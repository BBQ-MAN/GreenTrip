---
name: greentrip-qa
description: GreenTrip 통합 정합성 검증 스킬. API 응답↔프론트 훅 shape 교차 비교, 라우팅 정합성, Prisma↔API↔UI 3층 매핑, 타입 안정성, TourAPI 14종(KorService2 13종 + 두루누비) 사용 여부 + 미사용 2종 호출 0건, 접근성, Lighthouse. qa-reviewer 에이전트가 각 모듈 완성 직후 incremental QA로 사용.
---

# GreenTrip QA — 통합 정합성 검증

## 언제 사용하는가

- 주차별 모듈 완성 직후 (incremental QA)
- API Route 추가·변경 시 대응 훅과의 교차 검증
- 새 페이지 추가 시 라우팅 검증
- Phase 완료 시 전수 검증
- 공모전 심사 대비 최종 점검

## "양쪽 동시 읽기" 원칙

경계면 버그는 한쪽만 봐선 잡히지 않는다. 반드시 생산자+소비자를 **함께 Read**해 shape을 비교.

| 검증 대상 | 왼쪽 (생산자) | 오른쪽 (소비자) |
|----------|-------------|---------------|
| API 응답 shape | `src/app/api/**/route.ts`의 `NextResponse.json()` | `src/hooks/use*.ts`의 `fetchJson<T>` |
| 라우팅 | `src/app/**/page.tsx` 파일 경로 | 코드 내 `href=`, `router.push(` |
| 상태 전이 | Prisma `Course.status` 또는 `TransportMode` enum | `.update({ status })`, `mode:` 대입 |
| DB → API → UI | `prisma/schema.prisma` 필드 | API 응답 필드 → `src/types/` |

## 통합 정합성 체크리스트

### A. API ↔ 프론트엔드 교차 검증
- [ ] `/api/tour/*` 9개 Route(area·location·search·festival·detail·images·pet·lodging·sync)의 응답 shape과 `useTourAPI.ts` 훅의 제네릭 T 일치 — durunubi 라우트는 두루누비 별도 신청 완료 후 추가 예정(§E 별도 트랙 참조, 추가 시 10개)
- [ ] 공통 shape `{ items, totalCount, pageNo, numOfRows }`을 모든 TourAPI Route가 준수 (KorService2 unwrap 일관성)
- [ ] `/api/course/generate` 응답 shape과 CourseCompareCard props 일치
- [ ] `/api/carbon/calculate` 응답과 CarbonGauge props 일치
- [ ] `/api/report/generate` 응답과 CertificateCard props 일치
- [ ] 에러 응답 shape(`{ error: string, message?: string }`) 모든 Route 일관

### B. 라우팅 정합성
- [ ] 코드 내 모든 `href=`, `router.push(`, `redirect(`가 실제 `src/app/**/page.tsx`와 매칭
- [ ] 동적 세그먼트 `[id]`, `[contentId]`가 올바른 값 타입으로 채워짐
- [ ] `/plan` → `/plan/result` → `/course/[id]` 전환 시 state/query/DB로 데이터 전달
- [ ] 404·500 페이지 존재

### C. 데이터 흐름 (Prisma → API → UI)
- [ ] Waypoint.lat/lng ↔ TourAPI mapy/mapx 변환 지점 1곳만 존재
- [ ] Course.totalCarbonG, savedCarbonG 모두 g 단위 (kg 혼용 금지)
- [ ] Prisma nullable(`String?`) 필드 → API 응답 → UI에서 null 처리
- [ ] snake_case(DB) ↔ camelCase(API/TS) 변환 일관

### D. 상태·타입 정합성
- [ ] `TransportMode` 리터럴 유니온이 CARBON_FACTOR 키와 1:1 매칭
- [ ] `'use client'` 없는 파일에서 useState/useEffect 등 훅 사용 없음
- [ ] `any`, 무분별한 제네릭 캐스팅(`as unknown as T`) 검색 0건
- [ ] `@ts-ignore`, `@ts-expect-error` 주석 0건

### E. TourAPI 14종 사용 여부 (v1.6 KorService2 마이그레이션, 공모전 필수)

> **v1.6 (2026-06-05 사용자 활용신청서 1차 출처)**: 한국관광공사 오픈 API 총 **19종** 중 GreenTrip **14종** 활용 (약 74%).
> = KorService2 활성 13종 + 두루누비 1종.
> 미사용 2종 (`areaCode2`·`categoryCode2`)은 신청서에 "미사용 (삭제예정)" 명시 — 호출 코드 0건. 정식 대체: `ldongCode2`·`lclsSystmCode2`.

**기본 인프라:**
- [ ] **TOUR_API_BASE = `https://apis.data.go.kr/B551011/KorService2`** 확인 (`src/lib/tourapi/constants.ts`). KorService1 잔존 0건.
- [ ] **MobileApp 파라미터 = `GreenTrip` 고정** (`COMMON_PARAMS`) — 운영계정 승인요건 (OpenAPI 자료 p9). 임의 값·`AppTest` placeholder 0건.
- [ ] **KorService1 잔존 0건** — Grep `KorService1|areaCode1|categoryCode1|locationBasedList1|areaBasedList1|searchKeyword1|searchFestival1|detailCommon1|detailIntro1|detailImage1|detailPetTour1|areaBasedSyncList1` src/ → 0건

