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
