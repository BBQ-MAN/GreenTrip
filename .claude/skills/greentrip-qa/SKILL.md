---
name: greentrip-qa
description: GreenTrip 통합 정합성 검증 스킬. API 응답↔프론트 훅 shape 교차 비교, 라우팅 정합성, Prisma↔API↔UI 3층 매핑, 타입 안정성, TourAPI 10종 사용 여부, 접근성, Lighthouse. qa-reviewer 에이전트가 각 모듈 완성 직후 incremental QA로 사용.
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
- [ ] `/api/tour/*` 7개 Route의 응답 shape과 `useTourAPI.ts` 훅의 제네릭 T 일치
- [ ] 공통 shape `{ items, totalCount, pageNo, numOfRows }`을 모든 TourAPI Route가 준수
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

### E. TourAPI 10종 사용 여부 (공모전 필수, DEVELOPMENT_PLAN + 제안서 합집합)
- [ ] areaCode1 호출 확인 (`/api/tour/area`)
- [ ] categoryCode1 호출 확인
- [ ] locationBasedList1 호출 확인 (`/api/tour/location`)
- [ ] areaBasedList1 호출 확인 (`/api/tour/search`)
- [ ] searchKeyword1 호출 확인
- [ ] searchFestival1 호출 확인 (`/api/tour/festival`, Week 6~7)
- [ ] detailCommon1 호출 확인 (`/api/tour/detail`)
- [ ] detailIntro1 호출 확인
- [ ] detailImage1 호출 확인 (`/api/tour/images`)
- [ ] detailPetTour1 호출 확인 (`/api/tour/pet`, Week 8~9)
- [ ] **숙박정보 처리** — `areaBasedList1` with `contentTypeId=32` + 친환경/반려동물/대중교통 필터 (`/api/tour/lodging`, 제안서 3.1 No.6)
- [ ] **`areaBasedSyncList1` 동기화 목록** — 일 1회 cron 실행, 동기화 로그 테이블에 기록 (`/api/tour/sync`, 제안서 3.1 No.10)

### H. 문서 3대 정합성 검증
- [ ] `greentrip_proposal.md` 2장 "기획 서비스 주요 기능" 5개와 실제 구현된 기능이 일치
- [ ] 제안서 3.1장의 10종 OpenAPI와 실제 호출 코드 매핑 (위 E 체크리스트의 합집합 통과 여부)
- [ ] 제안서 4장 "단계별 발전 로드맵" 3단계와 `STRATEGY.md` 로드맵 v2가 충돌하지 않음
- [ ] 제안서 1장 "75% 관광교통 탄소", "83% 지속가능 의향" 등 정량 주장이 `_workspace/benchmark/04_evidence_ledger.md`에 출처와 함께 기록됨
- [ ] 제안서 4장 "기대효과" 4개 항목이 `STRATEGY.md`의 KPI로 1:1 매핑됨 (Evidence Ledger 참조)
- [ ] 제안서 4장 "기술 스택"과 DEVELOPMENT_PLAN.md 2장 기술 스택 불일치 사항이 명시적으로 해소됨 (예: Python 백엔드 vs TS 단일 스택 결정)

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

### 4. TourAPI 호출 검증
```
Grep "areaCode1|categoryCode1|locationBasedList1|areaBasedList1|searchKeyword1" src/
Grep "searchFestival1|detailCommon1|detailIntro1|detailImage1|detailPetTour1" src/
```
10종 모두 매치되는지 확인.

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

## TourAPI 10종 커버리지
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
