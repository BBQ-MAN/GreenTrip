# GreenTrip Strategy v1.0

> 발행: 2026-05-18 · 작성: product-strategist
> 정합 기준: `greentrip_proposal.md` (공모전 1차 심사 제안서) · `DEVELOPMENT_PLAN.md`
> 합본 입력: `_workspace/benchmark/01_*` (경쟁) · `02_*` (IA) · `03_*` (디자인) · `04_*` (전략 10종)
> 변경 이력: §부록 D 참조

---

## Executive Summary (1 page)

**한 문장 포지셔닝:**
> 같은 여행지, 다른 이동방식 — TourAPI 14종(KorService2 13종 + 두루누비, 19종 중 약 74%) 위에 **이동수단 3안 비교**와 **영구 URL 인증서**를 얹은, 비로그인 100% 한국형 저탄소 여행 플래너.

**시장 갭:** 18개 벤치마크 4사분면에서 "한국 × 친환경 × 코스 자동 생성" 우상단 사분면이 비어 있다. 트리플(코스만), Joro/Wren(탄소만), Byway(유럽 한정)이 각각 부분 솔루션. GreenTrip은 3차원 결합으로 유일.

**시그니처 3개 (5초 인지):**
1. **이동수단 3안 비교 카드** — 자가용·대중교통·자전거 동시 비교 (eco/balance/fast 컬러 코딩).
2. **영구 URL 인증서 + 비로그인 100% 깔때기** — 공유받은 친구가 가입 없이 보고 "나도 만들기" 진입.
3. **Carbon Scale 4단계 + Before/After** — "기존 12.4 kg → 본 코스 4.2 kg" 신호등 + 큰 numeric 시각화.

**핵심 KPI:**
- **North Star:** 월간 절감 누적 CO₂ (kg) — Phase 3 종료 1,000 kg/월 → Phase 6 50,000 kg/월
- **Counter Metric:** 코스 생성 후 실 사용률 (여행 완료 / 인증서 발급 / 30일 재방문)

**로드맵:**
| Phase | 시기 | 핵심 |
|-------|------|------|
| 1·2·3 (런칭) | 2026.05~09 | 강원도 PWA + 시그니처 3개 + TourAPI 14종 (KorService2 13종 + 두루누비) |
| 4 (확장) | 2026.11~2027.01 | 리더보드·챌린지·제주 확장 |
| 5 (사업화) | 2027.02~04 | B2G 대시보드·ESG·전국 5~6개 시도·지역화폐 PoC |
| 6 (지속) | 2027.05+ | 모바일 앱·다국어·탄소 크레딧·전국 완성 |

**공모전 4영역 강조 매핑:**
| 영역 | 배점 | GreenTrip 핵심 카드 |
|------|------|-------------------|
| 기획력 | 30 | 시장 갭 + 관점 전환(어디→어떻게) + 8개 정책 부합 |
| 완성도 | 30 | 시그니처 3개 라이브 데모 + WCAG AA + PWA |
| 데이터 활용 | 20 | TourAPI 14종 (KorService2 13종 + 두루누비, 19종 중 74%) 호출 + 통계 대시보드 + `/about/sustainability` |
| 발전성 | 20 | 4-Phase 로드맵 + B2G LOI 3건 + 카테고리 표준 어휘 선점 |

**Trade-off (안 할 것):** 항공권·해외여행, 풀-패키지 OTA, 호텔 인증(Phase 5까지 유예), 카본 오프셋 결제, 통근 멀티모달, 카테고리 평면 나열, 광역시 동시 지원, 앱 강제, 로그인 강요.

**TS 단일 스택 결정:** 제안서 §4 "Node.js + Python(탄소 엔진)" 표현은 Next.js API Routes + TypeScript 단일 스택으로 실 구현. 분리 백엔드 어필력 부재 가능성(W4)은 카테고리 선점(O4)으로 우회 (§부록 C).

---

## 1. Positioning (요약)

상세: `_workspace/benchmark/04_positioning.md`

### 6-line Statement

```
For       2030 MZ 국내 여행자 (환경 가치 의식, 막막함)
Who       강원도 여행 시 탄소 줄이고 자랑하고 싶으나 한국 도구 부재
GreenTrip is  TourAPI 14종(KorService2 13종 + 두루누비) 기반 비로그인 100% 저탄소 코스 플래너 PWA
That      자가용·대중교통·자전거 3안의 CO₂·시간·비용 동시 비교 + 영구 인증서
Unlike    트리플(탄소 X), Joro(한국 X), Byway(한국 X), 대한민국구석구석(정부 톤)
Our product   "어디를 갈까" → "어떻게 갈까"로 결정 축 전환
```

### JTBD 3개

1. **Effortless eco** — "죄책감 없이 자랑하고 싶다" (`/plan/result` 3안 + 인증서)
2. **Decision shortcut** — "막막함을 1분 의사결정으로" (2 클릭 도달)
3. **Belonging to the cause** — "가치 진영에 소속" (영구 URL + 누적 랭킹 Phase 4)

### 카테고리 표준 어휘 선점

- **이동수단 3-tier:** 저탄소 / 균형 / 속도
- **탄소 4-tier:** 저탄소 / 균형 / 주의 / 고탄소
- **환산 2종:** 나무 그루 (×22 kg/year) / 자동차 회피 km

---

## 2. SWOT (요약)

상세: `_workspace/benchmark/04_swot.md`

