# 🌿 GreenTrip (그린트립) — 개발 계획서

> **팀 매스그라피 (Massgraphy)**
> 2026 관광데이터 활용 공모전 ① 웹·앱 개발 부문
> 최종 업데이트: 2026-05-XX

---

## 1. 프로젝트 개요

### 1.1 서비스 한 줄 소개

이동수단별 탄소 배출량을 실시간 비교하고, 저탄소 최적 관광 코스를 자동 설계하는 **지속가능 여행 플래너**

### 1.2 핵심 가치

- **"같은 여행지, 다른 이동 방식"** — 목적지가 아닌 이동 방식의 환경 영향을 가시화
- 한국관광공사 OpenAPI **14종** 통합 활용 (KorService2 13종 + 두루누비 1종, 19종 중 약 74%)
- **강원도 지역 특화** (1차 런칭 지역)

### 1.3 공모전 타임라인

> 정확 일자: 2026-05-20 운영사무국 온라인 설명회 기준 (`_workspace/seminar/2026_seminar_findings.md` §A)

| 시기 | 마일스톤 | 비고 |
|------|---------|------|
| 2026.05 | 예비심사 통과 + OT | 제안서 심사 |
| 2026.05~06 | Phase 1: 핵심 기능 개발 | TourAPI 연동 + 탄소 계산 |
| 2026.07~08 | Phase 2: 선택 기능 + 테스트 | 축제/반려동물/리포트 |
| 2026.09 | Phase 3: 상용 런칭 | PWA 웹 정식 출시 |
| **2026-09-21 16:00** | **서비스 개발 마감 + 1차 심사 자료 제출 마감** | 한국관광 컨텐츠 랩 제출 |
| 2026.10 (중순) | 1차 심사 (기능심사) | 운영사무국 진행 |
| **2026-10-21 (수)** | **1차 합격자 발표** | 개별 안내 |
| **2026-10-28 (수)** | **최종 발표 심사 (PT, 오프라인)** | 상위 5팀, 대상·최우수상 결정 |
| **2026-11-05 (목)** | **시상식** | 대상 1팀(통합 부문) 1,000만원 + 최우수 5팀 + 우수 10팀 |

---

## 2. 기술 스택

### 2.1 프론트엔드

```
Framework:  Next.js 14+ (App Router)
Language:   TypeScript
Styling:    Tailwind CSS 3.x + shadcn/ui
State:      Zustand (가볍고 직관적)
지도:       Kakao Maps SDK (JavaScript)
PWA:        next-pwa (서비스워커, 오프라인 캐시)
차트:       Recharts (탄소 비교 시각화)
```

### 2.2 백엔드

```
Runtime:    Node.js 20 LTS
Framework:  Next.js API Routes (Route Handlers)
ORM:        Prisma
DB:         PostgreSQL (Supabase)
Cache:      Redis (Upstash) — API 응답 캐싱
Auth:       NextAuth.js (카카오/네이버/구글 소셜로그인)
```

### 2.3 인프라

```
Hosting:    Vercel (프론트 + API Routes)
DB:         Supabase (PostgreSQL + Auth + Storage)
Cache:      Upstash Redis (서버리스)
CDN:        Vercel Edge Network
CI/CD:      GitHub Actions → Vercel 자동 배포
모니터링:    Vercel Analytics + Sentry
```

### 2.4 외부 API

```
[필수] 한국관광공사 TourAPI (국문관광정보 서비스 KorService2) — 13종 활성
[필수] 한국관광공사 두루누비 정보 서비스 (별도 신청) — 1종
[필수] Kakao Maps API — 지도 표시, 경로, 거리 계산
[선택] 공공데이터포털 대중교통 API — 버스/철도 노선 정보
[선택] 기상청 단기예보 API — 날씨 연동
```

---

## 3. 한국관광공사 TourAPI 연동 명세

> ⚠ **2026-06-05 v1.6 KorService1 → KorService2 일괄 마이그레이션**
> 출처(1차): 사용자 활용신청서 — 15개 endpoint(모두 `*2` 접미사) HTTP 200 실측 확인.
> KorService1은 deprecated. 본 프로젝트는 KorService2 단일 사용.
> 활용 종수: **KorService2 활성 13종 + 두루누비 1종 = 총 14종 (한국관광공사 오픈 API 19종 중 약 74%)**.
> 미사용 2종(areaCode2·categoryCode2)은 신청은 됐으나 활용신청서에 "미사용 (삭제예정)" 명시 → 호출 코드 0건. 정식 대체는 ldongCode2·lclsSystmCode2.

### 3.1 기본 설정

```
Base URL: https://apis.data.go.kr/B551011/KorService2
일일 트래픽 한도: 1,000건/endpoint (개발 계정 기준, 운영 계정 100,000건)

공통 파라미터:
  - serviceKey: {환경변수 TOUR_API_KEY}
  - MobileOS: ETC
  - MobileApp: GreenTrip   # ← 운영계정 승인요건 (OpenAPI 자료 p9)
  - _type: json
```

### 3.2 활용 API 명세 — 활성 13종 + 두루누비 1종 + 미사용 2종

> 번호는 사용자 활용신청서 NO와 별개로 도메인 그룹별 재정렬. 신청서 NO는 각 항목에 병기.

#### 위치/지역 그룹

#### API-1: 위치기반 관광정보 조회 (`locationBasedList2`) — 신청서 NO.1

