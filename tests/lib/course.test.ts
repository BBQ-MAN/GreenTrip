// course.test.ts — generator·optimizer·comparator 검증
import { describe, it, expect } from 'vitest';
import { nearestNeighborRoute, hasValidCoord, spotToWaypoint } from '@/lib/course/generator';
import {
  twoOptImprove,
  twoOptSwap,
  totalDistance,
  MAX_ITERATIONS,
  TWO_OPT_POOL_LIMIT,
} from '@/lib/course/optimizer';
import { buildThreeOptions, ACTIVE_RADIUS_KM } from '@/lib/course/comparator';
import type { CourseWaypoint } from '@/types/course';
import type { SpotItem } from '@/types/tour';

function wp(contentId: string, lat: number, lng: number): CourseWaypoint {
  return { contentId, title: contentId, lat, lng, contentType: 12 };
}

// 강원도 주요 좌표 4점
const CHUNCHEON = wp('cc', 37.8813, 127.7298); // 춘천
const GANGNEUNG = wp('gn', 37.7519, 128.8761); // 강릉
const SOKCHO = wp('sc', 38.207, 128.5918); // 속초
const PYEONGCHANG = wp('pc', 37.3705, 128.3905); // 평창

describe('hasValidCoord', () => {
  it('정상 좌표는 true', () => {
    expect(hasValidCoord({ lat: 37.5, lng: 127.0 })).toBe(true);
  });
  it('0,0 좌표는 false (KorService2 누락 케이스)', () => {
    expect(hasValidCoord({ lat: 0, lng: 0 })).toBe(false);
  });
  it('NaN은 false', () => {
    expect(hasValidCoord({ lat: NaN, lng: 127 })).toBe(false);
  });
  it('범위 밖 좌표는 false', () => {
    expect(hasValidCoord({ lat: 91, lng: 127 })).toBe(false);
    expect(hasValidCoord({ lat: 37, lng: 181 })).toBe(false);
  });
});

describe('spotToWaypoint', () => {
  it('SpotItem → CourseWaypoint 매핑 (mapy=lat, mapx=lng)', () => {
    const spot: SpotItem = {
      contentid: 'X1',
      contenttypeid: 12,
      title: 'Spot',
      addr1: 'A1',
      addr2: 'A2',
      areacode: 32,
      mapx: 127.5,
      mapy: 37.5,
      firstimage: 'http://img/1.jpg',
    };
    const w = spotToWaypoint(spot);
    expect(w.contentId).toBe('X1');
    expect(w.lat).toBe(37.5);
    expect(w.lng).toBe(127.5);
    expect(w.address).toBe('A1 A2');
  });
});

describe('nearestNeighborRoute', () => {
  it('start 1개만 있으면 start 반환', () => {
    const route = nearestNeighborRoute([CHUNCHEON], CHUNCHEON);
    expect(route).toHaveLength(1);
    expect(route[0]).toBe(CHUNCHEON);
  });

  it('start + 3개 → 4개 경로 (결정적 출력)', () => {
    const spots = [CHUNCHEON, GANGNEUNG, SOKCHO, PYEONGCHANG];
    const route = nearestNeighborRoute(spots, CHUNCHEON);
    expect(route).toHaveLength(4);
    expect(route[0].contentId).toBe('cc');
    // 춘천에서 가장 가까운 다음 점은 평창
    expect(route[1].contentId).toBe('pc');
  });

  it('start가 spots에 포함돼도 중복 없음', () => {
    const spots = [CHUNCHEON, GANGNEUNG];
    const route = nearestNeighborRoute(spots, CHUNCHEON);
    expect(route).toHaveLength(2);
  });

  it('입력 spots 배열은 mutation 되지 않음', () => {
    const spots = [GANGNEUNG, SOKCHO];
    const original = [...spots];
    nearestNeighborRoute(spots, CHUNCHEON);
    expect(spots).toEqual(original);
  });
});

describe('twoOptSwap', () => {
  it('i..j 구간만 역순', () => {
    const route = [
      wp('a', 0, 0),
      wp('b', 1, 0),
      wp('c', 2, 0),
      wp('d', 3, 0),
      wp('e', 4, 0),
    ];
    const swapped = twoOptSwap(route, 1, 3);
    expect(swapped.map((s) => s.contentId)).toEqual(['a', 'd', 'c', 'b', 'e']);
  });

  it('입력 mutation 없음', () => {
    const route = [wp('a', 0, 0), wp('b', 1, 0), wp('c', 2, 0), wp('d', 3, 0)];
    const original = [...route];
    twoOptSwap(route, 1, 2);
    expect(route.map((s) => s.contentId)).toEqual(original.map((s) => s.contentId));
  });
});