| | 내부 (Internal) | 외부 (External) |
|---|----------------|-----------------|
| **긍정** | **S1** TourAPI 14종 (KorService2 13종 + 두루누비, 74%), **S2** 3안 비교 시그니처, **S3** 강원도 18시군구 깊이, **S4** 비로그인 100%, **S5** TS 단일 스택 효율 | **O1** 글로벌 84% 지속가능 의향, **O2** 국제 관광 운송 탄소 75%, **O3** 공모전 B2G 채널, **O4** 빈 사분면 선점, **O5** 강원관광재단 협업 잠재 |
| **부정** | **W1** 브랜드 0, **W2** 강원 한정, **W3** TourAPI 품질 변동, **W4** 분리 백엔드 어필 부재, **W5** 네이티브 앱 없음 | **T1** 빅테크(Google Maps), **T2** 트리플·카카오·네이버 추가 진입, **T3** TourAPI 정책 변경, **T4** 카본 오프셋 회의론 확산, **T5** 공공 데이터 상업화 충돌 |

**핵심 결론 3개:**
1. **선점이 답이다 (SO):** 빈 사분면 + 공모전 10월 타이밍 동시 열림.
2. **시그니처 3개로 컨벤션 위 차별 (ST):** 빅테크 진입 어렵게.
3. **B2G 보완재 프레임 (WO):** 대한민국구석구석 비판하지 않고 MZ 톤 보완재로.

---

## 3. Signatures (요약)

상세: `_workspace/benchmark/04_signatures.md`

### 시그니처 1 — 이동수단 3안 비교 카드 (★ 메인)

- **5초 인지:** `/plan/result`에서 3카드 가로/스와이프, 이동수단 컬러 칩 (eco `#0B8C5C` / balance `#0E7490` / fast `#F59E0B`), 우측 numeric.hero 56px 절감 kg + Carbon Scale 배경.
- **모방 어려움:** (한국 데이터) × (이동수단 3안) × (탄소 가시화) 3차원 결합. 카테고리 표준 어휘 선점.
- **발현:** `/plan/result`, `/course/[id]` 헤더+타임라인, 지도 RouteOverlay 3색, 랜딩 미리보기.

### 시그니처 2 — 영구 URL 인증서 + 비로그인 100% 깔때기

- **5초 인지:** 카카오톡 인증서 링크 → 가입 없이 카드 열람 → "나도 만들기" 즉시 진입. 9:16/1:1 두 비율.
- **모방 어려움:** Wren 휘발·VisitKorea 수치 빈약·트리플 앱 강제 회피. 영구 URL + 비로그인 + 수치 시그니처(나무 환산) 3중 결합.
- **발현:** `/report/[id]`, 카카오 Share, `/plan?ref=share-report` 깔때기.

### 시그니처 3 — Carbon Scale 4단계 + Before/After

- **5초 인지:** 모든 카드 우측에 4단계 CarbonBadge(pill + 컬러 + 아이콘 + 라벨), 코스 결과 `strikethrough 12.4 kg → 강조 4.2 kg`, Hero에 240px CarbonGaugeCircular 도넛 + 720ms 카운트업.
- **모방 어려움:** Joro 거래별 환산 + Too Good To Go 가격 차이 + Wren 라이브 피드 3개 통합. WCAG AA 검증 완료.
- **발현:** 전 카드 CarbonBadge, `/plan/result` BeforeAfterCompare, `/report/[id]` EquivalentMetaphor, Phase 4 LiveActivityToast.

### 안 할 시그니처 (Trade-off)

마스코트·라이브 토스트·리더보드·강원더풀 카피·7-pillar 그린 등급 → Phase 4+ 이연. 3개 미만 유지.

---

## 4. MVP+ Priority (P0/P1/P2/P3)

상세: `_workspace/benchmark/04_mvp_plus_priority.md`

### P0 — 공모전 1차 심사(2026.10) 필수 (13개)

| 항목 | RICE | Week | 비고 |
|------|------|------|------|
| 이동수단 3안 비교 카드 (P0-1) | 1.0 | W4 | 시그니처 1 |
| Carbon Scale 4단계 + Before/After (P0-2) | 1.0 | W3~4 | 시그니처 3 |
| TourAPI 14종 (P0-3, v1.6 KorService2 13종 + 두루누비) | 0.6 | W2 | 데이터 활용 20점 |
| 영구 URL 인증서 (P0-4) | 0.32 | W10~11 | 시그니처 2 |
| 비로그인 100% 깔때기 (P0-5) | 2.0 | W12 | NextAuth callbackUrl |
| 카카오맵 3안 경로 (P0-6) | 0.9 | W5 | RouteOverlay |
| 강원 ThemeCourse 시드 (P0-7) | 0.8 | W12~13 | Empty state |
| 축제 옵션 (P0-8) | 0.25 | W6~7 | 제안서 §2.2 ③ |
| 반려동물 모드 (P0-9) | 0.13 | W8~9 | 제안서 §2.2 ④ |
| **`/about/sustainability` (P0-10)** | 0.30 | W14~15 | **STRATEGY 보강 — 데이터/발전성 어필** |
| **TourAPI 호출 통계 대시보드 (P0-11)** | 0.15 | W15~16 | **STRATEGY 보강 — 심사용** |
| PWA + Lighthouse 90+ (P0-12) | 1.0 | W14 | 완성도 |
| 통합 QA (P0-13) | 0.67 | Each W + W16~17 | qa-reviewer |

### P1 — Phase 4 (2026.11~2027.01) — 게이미피케이션/확장

