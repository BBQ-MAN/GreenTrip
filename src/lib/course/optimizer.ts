// 2-opt 경로 최적화 — 순수 함수
// 참조: DEVELOPMENT_PLAN.md §4.2 3단계
//
// 무한루프 방지: MAX_ITERATIONS=50
// 풀 크기 상한: 호출측에서 20개 이내로 절단 권장 (시간 복잡도 O(n²)·반복)
import type { CourseWaypoint } from '@/types/course';
import { haversineKm } from '@/lib/map/distance';

/**
 * 2-opt 최대 반복 횟수 — 수렴 보장 + 무한루프 차단.
 */
export const MAX_ITERATIONS = 50;

/**
 * 2-opt 안전 상한 — 풀이 이 값을 초과하면 호출측이 절단 권장.
 * (n=20 → O(n²)=400, 반복 50회 → 20,000 거리 계산: 수십 ms)
 */
export const TWO_OPT_POOL_LIMIT = 20;

/**
 * 경로 총 직선거리 (km, Haversine 기준).
 * 도로 보정은 monotonic이라 순서 비교에서 동일 — 직선거리만 사용.
 */
export function totalDistance(route: CourseWaypoint[]): number {
  if (route.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += haversineKm(
      route[i].lat,
      route[i].lng,
      route[i + 1].lat,
      route[i + 1].lng,
    );
  }
  return total;
}

/**
 * 2-opt swap: route[i..j] 구간을 역순으로 뒤집은 새 배열 반환.
 * 입력 배열은 mutation 하지 않음.
 */
export function twoOptSwap(
  route: CourseWaypoint[],
  i: number,
  j: number,
): CourseWaypoint[] {
  const next = route.slice(0, i);
  const reversed = route.slice(i, j + 1).reverse();
  const tail = route.slice(j + 1);
  return [...next, ...reversed, ...tail];
}

/**
 * 2-opt 개선 (DEVELOPMENT_PLAN §4.2 3단계).
 *
 * - 시작점(index 0)은 고정 — i는 1부터.
 * - 수렴 시 (improved=false) 조기 종료.
 * - MAX_ITERATIONS 도달 시 강제 종료 (무한루프 방지).
 * - 풀이 TWO_OPT_POOL_LIMIT 초과 시 head(LIMIT) 절단 후 진행.
 */
export function twoOptImprove(route: CourseWaypoint[]): CourseWaypoint[] {
  if (route.length < 4) return [...route]; // 2-opt는 4개 이상에서만 의미

  // 풀 상한 적용 (시간 복잡도 보장)
  const working = route.length > TWO_OPT_POOL_LIMIT
    ? route.slice(0, TWO_OPT_POOL_LIMIT)
    : route;

  let best = [...working];
  let bestDist = totalDistance(best);
  let improved = true;
  let iter = 0;

  while (improved && iter < MAX_ITERATIONS) {
    improved = false;
    iter += 1;
    for (let i = 1; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const candidate = twoOptSwap(best, i, j);
        const candDist = totalDistance(candidate);
        if (candDist < bestDist - 1e-9) {
          best = candidate;
          bestDist = candDist;
          improved = true;
        }
      }
    }
  }
  return best;
}
