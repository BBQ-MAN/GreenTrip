// 탄소 절감량 → 친숙한 등가 환산 (순수 함수)
// 참조: DEVELOPMENT_PLAN.md §7.5 인증서, §4.1 탄소 계산
//
// 목적: 인증서·SNS 공유 카드에서 "X kg 절감" 추상 수치를
//   "소나무 N그루 / 자가용 N km / 노트북 N시간 / 인천-제주 비행 N회"로
//   사용자가 체감할 수 있는 비교 단위로 변환한다.
//
// 원칙:
//   - I/O 없음 (순수 함수). 테스트는 입력만으로 결과 결정.
//   - 음수/NaN/0 입력 → 0 반환 (UI에서 분기 없이 안전).
//   - 진원지: CARBON_FACTOR (factors.ts) + TREE_ABSORPTION_G_PER_YEAR.
//     이 파일에 별도 환산용 상수 2개(LAPTOP·FLIGHT)를 새로 추가하되,
//     factors.ts 값은 절대 재정의하지 않는다.
//
// 상수 근거:
//   - LAPTOP_G_PER_HOUR = 20
//     노트북 평균 소비전력 ≈ 50 W → 0.05 kWh/h.
//     한국 전력 평균 배출계수 ≈ 0.4 kg CO₂/kWh (전력거래소 2024 기준).
//     0.05 × 400 g = 20 g/h.
//
//   - FLIGHT_KG_INCHEON_JEJU = 130
//     인천(ICN) ↔ 제주(CJU) 편도 1인 평균 배출량 ≈ 130 kg CO₂.
//     B737 기준 거리 약 450 km × 평균 0.29 kg/km/인 (ICAO Carbon Calculator).
import { CARBON_FACTOR, TREE_ABSORPTION_G_PER_YEAR } from './factors';

/**
 * 노트북 1시간 사용 시 CO₂ 배출량 (g).
 * 50W × 0.4 kg CO₂/kWh = 20 g/h.
 * UI 상수 표시에 활용 가능 (export).
 */
export const LAPTOP_G_PER_HOUR = 20;

/**
 * 인천 → 제주 1인 편도 비행 CO₂ 배출량 (kg).
 * UI 상수 표시에 활용 가능 (export).
 */
export const FLIGHT_KG_INCHEON_JEJU = 130;

/**
 * 절감량(g) → 소나무 그루 환산.
 * 1그루 = 22 kg CO₂/년 (TREE_ABSORPTION_G_PER_YEAR = 22000).
 * 소숫점 1자리 반올림. 음수/NaN/0은 0 반환.
 *
 * @example gramsToTreeEq(22000) // 1.0
 * @example gramsToTreeEq(11000) // 0.5
 */
export function gramsToTreeEq(savedG: number): number {
  if (!Number.isFinite(savedG) || savedG <= 0) return 0;
  return Math.round((savedG / TREE_ABSORPTION_G_PER_YEAR) * 10) / 10;
}

/**
 * 절감량(g) → 자가용 회피 km 환산.
 * 자가용 1km = CARBON_FACTOR.car (210 g/km).
 * 정수 반올림. 음수/NaN/0은 0 반환.
 *
 * @example gramsToCarKm(21000) // 100
 * @example gramsToCarKm(210)   // 1
 */
export function gramsToCarKm(savedG: number): number {
  if (!Number.isFinite(savedG) || savedG <= 0) return 0;
  return Math.round(savedG / CARBON_FACTOR.car);
}

/**
 * 절감량(g) → 노트북 사용 시간 환산.
 * 노트북 50W × 0.4 kg CO₂/kWh = 20 g/h.
 * 정수 반올림. 음수/NaN/0은 0 반환.
 *
 * @example gramsToLaptopHours(20)  // 1
 * @example gramsToLaptopHours(200) // 10
 */
export function gramsToLaptopHours(savedG: number): number {
  if (!Number.isFinite(savedG) || savedG <= 0) return 0;
  return Math.round(savedG / LAPTOP_G_PER_HOUR);
}

/**
 * 절감량(g) → 인천-제주 편도 비행 분율 환산.
 * 1회 ≈ 130 kg CO₂. 소숫점 2자리 반올림. 음수/NaN/0은 0 반환.
 *
 * 반환 값은 회 단위 (0~N). UI에서 "X.XX회 ≈ Y%"로 표시 가능.
 *
 * @example gramsToFlightFraction(130000) // 1.0
 * @example gramsToFlightFraction(65000)  // 0.5
 */
export function gramsToFlightFraction(savedG: number): number {
  if (!Number.isFinite(savedG) || savedG <= 0) return 0;
  return Math.round((savedG / 1000 / FLIGHT_KG_INCHEON_JEJU) * 100) / 100;
}