| 항목 | RICE | 비고 |
|------|------|------|
| 누적 절감 리더보드 (P1-1) | 0.37 | 발전성 가점 직결 |
| 챌린지 시스템 v1 (P1-2) | 0.20 | Joro 학습 |
| 커뮤니티 후기 v1 PoC (P1-3) | 0.08 | 콜드스타트 위험 — 광역 검토 후 |
| 제주 확장 (P1-4) | 0.20 | W2 보완 |
| 마이페이지 강화 (P1-5) | 0.30 | 누적 카운터·인증서 갤러리 |
| Live Activity Toast (P1-6) | 0.64 | Wren ledger 차용 |
| Empty state 큐레이션 (P1-7) | 0.40 | 신규 첫 화면 |
| 카카오 친구 초대 (P1-8) | 0.20 | 바이럴 |
| 인플루언서 큐레이션 (P1-9) | 0.10 | W1 보완 |
| EquivalentMetaphor 다각화 (P1-10) | 0.60 | 나무·자동차·태양광 |

### P2 — Phase 5 (2027.02~04) — B2G/B2B/전국

B2G 대시보드 / ESG 리포트 / 친환경 숙소 어필리에이트 / 탄소 포인트↔지역화폐 PoC / `/api-docs` / 캠페인 페이지 / 전국 5~6개 시도

### P3 — Phase 6 (2027.05+) — 지속

RN 앱 / 탄소 크레딧 / AI 슬라이더 / 공개 인증 피드 / 다국어 / 기상청 연동

---

## 5. Roadmap v2

상세: `_workspace/benchmark/04_roadmap_v2.md`

### 제안서 §4.1 정합

| 제안서 단계 | 시기 | STRATEGY Phase |
|----------|------|---------------|
| 1단계: 서비스 개발 및 상용 런칭 | 2026.5~9 | Phase 1·2·3 |
| 2단계: 고도화 + 단계적 지역 확장 | 2026.11~2027.1 (제안서 v1.3 정합) | **Phase 4 (2026.11~2027.01)** — 일치 (제주 1차 확장) |
| 3단계: B2G·B2B 연계 + 전국 확장 완성 | 2027~ | Phase 5 + Phase 6 (전국 17개 완성 = Phase 6) |

> 제안서 v1.3(2026-06-11)에서 2단계 시기·범위가 본 로드맵 v2와 완전 정합 — 부록 C-2·C-3 해소 참조.

### Phase별 핵심 목표 + KPI 목표

```
Phase 1·2·3 (런칭, 2026.05~09)
  목표: 강원 PWA 런칭 + 시그니처 3개 + TourAPI 14종 (KorService2 13종 + 두루누비) + 1차 심사 통과
  KR: 누적 사용자 1,000 / 월간 절감 1,000 kg / 인증서 공유율 15% / Lighthouse 90+

Phase 4 (확장, 2026.11~2027.01)
  목표: 리더보드+챌린지+제주 → 사용자 5배
  KR: 누적 5,000 / 월간 3,000 kg / 비강원 25% / 리더보드 참여 30%

Phase 5 (사업화, 2027.02~04)
  목표: B2G 3건+ / ESG / 전국 5~6개 시도 / 지역화폐 PoC
  KR: 누적 30,000 / 월간 15,000 kg / LOI 3건+ / 숙소 파트너 5개 PoC

Phase 6 (지속, 2027.05+)
  목표: 전국 17개 / RN 앱 / 다국어 / 탄소 크레딧
  KR: 누적 100,000 / 월간 50,000 kg / 앱 50,000 다운로드 / 매출 연 5억
```

### 핵심 결정 사항

- **결정 1 — TS 단일 스택:** 제안서 표현과 차이 명시.
- **결정 2 — Phase 4 11월 시프트:** 10월은 심사 대응에 할애.
- **결정 3 — 단계적 확장:** 제주 → 수도권 → 영호남, Phase 4·5·6 분산.
- **결정 4 — 카본 오프셋 결제 제외:** 정책 연계로 대체 (Phase 5~6).

---

## 6. KPI

상세: `_workspace/benchmark/04_kpi.md`

### North Star + Counter

```
North Star: 월간 절감 누적 CO₂ (kg)
Counter:    1인당 코스 사용률 (여행 완료 OR 인증서 OR 30일 재방문)
```

### 보조 지표 9종

가입·활성화(누적 사용자, 월간 코스 생성, 비강원 비율) / 시그니처 도달률(3안 도달률, 인증서 발급률, 공유율) / 데이터 활용(TourAPI 14종 호출, 캐시 적중률) / 신뢰·성능(Lighthouse, WCAG, Sentry, p95).

### Phase별 OKR

각 Phase 종료 시점의 KR 5~7개. Phase 1·2·3은 공모전 1차 심사 통과가 마스터 KR.

### KPI 거버넌스

일간 모니터링 / 주간 리뷰 / 월간 NS+Counter / Phase 전환 시 KR 재조정.

---

## 7. 공모전 심사 매핑

상세: `_workspace/benchmark/04_judge_mapping.md`

### 1차 심사 (기능심사, 2026.10) — 100점 + 가점 4점

| 영역 (배점) | GreenTrip 핵심 카드 | 보강 필요 |
|-----------|-------------------|---------|
| **기획력 (30)** | 시장 갭 + "어디→어떻게" + MZ 가치 + Trade-off 명시 | Evidence Ledger E1·E2·E3 보강 |
| **완성도 (30)** | 시그니처 3개 라이브 데모 + PWA + Lighthouse + WCAG | 모바일 실 디바이스 QA + 시드 코스 캐시 워밍 |
| **데이터 활용 (20)** | TourAPI 14종 (KorService2 13종 + 두루누비, 19종 중 74%) + 통계 대시보드(P0-11) + `/about/sustainability`(P0-10) | ~~동기화 목록 API(areaBasedSyncList2) 실제 사용 코드~~ 구현 완료(`/api/tour/sync`, Phase 3 W14) |
| **발전성 (20)** | Phase 4·5·6 로드맵 + 정책 매핑 8개 + B2G LOI | 강원관광재단 협업 LOI 진척 |
| **가점 (+2~4)** | 강원도 특화 +2 | Start-up NEST 등록 검토 +2 |

