---
name: tourapi-integration
description: 한국관광공사 TourAPI(KorService1) 10종 연동 스킬. HTTP 클라이언트, 7개 Route Handler, Redis 캐싱, 응답 정규화. tourapi-integrator 에이전트가 Week 2 및 TourAPI 관련 요청 시 사용.
---

# TourAPI Integration — 외부 API 연동

## 언제 사용하는가

- Week 2 TourAPI 클라이언트 + Route Handlers 구축
- 축제(Week 6~7), 반려동물(Week 8~9) API 추가
- 캐시 TTL 조정, Rate Limit 대응

## TourAPI 공통 설정

```typescript
// src/lib/tourapi/constants.ts
export const TOURAPI_BASE = 'https://apis.data.go.kr/B551011/KorService1';
export const COMMON_PARAMS = {
  MobileOS: 'ETC',
  MobileApp: 'GreenTrip',
  _type: 'json',
} as const;

export const CONTENT_TYPE = {
  관광지: 12, 문화시설: 14, 축제공연행사: 15, 여행코스: 25,
  레포츠: 28, 숙박: 32, 쇼핑: 38, 음식점: 39,
} as const;

export const GANGWON = {
  areaCode: 32,
  sigungu: { 춘천시: 1, 원주시: 2, 강릉시: 3, 동해시: 4, 태백시: 5,
    속초시: 6, 삼척시: 7, 홍천군: 8, 횡성군: 9, 영월군: 10,
    평창군: 11, 정선군: 12, 철원군: 13, 화천군: 14, 양구군: 15,
    인제군: 16, 고성군: 17, 양양군: 18 },
} as const;
```

## 클라이언트 구조 (src/lib/tourapi/client.ts)

```typescript
// 핵심 요구사항:
// 1. 서비스키 자동 주입
// 2. 공통 파라미터 자동 주입
// 3. JSON 응답 파싱 (response.body.items.item) — null/단일객체/배열 모두 처리
// 4. resultCode !== "0000" → Error
// 5. single-flight (같은 쿼리 동시 요청 시 Promise 공유)

export async function callTourAPI<T>(
  endpoint: string,
  params: Record<string, string | number>
): Promise<{ items: T[]; totalCount: number; pageNo: number; numOfRows: number }>
```

## 캐시 전략 (src/lib/tourapi/cache.ts)

```typescript
// 캐시 키: tour:{endpoint}:{sha1(sorted JSON params)}
// TTL:
//   areaCode1, categoryCode1: 86400s (24h)
//   locationBasedList1, areaBasedList1: 3600s (1h)
//   searchKeyword1: 1800s (30m)
//   searchFestival1: 21600s (6h)
//   detailCommon1, detailIntro1, detailPetTour1: 21600s (6h)
//   detailImage1: 86400s (24h)

// Stale fallback: 네트워크 실패 시 만료된 캐시 반환, X-Cache: STALE 헤더

import { Redis } from '@upstash/redis';
export const redis = Redis.fromEnv();
```

## Route Handlers (src/app/api/tour/*/route.ts)

### 7개 엔드포인트

| Route | TourAPI 엔드포인트 | 쿼리 파라미터 | 캐시 |
|-------|-----------------|--------------|------|
| `/api/tour/area` | areaCode1 + categoryCode1 | areaCode? | 24h |
| `/api/tour/location` | locationBasedList1 | mapX, mapY, radius, contentTypeId? | 1h |
| `/api/tour/search` | searchKeyword1 + areaBasedList1 | keyword? OR areaCode? | 30m~1h |
| `/api/tour/festival` | searchFestival1 | eventStartDate, eventEndDate, areaCode? | 6h |
| `/api/tour/detail` | detailCommon1 + detailIntro1 | contentId, contentTypeId? | 6h |
| `/api/tour/images` | detailImage1 | contentId | 24h |
| `/api/tour/pet` | detailPetTour1 | contentId | 6h |

### Route 템플릿

```typescript
// src/app/api/tour/location/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { callTourAPI } from '@/lib/tourapi/client';
import { getCached, setCached } from '@/lib/tourapi/cache';
import type { SpotItem } from '@/types/tour';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mapX = searchParams.get('mapX');
  const mapY = searchParams.get('mapY');
  const radius = searchParams.get('radius') ?? '5000';

  if (!mapX || !mapY) {
    return NextResponse.json({ error: 'mapX, mapY required' }, { status: 400 });
  }

  const cacheKey = `tour:location:${mapX}:${mapY}:${radius}`;
  const cached = await getCached<{ items: SpotItem[]; totalCount: number }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const result = await callTourAPI<SpotItem>('locationBasedList1', {
      mapX, mapY, radius, arrange: 'E',
    });
    await setCached(cacheKey, result, 3600);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: 'TourAPI call failed', message: String(e) },
      { status: 503 }
    );
  }
}
```

## 응답 shape 계약

**모든 TourAPI Route는 아래 shape으로 정규화하여 반환:**
```typescript
{
  items: T[];       // 항상 배열 (빈 응답이면 [])
  totalCount: number;
  pageNo: number;
  numOfRows: number;
}
```

훅(`useTourAPI`)은 이 shape을 기대하고 `fetchJson<typeof shape>`로 타입 지정. **shape 변경 시 반드시 ui-builder에게 SendMessage.**

## 작업 원칙

1. **서버 사이드 전용** — 클라이언트에서 `TOUR_API_KEY` 사용 금지
2. **원본 필드명 보존** — `mapx/mapy` → `lng/lat`으로 바꾸지 않음. 타입 주석으로 의미 기록
3. **에러 표준화** — 400(파라미터), 503(외부 API), 500(내부)
4. **로깅** — 파싱 실패 시 raw body 로그, 캐시 히트/미스 헤더

## QA 교차 검증 지원

qa-reviewer의 요청 시 다음을 제공:
- 각 Route의 `NextResponse.json()` 반환 shape
- 대응 훅 파일 경로 (`src/hooks/useTourAPI.ts`)
- 래핑/unwrap 여부

## 참고 자료

- DEVELOPMENT_PLAN.md 3장 (TourAPI 10종 명세)
- DEVELOPMENT_PLAN.md 10.4 핵심 규칙 (서버 호출, Redis 캐시)
- references/endpoints.md (추가 엔드포인트 패턴이 필요하면 생성)
