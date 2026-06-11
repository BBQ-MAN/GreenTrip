// 코스 전체 탄소 배출량 계산 — 순수 함수
// 참조: DEVELOPMENT_PLAN.md §4.1
//
// 단위 일관성:
//   - 거리: km (소수 1자리 round)
//   - CO₂: g (정수 round)
//   - segments[].km / segments[].co2g 는 구간별 반올림 값이며,
//     totalKm = Σ(segments[].km), totalCO2g = Σ(segments[].co2g) 로 정의.
//     → 화면에 표시되는 구간 합과 헤더 총합이 항상 일치 (자기일관).
//
// 결정 근거 (2026-06-11 재감사 H1): "합산 후 반올림" 방식은 구간 합 ≠ 총합 모순
// (도심 단거리 코스에서 0.3km/1g 드리프트)을 유발 → 표시값 자기일관 우선 원칙으로
// "반올림된 구간의 합 = 총합"으로 정의 변경. DEVELOPMENT_PLAN §4.1은 총합만 정의하고
// segments 개념이 없으므로 스펙 위반 아님 (구간당 ±0.05km 반올림 오차가 총합에
// 누적될 수 있으나, UI 자기일관이 우선).
import { CARBON_FACTOR, type TransportMode } from './factors';
import { haversineKm, roadKm } from '@/lib/map/distance';

/**
 * 좌표 1개 (lat/lng) — TourAPI 응답의 mapy/mapx와 매칭.
 * CourseWaypoint과 호환되도록 lat/lng만 필수.
 */
export interface Waypoint {
  lat: number;
  lng: number;
}

/**
 * 단일 코스의 총 거리·CO₂·구간별 정보.
 * types/carbon.ts의 CarbonCalculation과 shape 호환 (mode·segments).
 */
export interface RouteCarbonResult {
  totalKm: number;
  totalCO2g: number;
  segments: Array<{ km: number; co2g: number }>;
}

function roundKm(km: number): number {
  return Math.round(km * 10) / 10;
}

/**
 * 코스 전체 탄소 배출량 계산 (순수 함수).
 *
 * - waypoints.length < 2 → totalKm=0, totalCO2g=0, segments=[]
 * - 각 구간 = 인접 waypoint Haversine → 도로 보정(×1.3) (내부 계산은 raw km)
 * - 구간 CO₂ = round(raw km × CARBON_FACTOR[mode]), 구간 km = round1(raw km)
 * - 총합 = Σ(반올림된 구간값) — 구간 합과 총합이 항상 일치 (H1 자기일관)
 * - 단위: km 소수 1자리, CO₂ g 정수
 */
export function calculateRouteCarbon(
  waypoints: Waypoint[],
  mode: TransportMode,
): RouteCarbonResult {
  if (waypoints.length < 2) {
    return { totalKm: 0, totalCO2g: 0, segments: [] };
  }

  const factor = CARBON_FACTOR[mode];
  const segments: Array<{ km: number; co2g: number }> = [];
  let totalKm = 0;
  let totalCO2g = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const rawKm = roadKm(haversineKm(a.lat, a.lng, b.lat, b.lng));
    const segKm = roundKm(rawKm); // 표시용 구간 km (1자리)
    const segCo2 = Math.round(rawKm * factor); // 구간 CO₂는 raw km 기준 정수 반올림
    segments.push({ km: segKm, co2g: segCo2 });
    // 총합 = Σ(반올림된 구간) — 구간 합 = 총합 보장 (H1 자기일관 우선)
    totalKm += segKm;
    totalCO2g += segCo2;
  }

  return {
    // 수학적으로 이미 0.1 단위 합이지만 부동소수 잡음(0.30000000000000004류) 제거
    totalKm: roundKm(totalKm),
    totalCO2g, // 정수 합 — 추가 반올림 불필요
    segments,
  };
}