### 최종심사 (PT, 2026.10) — 상위 5팀

10분 PT 구성: 시장 갭(1) → JTBD(1) → 시그니처 3개(2) → 라이브 데모(2) → 데이터 활용(1) → 발전성(2) → 클로징(1).

---

## 8. 산출물 인덱스

상세 문서들은 `_workspace/benchmark/`에 있다.

| # | 파일 | 내용 |
|---|------|------|
| 1 | `04_positioning.md` | 6-line statement, JTBD 3개, 카테고리 정의 |
| 2 | `04_swot.md` | 2×2 매트릭스, TOWS 전략, 결론 3개 |
| 3 | `04_signatures.md` | 시그니처 3개 (5초 인지·페이지·Week 매핑) |
| 4 | `04_mvp_plus_priority.md` | RICE + Kano + P0/P1/P2/P3 |
| 5 | `04_roadmap_v2.md` | Phase 1~6 일정·KPI·리소스·결정 사항 |
| 6 | `04_kpi.md` | North Star + Counter + Phase별 OKR + 측정 인프라 |
| 7 | `04_judge_mapping.md` | 4영역 매핑 + PT 시나리오 + 가점 |
| 8 | `04_policy_alignment.md` | 8개 정책 부합 매트릭스 + B2G 매핑 |
| 9 | `04_impact_to_kpi.md` | 제안서 기대효과 4개 → KPI 1:1 환원 |
| 10 | `04_evidence_ledger.md` | 24개 정량 주장 출처 추적 + 보강 계획 |

---

# 부록

## 부록 A — 정책 부합성 매트릭스 (요약)

상세: `_workspace/benchmark/04_policy_alignment.md`

| # | 정책 | GreenTrip 부합 기능 | 측정 지표 | Phase |
|---|------|-------------------|---------|-------|
| P1 | 2050 탄소중립 국가전략 | 이동수단 3안 + Carbon Scale + 인증서 | 월간 절감 CO₂ | 1~3 |
| P2 | 탄소중립 기본법 (2022) | 탄소 포인트 적립 PoC | 포인트 발행량 | 5 |
| P3 | **「제4차 관광개발기본계획 (2022~2031) — 공존·혁신·평화의 K-관광」** (v1.2 정식 확정) | 강원 + 친환경 인증·생태관광 필터 | 친환경 코스 사용률 | 1~5 |
| P4 | 지역화폐 제도 | 탄소 포인트 ↔ 지역화폐 PoC | 교환액 / 참여 시군구 | 5 |
| P5 | 강원특별자치도 + 관광 정책 | 18개 시군구 전체 + 강원더풀 협업 | 시군구별 분포 / 강원 LOI | 1~5 |
| P6 | K-ESG 가이드라인 | ESG 리포트 자동 생성 | ESG 발급 건수 | 5 |
| P7 | 관광진흥 5개년 기본계획 | TourAPI 14종 (KorService2 13종 + 두루누비) + 분산 관광 + 다국어 | TourAPI 호출량 / 비강원 비율 | 1~6 |
| P8 | 지속가능 교통물류 발전 계획 | 대중교통·자전거 우선 추천 | 대중교통/자전거 선택률 | 4~6 |

**B2G 최우선 파트너:** 강원특별자치도청 + 강원관광재단 (P1·P5).

---

## 부록 B — 기대효과 ↔ KPI 매핑

상세: `_workspace/benchmark/04_impact_to_kpi.md`

| 제안서 기대효과 | 1순위 KPI | 보조 KPI |
|---------------|----------|--------|
| A. 관광 탄소 감축 실천 도구 | 월간 절감 누적 CO₂ (North Star) | 1인당 사용률, 3안 도달률, 인증서 발급률, 공유율 |
| B. 지역 관광 활성화 | 강원도 18개 시군구 코스 분포 | 비강원 비율, 체류기간, 대중교통/자전거 선택률 |
| C. 데이터 생태계 확장 | TourAPI 14종 (KorService2 13종 + 두루누비) 주간 호출 적중률 100% | 월 호출량, 캐시 적중률, 대시보드 PV |
| D. 정책 연계 확장성 | B2G 파트너 LOI 누적 (Phase 5 종료 3건+) | 지역화폐 PoC 사용자, ESG 발급, 8개 정책 활동 |

---

## 부록 C — 핵심 결정 사항 (스택·아키텍처)

### C-1. TS 단일 스택 결정

- **제안서 §4.1 기술 스택:** "Node.js (Express) + Python (탄소 계산 엔진)"
- **STRATEGY 실 구현:** **Next.js 14 App Router + TypeScript 단일 스택** (Prisma + Supabase + Upstash + Vercel)
- **근거:** `CLAUDE.md` 사용자 결정. 4명 미만 팀에 분리 스택 운영 부담 과함. 탄소 계산은 TS로 충분 (`DEVELOPMENT_PLAN §4.1` Haversine + 배출 계수 곱).
- **약점 (`04_swot.md` W4):** Python 백엔드 어필력 부재 가능성. → **카테고리 선점(O4)으로 우회.** PT에서는 "단일 스택의 개발 속도·유지보수성" 발전성으로 강조.
- **권고 (별도 작업):** 제안서 §4.1 기술 스택 표를 "Node.js (Next.js API Routes) + TypeScript"로 표현 조정.

