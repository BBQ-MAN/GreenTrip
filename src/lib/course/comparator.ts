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
 * - 시간/비용 추정 포함 (내부 raw km 기준 — 표시 총합과 ±0.05km/구간 이내 차이).
 *
 * 총합 정의 (2026-06-11 재감사 H1): totalKm = Σ(반올림된 구간 km),
 * totalCO2g = Σ(반올림된 구간 co2g). "합산 후 반올림" 방식은 구간 합 ≠ 총합
 * 모순을 만들어 폐기 — 화면 표시값 자기일관 우선. DEVELOPMENT_PLAN §4는
 * 총합만 정의(segments 미정의)하므로 스펙 충돌 없음.
 */
function buildOption(
  waypoints: CourseWaypoint[],
  mode: TransportMode,
  category: CourseCategory,
): CourseOption {
  const segments: CourseSegment[] = [];
  let totalKm = 0;
  let totalCO2g = 0;
  let rawKmSum = 0; // 시간·비용 추정용 내부 raw 누적

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const km = roadKm(haversineKm(a.lat, a.lng, b.lat, b.lng));
    const segKm = Math.round(km * 10) / 10;
    const segCo2 = Math.round(km * CARBON_FACTOR[mode]);
    segments.push({
      fromIndex: i,
      toIndex: i + 1,
      km: segKm,
      co2g: segCo2,
      mode,
    });
    // 총합 = Σ(반올림된 구간) — 구간 합 = 총합 보장 (H1)
    totalKm += segKm;
    totalCO2g += segCo2;
    rawKmSum += km;
  }

  const speed = AVG_SPEED_KMH[mode];
  const durationMin = speed > 0 ? Math.round((rawKmSum / speed) * 60) : 0;
  const estimatedCostKRW = Math.round(rawKmSum * COST_PER_KM_KRW[mode]);

  return {
    mode,
    category,
    waypoints,
    segments,
    // 0.1 단위 합의 부동소수 잡음 제거 (수학적 값은 이미 구간 합과 동일)
    totalKm: Math.round(totalKm * 10) / 10,
    totalCO2g, // 정수 합 — 추가 반올림 불필요
    durationMin,
    estimatedCostKRW,
  };
}

/**
 * 추천 카테고리 선택 — totalCO2g 최소 옵션 (2026-06-11 재감사 H3 재설계).
 *
 * 규칙:
 *   1) 추천 = totalCO2g가 가장 작은 옵션. 동률 시 active > transit > car.
 *   2) 공정성 제약: active(C안)는 시작점 10km 반경으로 축소·재최적화된 별도
 *      코스라 방문지 수가 car/transit과 다를 수 있다. 방문지 수가 다른 옵션 간
 *      CO₂ 비교는 불공정 — 코스 자체를 줄여서 배출이 적어 보이는 착시가 생기고,
 *      사용자가 요청한 지역 전체 코스와 무관한 축소 코스를 추천하는 의미 왜곡이
 *      된다(구현: active 존재만으로 무조건 추천하던 결함의 원인).
 *      → 방문지 수가 같을 때만 active를 순수 CO₂ 비교에 포함하고,
 *        다르면 동일 방문지 집합인 car·transit(같은 waypoints) 중 최소 CO₂를 추천.
 *   3) active가 없으면(반경 내 spot < 2) car·transit 중 최소 CO₂.
 *
 * 참고: DEVELOPMENT_PLAN §4.2는 3안 "생성"만 정의하고 추천 규칙은 미정의 —
 * "저탄소 코스 추천" 제품 컨셉에 맞춰 본 규칙을 구현 측에서 확정.
 */
function pickRecommended(
  car: CourseOption,
  transit: CourseOption,
  active: CourseOption | null,
): CourseCategory {
  // 동률 우선순위: 숫자가 클수록 우선 (active=2 > transit=1 > car=0)
  const candidates: Array<{
    category: CourseCategory;
    co2: number;
    priority: number;
  }> = [
    { category: 'car', co2: car.totalCO2g, priority: 0 },
    { category: 'transit', co2: transit.totalCO2g, priority: 1 },
  ];

  // transit은 car와 동일 waypoints(carOptimized 재사용)이므로 car와의 비교만으로 충분
  if (
    active &&
    active.waypoints.length >= 2 &&
    active.waypoints.length === car.waypoints.length
  ) {
    candidates.push({ category: 'active', co2: active.totalCO2g, priority: 2 });
  }

  candidates.sort((a, b) => a.co2 - b.co2 || b.priority - a.priority);
  return candidates[0].category;
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
