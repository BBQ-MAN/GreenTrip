// equivalents.test.ts — Week 10~11 탄소 절감량 등가 환산 검증
// 대상: src/lib/carbon/equivalents.ts
//
// 원칙: 순수 함수 단위. I/O 없음.
//   - 모든 환산 함수: 음수/NaN/0/Infinity 경계 방어
//   - 진원지 상수 일관성: CARBON_FACTOR.car=210, TREE_ABSORPTION_G_PER_YEAR=22000
//   - 새 상수(LAPTOP_G_PER_HOUR=20, FLIGHT_KG_INCHEON_JEJU=130) 검증
import { describe, it, expect } from 'vitest';
import {
  gramsToTreeEq,
  gramsToCarKm,
  gramsToLaptopHours,
  gramsToFlightFraction,
  LAPTOP_G_PER_HOUR,
  FLIGHT_KG_INCHEON_JEJU,
} from '@/lib/carbon/equivalents';
import { CARBON_FACTOR, TREE_ABSORPTION_G_PER_YEAR } from '@/lib/carbon/factors';

// =============================================================================
// 진원지 상수 일관성 (회귀 가드)
// =============================================================================
describe('상수 진원지 일관성', () => {
  it('TREE_ABSORPTION_G_PER_YEAR = 22000', () => {
    expect(TREE_ABSORPTION_G_PER_YEAR).toBe(22_000);
  });

  it('CARBON_FACTOR.car = 210', () => {
    expect(CARBON_FACTOR.car).toBe(210);
  });

  it('LAPTOP_G_PER_HOUR = 20 (50W × 0.4 kg/kWh)', () => {
    expect(LAPTOP_G_PER_HOUR).toBe(20);
  });

  it('FLIGHT_KG_INCHEON_JEJU = 130', () => {
    expect(FLIGHT_KG_INCHEON_JEJU).toBe(130);
  });
});

// =============================================================================
// gramsToTreeEq — 소나무 그루
// =============================================================================
describe('gramsToTreeEq', () => {
  it('22000g (22kg) = 1.0 그루 (정확 1배수)', () => {
    expect(gramsToTreeEq(22_000)).toBe(1.0);
  });

  it('11000g = 0.5 그루 (반배수)', () => {
    expect(gramsToTreeEq(11_000)).toBe(0.5);
  });

  it('44000g = 2.0 그루 (2배수)', () => {
    expect(gramsToTreeEq(44_000)).toBe(2.0);
  });

  it('15400g = 0.7 그루 (소수 반올림)', () => {
    // 15400 / 22000 = 0.7
    expect(gramsToTreeEq(15_400)).toBe(0.7);
  });

  it('0 → 0', () => {
    expect(gramsToTreeEq(0)).toBe(0);
  });

  it('음수 → 0 (방어)', () => {
    expect(gramsToTreeEq(-1000)).toBe(0);
  });

  it('NaN → 0', () => {
    expect(gramsToTreeEq(NaN)).toBe(0);
  });

  it('Infinity → 0 (방어)', () => {
    expect(gramsToTreeEq(Infinity)).toBe(0);
  });

  it('TREE_ABSORPTION_G_PER_YEAR와 자기일관: 진원지 값 입력 시 1.0', () => {
    expect(gramsToTreeEq(TREE_ABSORPTION_G_PER_YEAR)).toBe(1.0);
  });
});

// =============================================================================
// gramsToCarKm — 자가용 km
// =============================================================================
describe('gramsToCarKm', () => {
  it('21000g (210 g/km) = 100 km', () => {
    expect(gramsToCarKm(21_000)).toBe(100);
  });

  it('CARBON_FACTOR.car (210g) = 1 km — 진원지 일관', () => {
    expect(gramsToCarKm(CARBON_FACTOR.car)).toBe(1);
  });

  it('420g = 2 km', () => {
    expect(gramsToCarKm(420)).toBe(2);
  });

  it('100g ≈ 0 km (정수 반올림)', () => {
    // 100 / 210 = 0.47 → round 0
    expect(gramsToCarKm(100)).toBe(0);
  });

  it('158g = 1 km (정수 반올림 경계: 0.75 → 1)', () => {
    // 158 / 210 = 0.7523... → round 1
    expect(gramsToCarKm(158)).toBe(1);
  });

  it('0 → 0', () => {
    expect(gramsToCarKm(0)).toBe(0);
  });

  it('음수 → 0', () => {
    expect(gramsToCarKm(-500)).toBe(0);
  });

  it('NaN → 0', () => {
    expect(gramsToCarKm(NaN)).toBe(0);
  });
});

// =============================================================================
// gramsToLaptopHours — 노트북 시간
// =============================================================================
describe('gramsToLaptopHours', () => {
  it('20g (LAPTOP_G_PER_HOUR) = 1시간 — 진원지 일관', () => {
    expect(gramsToLaptopHours(LAPTOP_G_PER_HOUR)).toBe(1);
  });

  it('200g = 10시간', () => {
    expect(gramsToLaptopHours(200)).toBe(10);
  });

  it('1000g = 50시간 (1kg)', () => {
    expect(gramsToLaptopHours(1000)).toBe(50);
  });

  it('0 → 0', () => {
    expect(gramsToLaptopHours(0)).toBe(0);
  });

  it('음수 → 0', () => {
    expect(gramsToLaptopHours(-50)).toBe(0);
  });

  it('NaN → 0', () => {
    expect(gramsToLaptopHours(NaN)).toBe(0);
  });
});

// =============================================================================
// gramsToFlightFraction — 인천-제주 비행
// =============================================================================
describe('gramsToFlightFraction', () => {
  it('130 kg (FLIGHT_KG_INCHEON_JEJU × 1000) = 1.0회 — 진원지 일관', () => {
    expect(gramsToFlightFraction(FLIGHT_KG_INCHEON_JEJU * 1000)).toBe(1.0);
  });

  it('65 kg = 0.5회', () => {
    expect(gramsToFlightFraction(65_000)).toBe(0.5);
  });

  it('13 kg = 0.1회', () => {
    expect(gramsToFlightFraction(13_000)).toBe(0.1);
  });

  it('260 kg = 2.0회 (2배수)', () => {
    expect(gramsToFlightFraction(260_000)).toBe(2.0);
  });

  it('1300g (1.3kg) = 0.01회 (소숫점 2자리)', () => {
    // 1.3 / 130 = 0.01
    expect(gramsToFlightFraction(1_300)).toBe(0.01);
  });

  it('0 → 0', () => {
    expect(gramsToFlightFraction(0)).toBe(0);
  });

  it('음수 → 0', () => {
    expect(gramsToFlightFraction(-10_000)).toBe(0);
  });

  it('NaN → 0', () => {
    expect(gramsToFlightFraction(NaN)).toBe(0);
  });

  it('Infinity → 0 (방어)', () => {
    expect(gramsToFlightFraction(Infinity)).toBe(0);
  });
});
