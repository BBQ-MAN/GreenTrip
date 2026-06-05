// 탄소 단위 포맷터 — g → kg / 나무 환산 / 자가용 대비 km
// UI 표기용 변환만 담당. 계산 로직은 calculator.ts에 위치.
import { CARBON_FACTOR, TREE_ABSORPTION_G_PER_YEAR, type TransportMode } from './factors';

/**
 * g → 사람 친화적 문자열.
 * - 1000g 미만: "{n} g"
 * - 1000g 이상: "{n.n} kg" (소수 1자리)
 */
export function formatCarbon(co2g: number): string {
  if (!Number.isFinite(co2g)) return '0 g';
  const abs = Math.abs(co2g);
  if (abs < 1000) return `${Math.round(co2g)} g`;
  return `${(co2g / 1000).toFixed(1)} kg`;
}

/**
 * 절감량 → 소나무 그루 환산 (소수 1자리).
 * 소나무 1그루 = 약 22 kg CO₂/년 흡수 (산림청 평균).
 */
export function treeEquivalent(co2g: number): number {
  if (!Number.isFinite(co2g) || co2g <= 0) return 0;
  return Math.round((co2g / TREE_ABSORPTION_G_PER_YEAR) * 10) / 10;
}

/**
 * 특정 이동수단의 CO₂ 절감량을 "자가용 회피 km"로 환산.
 * 자가용 1km = CARBON_FACTOR.car (210g). 절감 g ÷ 210g/km = km.
 *
 * @param co2g 절감/배출 CO₂ (g)
 * @param mode 비교 기준 이동수단 (기본: car)
 */
export function carEquivalentKm(co2g: number, mode: TransportMode = 'car'): number {
  if (!Number.isFinite(co2g)) return 0;
  const factor = CARBON_FACTOR[mode];
  if (factor <= 0) return 0;
  return Math.round((co2g / factor) * 10) / 10;
}
