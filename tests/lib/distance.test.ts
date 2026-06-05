// distance.test.ts — Haversine 공식 정확성 + 도로 보정
// 검증: 서울-부산 직선거리 ≈ 325 km (±5%), 도로 보정 ×1.3
import { describe, it, expect } from 'vitest';
import { haversineKm, roadKm, totalRouteKm } from '@/lib/map/distance';
import { ROAD_DISTANCE_FACTOR } from '@/lib/carbon/factors';

// 서울 시청, 부산 시청 좌표 (위키백과 표기)
const SEOUL = { lat: 37.5666, lng: 126.9784 };
const BUSAN = { lat: 35.1796, lng: 129.0756 };

describe('haversineKm', () => {
  it('서울-부산 직선거리는 325km 부근 (±5%)', () => {
    const km = haversineKm(SEOUL.lat, SEOUL.lng, BUSAN.lat, BUSAN.lng);
    // 실측 약 325km (위키 표기), ±5% 허용
    expect(km).toBeGreaterThan(325 * 0.95);
    expect(km).toBeLessThan(325 * 1.05);
  });

  it('동일 좌표는 0km', () => {
    expect(haversineKm(SEOUL.lat, SEOUL.lng, SEOUL.lat, SEOUL.lng)).toBeCloseTo(0, 5);
  });

  it('교환법칙 성립 (a→b 거리 = b→a 거리)', () => {
    const d1 = haversineKm(SEOUL.lat, SEOUL.lng, BUSAN.lat, BUSAN.lng);
    const d2 = haversineKm(BUSAN.lat, BUSAN.lng, SEOUL.lat, SEOUL.lng);
    expect(d1).toBeCloseTo(d2, 8);
  });

  it('서울 시청 ↔ 광화문 (약 1km 부근)', () => {
    // 서울 시청 → 광화문 (37.5759, 126.9769)
    const km = haversineKm(37.5666, 126.9784, 37.5759, 126.9769);
    expect(km).toBeGreaterThan(0.8);
    expect(km).toBeLessThan(1.5);
  });
});

describe('roadKm', () => {
  it('도로 보정계수는 정확히 1.3', () => {
    expect(ROAD_DISTANCE_FACTOR).toBe(1.3);
    expect(roadKm(100)).toBe(130);
    expect(roadKm(10)).toBe(13);
    expect(roadKm(0)).toBe(0);
  });
});

describe('totalRouteKm', () => {
  it('waypoints가 0~1개면 0', () => {
    expect(totalRouteKm([])).toBe(0);
    expect(totalRouteKm([SEOUL])).toBe(0);
  });

  it('2개 waypoints는 서울-부산 도로거리 ≈ 422km (325 × 1.3)', () => {
    const km = totalRouteKm([SEOUL, BUSAN]);
    // 325 × 1.3 = 422.5, ±5% 허용
    expect(km).toBeGreaterThan(422 * 0.95);
    expect(km).toBeLessThan(422 * 1.05);
  });

  it('3개 waypoints는 누적', () => {
    const km1 = totalRouteKm([SEOUL, BUSAN]);
    const km2 = totalRouteKm([SEOUL, BUSAN, SEOUL]);
    expect(km2).toBeCloseTo(km1 * 2, 1);
  });
});