describe('twoOptImprove', () => {
  it('MAX_ITERATIONS 상수 = 50', () => expect(MAX_ITERATIONS).toBe(50));
  it('TWO_OPT_POOL_LIMIT = 20', () => expect(TWO_OPT_POOL_LIMIT).toBe(20));

  it('3개 미만 입력은 그대로 반환', () => {
    const r = twoOptImprove([CHUNCHEON, GANGNEUNG]);
    expect(r).toHaveLength(2);
  });

  it('명백히 교차하는 경로를 개선', () => {
    // 정사각형 모서리 4점: a(0,0) b(0,1) c(1,1) d(1,0)
    // 잘못된 순서 a → c → b → d 는 X자 교차 → 2-opt가 a→b→c→d 또는 a→d→c→b 로 개선
    const a = wp('a', 0, 0);
    const c = wp('c', 1, 1);
    const b = wp('b', 0, 1);
    const d = wp('d', 1, 0);
    const before = totalDistance([a, c, b, d]);
    const optimized = twoOptImprove([a, c, b, d]);
    const after = totalDistance(optimized);
    expect(after).toBeLessThanOrEqual(before);
  });

  it('수렴 보장 (MAX_ITERATIONS 내 종료) — 25개 풀에서도 hang 없음', () => {
    const spots: CourseWaypoint[] = [];
    for (let i = 0; i < 25; i++) {
      // 0~1 범위 랜덤이 아닌 결정적 패턴
      spots.push(wp(`p${i}`, 37 + (i % 5) * 0.1, 127 + Math.floor(i / 5) * 0.1));
    }
    const t0 = Date.now();
    const result = twoOptImprove(spots);
    const elapsed = Date.now() - t0;
    // 상한 적용으로 20개로 절단
    expect(result.length).toBeLessThanOrEqual(TWO_OPT_POOL_LIMIT);
    expect(elapsed).toBeLessThan(2000); // 2초 이내 종료
  });

  it('첫 점(시작점)은 변경되지 않음', () => {
    const route = [CHUNCHEON, GANGNEUNG, SOKCHO, PYEONGCHANG];
    const optimized = twoOptImprove(route);
    expect(optimized[0].contentId).toBe('cc');
  });
});

describe('totalDistance', () => {
  it('빈/단일은 0', () => {
    expect(totalDistance([])).toBe(0);
    expect(totalDistance([CHUNCHEON])).toBe(0);
  });
  it('2점은 Haversine 1구간', () => {
    expect(totalDistance([CHUNCHEON, GANGNEUNG])).toBeGreaterThan(80);
    expect(totalDistance([CHUNCHEON, GANGNEUNG])).toBeLessThan(120);
  });
});

