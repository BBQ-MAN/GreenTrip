---
name: carbon-course-engine
description: GreenTrip 탄소 배출 계산 및 코스 최적화 엔진 스킬. Haversine 거리, 이동수단별 CO₂, Nearest Neighbor + 2-opt, 이동수단 3안 생성, 접근성 점수를 구현. domain-logic 에이전트가 Week 3 및 알고리즘 수정 요청 시 사용.
---

# Carbon & Course Engine — 도메인 알고리즘

## 언제 사용하는가

- Week 3 탄소 계산 + 코스 자동 생성 구현
- CARBON_FACTOR 상수 수정
- 경로 최적화 알고리즘 변경 (2-opt → 3-opt 등)
- 축제/반려동물/접근성 필터 구현 (Week 6~9)

## 모듈 구조

```
src/lib/carbon/
├── factors.ts      # CARBON_FACTOR 상수
├── calculator.ts   # 구간별/코스 CO₂ 계산
└── formatter.ts    # g → kg → "소나무 N그루" 환산

src/lib/map/
└── distance.ts     # Haversine + 도로거리 보정

src/lib/course/
├── generator.ts    # 후보 풀 + Nearest Neighbor
├── optimizer.ts    # 2-opt 개선
├── comparator.ts   # 이동수단 3안 (A/B/C)
└── filters.ts      # 축제·반려동물·접근성

src/app/api/course/generate/route.ts
src/app/api/carbon/calculate/route.ts
```

## 1. 탄소 계수 (factors.ts)

```typescript
// DEVELOPMENT_PLAN.md 4.1 수식. 변경 시 출처 명시 필수.
export const CARBON_FACTOR = {
  car: 210,          // 자가용 (중형차, g/km/인)
  express_bus: 68,   // 고속/시외버스
  city_bus: 78,      // 시내버스
  train_ktx: 18,     // KTX
  train_itx: 25,     // ITX/일반열차
  bicycle: 0,        // 자전거
  walking: 0,        // 도보
} as const;

export type TransportMode = keyof typeof CARBON_FACTOR;
```

## 2. 거리 계산 (distance.ts)

```typescript
export function haversineKm(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const ROAD_DISTANCE_FACTOR = 1.3;
export const roadKm = (straight: number) => straight * ROAD_DISTANCE_FACTOR;
```

## 3. 탄소 계산기 (calculator.ts)

```typescript
import type { TransportMode } from './factors';
import { CARBON_FACTOR } from './factors';
import { haversineKm, roadKm } from '@/lib/map/distance';

export interface Waypoint { lat: number; lng: number; }

export function calculateRouteCarbon(
  waypoints: Waypoint[],
  mode: TransportMode
): { totalKm: number; totalCO2g: number; segments: number[] } {
  const segments: number[] = [];
  let totalKm = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const km = roadKm(haversineKm(
      waypoints[i].lat, waypoints[i].lng,
      waypoints[i + 1].lat, waypoints[i + 1].lng
    ));
    segments.push(km);
    totalKm += km;
  }
  return {
    totalKm: Math.round(totalKm * 10) / 10,
    totalCO2g: Math.round(totalKm * CARBON_FACTOR[mode]),
    segments,
  };
}
```

## 4. 환산 (formatter.ts)

```typescript
// 소나무 1그루 = 약 22kg CO₂/년 흡수
const TREE_KG_PER_YEAR = 22;

export function formatCarbon(co2g: number): string {
  if (co2g < 1000) return `${co2g} g`;
  return `${(co2g / 1000).toFixed(1)} kg`;
}

export function treeEquivalent(co2g: number): number {
  return Math.round((co2g / 1000 / TREE_KG_PER_YEAR) * 10) / 10;
}
```

## 5. 코스 생성 (generator.ts)

