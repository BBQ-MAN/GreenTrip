// GET /api/course/[id] — 저장된 코스 + Waypoint 조회
// 참조: _workspace/00_input/week5_request.md §F, DEVELOPMENT_PLAN.md §7.4
//
// 응답:
//   200 { course: Course & { waypoints: Waypoint[] } }  // waypoints는 order ASC
//   404 { error: 'NOT_FOUND' }
//   500 { error: 'INTERNAL_ERROR' }
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `course '${id}' not found` },
        { status: 404 },
      );
    }

    return NextResponse.json({ course });
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