**활성 13종 (KorService2):**
- [ ] locationBasedList2 호출 확인 (`/api/tour/location`)
- [ ] areaBasedList2 호출 확인 (`/api/tour/area`)
- [ ] areaBasedSyncList2 호출 확인 (`/api/tour/sync`, 일 1회 cron, 제안서 3.1 No.10)
- [ ] searchKeyword2 호출 확인 (`/api/tour/search`)
- [ ] searchFestival2 호출 확인 (`/api/tour/festival`, Week 6~7)
- [ ] **searchStay2 호출 확인** ⭐신규 — 숙박 전용 (`/api/tour/lodging`, Week 12~13)
- [ ] detailCommon2 호출 확인 (`/api/tour/detail`)
- [ ] detailIntro2 호출 확인 (`/api/tour/detail`)
- [ ] **detailInfo2 호출 확인** ⭐신규 — 반복정보 (`/api/tour/detail`, 여행코스 구간·객실 등)
- [ ] detailImage2 호출 확인 (`/api/tour/images`)
- [ ] detailPetTour2 호출 확인 (`/api/tour/pet`, Week 8~9)
- [ ] **ldongCode2 호출 확인** ⭐신규 — areaCode 정식 대체 (`/api/tour/area`, 법정동 정밀화)
- [ ] **lclsSystmCode2 호출 확인** ⭐신규 — categoryCode 정식 대체 (`/api/tour/search`, 분류체계)

**별도 트랙 1종:**
- [ ] **두루누비 정보** — 별도 Base URL `Durunubi/courseList`·`routeList` 호출 확인 (`/api/tour/durunubi`, DEVELOPMENT_PLAN §3.2 API-14). 강원 코스 필터링 + GPX 트랙 활용. ⭐ 강원 RTO 특별상 어필 데이터. **별도 활용신청 미완료 시 N/A로 기록하되, 그 상태에서는 문서의 "14종 활용" 주장이 13종으로 하향되어야 하므로 3대 문서 정합성 이슈(섹션 H)로 승격하여 보고할 것.** (2026-06-10 기준 `callDurunubiAPI` 정의만 존재, 실호출 0건 — 해소 전까지 매 QA에서 재확인.)

**미사용 2종 — 호출 0건 의무:**
- [ ] ⚠ **areaCode2 호출 0건** — Grep `"areaCode2"` src/app/api src/lib/tourapi → 호출 코드(`callTourAPI('areaCode2', ...)`) 0건. 상수 정의(`TOUR_API_DEPRECATED`)·주석 언급은 허용.
- [ ] ⚠ **categoryCode2 호출 0건** — Grep `"categoryCode2"` src/app/api src/lib/tourapi → 호출 코드 0건.

**호출 통계 대시보드:**
- [ ] **호출 통계 대시보드** — 운영 계정 100,000건/일 한도 추적 (E30, P0-11). 미사용 2종에 호출 0건을 그래프로 검증.

### H. 문서 3대 정합성 검증
- [ ] `greentrip_proposal.md` 2장 "기획 서비스 주요 기능" 5개와 실제 구현된 기능이 일치
- [ ] 제안서 3.1장도 14종으로 갱신됨(commit 8377ac3, v1.2에서 표 14종 완성) — §3.1의 "14종" 선언과 표의 종수 합산이 일치하는지 + v1.6 활용 14종(KorService2 13종 + 두루누비)·실제 호출 코드와 3중 매핑 (위 E 체크리스트의 합집합 통과 여부). 미사용 2종(areaCode2·categoryCode2) 호출 0건.
- [ ] 제안서 4장 "단계별 발전 로드맵" 3단계와 `STRATEGY.md` 로드맵 v2가 충돌하지 않음
- [ ] 제안서 1장 "국제 관광 운송 탄소 약 75%(UNWTO)", "글로벌 84% 지속가능 의향(Booking.com 2025)", "내국인 여행 2024년 약 2.92억 회" 등 정량 주장(v1.1 정본 표현)이 `_workspace/benchmark/04_evidence_ledger.md`에 출처와 함께 기록됨 — 구표현(4억 회·한국인 83%·관광교통 탄소 75%) 잔존 시 이슈
- [ ] 제안서 4장 "기대효과" 4개 항목이 `STRATEGY.md`의 KPI로 1:1 매핑됨 (Evidence Ledger 참조)
- [ ] 제안서 4장 "기술 스택"과 DEVELOPMENT_PLAN.md 2장 기술 스택 불일치 사항이 명시적으로 해소됨 (예: Python 백엔드 vs TS 단일 스택 결정)
- [ ] **MobileApp 파라미터 = `GreenTrip` 고정** (`src/lib/tourapi/constants.ts` COMMON_PARAMS) — 운영계정 승인요건 (OpenAPI 자료 p9). 임의 값·`AppTest` 등 placeholder 잔존 0건. (§E와 중복 보장)
- [ ] **KorService2 단일 Base URL** — `src/lib/tourapi/constants.ts`의 `TOUR_API_BASE`가 KorService2. KorService1 잔존 0건. (§E와 중복 보장)
- [ ] **미사용 2종(areaCode2·categoryCode2) 호출 0건** — Grep으로 실제 HTTP 호출 코드 검증. (§E와 중복 보장)
- [ ] **운영계정 1차 심사 전 신청 의무 인지** — Phase 3 W15 운영계정 신청 → 인증키 정보가 1차 심사 제출 항목(OT p12). 위치기반 등록증 전제 (`_workspace/legal/lbs_registration_tracker.md`).