```
용도: 사용자 위치/선택 좌표 기준 반경 내 관광지 탐색.
      관광지 간 GPS 좌표(mapx, mapy) 기반 이동거리 계산 → 탄소 배출량 산정.
엔드포인트: /locationBasedList2
파라미터: mapX, mapY, radius, contentTypeId, arrange
호출 시점: 사용자 요청 시 실시간
캐시: 1시간 (위치+반경 조합 키)
일일 한도: 1,000건
```

#### API-2: 지역기반 관광정보 조회 (`areaBasedList2`) — 신청서 NO.13

```
용도: 강원도 등 특화 지역의 관광지를 지역코드 기반으로 필터링.
엔드포인트: /areaBasedList2
파라미터: areaCode, sigunguCode, contentTypeId, cat1~3, lclsSystm1~3, arrange
호출 시점: 코스 생성 시
캐시: 1시간
일일 한도: 1,000건
```

#### API-3: 관광정보 동기화 목록 (`areaBasedSyncList2`) — 신청서 NO.9

```
용도: 변경/추가/삭제된 contentId 목록을 일 1회 cron으로 수집 →
      DB 캐시 갱신 (제안서 §3.1 "데이터 최신성 유지").
엔드포인트: /areaBasedSyncList2
파라미터: modifiedTime?, areaCode?, sigunguCode?, contentTypeId?
호출 시점: Vercel Cron 일 1회
캐시: 동기화 cron 트리거 (별도 캐시 없음)
일일 한도: 1,000건
```

#### 검색 그룹

#### API-4: 키워드 검색 (`searchKeyword2`) — 신청서 NO.2

```
용도: "생태", "둘레길", "자전거", "도보" 등 저탄소 관련 키워드 검색.
엔드포인트: /searchKeyword2
파라미터: keyword, contentTypeId, areaCode, arrange, lclsSystm1~3
호출 시점: 사용자 검색 시 실시간
캐시: 30분
일일 한도: 1,000건
```

#### API-5: 행사정보 조회 (`searchFestival2`) — 신청서 NO.3

```
용도: [선택 옵션] 여행 기간 내 진행 중/예정 축제·행사 자동 탐색.
엔드포인트: /searchFestival2
파라미터: eventStartDate, eventEndDate, areaCode, arrange
호출 시점: 축제 옵션 ON 시
캐시: 6시간
일일 한도: 1,000건
```

#### API-6: 숙박정보 조회 (`searchStay2`) — ⭐ KorService2 신규 · 신청서 NO.4

```
용도: 숙박 전용 검색. areaBasedList2(contentTypeId=32)보다 숙박 도메인 필드에
      최적화. 친환경/반려동물/대중교통 접근 필터링과 결합.
엔드포인트: /searchStay2
파라미터: areaCode, sigunguCode, arrange (+ 클라이언트 필터: ecoCert/petOk/transitAccess)
호출 시점: 숙박 옵션 ON 시
캐시: 6시간
일일 한도: 1,000건
```

#### 상세 그룹

#### API-7: 공통정보 조회 (`detailCommon2`) — 신청서 NO.5

```
용도: 관광지별 제목, 주소, 개요, 대중교통 안내, 주차 정보 파싱.
엔드포인트: /detailCommon2
파라미터: contentId, defaultYN, firstImageYN, addrinfoYN, overviewYN
호출 시점: 관광지 상세 페이지
캐시: 6시간
일일 한도: 1,000건
```

#### API-8: 소개정보 조회 (`detailIntro2`) — 신청서 NO.6

```
용도: 운영시간, 휴무일, 요금, 장애인 편의시설 정보 → 접근성 점수 산정.
엔드포인트: /detailIntro2
파라미터: contentId, contentTypeId
호출 시점: 관광지 상세 페이지
캐시: 6시간
일일 한도: 1,000건
```

#### API-9: 반복정보 조회 (`detailInfo2`) — ⭐ KorService2 신규 · 신청서 NO.7

```
용도: 관광지 부대시설·여행코스(25) 구간·숙박(32) 객실 등 contentType별 가변 반복 필드.
      여행코스 구간 정보가 두루누비와 보완 — 코스 큐레이션 정확도 향상.
엔드포인트: /detailInfo2
파라미터: contentId, contentTypeId
호출 시점: 코스 상세·여행코스 콘텐츠 렌더링 시
캐시: 24시간 (정적에 가까움)
일일 한도: 1,000건
```

#### API-10: 이미지정보 조회 (`detailImage2`) — 신청서 NO.8

```
용도: 코스 미리보기 갤러리, 탄소 절감 인증서 내 관광지 대표 이미지.
엔드포인트: /detailImage2
파라미터: contentId, imageYN(Y)
호출 시점: 코스 결과 렌더링 시
캐시: 24시간
일일 한도: 1,000건
```

#### API-11: 반려동물 동반여행 (`detailPetTour2`) — 신청서 NO.11

```
용도: [선택 옵션] 반려동물 동반 가능 여부 필터링.
엔드포인트: /detailPetTour2
파라미터: contentId
호출 시점: 반려동물 모드 ON 시
캐시: 6시간
일일 한도: 1,000건
```

#### 코드 그룹 (정식 대체)

#### API-12: 법정동코드 조회 (`ldongCode2`) — ⭐ KorService2 신규 · 신청서 NO.14

