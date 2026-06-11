// carbon.test.ts — calculator·factors·formatter 검증
// 검증: 자가용 100km = 21,000g, 빈 waypoints → 0, CARBON_FACTOR 변경 감지
import { describe, it, expect } from 'vitest';
import { CARBON_FACTOR, ROAD_DISTANCE_FACTOR, TREE_ABSORPTION_G_PER_YEAR } from '@/lib/carbon/factors';
import { calculateRouteCarbon } from '@/lib/carbon/calculator';
import { formatCarbon, treeEquivalent, carEquivalentKm } from '@/lib/carbon/formatter';

describe('CARBON_FACTOR (DEVELOPMENT_PLAN §4.1 수식 진원지)', () => {
  it('자가용 = 210 g/km', () => expect(CARBON_FACTOR.car).toBe(210));
  it('고속/시외버스 = 68 g/km', () => expect(CARBON_FACTOR.express_bus).toBe(68));
  it('시내버스 = 78 g/km', () => expect(CARBON_FACTOR.city_bus).toBe(78));
  it('KTX = 18 g/km', () => expect(CARBON_FACTOR.train_ktx).toBe(18));
  it('ITX = 25 g/km', () => expect(CARBON_FACTOR.train_itx).toBe(25));
  it('자전거 = 0 g/km', () => expect(CARBON_FACTOR.bicycle).toBe(0));
  it('도보 = 0 g/km', () => expect(CARBON_FACTOR.walking).toBe(0));
  it('소나무 환산 = 22kg/년', () => expect(TREE_ABSORPTION_G_PER_YEAR).toBe(22_000));
  it('도로 보정 = 1.3', () => expect(ROAD_DISTANCE_FACTOR).toBe(1.3));
});

