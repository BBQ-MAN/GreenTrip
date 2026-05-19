// 이동수단별 CO₂ 배출 계수 (g/km, 1인 기준)
// 참조: DEVELOPMENT_PLAN.md §4.1

import type { TransportMode } from '@/types';

export const CARBON_FACTOR: Record<TransportMode, number> = {
  car: 210, // 자가용 (중형차 기준)
  express_bus: 68, // 고속/시외버스
  city_bus: 78, // 시내버스
  train_ktx: 18, // KTX
  train_itx: 25, // ITX/일반열차
  bicycle: 0, // 자전거
  walking: 0, // 도보
} as const;

/**
 * 도로거리 보정계수 (Haversine 직선거리 → 실제 도로거리)
 */
export const ROAD_DISTANCE_MULTIPLIER = 1.3;

/**
 * 나무 환산 (1그루 = 약 22 kg CO₂ / 년)
 * 절감량(g) / TREE_ABSORPTION_G_PER_YEAR = 나무 그루 수
 */
export const TREE_ABSORPTION_G_PER_YEAR = 22_000;
