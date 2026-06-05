// 이동수단별 3안 비교 — 순수 함수 (입력만으로 결과 결정)
// 참조: DEVELOPMENT_PLAN.md §4.2 4단계
//
// A안 (car): 자가용 최단 (Nearest Neighbor + 2-opt 결과 그대로)
// B안 (transit): 시외버스 가정 (동일 경로, mode만 변경) — 역/터미널 대체는 Phase 2 본격
// C안 (active): 자전거/도보 — 시작점 기준 ACTIVE_RADIUS_KM(10km) 반경 필터 후 재최적화
//   반경 내 spot이 2개 미만이면 null 반환.
import type {
  CourseWaypoint,
  CourseOption,
  CourseCompareResult,
  CourseCategory,
  CourseSegment,
  TransportMode,
} from '@/types/course';
import { CARBON_FACTOR } from '@/lib/carbon/factors';
import { haversineKm, roadKm } from '@/lib/map/distance';
import { nearestNeighborRoute } from './generator';
import { twoOptImprove } from './optimizer';

/**
 * C안 반경 (km) — 자전거/도보 코스 후보 풀 필터.
 * DEVELOPMENT_PLAN §4.2: "10km 반경 제한".
 */
export const ACTIVE_RADIUS_KM = 10;

/**
 * 이동수단별 평균 속도 (km/h, 도로거리 기준 추정).
 * durationMin 계산용. 정확한 시간은 외부 라우팅 API 필요 (Phase 4+).
 */
const AVG_SPEED_KMH: Record<TransportMode, number> = {
  car: 60,
  express_bus: 55,
  city_bus: 30,
  train_ktx: 200,
  train_itx: 90,
  bicycle: 15,
  walking: 4,
};

/**
 * 이동수단별 km당 추정 비용 (KRW). 매우 보수적 — UI 표기용.
 * 자가용: 연료비 100원/km, 대중교통: 정액 가정, 자전거/도보: 0원.
 */
const COST_PER_KM_KRW: Record<TransportMode, number> = {
  car: 100,
  express_bus: 60,
  city_bus: 40,
  train_ktx: 90,
  train_itx: 50,
  bicycle: 0,
  walking: 0,
};

/**
 * 경로(waypoints)와 mode로 CourseOption 1건 생성.
 * - 도로 보정 ×1.3 후 CARBON_FACTOR[mode] 적용.
 * - 시간/비용 추정 포함.
 */
function buildOption(
  waypoints: CourseWaypoint[],
  mode: TransportMode,
  category: CourseCategory,
): CourseOption {
  const segments: CourseSegment[] = [];
  let totalKm = 0;
  let totalCO2g = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const km = roadKm(haversineKm(a.lat, a.lng, b.lat, b.lng));
    const co2g = km * CARBON_FACTOR[mode];
    segments.push({
      fromIndex: i,
      toIndex: i + 1,
      km: Math.round(km * 10) / 10,
      co2g: Math.round(co2g),
      mode,
    });
    totalKm += km;
    totalCO2g += co2g;
  }

  const speed = AVG_SPEED_KMH[mode];
  const durationMin = speed > 0 ? Math.round((totalKm / speed) * 60) : 0;
  const estimatedCostKRW = Math.round(totalKm * COST_PER_KM_KRW[mode]);

  return {
    mode,
    category,
    waypoints,
    segments,
    totalKm: Math.round(totalKm * 10) / 10,
    totalCO2g: Math.round(totalCO2g),
    durationMin,
    estimatedCostKRW,
  };
}

/**
 * 추천 카테고리 선택 — CO₂ 최소(0이면 active 우선, 그 다음 transit).
 */
function pickRecommended(
  car: CourseOption,
  transit: CourseOption,
  active: CourseOption | null,
): CourseCategory {
  // CO₂가 0인 active가 있고 waypoints가 충분하면 active 우선
  if (active && active.waypoints.length >= 2) return 'active';
  // 다음으로 transit (대중교통 권장)
  if (transit.totalCO2g < car.totalCO2g) return 'transit';
  return 'car';
}

export interface BuildOptionsParams {
  /** 자전거/도보 모드 기본값 (bicycle 권장). */
  activeMode?: 'bicycle' | 'walking';
  /** 대중교통 기본 모드 (express_bus 기본 — 시외 이동 가정). */
  transitMode?: 'express_bus' | 'city_bus' | 'train_itx' | 'train_ktx';
  /** 최대 waypoints (시작점 제외하고 maxSpots-1 추가). */
  maxSpots?: number;
}

/**
 * 풀에서 3안(car/transit/active) 생성.
 *
 * - A안: pool 전체 → NN → 2-opt → car 모드.
 * - B안: A안 waypoints 그대로 + transitMode 적용 (Phase 2에서 역/터미널 대체).
 * - C안: start 기준 ACTIVE_RADIUS_KM 내 spot만 → NN → 2-opt → activeMode 적용.
 *        반경 내 2개 미만이면 null.
 *
 * 모든 단계는 순수 함수 (I/O 없음). pool은 buildCandidatePool로 미리 확보.
 */
export function buildThreeOptions(
  pool: CourseWaypoint[],
  start: CourseWaypoint,
  options: BuildOptionsParams = {},
): CourseCompareResult {
  const activeMode = options.activeMode ?? 'bicycle';
  const transitMode = options.transitMode ?? 'express_bus';
  const maxSpots = options.maxSpots ?? 8;

  // pool에 start 포함되지 않았을 수 있으므로 보정
  const poolWithStart = pool.some((s) => s.contentId === start.contentId)
    ? pool
    : [start, ...pool];

  // ===== A안: car =====
  const carNN = nearestNeighborRoute(poolWithStart, start);
  const carTrimmed = carNN.slice(0, maxSpots);
  const carOptimized = twoOptImprove(carTrimmed);
  const car = buildOption(carOptimized, 'car', 'car');

  // ===== B안: transit (동일 waypoints, mode만 변경) =====
  // Phase 2: 역/터미널 검색(API-4 키워드 "터미널"·"역") 후 시작/종점 대체 예정.
  const transit = buildOption(carOptimized, transitMode, 'transit');

  // ===== C안: active (10km 반경 필터 후 재최적화) =====
  const inRadius = poolWithStart.filter((s) => {
    if (s.contentId === start.contentId) return true;
    return haversineKm(start.lat, start.lng, s.lat, s.lng) <= ACTIVE_RADIUS_KM;
  });

  let active: CourseOption | null = null;
  if (inRadius.length >= 2) {
    const activeNN = nearestNeighborRoute(inRadius, start);
    const activeTrimmed = activeNN.slice(0, maxSpots);
    const activeOptimized = twoOptImprove(activeTrimmed);
    active = buildOption(activeOptimized, activeMode, 'active');
  }

  return {
    car,
    transit,
    active,
    recommended: pickRecommended(car, transit, active),
  };
}