describe('calculateRouteCarbon', () => {
  it('빈 waypoints → totalKm=0, totalCO2g=0, segments=[]', () => {
    const r = calculateRouteCarbon([], 'car');
    expect(r.totalKm).toBe(0);
    expect(r.totalCO2g).toBe(0);
    expect(r.segments).toEqual([]);
  });

  it('단일 waypoint도 0', () => {
    const r = calculateRouteCarbon([{ lat: 37.5, lng: 126.9 }], 'car');
    expect(r.totalKm).toBe(0);
    expect(r.totalCO2g).toBe(0);
  });

  it('자가용 100km 직선 ≈ 130km 도로 = 27,300g (직선 100km × 1.3 × 210)', () => {
    // 위도 1도 ≈ 111.32 km. 위도 0.898... ≈ 100km
    // Haversine로 100km 가깝게 두 점 잡기 (경도 동일, 위도만 변경)
    const r = calculateRouteCarbon(
      [
        { lat: 37.0, lng: 127.0 },
        { lat: 37.8983, lng: 127.0 }, // ≈ 100km
      ],
      'car',
    );
    // 직선 ≈ 100km, 도로 ≈ 130km, CO₂ = 130 × 210 = 27,300g
    expect(r.totalKm).toBeGreaterThan(125);
    expect(r.totalKm).toBeLessThan(135);
    expect(r.totalCO2g).toBeGreaterThan(26000);
    expect(r.totalCO2g).toBeLessThan(28500);
  });

  it('자가용 100km(도로) → 정확히 21,000g 검증을 위해 도로거리 100km 입력 유도', () => {
    // 도로거리 100km = 직선거리 100/1.3 ≈ 76.92km
    // 위도 0.69도 ≈ 76.92km (76.92/111.32)
    const dLat = 76.92 / 111.32;
    const r = calculateRouteCarbon(
      [
        { lat: 37.0, lng: 127.0 },
        { lat: 37.0 + dLat, lng: 127.0 },
      ],
      'car',
    );
    // 도로 ≈ 100km, CO₂ ≈ 21,000g (±2%)
    expect(r.totalKm).toBeGreaterThan(99);
    expect(r.totalKm).toBeLessThan(101);
    expect(r.totalCO2g).toBeGreaterThan(20600);
    expect(r.totalCO2g).toBeLessThan(21400);
  });

  it('자전거·도보는 CO₂=0 (거리는 양수)', () => {
    const wps = [
      { lat: 37.0, lng: 127.0 },
      { lat: 37.1, lng: 127.1 },
    ];
    const bike = calculateRouteCarbon(wps, 'bicycle');
    const walk = calculateRouteCarbon(wps, 'walking');
    expect(bike.totalCO2g).toBe(0);
    expect(walk.totalCO2g).toBe(0);
    expect(bike.totalKm).toBeGreaterThan(0);
  });

  it('KTX는 자가용의 약 1/12 CO₂ (18/210)', () => {
    const wps = [
      { lat: 37.0, lng: 127.0 },
      { lat: 38.0, lng: 127.0 },
    ];
    const car = calculateRouteCarbon(wps, 'car');
    const ktx = calculateRouteCarbon(wps, 'train_ktx');
    expect(car.totalCO2g / ktx.totalCO2g).toBeCloseTo(210 / 18, 0);
  });

  it('segments 길이 = waypoints.length - 1', () => {
    const wps = [
      { lat: 37.0, lng: 127.0 },
      { lat: 37.5, lng: 127.0 },
      { lat: 38.0, lng: 127.5 },
    ];
    const r = calculateRouteCarbon(wps, 'car');
    expect(r.segments).toHaveLength(2);
    expect(r.segments[0].co2g).toBeGreaterThan(0);
    expect(r.segments[1].co2g).toBeGreaterThan(0);
  });

  // 2026-06-11 재감사 H1 회귀 방지 — 구간 합 = 총합 자기일관
  it('도심 8지점 단거리 코스: Σ(seg.km) = totalKm (구간 합 ≠ 총합 모순 해소)', () => {
    // 재감사 실측 패턴 재현: 구간 raw ≈ 0.457km(표시 0.5km) × 7
    // 구모델 구현은 totalKm=3.2 vs Σseg=3.5 (drift -0.3km)였음
    const step = 0.457 / 1.3 / 111.32; // raw 도로거리 0.457km가 되는 위도 간격
    const wps = Array.from({ length: 8 }, (_, i) => ({
      lat: 37.5666 + i * step,
      lng: 126.9784,
    }));
    const walk = calculateRouteCarbon(wps, 'walking');
    const sumKm = walk.segments.reduce((acc, s) => acc + s.km, 0);
    expect(Math.round(sumKm * 10) / 10).toBe(walk.totalKm);
  });

  it('도심 8지점 단거리 코스: Σ(seg.co2g) = totalCO2g (CO₂ 자기일관)', () => {
    const step = 0.457 / 1.3 / 111.32;
    const wps = Array.from({ length: 8 }, (_, i) => ({
      lat: 37.5666 + i * step,
      lng: 126.9784,
    }));
    const car = calculateRouteCarbon(wps, 'car');
    const sumCo2 = car.segments.reduce((acc, s) => acc + s.co2g, 0);
    expect(sumCo2).toBe(car.totalCO2g);
  });

  it('장거리 다구간 코스에서도 Σ(seg) = total (km·CO₂ 모두)', () => {
    const wps = [
      { lat: 37.8813, lng: 127.7298 }, // 춘천
      { lat: 37.3705, lng: 128.3905 }, // 평창
      { lat: 37.7519, lng: 128.8761 }, // 강릉
      { lat: 38.207, lng: 128.5918 }, // 속초
    ];
    const r = calculateRouteCarbon(wps, 'express_bus');
    const sumKm = r.segments.reduce((acc, s) => acc + s.km, 0);
    const sumCo2 = r.segments.reduce((acc, s) => acc + s.co2g, 0);
    expect(Math.round(sumKm * 10) / 10).toBe(r.totalKm);
    expect(sumCo2).toBe(r.totalCO2g);
  });

  it('km 소수 1자리, CO₂ 정수 (단위 일관성)', () => {
    const r = calculateRouteCarbon(
      [
        { lat: 37.5, lng: 127.0 },
        { lat: 37.6, lng: 127.1 },
      ],
      'car',
    );
    expect(r.totalKm).toBe(Math.round(r.totalKm * 10) / 10);
    expect(Number.isInteger(r.totalCO2g)).toBe(true);
  });
});

describe('formatCarbon', () => {
  it('1000g 미만은 g', () => {
    expect(formatCarbon(500)).toBe('500 g');
    expect(formatCarbon(999)).toBe('999 g');
    expect(formatCarbon(0)).toBe('0 g');
  });
  it('1000g 이상은 kg (소수 1자리)', () => {
    expect(formatCarbon(1000)).toBe('1.0 kg');
    expect(formatCarbon(12_400)).toBe('12.4 kg');
    expect(formatCarbon(9_500)).toBe('9.5 kg');
  });
  it('NaN·Infinity 안전 처리', () => {
    expect(formatCarbon(NaN)).toBe('0 g');
    expect(formatCarbon(Infinity)).toBe('0 g');
  });
});

describe('treeEquivalent', () => {
  it('22,000g = 1.0 그루', () => expect(treeEquivalent(22_000)).toBe(1));
  it('11,000g = 0.5 그루', () => expect(treeEquivalent(11_000)).toBe(0.5));
  it('0 또는 음수는 0', () => {
    expect(treeEquivalent(0)).toBe(0);
    expect(treeEquivalent(-1000)).toBe(0);
  });
});

describe('carEquivalentKm', () => {
  it('21,000g = 자가용 100km', () => {
    expect(carEquivalentKm(21_000, 'car')).toBe(100);
  });
  it('0g = 0km', () => expect(carEquivalentKm(0)).toBe(0));
  it('자전거 모드는 factor 0이므로 0', () => {
    expect(carEquivalentKm(1000, 'bicycle')).toBe(0);
  });
});
