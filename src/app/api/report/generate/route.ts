// POST /api/report/generate — 코스 → CarbonReport 발급 (courseId당 1개 idempotent)
// 참조: DEVELOPMENT_PLAN.md §7.5, _workspace/00_input/week10_request.md §B-1
//
// 정책 (재감사 H-1 — 설계 결정 2026-06-11):
//   - **idempotent**: 같은 courseId의 인증서가 이미 있으면 새 row를 만들지 않고
//     기존 것을 200으로 반환 (무한 발급/DB 증식 차단). 영구 URL은 코스당 1개로 충분 —
//     다회 공유는 같은 reportId URL을 재사용.
//   - **소유자 제한**: course.userId가 있고 세션 사용자와 다르면 403.
//     익명 코스(userId=null)는 발급 허용 (비로그인 깔때기 보존).
//
// 동작:
//   1) Zod 검증 (courseId 1자 이상) → 400
//   2) Prisma.course.findUnique → 없으면 404
//   3) 소유 코스 + 비소유 세션 → 403
//   4) 기존 리포트 존재 → 200 (기존 반환)
//   5) CarbonReport.create → 201
//      - shareImageUrl: null (og:image route가 동적 생성 — 정적 캐시 전환 대비 빈 슬롯)
//   6) 응답: { reportId, courseId, savedCarbonG, savedTreeEq }
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { gramsToTreeEq } from '@/lib/carbon/equivalents';
import { internalErrorResponse } from '@/lib/apiError';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RequestSchema = z.object({
  courseId: z.string().min(1),
});

const REPORT_SELECT = {
  id: true,
  courseId: true,
  savedCarbonG: true,
  savedTreeEq: true,
} as const;

function toResponseBody(report: {
  id: string;
  courseId: string;
  savedCarbonG: number;
  savedTreeEq: number;
}) {
  return {
    reportId: report.id,
    courseId: report.courseId,
    savedCarbonG: report.savedCarbonG,
    savedTreeEq: report.savedTreeEq,
  };
}

export async function POST(req: NextRequest) {
  // 1. JSON 파싱
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Request body is not valid JSON' },
      { status: 400 },
    );
  }

  // 2. Zod 검증
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; '),
      },
      { status: 400 },
    );
  }

  const { courseId } = parsed.data;

  try {
    // 3. 코스 조회
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, userId: true, savedCarbonG: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `course '${courseId}' not found` },
        { status: 404 },
      );
    }

    // 4. 소유자 제한 — 소유 코스는 본인만 발급. 익명 코스는 허용 (깔때기 보존).
    const sessionUser = await getCurrentUser();
    if (course.userId && course.userId !== sessionUser?.id) {
      return NextResponse.json(
        {
          error: 'FORBIDDEN',
          message: '해당 코스의 인증서는 코스 소유자만 발급할 수 있습니다.',
        },
        { status: 403 },
      );
    }

    // 5. idempotent — 이미 발급된 인증서가 있으면 기존 것을 반환 (최초 발급분 고정)
    const existing = await prisma.carbonReport.findFirst({
      where: { courseId: course.id },
      orderBy: { createdAt: 'asc' },
      select: REPORT_SELECT,
    });
    if (existing) {
      return NextResponse.json(toResponseBody(existing), { status: 200 });
    }

    // 6. userId 우선순위: course.userId(저장 시점) > 현재 로그인 사용자 > null.
    //    이미 익명으로 저장된 코스를 로그인 후 인증서 발급 시 연결하기 위해 fallback 사용.
    const userId = course.userId ?? sessionUser?.id ?? null;

    // 7. CarbonReport 신규 발급
    const savedTreeEq = gramsToTreeEq(course.savedCarbonG);
    const report = await prisma.carbonReport.create({
      data: {
        courseId: course.id,
        userId,
        savedCarbonG: course.savedCarbonG,
        savedTreeEq,
        shareImageUrl: null,
      },
      select: REPORT_SELECT,
    });

    return NextResponse.json(toResponseBody(report), { status: 201 });
  } catch (e) {
    return internalErrorResponse('report/generate', e);
  }
}
