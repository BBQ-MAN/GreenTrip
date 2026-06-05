// POST /api/report/generate — 코스 → CarbonReport 신규 발급
// 참조: DEVELOPMENT_PLAN.md §7.5, _workspace/00_input/week10_request.md §B-1
//
// 동작:
//   1) Zod 검증 (courseId 1자 이상) → 400
//   2) Prisma.course.findUnique → 없으면 404
//   3) CarbonReport.create (savedCarbonG=course.savedCarbonG, savedTreeEq=gramsToTreeEq(...))
//      - userId: course.userId (현재는 항상 null. Phase 2 W12 NextAuth 도입 후 채움)
//      - shareImageUrl: null
//        → og:image route(`/api/og/cert/[id]`)가 동적 생성하므로 DB에 URL 저장 불필요.
//          미래에 정적 PNG 캐시로 전환할 때만 채우는 빈 슬롯으로 유지.
//   4) **always-new**: 같은 courseId라도 새 reportId 생성 (영구 URL 분리 → 다회 공유 가능)
//   5) 응답: { reportId, courseId, savedCarbonG, savedTreeEq }
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { gramsToTreeEq } from '@/lib/carbon/equivalents';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RequestSchema = z.object({
  courseId: z.string().min(1),
});

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

  // 3. 코스 조회
  try {
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

    // 4. CarbonReport 신규 발급 (always-new)
    const savedTreeEq = gramsToTreeEq(course.savedCarbonG);
    const report = await prisma.carbonReport.create({
      data: {
        courseId: course.id,
        userId: course.userId, // 현재는 null 동기화 (Phase 2 W12 이후 채워짐)
        savedCarbonG: course.savedCarbonG,
        savedTreeEq,
        shareImageUrl: null,
      },
      select: {
        id: true,
        courseId: true,
        savedCarbonG: true,
        savedTreeEq: true,
      },
    });

    return NextResponse.json(
      {
        reportId: report.id,
        courseId: report.courseId,
        savedCarbonG: report.savedCarbonG,
        savedTreeEq: report.savedTreeEq,
      },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: e instanceof Error ? e.message : 'Unknown DB error',
      },
      { status: 500 },
    );
  }
}