### C-2. Phase 4 시작 1개월 시프트 — ✅ 해소 (제안서 v1.3, 2026-06-11)

- (구) 제안서 2단계 2026.10~12 → STRATEGY Phase 4 2026.11~2027.01.
- 10월은 1차 심사·최종심사·Phase 3 Week 16~17(QA·콘텐츠 보강)에 할애.
- **해소:** 제안서 v1.3에서 2단계 시기를 2026.11~2027.1월로 조정 — 시기 충돌 소멸. §5 정합 표 동시 갱신.

### C-3. 단계적 확장 — ✅ 제안서 정합 완료 (v1.3, 2026-06-11)

- Phase 4 제주 → Phase 5 수도권·호남·영남 5~6개 시도 → Phase 6 17개 완성.
- 17개 동시 확장은 데이터·UX 모두 흐림.
- **해소:** (구) 제안서 2단계 "전국 17개 시도 확대"가 본 결정과 범위 충돌(재감사 2026-06-11 M-5). 제안서 v1.3에서 2단계 = 제주 1차 확장, 전국 17개 완성 = 3단계(2027~)로 조정 — STRATEGY 로드맵 v2를 정본으로 정합. 심사 관점에서도 "강원 검증 → 제주 → 전국"의 단계적 로드맵이 실행 가능성 평가에 유리.

### C-4. 카본 오프셋 결제 제외

- Klima·Wren 오프셋 시장 신뢰성 논쟁.
- 정책 연계(P2 탄소 포인트, P4 지역화폐, Phase 5~6 탄소 크레딧)로 대체.

---

## 부록 D — Evidence Ledger (v1.6 — KorService2 마이그레이션 2026-06-05)

상세: `_workspace/benchmark/04_evidence_ledger.md` (v1.6) + `_workspace/seminar/2026_seminar_findings.md` + `_workspace/tourapi_migration_v1.6.md`

**총 31개 정량 주장 추적표 (v1.3 기준 E25~E31 신규 7건 추가, v1.6 E22·E29 갱신).**

### v1.6 갱신 (2026-06-05 사용자 활용신청서 1차 출처)

| ID | 변경 | 신뢰도 |
|----|------|------|
| **E22** | Base URL `KorService1` → **`KorService2`** (사용자 신청서 15개 endpoint HTTP 200 실측) | [Verified v1.6] High (신청서 1차) |
| **E29** | "19종 중 10종 활용" → **"19종 중 14종 활용 (약 74%)"** = KorService2 활성 13종 + 두루누비 1종. 신규 endpoint 5종(searchStay2·detailInfo2·ldongCode2·lclsSystmCode2 + 두루누비) 추가. 미사용 2종(areaCode2·categoryCode2)은 신청서 "미사용 (삭제예정)" 명시 → 호출 0건 + 정식 대체로 사전 마이그레이션. | [Verified v1.6] High |

### v1.3 추가 (2026-05-20 운영사무국 설명회 출처)

| ID | 주장 | 신뢰도 |
|----|------|------|
| **E25** | 한국관광공사 보유 관광 데이터 **약 791만건** (v1.4 PDF 원본 정정 — 791건→791만건) | [Verified] High (PDF p2) |
| **E26** | 국문 정보 **50,956건**, 다국어 8종 (주요 4종 ~15,000건, 소수어 2,000~3,100건), 국내 유일 | [Verified] High (PDF p5·p7) |
| **E27** | TourAPI 시작 2011년 → 현재 4.0 버전 | [Verified] High |
| **E28** | TourAPI 활용 서비스 중 웹 점유 약 46.2% (안드로이드 역전) | [Verified] High — PWA 선택 정합 근거 |
| **E29** | 한국관광공사 오픈 API 총 19종 (공모전 대상). E20 v1.3 정정 근거. | [Verified] High |
| **E30** | 호출 한도: 개발 1,000건/일, 운영 100,000건/일 | [Verified] High — 캐싱 전략 필수 |
| **E31** | 인증키 유효기간 2년 (연장 시 키 유지) | [Verified] High — 2028년 5월 이전 연장 |

### v1.2 신뢰도 매트릭스 (잔여 처리·제안서 정정 적용 2026-05-18)

| 상태 | 건수 | 항목 |
|------|------|------|
| **[Verified] High** ✓ | **8건** | E5·E6·E8·E9·E10·E11·E12 + **E3** (2.92억 회 정정 완료로 격상) |
| **[Verified Adjusted Option A]** ⊙ | **2건** | **E1** 글로벌 75% (UNWTO 2008·2005 통계) + 한국 자가용 패턴 부연 채택 (한국 한정 통계는 공공 인벤토리 분리 부존재 — KOTI·GIR·KCTI 구조적 한계) · **E2** Booking.com 2025 글로벌 84% (34개국 32,000명, 한국 1,000명 포함) 채택 (한국 분리 수치는 비공개 정책) |
| **[Replaced + Verified] High** ⚙✓ | **1건** | **E7** 「제4차 관광개발기본계획 (2022~2031) — 공존·혁신·평화의 K-관광」 정식 채택 (「제3차 지속가능 관광 활성화 계획」 부존재 확정, 보조 「제6차 관광진흥기본계획」 병기) |
| **[Replaced] High** ⚙ | **1건** | **E24** 동해안 자전거길 강원 **242km** (130km → 정정 완료) |
| **[Still Unverified]** ⚠ | **0건** | — 해소 완료 |
| 기타 High/Med/내부 | 12건 | E4·E13~E23 (벤치마크·내부 합의 등 변경 없음) |

