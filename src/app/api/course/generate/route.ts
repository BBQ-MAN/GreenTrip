// POST /api/course/generate — 이동수단별 3안 코스 자동 생성
// 참조: DEVELOPMENT_PLAN.md §4.2, _workspace/00_input/week3_request.md §D-1
//
// Request body (Zod):
//   { areaCode, sigunguCode?, contentTypeIds?, startContentId?, duration?,
//     includeFestival?, includePet?, accessibilityMin?, maxSpots? }
// Response: CourseCompareResult { car, transit, active, recommended }
// 400: Zod validation failed | 풀 부족 (관광지 2개 미만)
// 503: TourAPI 호출 실패
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { buildCandidatePool } from '@/lib/course/generator';
import { buildThreeOptions } from '@/lib/course/comparator';
import { TWO_OPT_POOL_LIMIT } from '@/lib/course/optimizer';
import { durationToDateRange } from '@/lib/course/filters';
import { TourAPIError } from '@/lib/tourapi/client';
import type { CourseWaypoint } from '@/types/course';

export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  areaCode: z.number().int().min(1).max(50),
  sigunguCode: z.number().int().min(1).max(50).optional(),
  contentTypeIds: z.array(z.number().int().min(1).max(99)).max(10).optional(),
  startContentId: z.string().optional(),
  startLat: z.number().min(-90).max(90).optional(),
  startLng: z.number().min(-180).max(180).optional(),
  // DEVELOPMENT_PLAN §7.2 + types/course.ts GenerateCourseRequest.duration과 1:1 정합 (required, Week 4 QA Medium 정정)
  duration: z.enum(['당일', '1박2일', '2박3일']),
  includeFestival: z.boolean().optional(),
  includePet: z.boolean().optional(),
  accessibilityMin: z.number().min(0).max(100).optional(),
  maxSpots: z.number().int().min(2).max(20).optional(),
  activeMode: z.enum(['bicycle', 'walking']).optional(),
  transitMode: z.enum(['express_bus', 'city_bus', 'train_itx', 'train_ktx']).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Request body is not valid JSON' },
      { status: 400 },
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  try {
    // Week 6~7: duration → 축제 검색 dateRange (KST 오늘 시작).
    // includeFestival=true일 때만 buildCandidatePool에서 searchFestival2 호출.
    const festivalDateRange = data.includeFestival
      ? durationToDateRange(data.duration)
      : undefined;

    // 후보 풀 구성 (areaBasedList2 + 옵션 searchFestival2 + 옵션 detailPetTour2 폴백)
    // Week 8~9: includePet=true 시 buildCandidatePool 내부에서 filterPetFriendly 적용.
    //   - 트레이드오프 디폴트 (petConcurrency=5·petMaxFallback=20)는 Route에서 명시 안 함 (lib 기본값 사용)
    const pool = await buildCandidatePool({
      areaCode: data.areaCode,
      sigunguCode: data.sigunguCode,
      contentTypeIds: data.contentTypeIds,
      numOfRows: 50,
      includeFestival: data.includeFestival,
      festivalDateRange,
      includePet: data.includePet,
    });

    if (pool.length < 2) {
      return NextResponse.json(
        {
          error: 'INSUFFICIENT_POOL',
          message: `Found ${pool.length} valid spots. Need at least 2 to build a course.`,
        },
        { status: 400 },
      );
    }

    // 시작점 결정
    let start: CourseWaypoint;
    if (data.startContentId) {
      const found = pool.find((s) => s.contentId === data.startContentId);
      start = found ?? pool[0];
    } else if (data.startLat !== undefined && data.startLng !== undefined) {
      start = {
        contentId: '__user_location__',
        title: '내 위치',
        lat: data.startLat,
        lng: data.startLng,
        contentType: 0,
      };
    } else {
      start = pool[0];
    }

    // 풀 상한 적용 (성능 보장 — 2-opt O(n²)·MAX_ITERATIONS)
    const limitedPool = pool.length > TWO_OPT_POOL_LIMIT
      ? pool.slice(0, TWO_OPT_POOL_LIMIT)
      : pool;

    const result = buildThreeOptions(limitedPool, start, {
      activeMode: data.activeMode,
      transitMode: data.transitMode,
      maxSpots: data.maxSpots,
    });

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof TourAPIError) {
      return NextResponse.json(
        {
          error: 'TOUR_API_ERROR',
          message: e.message,
          resultCode: e.code,
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