### F. 접근성 & 성능 (Phase 3)
- [ ] axe-core 경고 0 (또는 의도적 무시 사유 명시)
- [ ] Lighthouse Performance ≥ 90 (모바일)
- [ ] Lighthouse Accessibility ≥ 90
- [ ] LCP < 2.5s, CLS < 0.1
- [ ] PWA manifest 유효, 서비스워커 등록

### G. 환경 & 인프라
- [ ] `.env.example`의 모든 키가 실제 코드에서 사용
- [ ] `TOUR_API_KEY`, `NEXT_PUBLIC_KAKAO_MAP_KEY` 등 서버/클라이언트 구분 정확
- [ ] `next.config.ts`의 `remotePatterns`에 tong.visitkorea.or.kr 등록

## 검증 방법

### 1. shape 교차 비교 (가장 중요)
각 API Route 파일과 대응 훅을 **동시에** Read:
```
Read src/app/api/tour/location/route.ts
Read src/hooks/useTourAPI.ts
```
Route의 `NextResponse.json(X)`에서 X의 타입과 훅의 `fetchJson<T>`의 T를 비교.

### 2. 라우팅 스캔
```
Grep "href=" src/
Grep "router.push(" src/
Grep "redirect(" src/
Glob src/app/**/page.tsx
```
두 집합을 크로스 매칭.

### 3. 타입 우회 검출
```
Grep "as unknown as" src/
Grep ": any" src/
Grep "@ts-ignore" src/
```

### 4. TourAPI 호출 검증 (v1.6 KorService2)

**활성 13종 매치 확인:**
```
Grep "locationBasedList2|areaBasedList2|areaBasedSyncList2|searchKeyword2|searchFestival2" src/
Grep "searchStay2|detailCommon2|detailIntro2|detailInfo2|detailImage2|detailPetTour2" src/
Grep "ldongCode2|lclsSystmCode2" src/
```
13종 모두 매치되는지 확인.

**두루누비 1종:**
```
Grep "courseList|routeList|Durunubi" src/
```

**미사용 2종 호출 0건 (Blocker):**
```
Grep "callTourAPI\(['\"]areaCode2['\"]|callTourAPI\(['\"]categoryCode2['\"]" src/
```
0건이어야 함.

**KorService1 잔존 0건 (Blocker):**
```
Grep "KorService1|areaCode1|categoryCode1|locationBasedList1|areaBasedList1|searchKeyword1|searchFestival1|detailCommon1|detailIntro1|detailImage1|detailPetTour1|areaBasedSyncList1" src/
```
0건이어야 함.

## 리포트 포맷

`_workspace/{week}_qa_report.md`:
```markdown
# Week {N} QA Report

## 요약
- 검증 범위: {모듈 목록}
- Blocker: N개 / High: N개 / Medium: N개 / Low: N개
- 통합 정합성: {통과/실패}

## 발견된 이슈

### [Blocker] API↔훅 shape 불일치
- **위치**: src/app/api/tour/location/route.ts:15 ↔ src/hooks/useTourAPI.ts:42
- **문제**: Route는 `{ items: SpotItem[], totalCount }` 반환, 훅은 `SpotItem[]` 기대
- **수정 제안**: 훅을 `fetchJson<{ items: SpotItem[], totalCount: number }>`로 변경
- **담당**: tourapi-integrator + ui-builder

### [High] ...
...

## 미검증 항목
- {이유와 함께 명시}

## TourAPI 14종 커버리지 (v1.6 KorService2 13종 + 두루누비)
{체크리스트 결과}
```

## 심각도 기준

| 심각도 | 기준 |
|-------|------|
| Blocker | 런타임 크래시, 기능 불가, 데이터 손실 |
| High | 주요 기능 결함, 심사 평가 감점 요소 |
| Medium | UX 이슈, 접근성 위반 |
| Low | 코드 품질, 미사용 코드, 스타일 불일치 |

## 팀 통신 프로토콜

- Blocker 발견 시: 파일:라인 + 수정 제안을 해당 에이전트(들)에게 즉시 SendMessage
- 경계면 이슈는 **양쪽 에이전트 모두**에게 멘션
- 리더에게 주차 검증 요약 보고