### 잔여 [unverified] 처리

**v1.2 완료 — 잔여 작업 없음.** Phase 3 W14의 별도 워크숍 불필요.

competitor-researcher v2 검증 결과 잔여 3건 모두 처리:
- **E1·E2 옵션 A 확정** — 한국 한정 분리 통계의 구조적 부존재(KOTI·GIR·KCTI) / 비공개(Booking.com)를 명시하고 글로벌 1차 출처 + 한국 맥락 부연 표현으로 채택.
- **E7 1차 채택** — 「제4차 관광개발기본계획 (2022~2031) — 공존·혁신·평화의 K-관광」 (부합도 9/10).

### 검증된 정책·법령 (E5~E12) — 정식 명칭 (v1.2)

| ID | 정식 명칭 | 발행 / 시행 |
|----|---------|------------|
| E5 | 탄소중립·녹색성장 국가전략 및 제1차 국가 기본계획 (2023~2042) | 2023-04-10 의결 (2050탄소중립녹색성장위원회) |
| E6 | 기후위기 대응을 위한 탄소중립·녹색성장 기본법 | 시행 2022-03-25 |
| **E7** | **「제4차 관광개발기본계획 (2022~2031) — 공존·혁신·평화의 K-관광」 (주) + 「제6차 관광진흥기본계획 (2023~2027)」 (보조)** ✓ v1.2 정식 확정 | 4차 2022-03-28 발표 (10년 단위 법정계획) / 6차 2022-12-12 발표 |
| E8 | 지역사랑상품권 이용 활성화에 관한 법률 | 시행 2020-07-02 |
| E9 | 강원특별자치도 (강원특별법 근거) | 출범 2023-06-11 |
| E10 | K-ESG 가이드라인 v1.0 (관계부처 합동) | 공개 2021-12-01 |
| E11 | 제6차 관광진흥기본계획 (2023~2027) | 2022-12-12 발표 (제7차 국가관광전략회의) |
| E12 | 제2차 지속가능 국가교통물류발전 기본계획 (2021~2030) | 수송부문 24.3% 감축 (2017년 대비 2030년) |

### 제안서 표현 정정 (✅ APPLIED 2026-05-18)

`04_proposal_corrections.md` v1.2 참조. 핵심 5건 모두 `greentrip_proposal.md` v1.1 본문에 적용 완료:
1. **§1.1** "내국인 여행 4억 회" → "**2024년 약 2.92억 회** (한국문화관광연구원 「2024 국민여행조사」, 경험률 95.4%, 2019년 피크 3.45억 회 회복세)" ✅
2. **§1.1** "국내 관광 탄소 75% 관광교통" → "**국제 관광 탄소 약 75%** (UNWTO 2008·2005 통계) + 한국 자가용 패턴 부연" (옵션 A) ✅
3. **§1.1** "한국인 83% 지속가능 의향" → "**Booking.com 2025 「Sustainable Travel Report」 34개국 32,000명(한국 1,000명 포함) 응답자의 84%**" ✅
4. **§2.4** "동해안 자전거길 130km" → "**동해안 자전거길 강원 구간 242km (고성~삼척, 자전거행복나눔 공식)**" ✅
5. **§1.2·§4 정책 인용** → 「탄소중립·녹색성장 국가전략 및 제1차 국가 기본계획 (2023~2042)」, 「제4차 관광개발기본계획 (2022~2031) — 공존·혁신·평화의 K-관광」(보조 「제6차 관광진흥기본계획」), 「기후위기 대응을 위한 탄소중립·녹색성장 기본법」, 「지역사랑상품권 이용 활성화에 관한 법률」 정식 명칭으로 교체 ✅

### 확보 완료 항목 (High 신뢰도, 변경 없음)

E13~E20 (Byway·마이리얼트립·Citymapper·AllTrails·Too Good To Go·Google Maps·공모전 상금·TourAPI 활용 종수) + E22·E23 (TourAPI Base URL·강원 area code) + E5·E6·E8·E9·E10·E11·E12 (v1.1 신규 [Verified] High 7건) + E3·E7 (v1.2 격상·채택). **v1.6 갱신: E20 활용 종수 재평가(이전 10종 → 14종, KorService2 13종 + 두루누비), E22 Base URL = KorService2, E29 신규(19종 중 14종 = 74%) 추가.**

---

## 부록 E — 분석 입력의 한계

- **모바일 실제 UI:** WebFetch는 정적 HTML 기반. AllTrails·Komoot·Wanderlog의 모바일 햄버거 메뉴 내부, 모달, 제스처 인터랙션 미관측 (`02_ia_insights.md §8`).
- **로그인 후 IA:** 모든 벤치마크의 로그인 벽 너머 미관측 — `/mypage` 설계는 카테고리 컨벤션 기반 추정.
- **BookDifferent·Joro 사이트:** 서버 응답 없음 (`02_ia_sitemaps.md` 미수집). Wren·Klima·BeCause로 흡수.
- **트리플 앱 내부:** 웹 랜딩만 조사.
- **그레킹·싸이클로라마 (2024 공모전 수상작):** 1차 사이트 미확인 (`01_landscape §7.2, §7.3`). 후속 심층 조사 권고.