```
용도: areaCode2의 정식 대체. 행안부 법정동 체계로 시·군·구·읍·면·동까지 정확 식별.
      강원 18개 시군구 → 읍/면/동 수준 확장 가능 (Phase 4+ 콘텐츠 보강).
엔드포인트: /ldongCode2
파라미터: lDongRegnCd?, lDongSignguCd?
호출 시점: 초기 1회 (정적 캐시) + 신규 행정구역 개편 시 재호출
캐시: 24시간 ~ ISR
일일 한도: 1,000건
대체 관계: areaCode2 (미사용·삭제예정) → ldongCode2
```

#### API-13: 분류체계 코드 조회 (`lclsSystmCode2`) — ⭐ KorService2 신규 · 신청서 NO.15

```
용도: categoryCode2의 정식 대체. 한국관광공사 신규 분류체계(lclsSystm1/2/3).
      cat1/cat2/cat3 legacy 체계와 병행. 테마 코스 자동 태깅.
엔드포인트: /lclsSystmCode2
파라미터: lclsSystm1?, lclsSystm2?
호출 시점: 초기 1회 (정적 캐시)
캐시: 24시간 ~ ISR
일일 한도: 1,000건
대체 관계: categoryCode2 (미사용·삭제예정) → lclsSystmCode2
```

#### 별도 트랙

#### API-14: 두루누비 정보 (코리아둘레길) — ⭐ 강원 저탄소 인프라 직결 (2026-05-28 추가)

```
용도: 코리아둘레길 284개 코스의 GPX 트랙 + 주변 관광정보 활용.
      DMZ 평화의 길·해파랑길(동해안)·강원 둘레길 등 저탄소(도보·자전거) 코스를
      GreenTrip의 자전거/도보 코스(C안) 및 강원 테마 코스에 직접 연동.
      GPX 트랙으로 Haversine 추정보다 정확한 실제 경로 거리 산출 가능.
서비스명: 한국관광공사_두루누비 정보 서비스_GW (공공데이터포털 데이터 15101974)
Base URL: https://apis.data.go.kr/B551011/Durunubi  (KorService2와 별도 경로, 별도 신청 필요)
오퍼레이션: courseList(코스 목록), routeList(길 목록)
파라미터: numOfRows, pageNo, MobileOS, MobileApp, _type, brdDiv(코스/구간), routeIdx 등
호출 시점: 강원 테마 코스 큐레이션 + 자전거/도보 코스 생성 시
캐시: 24시간 (코스 데이터는 정적에 가까움)
근거: 두루누비 코스 = 저탄소 이동수단(도보·자전거) 전용 → GreenTrip 핵심 가치와 정합.
      강원 RTO 특별상 어필 + 발전성(데이터 활용 다양성) 강화.
신청 상태: 사용자 활용신청서(2026-06-05)에는 미포함. 별도 신청 필요.
```

#### 미사용 (삭제예정) — 신청은 됐으나 호출 금지

#### 미사용-1: 지역코드 조회 (`areaCode2`) — 신청서 NO.10 "미사용 (삭제예정)"

```
⚠ 사용자 활용신청서에 "미사용 (삭제예정-법정동/분류체계 코드로 대체)" 명시.
   호출 코드 추가 금지. 정식 대체: ldongCode2 (API-12).
   QA(greentrip-qa §E)가 grep으로 호출 0건 검증.

대체 전략 (구현 완료):
- 강원도 시군구 매핑: src/lib/tourapi/constants.ts의 GANGWON 정적 상수
- 콘텐츠별 시군구 정보: areaBasedList2 응답의 sigungucode 필드 직접 활용
- 법정동 수준 정밀화 필요 시: ldongCode2 (API-12) 호출
```

#### 미사용-2: 서비스분류코드 조회 (`categoryCode2`) — 신청서 NO.12 "미사용 (삭제예정)"

```
⚠ 사용자 활용신청서에 "미사용 (삭제예정-법정동/분류체계 코드로 대체)" 명시.
   호출 코드 추가 금지. 정식 대체: lclsSystmCode2 (API-13).
   QA(greentrip-qa §E)가 grep으로 호출 0건 검증.

대체 전략:
- 콘텐츠별 카테고리: areaBasedList2 / locationBasedList2 응답의
  cat1 / cat2 / cat3 또는 lclsSystm1/2/3 필드 직접 활용
- 분류 트리 필요 시: lclsSystmCode2 (API-13) 호출
```

### 3.3 콘텐츠 타입 ID 참조

```typescript
export const CONTENT_TYPE = {
  관광지: 12,
  문화시설: 14,
  축제공연행사: 15,
  여행코스: 25,
  레포츠: 28,
  숙박: 32,
  쇼핑: 38,
  음식점: 39,
} as const;
```

### 3.4 강원도 지역코드

```typescript
export const GANGWON = {
  areaCode: 32,
  sigungu: {
    춘천시: 1, 원주시: 2, 강릉시: 3, 동해시: 4,
    태백시: 5, 속초시: 6, 삼척시: 7, 홍천군: 8,
    횡성군: 9, 영월군: 10, 평창군: 11, 정선군: 12,
    철원군: 13, 화천군: 14, 양구군: 15, 인제군: 16,
    고성군: 17, 양양군: 18,
  },
} as const;
```

---

## 4. 핵심 알고리즘

### 4.1 탄소 배출량 계산 엔진