describe('buildThreeOptions — 3안 shape', () => {
  it('car/transit/active/recommended 키 모두 존재', () => {
    const pool = [CHUNCHEON, GANGNEUNG, SOKCHO, PYEONGCHANG];
    const r = buildThreeOptions(pool, CHUNCHEON, { maxSpots: 4 });
    expect(r).toHaveProperty('car');
    expect(r).toHaveProperty('transit');
    expect(r).toHaveProperty('active');
    expect(r).toHaveProperty('recommended');
  });

  it('car·transit은 항상 비어있지 않음 (CourseOption)', () => {
    const pool = [CHUNCHEON, GANGNEUNG, SOKCHO];
    const r = buildThreeOptions(pool, CHUNCHEON);
    expect(r.car.mode).toBe('car');
    expect(r.car.category).toBe('car');
    expect(r.car.waypoints.length).toBeGreaterThanOrEqual(2);
    expect(r.car.totalCO2g).toBeGreaterThan(0);
    expect(r.transit.category).toBe('transit');
    expect(r.transit.totalCO2g).toBeLessThan(r.car.totalCO2g); // 대중교통이 자가용보다 적음
  });

  it('자전거 모드 CO₂ = 0', () => {
    // 10km 내에 spot 2개 이상 보장 — 시작점 주변 좁게 배치
    const near1 = wp('n1', 37.5666, 126.9784); // 서울 시청
    const near2 = wp('n2', 37.5759, 126.9769); // 광화문 (≈1km)
    const near3 = wp('n3', 37.58, 126.99); // ≈2km
    const r = buildThreeOptions([near1, near2, near3], near1);
    expect(r.active).not.toBeNull();
    expect(r.active!.mode).toBe('bicycle');
    expect(r.active!.totalCO2g).toBe(0);
    expect(r.active!.category).toBe('active');
  });

  it('10km 반경 외만 있으면 active=null', () => {
    // 시작점 춘천, 다른 점들은 강릉/속초 (모두 10km 초과)
    const r = buildThreeOptions([CHUNCHEON, GANGNEUNG, SOKCHO], CHUNCHEON);
    expect(r.active).toBeNull();
  });

  it('ACTIVE_RADIUS_KM = 10', () => expect(ACTIVE_RADIUS_KM).toBe(10));

  it('segments 길이 = waypoints.length - 1', () => {
    const pool = [CHUNCHEON, GANGNEUNG, SOKCHO];
    const r = buildThreeOptions(pool, CHUNCHEON);
    expect(r.car.segments).toHaveLength(r.car.waypoints.length - 1);
  });

  it('recommended는 CourseCategory 값 중 하나', () => {
    const pool = [CHUNCHEON, GANGNEUNG, SOKCHO];
    const r = buildThreeOptions(pool, CHUNCHEON);
    expect(['car', 'transit', 'active']).toContain(r.recommended);
  });

  // 2026-06-11 재감사 H1 회귀 방지 — 옵션별 구간 합 = 총합 자기일관
  it('각 옵션의 Σ(seg.km)=totalKm, Σ(seg.co2g)=totalCO2g (DB 영속 값 자기일관)', () => {
    const pool = [CHUNCHEON, GANGNEUNG, SOKCHO, PYEONGCHANG];
    const r = buildThreeOptions(pool, CHUNCHEON);
    for (const opt of [r.car, r.transit]) {
      const sumKm = opt.segments.reduce((acc, s) => acc + s.km, 0);
      const sumCo2 = opt.segments.reduce((acc, s) => acc + s.co2g, 0);
      expect(Math.round(sumKm * 10) / 10).toBe(opt.totalKm);
      expect(sumCo2).toBe(opt.totalCO2g);
    }
  });

  it('단거리 다구간(active) 코스에서도 Σ(seg.km)=totalKm — 재감사 드리프트 패턴', () => {
    // 구간 raw ≈ 0.457km(표시 0.5km)가 연속되는 도심형 코스
    const step = 0.457 / 1.3 / 111.32;
    const pool = Array.from({ length: 8 }, (_, i) =>
      wp(`s${i}`, 37.5666 + i * step, 126.9784),
    );
    const r = buildThreeOptions(pool, pool[0]);
    expect(r.active).not.toBeNull();
    const sumKm = r.active!.segments.reduce((acc, s) => acc + s.km, 0);
    expect(Math.round(sumKm * 10) / 10).toBe(r.active!.totalKm);
  });
});

// 2026-06-11 재감사 H3 — 추천 = totalCO2g 최소 (방문지 수 공정성 규칙 포함)
describe('pickRecommended (buildThreeOptions.recommended) — CO₂ 최소 규칙', () => {
  // 시작점 주변 좁게 배치 (10km 반경 내)
  const near1 = wp('n1', 37.5666, 126.9784); // 서울 시청
  const near2 = wp('n2', 37.5759, 126.9769); // 광화문 (≈1km)
  const near3 = wp('n3', 37.58, 126.99); // ≈2km

  it('방문지 수가 같으면 3안 순수 CO₂ 비교 → CO₂=0인 active 추천', () => {
    const r = buildThreeOptions([near1, near2, near3], near1);
    expect(r.active).not.toBeNull();
    // 전 spot이 10km 내 → active 방문지 수 = car 방문지 수
    expect(r.active!.waypoints.length).toBe(r.car.waypoints.length);
    expect(r.active!.totalCO2g).toBe(0);
    expect(r.recommended).toBe('active');
  });

  it('active가 축소 코스(방문지 수 상이)면 비교에서 제외 → 동일 방문지인 transit 추천', () => {
    // near 2개 + 원거리 2개: active는 2개로 축소, car/transit은 4개
    const r = buildThreeOptions([near1, near2, GANGNEUNG, SOKCHO], near1);
    expect(r.active).not.toBeNull();
    expect(r.active!.waypoints.length).not.toBe(r.car.waypoints.length);
    // 축소 코스의 CO₂=0이라도 불공정 비교 → car/transit 중 최소 CO₂
    expect(r.recommended).toBe('transit');
  });

  it('active 없음(반경 내 spot 부족) → car/transit 중 CO₂ 최소인 transit', () => {
    const r = buildThreeOptions([CHUNCHEON, GANGNEUNG, SOKCHO], CHUNCHEON);
    expect(r.active).toBeNull();
    expect(r.transit.totalCO2g).toBeLessThan(r.car.totalCO2g);
    expect(r.recommended).toBe('transit');
  });
});