분석 입력의 약점은 카테고리 컨벤션과 신중한 추정으로 보완했으나, 본 STRATEGY의 일부 단정(예: "벤치마크 어디에도 없다")은 분석 한계 내에서 유효.

---

## 부록 F — 변경 이력

| 날짜 | 버전 | 변경 | 사유 |
|------|------|------|------|
| 2026-05-18 | v1.0 | 초기 STRATEGY.md 발행 | 벤치마크 Phase A 3명 분석 결과 합성. P0~P3 + 8개 정책 + 24개 Evidence + 시그니처 3개. |
| 2026-05-18 | **v1.1** | **Evidence Ledger 출처 보강** — competitor-researcher 12건 검증 결과 반영. [Verified] High 7건(E5·E6·E8·E9·E10·E11·E12) / [Replaced] 4건(E1·E2·E3·E24 수치·표현 정정) / [Still Unverified] 1건(E7). 부록 D·SWOT O1/O2·정책 매핑 P1~P8·심사 매핑 §1.1·제안서 정정 권고(`04_proposal_corrections.md`) 동시 갱신. | 공모전 심사 대응 사실 정확성 확보 |
| 2026-05-18 | **v1.2** | **Evidence Ledger 보강 + 제안서 정정 적용** — competitor-researcher v2 잔여 3건 처리. E1·E2 옵션 A 채택([Verified Adjusted Option A] ⊙, 한국 한정 분리 통계 구조적 부존재·비공개 명시). E7 「제4차 관광개발기본계획 (2022~2031) — 공존·혁신·평화의 K-관광」 정식 채택([Replaced + Verified] ⚙✓). E3 [Verified] High 격상. 잔여 [unverified] 0건. `greentrip_proposal.md` v1.1 본문 정정 5건(C1~C5) 적용 완료. 부록 A P3 정책명, 부록 D 신뢰도 매트릭스·정책 매핑 표·제안서 정정 적용 결과 동시 갱신. | 잔여 정량 주장 정합성 종결 + 제안서 본문 정정 일괄 적용 |
| 2026-05-21 | **v1.3** | **2026 세미나 분석 반영** — 2026-05-20 운영사무국 온라인 설명회(`_workspace/seminar/2026_seminar_findings.md`) 분석 통합. 부록 D Evidence Ledger E25~E31 신규 7건(보유 데이터 791건·국문 5만건·다국어 8종·API 4.0·웹 점유 46.2%·총 19종·호출 한도·키 2년) + E20 재평가(19종 중 10종, areaCode1·categoryCode1 2026 폐기 대응 명시). 정확 일정 4건 추가(09-21 마감 / 10-21 합격 / 10-28 PT / 11-05 시상). 시상금 정보 추가(대상 1,000만원 통합). 위치기반 사업자 등록 필수 명시. DEVELOPMENT_PLAN §1.3 + §3.2(폐기 API), 04_judge_mapping, 04_evidence_ledger, greentrip-qa, CLAUDE.md, _workspace/legal/lbs_registration_tracker.md(신규) 동시 갱신. | 예비합격자 대상 운영사무국 설명회 핵심 정보 정합 |
| 2026-05-28 | **v1.4** | **PDF 원본 교차검증** — 설명회 PDF 2종(OpenAPI 45p·OT 23p) 정독. **E25 중대 정정 791건→791만건**(녹취 1만배 오류). E26 정밀화(국문 50,956건). 시상 완전판(장려상 15팀×50만+최우수 300만/우수 100만 확정). **강원 RTO 특별상**(본상+특별상 이중 수상, GreenTrip 직접 타겟). 운영계정 1차 심사 전 신청 필수(인증키 정보 제출→위치기반 등록 임계경로). MobileApp=GreenTrip 승인요건. `findings §P`, 04_evidence_ledger v1.4, 04_judge_mapping, greentrip-qa, lbs_tracker, CLAUDE.md 동시 갱신. | PDF 원본 정독 누락·오류 보정 |
| 2026-05-28 | **v1.5** | **두루누비 API 도입 + 강원관광재단 협업 P0 격상** — 두루누비(API-11, 코리아둘레길) 도입: 강원 자전거길·둘레길·DMZ GPX를 자전거/도보 코스 + 강원 테마에 연동. 활용 11종(19종 중 58%). P0-7 시드 소스 + P1-11 본격 통합. 강원관광재단 협업을 발전성 어필 → **강원 RTO 특별상 자체 심사 직접 영향**으로 P0 격상. DEVELOPMENT_PLAN §3.2 API-11, tourapi-integrator/integration, greentrip-qa, 04_mvp_plus_priority, 04_judge_mapping(데이터 활용 11종·발전성 강원 RTO), CLAUDE.md 동시 갱신. | 사용자 결정(두루누비 도입 + 강원 협업 상향) |
| 2026-06-05 | **v1.6** | **KorService1 → KorService2 일괄 마이그레이션** — 사용자 활용신청서(15개 endpoint HTTP 200 실측) 1차 출처. Base URL `KorService2` 단일. 활용 종수 11종 → **14종** (KorService2 활성 13종 + 두루누비, 19종 중 약 74%). 신규 endpoint 5종(searchStay2·detailInfo2·ldongCode2·lclsSystmCode2 + 두루누비) 통합. 미사용 2종(areaCode2·categoryCode2) "신청 됐으나 호출 0건" + 정식 대체(ldongCode2·lclsSystmCode2)로 사전 마이그레이션. DEVELOPMENT_PLAN §3, tourapi-integrator/integration, greentrip-qa §E(체크리스트 14종 + 미사용 0건 Grep), 04_evidence_ledger v1.6(E22·E29), 04_judge_mapping §1.3(14종·74%), 부록 D, `src/lib/tourapi/constants.ts`, `src/types/tour.ts`, `.env.example`, `CLAUDE.md` 동시 갱신. 산출물: `_workspace/tourapi_migration_v1.6.md`. | 사용자 결정 + 15개 endpoint HTTP 200 실측 확인 (KorService1 deprecated) |
| 2026-06-11 | **v1.7** | **제안서 v1.3 로드맵 정합 + SWOT 라벨 정정** — 재감사(`_workspace/reaudit_harness_docs_20260611.md` M-5) 로드맵 충돌 해소: 제안서 §4.1 2단계를 단계적 확장(2026.11~2027.1·제주 1차)으로, 전국 17개 시도 완성을 3단계(2027~)로 조정 — STRATEGY 로드맵 v2 정본. §5 정합 표·부록 C-2/C-3 해소 표기, `04_roadmap_v2.md` §1·결정 2·3 동시 갱신. §2 SWOT 요약 라벨 구수치 축약(O1 "83%"·O2 "관광 탄소 75%") → v1.1 정본 축약(글로벌 84%·국제 관광 운송 탄소 75%) 정정 — `04_swot.md` 상세는 v1.2에 기정정. 제안서 §1 본문 구표현(4억·83%·관광교통 탄소) 잔존 0건 확인. | 재감사 M-5 + `_workspace/refix_docs_harness_summary.md` 보류 목록(M-5·신규 관찰) 해소 |