```typescript
// 이동수단별 CO₂ 배출 계수 (g/km, 1인 기준)
export const CARBON_FACTOR = {
  car: 210,        // 자가용 (중형차 기준)
  express_bus: 68,  // 고속/시외버스
  city_bus: 78,     // 시내버스
  train_ktx: 18,    // KTX
  train_itx: 25,    // ITX/일반열차
  bicycle: 0,       // 자전거
  walking: 0,       // 도보
} as const;

// 두 관광지 간 직선거리 (Haversine) → 도로거리 보정계수 적용
function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // 지구 반경 (km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const straightDist = R * c;
  return straightDist * 1.3; // 도로거리 보정계수
}

// 코스 전체 탄소 배출량 계산
function calculateRouteCarbonEmission(
  waypoints: { lat: number; lng: number }[],
  transportMode: keyof typeof CARBON_FACTOR
): { totalKm: number; totalCO2g: number } {
  let totalKm = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalKm += calculateDistance(
      waypoints[i].lat, waypoints[i].lng,
      waypoints[i+1].lat, waypoints[i+1].lng
    );
  }
  return {
    totalKm: Math.round(totalKm * 10) / 10,
    totalCO2g: Math.round(totalKm * CARBON_FACTOR[transportMode]),
  };
}
```

### 4.2 코스 자동 설계 (Nearest Neighbor + 2-opt)

```typescript
// 1단계: 후보 관광지 풀 구성
//   - areaBasedList2 (지역) + lclsSystmCode2 (테마 필터, categoryCode2 정식 대체)
//   - 사용자 선호 콘텐츠 타입 적용
//   - [옵션] searchFestival2로 축제 추가
//   - [옵션] detailPetTour2로 반려동물 불가 제외

// 2단계: Nearest Neighbor 초기 경로 생성
function nearestNeighborRoute(spots: Spot[], start: Spot): Spot[] {
  const route: Spot[] = [start];
  const remaining = new Set(spots.filter(s => s.id !== start.id));
  let current = start;
  while (remaining.size > 0) {
    let nearest: Spot | null = null;
    let minDist = Infinity;
    for (const spot of remaining) {
      const d = calculateDistance(current.lat, current.lng, spot.lat, spot.lng);
      if (d < minDist) { minDist = d; nearest = spot; }
    }
    if (nearest) {
      route.push(nearest);
      remaining.delete(nearest);
      current = nearest;
    }
  }
  return route;
}

// 3단계: 2-opt 경로 최적화 (탄소 최소화)
function twoOptImprove(route: Spot[]): Spot[] {
  let improved = true;
  let best = [...route];
  while (improved) {
    improved = false;
    for (let i = 1; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const newRoute = twoOptSwap(best, i, j);
        if (totalDistance(newRoute) < totalDistance(best)) {
          best = newRoute;
          improved = true;
        }
      }
    }
  }
  return best;
}

// 4단계: 이동수단별 3안 생성
//   A안: 자가용 코스 (최단 경로)
//   B안: 대중교통 코스 (역/터미널 기준 재배치)
//   C안: 자전거/도보 코스 (10km 반경 제한)
```

### 4.3 접근성 점수 산정

```typescript
// detailCommon2 + detailIntro2 데이터 파싱
interface AccessibilityScore {
  publicTransport: number;  // 0~100: 대중교통 접근성
  parking: number;          // 0~100: 주차 편의성
  wheelchair: number;       // 0~100: 휠체어 접근성
  petFriendly: boolean;     // 반려동물 동반 가능 여부
}

// overview, infocenter 텍스트에서 키워드 파싱
// "버스", "지하철", "역에서" → publicTransport 점수 UP
// "주차장 있음", "무료주차" → parking 점수 UP
// "장애인 편의시설", "엘리베이터" → wheelchair 점수 UP
```

---

## 5. 디렉토리 구조

