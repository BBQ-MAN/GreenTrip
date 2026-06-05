---
name: tourapi-integration
description: 한국관광공사 TourAPI(KorService2) 13종 + 두루누비 1종 = 14종 연동 스킬. HTTP 클라이언트, Route Handler, Redis 캐싱, 응답 unwrap 정규화. tourapi-integrator 에이전트가 Week 2 및 TourAPI 관련 요청 시 사용.
---

# TourAPI Integration — 외부 API 연동

## 언제 사용하는가

- Week 2 TourAPI 클라이언트 + Route Handlers 구축
- 축제(Week 6~7), 반려동물(Week 8~9), 숙박(Week 12~13) API 추가
- 캐시 TTL 조정, Rate Limit 대응
- KorService1 잔존 발견 시 KorService2로 즉시 마이그레이션

## v1.6 변경 사항 (2026-06-05)

> **사용자 활용신청서 1차 출처 — KorService1 → KorService2 일괄 마이그레이션**

- Base URL: `KorService1` → **`KorService2`** (모든 endpoint `*2` 접미사)
- 활용 종수: **14종 (KorService2 활성 13종 + 두루누비 1종)**, 19종 중 약 74%
- 신규 endpoint 5종 추가: `searchStay2`, `detailInfo2`, `ldongCode2`, `lclsSystmCode2` (KorService2 신청서 기준), 두루누비는 별도
- 미사용 2종: `areaCode2`·`categoryCode2` "신청은 됐으나 호출 0건" (정식 대체 = ldongCode2/lclsSystmCode2)

## TourAPI 공통 설정

```typescript
// src/lib/tourapi/constants.ts (v1.6 KorService2)
export const TOUR_API_BASE = 'https://apis.data.go.kr/B551011/KorService2';
export const DURUNUBI_API_BASE = 'https://apis.data.go.kr/B551011/Durunubi'; // 별도 신청

export const TOUR_API_COMMON_PARAMS = {
  MobileOS: 'ETC',
  MobileApp: 'GreenTrip',   // ← 운영계정 승인요건 (OpenAPI 자료 p9). 절대 변경 금지.
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

// 활성 13종 식별자
export const TOUR_API_ENDPOINTS = {
  locationBasedList2, areaBasedList2, areaBasedSyncList2,
  searchKeyword2, searchFestival2, searchStay2,
  detailCommon2, detailIntro2, detailInfo2, detailImage2, detailPetTour2,
  ldongCode2, lclsSystmCode2,
} as const;

// 호출 금지 목록 (QA grep 검증 대상)
export const TOUR_API_DEPRECATED = ['areaCode2', 'categoryCode2'] as const;
```

## 클라이언트 구조 (src/lib/tourapi/client.ts)

```typescript
// 핵심 요구사항:
// 1. 서비스키 자동 주입 (TOUR_API_KEY)
// 2. 공통 파라미터 자동 주입 (MobileApp=GreenTrip)
// 3. KorService2 응답 unwrap:
//    - 정상: response.body.items.item이 단일/배열/'' (빈 문자열) 모두 가능
//      → 항상 T[] 배열로 정규화. items='' 또는 totalCount=0이면 []
//    - 에러: { resultCode: '11', resultMsg, responseTime } 형태 (response 래퍼 없음)
// 4. resultCode !== "0000" → Error (정상 응답 구조에서)
// 5. single-flight (같은 쿼리 동시 요청 시 Promise 공유)
// 6. 미사용 2종(areaCode2·categoryCode2) endpoint 인자로 들어오면 throw

export async function callTourAPI<T>(
  endpoint: TourAPIEndpoint,  // 컴파일 타임에 미사용 2종 차단 가능
  params: Record<string, string | number>
): Promise<TourAPIResponse<T>>;  // { items: T[], totalCount, pageNo, numOfRows }

// 두루누비는 별도 함수 (Base URL 다름)
export async function callDurunubiAPI<T>(
  operation: 'courseList' | 'routeList',
  params: Record<string, string | number>
): Promise<TourAPIResponse<T>>;
```

### KorService2 실측 응답 형식 (참고)

```json
// 정상
{
  "response": {
    "header": {"resultCode": "0000", "resultMsg": "OK"},
    "body": {
      "items": {"item": [...]},  // 단일 객체 또는 배열, 빈 응답이면 ""
      "totalCount": 1234,
      "pageNo": 1,
      "numOfRows": 10
    }
  }
}

// 파라미터 누락 (정상 응답 구조와 다름!)
{
  "responseTime": "...",
  "resultCode": "11",
  "resultMsg": "NO_MANDATORY_REQUEST_PARAMETERS_ERROR"
}
```

## 캐시 전략 (src/lib/tourapi/cache.ts)