**후보 풀 구성:**
1. areaBasedList2 또는 locationBasedList2로 관광지 풀 수집
2. lclsSystmCode2 분류체계(lclsSystm1~3) 필터 적용 — categoryCode 계열은 폐기 예정이므로 사용 금지
3. (옵션) searchFestival2 결과 병합
4. (옵션) detailPetTour2로 반려동물 불가 제외

**Nearest Neighbor:**
```typescript
export function nearestNeighbor(
  spots: Spot[], start: Spot
): Spot[] {
  const route: Spot[] = [start];
  const remaining = new Set(spots.filter(s => s.id !== start.id));
  let current = start;
  while (remaining.size > 0) {
    let nearest: Spot | null = null;
    let minDist = Infinity;
    for (const s of remaining) {
      const d = haversineKm(current.lat, current.lng, s.lat, s.lng);
      if (d < minDist) { minDist = d; nearest = s; }
    }
    if (!nearest) break;
    route.push(nearest);
    remaining.delete(nearest);
    current = nearest;
  }
  return route;
}
```

## 6. 2-opt 최적화 (optimizer.ts)

```typescript
const MAX_ITERATIONS = 50; // 무한루프 방지

export function twoOpt(route: Spot[]): Spot[] {
  let best = [...route];
  let improved = true;
  let iter = 0;
  while (improved && iter < MAX_ITERATIONS) {
    improved = false;
    iter++;
    for (let i = 1; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const next = twoOptSwap(best, i, j);
        if (totalKm(next) < totalKm(best)) {
          best = next;
          improved = true;
        }
      }
    }
  }
  return best;
}
```

## 7. 3안 비교 (comparator.ts)

```typescript
// A안: 자가용 최단 (2-opt 결과 그대로)
// B안: 대중교통 — 시작점/끝점을 가까운 역·터미널로 대체 후 재계산
// C안: 자전거/도보 — 10km 반경으로 후보 필터 후 2-opt

export function buildThreeOptions(
  pool: Spot[], start: Spot
): {
  car: CourseOption;
  transit: CourseOption;
  active: CourseOption | null; // 반경 내 관광지 부족 시 null
}
```

`CourseOption` 타입: `{ waypoints: Spot[]; totalKm: number; totalCO2g: number; duration: string; }`

## 8. 필터 (filters.ts)

```typescript
export function excludeNonPetFriendly(spots: Spot[]): Promise<Spot[]>;
export function filterByAccessibility(spots: Spot[], minScore: number): Spot[];
export function mergeFestivals(spots: Spot[], festivals: Festival[], daterange: Range): Spot[];
```

## 9. 접근성 점수

```typescript
// overview, infocenter 텍스트 키워드 매칭 (보수적)
export function calculateAccessibility(detail: SpotDetail): AccessibilityScore {
  const text = `${detail.overview ?? ''} ${detail.infocenter ?? ''}`;
  const publicTransport = Math.min(100,
    (text.match(/버스|지하철|KTX|역에서|정류장/g)?.length ?? 0) * 20);
  const parking = text.includes('주차장') ? (text.includes('무료') ? 100 : 60) : 20;
  const wheelchair = Math.min(100,
    (text.match(/장애인|엘리베이터|경사로|무장애/g)?.length ?? 0) * 30);
  const petFriendly = /* detailPetTour2 결과로 대체 */;
  return { publicTransport, parking, wheelchair, petFriendly };
}
```

## 작업 원칙

1. **순수 함수 우선** — I/O 없이 입력만으로 결과 결정
2. **단위 일관성** — km(소수 1자리), CO₂(g 정수)
3. **성능 상한** — 2-opt은 MAX_ITERATIONS 또는 관광지 수 20 이내
4. **엣지 케이스** — waypoints < 2, 좌표 범위 밖 필터링
5. **테스트 스켈레톤 동반** — `tests/lib/carbon.test.ts`, `tests/lib/course.test.ts`

## 참고 자료

- DEVELOPMENT_PLAN.md 4장 (핵심 알고리즘)
