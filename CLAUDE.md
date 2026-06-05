# GreenTrip (그린트립)

저탄소 관광 코스 플래너 웹 서비스. 2026 관광데이터 활용 공모전 출품작.

**3대 문서:**
- `DEVELOPMENT_PLAN.md` — 기술 상세 스펙 (디렉토리·DB·API·알고리즘·페이지)
- `greentrip_proposal.md` — 공모전 1차 심사 제출 제안서 (시장·정책·발전 로드맵·기대효과)
- `STRATEGY.md` — 제품 방향성 (벤치마크 결과로 도출, `greentrip-benchmark` 스킬이 생성)

세 문서가 어긋나면 qa-reviewer가 검출하고 사용자에게 보고. 변경 시 다른 두 문서에 미치는 영향을 오케스트레이터가 분석.

## 하네스: GreenTrip Development

**목표:** DEVELOPMENT_PLAN.md 기반의 Phase/Week별 기능을 에이전트 팀으로 구현·검증.

**트리거:** GreenTrip 개발 관련 요청("Phase N Week M 구현", "TourAPI 연동", "탄소 계산", "코스 생성", "지도 통합", "인증서 구현", "QA 검증" 등)과 후속 작업("다시", "수정", "보완", "업데이트") 시 `greentrip-dev` 스킬을 사용하라.

## 하네스: GreenTrip Benchmark & Strategy

**목표:** 유사 서비스(국내외 저탄소 여행·코스 추천·탄소 가시화·TourAPI 활용)의 구성·하이라키·디자인을 분석하여 GreenTrip 제품 방향성·로드맵·KPI를 도출.

**트리거:** "유사 서비스 분석", "벤치마크", "벤치마킹", "경쟁 분석", "사이트 분석", "IA 분석", "디자인 분석", "방향성", "전략", "로드맵", "포지셔닝", "STRATEGY.md" 요청과 후속 작업("재실행", "수정", "보완", "특정 영역만 다시") 시 `greentrip-benchmark` 스킬을 사용하라.

## 트랙 분리 원칙

| 요청 성격 | 사용 스킬 |
|---------|---------|
| 코드 구현·기능 개발·QA | `greentrip-dev` |
| 시장·경쟁·디자인 분석·전략·로드맵 | `greentrip-benchmark` |
| 단순 개념 질문 | 직접 응답 가능 |

두 하네스는 산출물을 공유한다: `greentrip-benchmark`의 `STRATEGY.md` → `greentrip-dev`가 Phase 4+ 구현 시 참조.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-04-23 | 초기 하네스 구성 | agents/(6) + skills/(7) | DEVELOPMENT_PLAN.md 기반 개발 팀 구축 |
| 2026-05-18 | 벤치마크·전략 하네스 추가 | agents/(+4) + skills/(+5) | 유사 서비스 분석 및 제품 방향성 도출 요구 |
| 2026-05-18 | 제안서 정합성 반영 | product-strategist, tourapi-integrator, qa-reviewer, competitor-researcher, greentrip-dev, greentrip-benchmark, product-strategy, tourapi-integration, greentrip-qa, competitor-research | greentrip_proposal.md의 정량 주장(75%·83%·4억회)·정책 매핑·기대효과·10종 OpenAPI(숙박+동기화 포함)·발전 로드맵 3단계를 하네스 책임에 통합. 게이미피케이션·커뮤니티 Phase 4 매트릭스 추가. Evidence Ledger 도입. 3대 문서 정합성 QA 신설. |
| 2026-05-21 | 2026 세미나 분석 반영 | DEVELOPMENT_PLAN(§1.3 일정·§3.2 폐기 API), STRATEGY 부록 D, 04_evidence_ledger v1.3, 04_judge_mapping, greentrip-qa, _workspace/legal | 5/20 운영사무국 온라인 설명회 핵심: ① areaCode1·categoryCode1 2026년 내 폐기 예정 ② 위치기반 사업자 등록 2026년 기준 강화(GreenTrip 등록 필수) ③ 일정 정확화(09-21 마감/10-21 합격/10-28 PT/11-05 시상) ④ 시상금 대상 1,000만원(통합) ⑤ 활용 사례 등록 금년 미시행. 위치기반 등록 추적 파일 신규. |
| 2026-05-28 | PDF 원본 교차검증 | findings §P, 04_evidence_ledger v1.4(E25·E26), STRATEGY 부록 D, 04_judge_mapping(시상 완전판·강원 RTO 특별상), greentrip-qa, lbs_registration_tracker | 설명회 PDF 2종(OpenAPI 45p·OT 23p) 정독 교차검증: ① **E25 중대 정정 791건→791만건**(녹취 1만배 오류) ② **시상 완전판**(장려상 15팀×50만+최우수 300만/우수 100만 확정) ③ **강원 RTO 특별상**(본상+특별상 이중 수상 가능, GreenTrip 직접 타겟) ④ **운영계정 1차 심사 전 신청 필수**(인증키 정보 제출 항목→위치기반 등록 임계경로) ⑤ MobileApp=GreenTrip 승인요건 ⑥ 두루누비정보 추가 활용 후보(강원 자전거길·둘레길). |
| 2026-05-28 | 두루누비 API 도입 + 강원 협업 P0 격상 | DEVELOPMENT_PLAN §3.2(API-11), tourapi-integrator/integration, greentrip-qa, STRATEGY(부록 D·다음단계), 04_mvp_plus_priority(P0-7·P1-11), 04_judge_mapping(데이터 활용 11종·발전성 강원 RTO) | 사용자 결정 반영: ① **두루누비(코리아둘레길) API-11 도입** — 별도 Base URL Durunubi, courseList·routeList. 강원 자전거길 242km·둘레길·DMZ GPX를 자전거/도보 코스+강원 테마에 직접 연동. 활용 10종→11종(19종 중 58%). ② **강원관광재단 협업 P0 격상** — 발전성 어필을 넘어 강원 RTO 특별상 자체 심사 직접 영향(본상과 독립 수상 트랙). Phase 1 접촉 시작→Phase 3 전 의향서 1건. |
| 2026-06-05 | **KorService1 → KorService2 일괄 마이그레이션 (v1.6)** | `src/lib/tourapi/constants.ts`·`src/types/tour.ts`·`.env.example`, DEVELOPMENT_PLAN §1.2·§2.4·§3, tourapi-integrator·integration, greentrip-qa §E, 04_evidence_ledger v1.6(E22·E29), 04_judge_mapping §1.3, STRATEGY 부록 D·F·G, 산출물 `_workspace/tourapi_migration_v1.6.md` | 사용자 활용신청서(2026-06-05) 1차 출처 + 15개 endpoint HTTP 200 실측 확인. ① **Base URL = `KorService2`** 단일 (KorService1 deprecated, 잔존 0건). ② **활용 종수 11종 → 14종** = KorService2 활성 13종 + 두루누비 1종 (19종 중 약 74%). ③ **신규 endpoint 5종** 통합: searchStay2(숙박 전용)·detailInfo2(반복정보)·ldongCode2(법정동, areaCode 정식 대체)·lclsSystmCode2(분류체계, categoryCode 정식 대체) + 두루누비. ④ **미사용 2종** (areaCode2·categoryCode2) "신청 됐으나 호출 0건" 의무 + 정식 대체로 사전 마이그레이션. ⑤ MobileApp=GreenTrip 운영계정 승인요건 유지. |