```typescript
// 캐시 키: tour:{endpoint}:{sha1(sorted JSON params)}
// TTL (KorService2 v1.6):
//   ldongCode2, lclsSystmCode2: 86400s (24h, 정적에 가까움)
//   locationBasedList2, areaBasedList2: 3600s (1h)
//   searchKeyword2: 1800s (30m)
//   searchFestival2, searchStay2: 21600s (6h)
//   detailCommon2, detailIntro2, detailPetTour2: 21600s (6h)
//   detailInfo2: 86400s (24h, 정적)
//   detailImage2: 86400s (24h)
//   areaBasedSyncList2: 캐시 안 함 (cron 트리거)

// Stale fallback: 네트워크 실패 시 만료된 캐시 반환, X-Cache: STALE 헤더

import { Redis } from '@upstash/redis';
export const redis = Redis.fromEnv();
```

## Route Handlers (src/app/api/tour/*/route.ts)

### Route ↔ KorService2 endpoint 매핑 (v1.6)

| Route | KorService2 endpoint(s) | 쿼리 파라미터 | 캐시 |
|-------|------------------------|--------------|------|
| `/api/tour/area` | `areaBasedList2` (+ `ldongCode2` 필요시) | areaCode, sigunguCode, contentTypeId? | 1h / 24h |
| `/api/tour/location` | `locationBasedList2` | mapX, mapY, radius, contentTypeId? | 1h |
| `/api/tour/search` | `searchKeyword2` (+ `lclsSystmCode2` 필요시) | keyword OR lclsSystm1~3 | 30m / 24h |
| `/api/tour/festival` | `searchFestival2` | eventStartDate, eventEndDate, areaCode? | 6h |
| `/api/tour/detail` | `detailCommon2` + `detailIntro2` + `detailInfo2` ⭐ | contentId, contentTypeId? | 6h (Info 24h) |
| `/api/tour/images` | `detailImage2` | contentId | 24h |
| `/api/tour/pet` | `detailPetTour2` | contentId | 6h |
| `/api/tour/lodging` ⭐ | `searchStay2` (or `areaBasedList2` cTID=32) + `detailPetTour2` | areaCode, ecoCert?, petOk?, transitAccess? | 6h |
| `/api/tour/sync` ⭐ | `areaBasedSyncList2` | modifiedTime?, areaCode? | cron 트리거 |
| `/api/tour/durunubi` ⭐⭐ | Durunubi `courseList` + `routeList` | brdDiv?, routeIdx?, areaCode? | 24h |

⭐ 표시는 제안서 §3.1 "숙박정보·동기화 목록" 별도 명시 항목.
⭐⭐ 두루누비는 별도 Base URL Durunubi · 별도 신청 필요. KorService2와 분리.

### 신규 endpoint 작업 메모 (v1.6)

#### `detailInfo2` (반복정보) — `/api/tour/detail`에 통합

- contentTypeId별 반복 필드: 부대시설(12/14), 코스 구간(25), 객실 정보(32)
- 여행코스(25) 활용 시 두루누비 GPX와 보완 → 코스 큐레이션 정확도 향상
- 캐시 24h (정적에 가까움)
- 응답 필드는 `infoname/infotext` 또는 `subname/subdetailoverview` 등 contentType별 가변 → `SpotDetailInfo` 타입의 index signature 활용

#### `searchStay2` (숙박 전용) — `/api/tour/lodging`

- 숙박 도메인 최적화 검색. `areaBasedList2(contentTypeId=32)`로도 대체 가능하나 신규 endpoint 우선 활용
- 친환경(`ecoCert=Y`): overview/title 텍스트 키워드("친환경", "그린키", "에코") 매칭
- 반려동물(`petOk=Y`): 결과의 contentId별 `detailPetTour2` 합필터링 (캐시 의무)
- 대중교통(`transitAccess=Y`): `detailCommon2.overview`/`infocenter` 키워드 ("역에서 N분", "버스 정류장")

#### `ldongCode2` (법정동) — `/api/tour/area`에 통합 또는 신규 라우트

- areaCode2(미사용·삭제예정)의 정식 대체. 행안부 법정동 체계.
- 강원 18개 시군구 → 읍/면/동 수준 확장 가능 (Phase 4+ 콘텐츠 보강)
- 초기 1회 호출 → 정적 캐시 또는 ISR

#### `lclsSystmCode2` (분류체계) — `/api/tour/search`에 통합

- categoryCode2(미사용·삭제예정)의 정식 대체. 신규 분류체계(`lclsSystm1/2/3`).
- 콘텐츠 응답의 `lclsSystm1/2/3` 필드와 연동. 기존 `cat1/cat2/cat3` 체계와 병행.
- 테마 코스 자동 태깅에 활용.

### 두루누비(`/api/tour/durunubi`) 작업 메모

- **Base URL이 다름**: `https://apis.data.go.kr/B551011/Durunubi` (KorService2 아님).
- **별도 신청 필요**: 사용자 활용신청서(2026-06-05)에는 미포함. 공공데이터포털에서 별도 신청.
- `client.ts`에서 `callDurunubiAPI` 분리 함수로 처리.
- **오퍼레이션 2종**: `courseList`(코스 목록), `routeList`(구간 + GPX 트랙)
- **강원 필터링**: 응답 `sigun`/`brdDiv`/지역명으로 강원(고성·속초·양양·강릉·동해·삼척 등 동해안 + DMZ 접경) 추출
- **GPX 활용**: routeList GPX 좌표열로 실제 경로 거리 (Haversine 직선 추정보다 정확). `domain-logic`의 distance 계산에 옵션 전달
- **활용 위치**: ① 강원 ThemeCourse 시드 (Week 12~13) ② 자전거/도보 코스(C안) 보강 (Week 3 comparator) ③ `/explore` 테마 코스 탐색
- **캐시 24h**: 코스 데이터는 거의 정적. 동기화는 sync cron에 포함 가능.

