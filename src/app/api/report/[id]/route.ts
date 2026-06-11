// GET /api/report/[id] — 인증서 조회 (course + waypoints include)
// 참조: _workspace/00_input/week10_request.md §B-3
//
// 접근 정책 (재감사 H-1 — 설계 결정 2026-06-11):
//   - 인증서는 **공유 링크 전제의 공개 리소스** (카카오 공유·OG 이미지와 정합) → 조회는 공개 유지.
//   - 단, 응답에서 내부 필드(report.userId, course.userId)는 제거 — 정찰면 축소.
//   - 발급(생성)은 /api/report/generate에서 소유자 제한 + idempotent.
//
// 응답:
//   200 { report: CarbonReport & { course: Course & { waypoints: Waypoint[] } } }  // userId 제외
//   404 { error: 'NOT_FOUND' }
//   500 { error: 'INTERNAL_ERROR' }
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { internalErrorResponse } from '@/lib/apiError';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    const report = await prisma.carbonReport.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            waypoints: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `report '${id}' not found` },
        { status: 404 },
      );
    }

    // 내부 필드 제거 — 공유 링크로 노출되는 응답에 소유자 식별자를 싣지 않는다.
    const { userId: _reportUserId, course, ...reportRest } = report;
    const { userId: _courseUserId, ...courseRest } = course;

    return NextResponse.json({
      report: { ...reportRest, course: courseRest },
    });
  } catch (e) {
    return internalErrorResponse('report/[id]', e);
  }
}
