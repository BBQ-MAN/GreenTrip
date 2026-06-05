// 코스 전체 탄소 배출량 계산 — 순수 함수
// 참조: DEVELOPMENT_PLAN.md §4.1
//
// 단위 일관성:
//   - 거리: km (소수 1자리 round)
//   - CO₂: g (정수 round)
//   - segments[].km / segments[].co2g 도 round 적용 (round-trip 안정성)
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
 * - 각 구간 = 인접 waypoint Haversine → 도로 보정(×1.3)
 * - CO₂ = 누적 km × CARBON_FACTOR[mode]
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
    const segKm = roundKm(rawKm);
    const segCo2 = Math.round(rawKm * factor);
    segments.push({ km: segKm, co2g: segCo2 });
    totalKm += rawKm;
    totalCO2g += rawKm * factor;
  }

  return {
    totalKm: roundKm(totalKm),
    totalCO2g: Math.round(totalCO2g),
    segments,
  };
}