### 숙박 필터링(`/api/tour/lodging`) 작업 메모

- 우선: `searchStay2` (KorService2 신규 숙박 전용). 보조: `areaBasedList2` with `contentTypeId=32`
- 친환경 인증(`ecoCert=Y`): TourAPI 자체 직접 플래그 없음 → overview 텍스트 키워드("친환경", "그린키", "에코") 매칭. Phase 4+ 외부 인증 DB와 결합.
- 반려동물(`petOk=Y`): `detailPetTour2`를 lodging 결과 contentId별 호출 → 합필터링. 캐시 활용 의무.
- 대중교통 접근(`transitAccess=Y`): `detailCommon2`의 infocenter/overview 텍스트 키워드 추출. 접근성 점수와 동일 로직.

### 동기화 목록(`/api/tour/sync`) 작업 메모

- TourAPI `areaBasedSyncList2` endpoint로 변경/추가/삭제된 contentId 목록 수집
- DB 캐시된 관광지 레코드와 비교 → 변경분만 갱신
- Vercel Cron 또는 GitHub Actions 일 1회 실행 (제안서 3.1 No.10 "데이터 최신성 유지")
- 동기화 실행 로그 별도 테이블 기록 → 공모전 심사 시 "데이터 최신성" 증빙

### Route 템플릿

```typescript
// src/app/api/tour/location/route.ts (v1.6 KorService2)
import { NextRequest, NextResponse } from 'next/server';
import { callTourAPI } from '@/lib/tourapi/client';
import { getCached, setCached } from '@/lib/tourapi/cache';
import type { SpotItem, TourAPIResponse } from '@/types/tour';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mapX = searchParams.get('mapX');
  const mapY = searchParams.get('mapY');
  const radius = searchParams.get('radius') ?? '5000';

  if (!mapX || !mapY) {
    return NextResponse.json({ error: 'mapX, mapY required' }, { status: 400 });
  }

  const cacheKey = `tour:locationBasedList2:${mapX}:${mapY}:${radius}`;
  const cached = await getCached<TourAPIResponse<SpotItem>>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const result = await callTourAPI<SpotItem>('locationBasedList2', {
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

훅(`useTourAPI`)은 이 shape을 기대하고 `fetchJson<TourAPIResponse<T>>`로 타입 지정. **shape 변경 시 반드시 ui-builder에게 SendMessage.**

## 미사용 2종 호출 0건 규약 (v1.6)

```typescript
// 호출 금지: areaCode2 / categoryCode2
//
// 정식 대체:
//   areaCode2     → ldongCode2 (법정동, API-12)
//   categoryCode2 → lclsSystmCode2 (분류체계, API-13)
//
// QA 검증 (greentrip-qa SKILL §E):
//   Grep "areaCode2|categoryCode2" src/  → 호출 코드 (callTourAPI 인자) 0건 확인
//   상수 정의 (TOUR_API_DEPRECATED)·주석 언급은 허용
```

## 작업 원칙

1. **서버 사이드 전용** — 클라이언트에서 `TOUR_API_KEY` 사용 금지
2. **KorService2 단일** — Base URL은 `TOUR_API_BASE`(KorService2) 사용. KorService1 잔존 발견 시 즉시 교체
3. **원본 필드명 보존** — `mapx/mapy` → `lng/lat`으로 바꾸지 않음. 도메인 변환은 Waypoint 매핑 1곳에서만
4. **에러 표준화** — 400(파라미터/resultCode≠'0000'), 503(외부 API), 500(내부)
5. **로깅** — 파싱 실패 시 raw body 로그, 캐시 히트/미스 헤더
6. **미사용 2종 호출 0건** — `areaCode2`·`categoryCode2` 코드 추가 금지

## QA 교차 검증 지원

qa-reviewer 요청 시 다음을 제공:
- 각 Route의 `NextResponse.json()` 반환 shape
- 대응 훅 파일 경로 (`src/hooks/useTourAPI.ts`)
- 호출 endpoint 목록 (TOUR_API_ENDPOINTS 사용 확인)
- 미사용 2종 grep 결과 (0건 증빙)

## 참고 자료

- DEVELOPMENT_PLAN.md §3 (TourAPI 14종 명세, v1.6)
- DEVELOPMENT_PLAN.md §10.4 핵심 규칙 (서버 호출, Redis 캐시)
- `_workspace/tourapi_migration_v1.6.md` (KorService1→2 매핑·검증 결과)
- references/endpoints.md (추가 endpoint 패턴이 필요하면 생성)
