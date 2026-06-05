// 코스 후보 풀 + Nearest Neighbor 초기 경로
// 참조: DEVELOPMENT_PLAN.md §4.2 1·2단계
//
// 입력 진원지: TourAPI areaBasedList2 응답의 SpotItem (mapx/mapy는 v1.6 coerceNumericFields로 number 보장).
// 출력 진원지: types/course.ts의 CourseWaypoint (lat/lng 표준).
//
// 순수 함수 원칙: nearestNeighborRoute는 I/O 없음.
// buildCandidatePool은 I/O 포함 (callTourAPI) — Route Handler 호출용.
import { callTourAPI } from '@/lib/tourapi/client';
import type { SpotItem, FestivalItem } from '@/types/tour';
import type { CourseWaypoint } from '@/types/course';
import { haversineKm } from '@/lib/map/distance';
import { mergeFestivals, type DateRange } from './filters';

/**
 * SpotItem → CourseWaypoint 매핑.
 * KorService2 v1.6: mapx/mapy는 client.coerceNumericFields로 number 정규화 완료.
 * 좌표 비정상값(0/NaN/범위 밖)은 호출측에서 필터.
 */
export function spotToWaypoint(spot: SpotItem): CourseWaypoint {
  return {
    contentId: spot.contentid,
    title: spot.title,
    lat: spot.mapy,
    lng: spot.mapx,
    address: [spot.addr1, spot.addr2].filter(Boolean).join(' ').trim() || undefined,
    imageUrl: spot.firstimage || spot.firstimage2 || undefined,
    contentType: spot.contenttypeid,
    stayMinutes: 60,
  };
}

/**
 * 좌표 유효성 검사: 위도 ±90, 경도 ±180, 0 제외(KorService2 누락 시 0 반환되는 케이스 차단).
 */
export function hasValidCoord(w: { lat: number; lng: number }): boolean {
  return (
    Number.isFinite(w.lat) &&
    Number.isFinite(w.lng) &&
    w.lat !== 0 &&
    w.lng !== 0 &&
    Math.abs(w.lat) <= 90 &&
    Math.abs(w.lng) <= 180
  );
}

export interface BuildPoolParams {
  areaCode: number;
  sigunguCode?: number;
  contentTypeIds?: number[]; // 다중 호출 후 병합
  cat1?: string;
  cat2?: string;
  cat3?: string;
  lclsSystm1?: string;
  numOfRows?: number; // endpoint당 최대 (기본 50)
  arrange?: string; // 정렬 (기본 'A' = 제목순)
  // Week 6~7: 축제 자동 통합
  includeFestival?: boolean;
  /**
   * 축제 검색 대상 기간 (YYYYMMDD). includeFestival=true일 때 사용.
   * 미지정 시 호출측에서 durationToDateRange로 계산하여 전달 권장.
   */
  festivalDateRange?: DateRange;
  /** 축제 endpoint 최대 결과 수 (기본 30). */
  festivalNumOfRows?: number;
}

/**
 * 코스 후보 풀 구성. areaBasedList2 호출 후 좌표 유효 SpotItem만 반환.
 *
 * - contentTypeIds 다중 지정 시 각 type별 1회씩 호출 (Promise.all) → 병합 + dedupe(contentid).
 * - 미지정 시 contentTypeId 없이 1회 호출 (= 모든 타입).
 * - 좌표 무효 (mapx/mapy 누락·범위 밖) 자동 제외.
 *
 * Note: 캐싱은 callTourAPI 단일 진원지에서 이뤄지지 않음 (Route Handler가 별도 적용 가능).
 *       2-opt 풀 상한(20)을 넘으면 우선순위 정렬 없이 head(20)을 사용 (호출측 책임).
 */
export async function buildCandidatePool(
  params: BuildPoolParams,
): Promise<CourseWaypoint[]> {
  const baseParams: Record<string, string | number | undefined> = {
    areaCode: params.areaCode,
    sigunguCode: params.sigunguCode,
    cat1: params.cat1,
    cat2: params.cat2,
    cat3: params.cat3,
    lclsSystm1: params.lclsSystm1,
    numOfRows: params.numOfRows ?? 50,
    pageNo: 1,
    arrange: params.arrange ?? 'A',
  };

  const typeIds = params.contentTypeIds && params.contentTypeIds.length > 0
    ? params.contentTypeIds
    : [undefined];

  const responses = await Promise.all(
    typeIds.map((ct) =>
      callTourAPI<SpotItem>('areaBasedList2', {
        ...baseParams,
        contentTypeId: ct,
      }),
    ),
  );

  // dedupe by contentid + 좌표 유효성 필터
  const seen = new Set<string>();
  const pool: CourseWaypoint[] = [];
  for (const res of responses) {
    for (const item of res.items) {
      if (seen.has(item.contentid)) continue;
      seen.add(item.contentid);
      const wp = spotToWaypoint(item);
      if (!hasValidCoord(wp)) continue;
      pool.push(wp);
    }
  }

  // Week 6~7: 축제 통합 (DEVELOPMENT_PLAN §8)
  // includeFestival=true이고 dateRange 유효 시 searchFestival2 호출 후 mergeFestivals.
  if (params.includeFestival && params.festivalDateRange) {
    const range = params.festivalDateRange;
    const festResp = await callTourAPI<FestivalItem>('searchFestival2', {
      eventStartDate: range.start,
      eventEndDate: range.end,
      areaCode: params.areaCode,
      sigunguCode: params.sigunguCode,
      numOfRows: params.festivalNumOfRows ?? 30,
      pageNo: 1,
      arrange: params.arrange ?? 'A',
    });
    return mergeFestivals(pool, festResp.items, range);
  }

  return pool;
}

/**
 * Nearest Neighbor 초기 경로 (DEVELOPMENT_PLAN §4.2 2단계).
 *
 * - 순수 함수 (I/O 없음, spots/start의 mutation 없음).
 * - 빈 spots → [].
 * - start가 spots에 포함되어 있으면 제외 후 진행.
 * - 거리 비교는 Haversine 직선 (도로 보정 ×1.3은 monotonic이라 순서 동일).
 */
export function nearestNeighborRoute(
  spots: CourseWaypoint[],
  start: CourseWaypoint,
): CourseWaypoint[] {
  const route: CourseWaypoint[] = [start];
  const remaining = spots.filter((s) => s.contentId !== start.contentId);
  let current = start;
  while (remaining.length > 0) {
    let nearestIdx = -1;
    let minDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const s = remaining[i];
      const d = haversineKm(current.lat, current.lng, s.lat, s.lng);
      if (d < minDist) {
        minDist = d;
        nearestIdx = i;
      }
    }
    if (nearestIdx === -1) break;
    const next = remaining[nearestIdx];
    route.push(next);
    remaining.splice(nearestIdx, 1);
    current = next;
  }
  return route;
}
