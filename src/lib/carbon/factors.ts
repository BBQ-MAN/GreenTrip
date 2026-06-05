// 이동수단별 CO₂ 배출 계수 (g/km, 1인 기준)
// 참조: DEVELOPMENT_PLAN.md §4.1 (수식 진원지)
//
// 출처: 환경부 운송 부문 배출 계수 (탄소중립녹색성장위원회 가이드라인).
// 본 값들은 DEVELOPMENT_PLAN.md §4.1과 1:1 일치해야 한다. 변경 시 출처 명시 필수.
//
// types/course.ts의 TransportMode union과 1:1 매칭.

import type { TransportMode } from '@/types';

/**
 * 이동수단별 1km당 CO₂ 배출량 (g, 1인 기준).
 *
 * 변경 금지 — DEVELOPMENT_PLAN.md §4.1 수식 진원지.
 * `as const`로 type narrowing + readonly 보장.
 */
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
 * 도로거리 보정계수 — Haversine 직선거리를 실제 도로거리로 환산.
 * DEVELOPMENT_PLAN §4.1: `straightDist * 1.3`
 */
export const ROAD_DISTANCE_FACTOR = 1.3;

/**
 * @deprecated name alias for ROAD_DISTANCE_FACTOR (호환용)
 */
export const ROAD_DISTANCE_MULTIPLIER = ROAD_DISTANCE_FACTOR;

/**
 * 소나무 1그루 연간 CO₂ 흡수량 (g).
 * 산림청 평균값: 약 22 kg CO₂/년.
 */
export const TREE_ABSORPTION_G_PER_YEAR = 22_000;

/**
 * TransportMode union 재export — 단일 진원지 패턴.
 */
export type { TransportMode };