```
greentrip/
├── .env.local                    # 환경변수 (API 키)
├── .env.example                  # 환경변수 템플릿
├── next.config.ts
├── tailwind.config.ts
├── prisma/
│   └── schema.prisma             # DB 스키마
│
├── public/
│   ├── manifest.json             # PWA 매니페스트
│   ├── sw.js                     # 서비스워커
│   ├── icons/                    # PWA 아이콘
│   └── images/
│       └── og-image.png          # OG 이미지
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   ├── page.tsx              # 랜딩 페이지
│   │   ├── globals.css
│   │   │
│   │   ├── plan/                 # 코스 플래닝
│   │   │   ├── page.tsx          # 코스 설정 (출발지, 옵션 선택)
│   │   │   └── result/
│   │   │       └── page.tsx      # 코스 3안 비교 결과
│   │   │
│   │   ├── course/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 코스 상세 (지도 + 일정표)
│   │   │
│   │   ├── spot/
│   │   │   └── [contentId]/
│   │   │       └── page.tsx      # 관광지 상세 페이지
│   │   │
│   │   ├── report/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 탄소 절감 인증서
│   │   │
│   │   ├── explore/
│   │   │   └── page.tsx          # 강원도 테마 코스 탐색
│   │   │
│   │   ├── mypage/
│   │   │   └── page.tsx          # 마이페이지 (여행 기록, 누적 절감량)
│   │   │
│   │   └── api/                  # API Route Handlers
│   │       ├── tour/             # TourAPI 프록시
│   │       │   ├── area/route.ts
│   │       │   ├── location/route.ts
│   │       │   ├── search/route.ts
│   │       │   ├── festival/route.ts
│   │       │   ├── detail/route.ts
│   │       │   ├── images/route.ts
│   │       │   └── pet/route.ts
│   │       │
│   │       ├── course/           # 코스 생성/조회
│   │       │   ├── generate/route.ts
│   │       │   └── [id]/route.ts
│   │       │
│   │       ├── carbon/           # 탄소 계산
│   │       │   └── calculate/route.ts
│   │       │
│   │       └── report/           # 인증서 생성
│   │           └── generate/route.ts
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 컴포넌트
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── PageContainer.tsx
│   │   │
│   │   ├── map/
│   │   │   ├── KakaoMap.tsx          # 카카오맵 래퍼
│   │   │   ├── RouteOverlay.tsx      # 경로 오버레이
│   │   │   └── SpotMarker.tsx        # 관광지 마커
│   │   │
│   │   ├── course/
│   │   │   ├── CourseOptionForm.tsx   # 코스 옵션 설정 폼
│   │   │   ├── CourseCompareCard.tsx  # 3안 비교 카드
│   │   │   ├── CarbonGauge.tsx       # 탄소 배출 게이지
│   │   │   ├── TimelineView.tsx      # 일정 타임라인
│   │   │   └── TransportBadge.tsx    # 이동수단 뱃지
│   │   │
│   │   ├── spot/
│   │   │   ├── SpotCard.tsx          # 관광지 카드
│   │   │   ├── SpotDetail.tsx        # 관광지 상세
│   │   │   └── SpotGallery.tsx       # 이미지 갤러리
│   │   │
│   │   ├── report/
│   │   │   ├── CarbonReport.tsx      # 탄소 리포트 대시보드
│   │   │   └── CertificateCard.tsx   # 인증서 카드 (공유용)
│   │   │
│   │   └── common/
│   │       ├── ToggleOption.tsx       # 축제/반려동물 토글
│   │       ├── LoadingSkeleton.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── lib/
│   │   ├── tourapi/
│   │   │   ├── client.ts             # TourAPI HTTP 클라이언트
│   │   │   ├── types.ts              # 응답 타입 정의
│   │   │   ├── constants.ts          # 지역코드, 콘텐츠타입 상수
│   │   │   └── cache.ts              # Redis 캐시 래퍼
│   │   │
│   │   ├── carbon/
│   │   │   ├── calculator.ts         # 탄소 계산 엔진
│   │   │   ├── factors.ts            # 배출 계수
│   │   │   └── formatter.ts          # 단위 포맷터 (g→kg→나무 환산)
│   │   │
│   │   ├── course/
│   │   │   ├── generator.ts          # 코스 자동 생성
│   │   │   ├── optimizer.ts          # 경로 최적화 (2-opt)
│   │   │   ├── comparator.ts         # 이동수단별 3안 비교
│   │   │   └── filters.ts            # 축제/반려동물/접근성 필터
│   │   │
│   │   ├── map/
│   │   │   ├── kakao.ts              # Kakao Maps 유틸
│   │   │   └── distance.ts           # Haversine 거리 계산
│   │   │
│   │   ├── db.ts                     # Prisma 클라이언트
│   │   ├── auth.ts                   # NextAuth 설정
│   │   └── utils.ts                  # 공통 유틸
│   │
│   ├── hooks/
│   │   ├── useTourAPI.ts             # TourAPI SWR 훅
│   │   ├── useCourseGenerator.ts     # 코스 생성 훅
│   │   ├── useCarbonCalculator.ts    # 탄소 계산 훅
│   │   ├── useKakaoMap.ts            # 카카오맵 훅
│   │   └── useGeolocation.ts         # 현재 위치 훅
│   │
│   ├── stores/
│   │   ├── courseStore.ts            # 코스 상태
│   │   └── userStore.ts             # 사용자 상태
│   │
│   └── types/
│       ├── tour.ts                   # TourAPI 관련 타입
│       ├── course.ts                 # 코스 관련 타입
│       ├── carbon.ts                 # 탄소 관련 타입
│       └── index.ts
│
├── docs/
│   ├── DEVELOPMENT_PLAN.md           # 이 문서
│   └── API_REFERENCE.md              # API 상세 명세
│
└── tests/
    ├── lib/
    │   ├── carbon.test.ts
    │   └── course.test.ts
    └── api/
        └── tour.test.ts
```

---

## 6. DB 스키마 (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 사용자
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  image         String?
  provider      String?                 // kakao, naver, google
  courses       Course[]
  reports       CarbonReport[]
  totalSavedCO2 Float     @default(0)   // 누적 탄소 절감량 (g)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// 생성된 코스
model Course {
  id             String       @id @default(cuid())
  userId         String?
  user           User?        @relation(fields: [userId], references: [id])
  title          String                              // "강릉 저탄소 1일 코스"
  region         String       @default("강원도")      // 특화 지역
  areaCode       Int                                 // TourAPI 지역코드
  transportMode  String                              // car, bus, train, bicycle, walking
  totalDistanceKm Float
  totalCarbonG   Float                               // 해당 이동수단 기준 CO₂
  baselineCarbonG Float                              // 자가용 기준 CO₂ (비교용)
  savedCarbonG   Float                               // 절감량
  duration       String?                             // "1일", "2일1박"
  includeFestival Boolean    @default(false)
  includePet      Boolean    @default(false)
  waypoints      Waypoint[]
  reports        CarbonReport[]
  isPublic       Boolean     @default(false)
  createdAt      DateTime    @default(now())
}

