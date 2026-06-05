// GET /api/report/[id] — 인증서 조회 (course + waypoints include)
// 참조: _workspace/00_input/week10_request.md §B-3
//
// 응답:
//   200 { report: CarbonReport & { course: Course & { waypoints: Waypoint[] } } }
//   404 { error: 'NOT_FOUND' }
//   500 { error: 'INTERNAL_ERROR' }
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

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

    return NextResponse.json({ report });
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