---

## 부록 G — 다음 단계 권고

1. **✅ Evidence Ledger 종결 (v1.2 2026-05-18):** 잔여 [unverified] 0건. E1·E2 옵션 A 채택, E7 「제4차 관광개발기본계획」 정식 채택, E3 [Verified] High 격상. `greentrip_proposal.md` v1.1 본문 5개 위치 정정 적용 완료. **사용자 후속 의사결정 1건**: 공모전 사무국에 v1.1 제안서 수정안 제출 가능 여부 문의. 불가 시 PT·`/about/sustainability`·STRATEGY에 v1.1 표현 사용 (PT 발표자 v1.1 의무).
2. **🔴 위치기반 사업자 등록 즉시 신청 (v1.3 신규 P0):** 2026 기준 강화로 GPS 좌표를 서버에 전송하는 GreenTrip은 등록 필수. 등록 수 주 ~ 1-2개월 소요. Phase 3 W15 운영 계정 신청 시점에 등록증 없으면 반려 가능. 진행 추적: `_workspace/legal/lbs_registration_tracker.md`.
3. **🔴 강원관광재단 협업 — P0 격상 (v1.5):** ① 발전성 점수 + ② **강원 RTO 특별상 자체 심사 직접 영향**(OT p14, 본상과 독립 수상 트랙) + ③ 두루누비 강원 코스 큐레이션 자문의 3중 효과. Phase 1(6월)부터 접촉 시작 → Phase 3 종료(9월) 전 협업 의향서 1건 확보. 채널: 강원관광재단 공식 + 운영사무국(gongmo@stunning.kr) RTO 연결. 7~8월 공모전 컨설팅에서 RTO 연계 분야 신청.
4. **Start-up NEST 등록 검토 (Phase 1):** 가점 +2 확보 가능성 점검. 미등록 시 등록 절차 검토.
5. **`/about/sustainability` 페이지 콘텐츠 작성 (Phase 3 W14):** 콘텐츠 초안 작성 완료 (`_workspace/content/about_sustainability.md`, 8개 섹션). 탄소 계수 출처 + TourAPI 활용 + WCAG 검증 + Evidence Ledger v1.3 일부 공개. 심사 데이터 활용·발전성 직접 어필.
6. **PT 슬라이드 사전 작성 (Phase 3 W16~17):** 본 STRATEGY §7 PT 구성을 슬라이드 10장으로. 데모 비디오 백업 준비. 2026-10-28 오프라인 발표 심사 대비.
7. **✅ TourAPI 키 활성화 확인 (v1.6 완료, 2026-06-05):** 사용자 활용신청서 + 15개 endpoint(KorService2) HTTP 200 실측 검증 완료. 키 활성화 이슈 해소.
8. **TourAPI KorService2 마이그레이션 (v1.6 신규):** 사용자 활용신청서 1차 출처 기반 KorService1 → KorService2 일괄 마이그레이션 완료. 활용 종수 11종 → **14종 (KorService2 활성 13종 + 두루누비)** = 19종 중 약 74%. 신규 endpoint 5종(searchStay2·detailInfo2·ldongCode2·lclsSystmCode2 + 두루누비) 통합. 미사용 2종(areaCode2·categoryCode2)은 정식 대체(ldongCode2·lclsSystmCode2)로 사전 마이그레이션. 어필 표현 = "19종 중 14종 활용(74%) — KorService2 신규 endpoint 5종 + 두루누비 통합, 미사용 2종 정식 대체로 폐기 영향 0".
9. **두루누비(코리아둘레길) API 도입 (v1.5 신규):** 강원 자전거길(동해안 242km)·둘레길·DMZ 평화의 길의 GPX 트랙을 자전거/도보 코스(C안) + 강원 ThemeCourse에 직접 연동. **강원 RTO 특별상 어필 + 데이터 활용 다양성 + 발전성** 3중 효과. P0-7(시드 데이터 소스) + P1-11(본격 통합). ⚠ 사용자 활용신청서 미포함 → 별도 신청 필요.

---

**End of GreenTrip Strategy v1.7 (2026-06-11)**
