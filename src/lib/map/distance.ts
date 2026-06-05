// Haversine + 도로거리 보정 — 순수 함수 (I/O 없음)
// 참조: DEVELOPMENT_PLAN.md §4.1
//
// 단위 일관성:
//   - 입력: 위/경도 (도, decimal degree)
//   - 출력: km (소수 1자리 round는 호출측에서)
// 도로 보정은 별도 함수 `roadKm` — 호출 시점에 명시.

import { ROAD_DISTANCE_FACTOR } from '@/lib/carbon/factors';

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * 두 좌표 간 대원거리 (Haversine), km.
 *
 * 공식 (DEVELOPMENT_PLAN §4.1):
 *   a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlng/2)
 *   c = 2·atan2(√a, √(1−a))
 *   d = R·c    (R = 6371 km)
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Haversine 직선거리를 도로거리로 보정 (×1.3).
 * DEVELOPMENT_PLAN §4.1: `straightDist * 1.3`.
 */
export function roadKm(straightKm: number): number {
  return straightKm * ROAD_DISTANCE_FACTOR;
}

/**
 * waypoint 배열의 총 도로거리 (km).
 * 인접 waypoint 간 Haversine → 도로 보정 → 합산.
 * waypoints.length < 2 면 0.
 */
export function totalRouteKm(
  waypoints: Array<{ lat: number; lng: number }>,
): number {
  if (waypoints.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    total += roadKm(haversineKm(a.lat, a.lng, b.lat, b.lng));
  }
  return total;
}