// 코스 내 관광지 (순서 보존)
model Waypoint {
  id          String  @id @default(cuid())
  courseId    String
  course      Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  order       Int                           // 방문 순서
  contentId   String                        // TourAPI contentId
  title       String
  address     String?
  lat         Float                         // mapy
  lng         Float                         // mapx
  imageUrl    String?                       // firstimage
  contentType Int                           // contentTypeId
  stayMinutes Int     @default(60)          // 예상 체류시간 (분)
  distToNext  Float?                        // 다음 지점까지 거리 (km)
  carbonToNext Float?                       // 다음 지점까지 탄소 (g)
}

// 탄소 절감 인증서
model CarbonReport {
  id           String   @id @default(cuid())
  userId       String?
  user         User?    @relation(fields: [userId], references: [id])
  courseId     String
  course       Course   @relation(fields: [courseId], references: [id])
  savedCarbonG Float                        // 절감량
  savedTreeEq  Float                        // 나무 환산 (1그루 = 약 22kg CO₂/년)
  shareImageUrl String?                     // 인증서 이미지 URL
  createdAt    DateTime @default(now())
}

// 큐레이션 테마 코스 (관리자 등록)
model ThemeCourse {
  id          String   @id @default(cuid())
  title       String                        // "설악에서 동해까지 무탄소 3일 코스"
  description String
  region      String
  transport   String                        // 추천 이동수단
  difficulty  String   @default("보통")      // 쉬움/보통/어려움
  imageUrl    String?
  spotIds     String[]                      // contentId 배열
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

---

## 7. 페이지별 구현 명세

### 7.1 랜딩 페이지 (`/`)

```
[Hero 섹션]
- 서비스 타이틀 + 한 줄 소개
- CTA 버튼: "코스 만들기" → /plan
- 배경: 강원도 자연 이미지 (TourAPI 이미지)

[서비스 소개 섹션]
- 3단계 플로우 시각화: 목적지 선택 → 코스 비교 → 탄소 절감 확인

[큐레이션 코스 섹션]
- ThemeCourse 목록 (강원도 테마 코스 3~4개)
- 카드형 레이아웃 (이미지 + 제목 + 이동수단 + 예상 절감량)

[누적 절감 현황] (옵션)
- 전체 사용자 누적 탄소 절감량 카운터
```

### 7.2 코스 플래닝 페이지 (`/plan`)

```
[Step 1: 여행 설정]
- 지역 선택: 강원도(기본) → 시군구 드롭다운
- 여행 기간: 당일 / 1박2일 / 2박3일
- 관심 테마: 자연 / 문화 / 레포츠 / 음식 (다중선택, 분류체계코드 연동)

[Step 2: 옵션 토글]
☐ 축제·행사 포함하기 → searchFestival2 연동
☐ 반려동물과 함께 → detailPetTour2 필터
☐ 무장애 코스 우선 → detailIntro2 접근성 필터

[Step 3: 코스 생성]
- "코스 만들기" 버튼 → API 호출 → 로딩 → /plan/result 이동
```

### 7.3 코스 비교 결과 페이지 (`/plan/result`)

```
[3안 비교 카드]
┌─────────────────┬─────────────────┬─────────────────┐
│  🚗 자가용 코스   │  🚌 대중교통 코스  │  🚴 자전거/도보   │
│                 │     ⭐ 추천      │                 │
│  CO₂: 12.4 kg  │  CO₂: 3.1 kg   │  CO₂: 0.0 kg   │
│  시간: 2시간 30분 │  시간: 3시간 10분 │  시간: 5시간     │
│  비용: 약 35,000원│  비용: 약 12,000원│  비용: 0원       │
│                 │                 │                 │
│  [탄소 게이지바]  │  [탄소 게이지바]  │  [탄소 게이지바]  │
│  절감: -        │  절감: 9.3 kg   │  절감: 12.4 kg  │
│                 │                 │                 │
│  [코스 선택]     │  [코스 선택]     │  [코스 선택]     │
└─────────────────┴─────────────────┴─────────────────┘

[하단: 카카오맵]
- 3개 코스 경로를 색상별로 오버레이
- 코스 카드 선택 시 해당 경로 하이라이트

[절감 효과 시각화]
- "대중교통 선택 시 소나무 0.4그루가 1년간 흡수하는 CO₂와 동일"
```

### 7.4 코스 상세 페이지 (`/course/[id]`)

```
[코스 정보 헤더]
- 코스 제목, 이동수단, 총 거리, 총 탄소, 절감량

[타임라인 뷰]
- 방문 순서별 관광지 카드
  - 이미지 (detailImage2)
  - 제목, 주소, 간략 소개 (detailCommon2)
  - 예상 체류시간
  - 다음 지점까지: 거리 + CO₂ + 이동수단 아이콘
  - [축제 뱃지] 해당 기간 축제 있을 시
  - [반려동물 OK] 동반 가능 시

[카카오맵]
- 전체 경로 + 마커

[하단 CTA]
- "이 코스로 여행하기" → 저장 + 탄소 리포트 생성
- "코스 공유하기" → 카카오톡/링크 공유
```

### 7.5 탄소 리포트 / 인증서 (`/report/[id]`)

```
[인증서 카드] (공유용 이미지 자동 생성)
┌──────────────────────────────┐
│   🌿 그린 여행 인증서           │
│                              │
│   [사용자명] 님의              │
│   [강릉 저탄소 1일 코스]        │
│                              │
│   🚌 대중교통으로 이동하여       │
│   CO₂ 9.3 kg 절감             │
│   = 소나무 0.4그루 × 1년       │
│                              │
│   2026.09.15                 │
│   GreenTrip × 한국관광공사      │
└──────────────────────────────┘

[상세 리포트]
- 구간별 탄소 배출 상세 (Recharts 바 차트)
- 자가용 대비 절감 비율 (%)
- 누적 절감량 히스토리

[공유]
- 이미지 다운로드 / 카카오톡 공유 / 링크 복사
```

---

## 8. Phase별 구현 순서

### Phase 1: 핵심 기능 (2026.05~06) — 5주

> Claude Code 지시: "Phase 1 핵심 기능을 구현해주세요"

```
Week 1: 프로젝트 초기 세팅
  ├── Next.js + TypeScript + Tailwind + shadcn/ui 프로젝트 생성
  ├── Prisma + Supabase DB 연결
  ├── 환경변수 설정 (.env.local)
  ├── TourAPI 클라이언트 모듈 (lib/tourapi/client.ts)
  ├── 지역코드, 분류코드 상수 정의 (lib/tourapi/constants.ts)
  └── TourAPI 응답 타입 정의 (lib/tourapi/types.ts)

Week 2: TourAPI 연동 + API Routes
  ├── API Route: /api/tour/area (지역기반 관광정보)
  ├── API Route: /api/tour/location (위치기반 관광정보)
  ├── API Route: /api/tour/search (키워드 검색)
  ├── API Route: /api/tour/detail (공통정보+소개정보)
  ├── API Route: /api/tour/images (이미지정보)
  ├── Redis 캐시 적용 (lib/tourapi/cache.ts)
  └── 관광지 상세 페이지 (/spot/[contentId])

Week 3: 탄소 계산 엔진 + 코스 생성
  ├── 탄소 계산 모듈 (lib/carbon/calculator.ts)
  ├── 거리 계산 모듈 (lib/map/distance.ts)
  ├── 코스 자동 생성 (lib/course/generator.ts)
  ├── 경로 최적화 2-opt (lib/course/optimizer.ts)
  ├── 이동수단별 3안 생성 (lib/course/comparator.ts)
  └── API Route: /api/course/generate

Week 4: 코스 플래닝 UI
  ├── 랜딩 페이지 (/)
  ├── 코스 설정 페이지 (/plan)
  ├── CourseOptionForm 컴포넌트
  ├── 코스 비교 결과 페이지 (/plan/result)
  ├── CourseCompareCard + CarbonGauge 컴포넌트
  └── TransportBadge 컴포넌트

Week 5: 카카오맵 + 코스 상세
  ├── Kakao Maps SDK 통합
  ├── KakaoMap + RouteOverlay + SpotMarker 컴포넌트
  ├── 코스 상세 페이지 (/course/[id])
  ├── TimelineView 컴포넌트
  ├── DB 저장 (Course + Waypoint)
  └── 통합 테스트 (강원도 코스 E2E)
```

### Phase 2: 선택 기능 + 테스트 (2026.07~08) — 8주

> Claude Code 지시: "Phase 2 선택 기능을 구현해주세요"

```
Week 6~7: 축제·행사 연동
  ├── API Route: /api/tour/festival
  ├── 축제 필터 모듈 (lib/course/filters.ts)
  ├── 코스에 축제 자동 삽입 로직
  ├── 축제 뱃지 UI (SpotCard 내)
  └── 축제 옵션 토글 + 결과 반영

Week 8~9: 반려동물 모드
  ├── API Route: /api/tour/pet
  ├── 반려동물 동반 필터 로직
  ├── 동반 불가 시설 제외 + 대체 추천
  ├── 반려동물 모드 UI 토글
  └── 반려동물 아이콘/뱃지

Week 10~11: 탄소 리포트 + 인증서
  ├── CarbonReport DB 모델 연동
  ├── API Route: /api/report/generate
  ├── 인증서 이미지 자동 생성 (html-to-image 또는 @vercel/og)
  ├── 리포트 페이지 (/report/[id])
  ├── CarbonReport + CertificateCard 컴포넌트
  ├── Recharts 탄소 비교 차트
  └── 카카오톡 공유 (카카오 Share API)

Week 12~13: 인증 + 마이페이지 + 테마코스
  ├── NextAuth.js 설정 (카카오/네이버/구글)
  ├── 마이페이지 (/mypage) — 여행 기록, 누적 절감량
  ├── ThemeCourse 시드 데이터 (강원도 3~4개)
  ├── 테마 코스 탐색 페이지 (/explore)
  ├── 크로스브라우저/모바일 반응형 테스트
  └── 접근성 점검 (axe-core)
```

### Phase 3: 상용 런칭 (2026.09) — 4주

> Claude Code 지시: "Phase 3 런칭 준비를 해주세요"

```
Week 14: PWA + 성능 최적화
  ├── next-pwa 설정 (서비스워커, 오프라인 캐시)
  ├── PWA manifest.json + 아이콘 세트
  ├── 이미지 최적화 (next/image, WebP)
  ├── 코드 스플리팅 검증
  ├── Lighthouse 성능 점수 90+ 목표
  └── SEO 메타태그 + OG 이미지

Week 15: 배포 + 모니터링
  ├── Vercel 프로덕션 배포
  ├── 커스텀 도메인 연결
  ├── Sentry 에러 모니터링 설정
  ├── Vercel Analytics 설정
  ├── 업타임 모니터링
  └── API Rate Limiting 설정

Week 16~17: QA + 버그 수정 + 콘텐츠
  ├── 실사용 시나리오 QA (강원도 전 시군구)
  ├── 버그 수정 및 UX 개선
  ├── 강원도 테마 코스 콘텐츠 보강
  ├── 사용자 피드백 수집 채널 설정
  └── 공모전 1차 심사 대비 서비스 데모 준비
```

---

## 9. 환경변수 (.env.example)

```bash
# 한국관광공사 TourAPI
TOUR_API_KEY=your_tour_api_service_key_here

# Kakao Maps
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_javascript_key
KAKAO_REST_API_KEY=your_kakao_rest_api_key

# Supabase (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/greentrip
DIRECT_URL=postgresql://user:password@host:5432/greentrip

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# 소셜로그인
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# Sentry (선택)
SENTRY_DSN=your_sentry_dsn
```

---

## 10. Claude Code 사용 가이드

### 10.1 프로젝트 시작

```bash
# Claude Code에서 프로젝트 시작
claude

# 프로젝트 초기화 요청
> 이 DEVELOPMENT_PLAN.md를 읽고 Phase 1 Week 1부터 구현을 시작해주세요.
> Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui로
> 프로젝트를 초기화하고, Prisma 스키마를 설정해주세요.
```

### 10.2 주차별 진행 요청 예시

```bash
# Week 2 진행
> Phase 1 Week 2를 구현해주세요.
> TourAPI 클라이언트와 API Routes를 만들어주세요.
> DEVELOPMENT_PLAN.md의 "3. TourAPI 연동 명세"를 참조하세요.

# Week 3 진행
> Phase 1 Week 3를 구현해주세요.
> 탄소 계산 엔진과 코스 자동 생성 알고리즘을 구현해주세요.
> "4. 핵심 알고리즘" 섹션을 참조하세요.

# 특정 기능 요청
> CourseCompareCard 컴포넌트를 구현해주세요.
> "7.3 코스 비교 결과 페이지" 명세를 참조해서
> 3개 이동수단 비교 카드를 만들어주세요.
```

### 10.3 컨텍스트 유지 팁

```bash
# 이 파일을 Claude Code의 CLAUDE.md로 활용
cp docs/DEVELOPMENT_PLAN.md CLAUDE.md

# 또는 프로젝트 루트에 CLAUDE.md로 서비스 컨텍스트 요약본 배치
# Claude Code가 자동으로 읽어 프로젝트 맥락을 파악
```

### 10.4 핵심 규칙

```
1. TourAPI 호출은 반드시 서버 사이드 (API Routes)에서 수행
   → serviceKey 노출 방지

2. 모든 TourAPI 응답은 Redis 캐시 적용
   → Rate Limit 대응 + 성능 최적화

3. 컴포넌트는 Client/Server 명확히 분리
   → 'use client' 지시자는 필요한 곳에만

4. 타입은 /src/types에 중앙 관리
   → TourAPI 응답 타입, 코스 타입, 탄소 타입

5. 이미지는 next/image로 최적화
   → TourAPI 이미지 URL은 remotePatterns에 등록

6. 모바일 퍼스트 반응형
   → Tailwind 기본 = 모바일, md: = 태블릿, lg: = 데스크탑
```

---

## 11. 심사 대응 체크리스트

### 1차 심사 (기능심사, 10월)

```
[ ] 서비스 기획력 (30점)
    [ ] 탄소발자국 + 관광 융합의 독창성 어필
    [ ] MZ세대 가치소비 트렌드 연결
    [ ] 강원도 지역 특화 콘텐츠

[ ] 서비스 완성도 (30점)
    [ ] 코스 생성 → 비교 → 선택 → 저장 전체 플로우 정상 작동
    [ ] 축제/반려동물 옵션 정상 작동
    [ ] 카카오맵 경로 표시 정상
    [ ] 모바일 반응형 완벽
    [ ] 에러 핸들링 (API 장애 시 graceful degradation)

[ ] 데이터 활용 적절성 (20점)
    [ ] TourAPI 14종(KorService2 13종 + 두루누비) 실제 호출되는지 확인 — 19종 중 약 74%
    [ ] 미사용 2종(areaCode2·categoryCode2) 호출 0건 검증 (Grep)
    [ ] API 호출 로그 / 통계 대시보드 (심사용)
    [ ] 데이터 최신성 유지 (areaBasedSyncList2 일 1회 cron)

[ ] 서비스 발전성 (20점)
    [ ] B2G 연계 가능성 (탄소중립 정책)
    [ ] 전국 확장 로드맵
    [ ] 사용자 커뮤니티 구상

[ ] 가점
    [ ] 강원도 지역 특화 (+2점)
    [ ] 신용보증기금 Start-up NEST 해당 시 (+2점)
```

### 최종심사 (PT, 10월)

```
[ ] 서비스 적정성 (30점) — 명확하고 논리적인 발표
[ ] 서비스 완성도 (30점) — 라이브 데모
[ ] 서비스 실용성 (25점) — 실제 사용 시나리오 시연
[ ] 발표 점수 (15점) — 발표 자료 퀄리티
```
