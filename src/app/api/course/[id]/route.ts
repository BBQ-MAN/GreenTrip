// GET /api/course/[id] — 저장된 코스 + Waypoint 조회
// 참조: _workspace/00_input/week5_request.md §F, DEVELOPMENT_PLAN.md §7.4
//
// 접근 정책 (재감사 H-1 — 설계 결정 2026-06-11, refix QA 후 정합):
//   - 코스 상세는 공유 표면 — 조회는 공개, 변경·발급만 소유자 제한 (페이지 RSC와 동일 정책)
//   - POST /api/course가 isPublic:false 고정 저장이라 isPublic 게이트는 페이지(무게이트)와
//     모순을 만들었음 → 제거. 비공개 코스 기능(isPublic 토글 UI) 도입 시
//     이 라우트와 src/app/course/[id]/page.tsx RSC 조회를 **동시에** 게이트할 것.
//   - 응답에서 내부 필드 userId 제거 (정찰면 축소)
//
// 응답:
//   200 { course: Course & { waypoints: Waypoint[] } }  // waypoints는 order ASC, userId 제외
//   404 { error: 'NOT_FOUND' }
//   500 { error: 'INTERNAL_ERROR' }
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { internalErrorResponse } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

/** 비소유자에게는 존재 여부도 숨긴다 (403이 아닌 404) */
function notFoundResponse(id: string) {
  return NextResponse.json(
    { error: 'NOT_FOUND', message: `course '${id}' not found` },
    { status: 404 },
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { error: 'INVALID_ID', message: 'id is required' },
      { status: 400 },
    );
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: { waypoints: { orderBy: { order: 'asc' } } },
    });

    if (!course) {
      return notFoundResponse(id);
    }

    // 내부 필드 제거 (userId는 API 응답에 불필요 — IDOR 정찰면 축소)
    const { userId: _userId, ...publicCourse } = course;

    return NextResponse.json({ course: publicCourse });
  } catch (e) {
    return internalErrorResponse('course/[id]', e);
  }
}
