---
name: product-strategy
description: GreenTrip 제품 전략 도출 스킬. 경쟁/IA/디자인 분석 결과를 종합하여 포지셔닝, SWOT, 차별화 시그니처, MVP+ 우선순위, 로드맵 v2, KPI, 공모전 심사 기준 매핑을 도출. STRATEGY.md를 프로젝트 루트에 산출. product-strategist 에이전트가 사용.
---

# Product Strategy — 제품 전략 도출

## 언제 사용하는가

- 벤치마크 분석(01/02/03) 완료 후 전략 합성
- 새 분석 입력 추가 시 영향받는 섹션만 갱신
- 공모전 심사 대비 강조 포인트 재정렬

## 분석 도구 5종

### 1) JTBD (Job-To-Be-Done)
"사용자가 GreenTrip을 고용하는 이유" 3개 명시:
```
- When [상황]
- I want to [Job]
- So I can [Outcome]
```
예: When 강원도 여행을 계획할 때 / I want to 환경에 미치는 영향을 알고 줄이고 싶다 / So I can 죄책감 없이 즐기고 자랑할 수 있다

### 2) Value Proposition Canvas
| Customer Profile | Value Map |
|-----------------|-----------|
| Jobs (해야 할 일) | Products & Services |
| Pains (불편) | Pain Relievers |
| Gains (얻고 싶은 것) | Gain Creators |

### 3) 포지셔닝 매트릭스
경쟁사를 2축(예: 친환경 강도 × 코스 추천 깊이)에 배치하고 GreenTrip의 빈 영역(white space) 식별.

### 4) RICE 스코어링
| 기능 후보 | Reach | Impact (0.25/0.5/1/2/3) | Confidence (50/80/100%) | Effort (man-week) | Score |
|----------|-------|------------------------|------------------------|------------------|-------|
| 누적 절감 리더보드 | 80% MAU | 2 | 80% | 3 | (0.8 × 2 × 0.8) / 3 = 0.43 |

### 5) Kano 모델
- 기본 품질 (없으면 불만): 코스 생성, 탄소 계산, 지도
- 성능 품질 (많을수록 만족): 코스 다양성, 정확도, 빠른 응답
- 매력 품질 (있으면 감동): 인증서 이미지, 리더보드, 챌린지

## 분석 입력 (필수 Read 대상)

`STRATEGY.md` 작성 전에 다음을 모두 Read하라:

1. `_workspace/benchmark/01_*` (경쟁), `02_*` (IA), `03_*` (디자인)
2. `DEVELOPMENT_PLAN.md` — 특히 1·4·6·8·11장
3. **`greentrip_proposal.md`** (프로젝트 루트) — 공모전 1차 심사 제출 제안서. **STRATEGY는 이 제안서와 반드시 정합**되어야 한다:
   - 제안서 1장(기획배경): 75% 관광교통 탄소, 83% 지속가능 의향, 4억 회 등 정량 주장 — Evidence Ledger로 검증
   - 제안서 2-4장(차별성·강원도 특화·기대효과): 시그니처 후보 검증 기준
   - 제안서 3장(데이터 활용): 제안서 10종 TourAPI 명세(불변) ↔ DEVELOPMENT_PLAN.md v1.6 갱신 14종(KorService2 13종 + 두루누비) 교차 비교
   - 제안서 4장(발전 방향): 로드맵 v2의 1·2·3단계 정합 의무

세 문서가 어긋나면 product-strategist가 STRATEGY.md 부록에 차이를 명시하고 사용자에게 보고.

## 출력 산출물 10종

### 1) Positioning (`04_positioning.md`)
```
**For** {타깃}
**Who** {핵심 페인}
**GreenTrip is** {카테고리}
**That** {핵심 가치}
**Unlike** {대표 경쟁사}
**Our product** {차별점}
```

### 2) SWOT (`04_swot.md`)
2×2 매트릭스 + 각 셀 3~5개 항목 + 출처

### 3) Signatures (`04_signatures.md`)
차별화 시그니처 3개 (5초 인지 가능)
- 시그니처 명
- 어떻게 인지되나
- 왜 모방 어려운가
- 어디서 발현되나(페이지·컴포넌트)

### 4) MVP+ Priority (`04_mvp_plus_priority.md`)
RICE 점수 + Kano 분류 + P0/P1/P2 결정

### 5) Roadmap v2 (`04_roadmap_v2.md`)
- Phase 3 (런칭) — DEVELOPMENT_PLAN.md 기존 계획
- Phase 4 (확장, 2026.11~2027.01)
- Phase 5 (사업화, 2027.02~04)
- Phase 6 (지속, 2027.05+)
각 Phase에 목표·기능·KPI·필요 리소스

### 6) KPI (`04_kpi.md`)
- North Star (절감된 누적 CO₂)
- Counter Metric (실제 사용률 — 자전거 코스가 PR용으로만 만들어지지 않게)
- Phase별 OKR
- 측정 방법

### 7) 공모전 심사 매핑 (`04_judge_mapping.md`)
DEVELOPMENT_PLAN.md 11장의 4개 평가 영역(기획력·완성도·데이터 활용·발전성) 각각에 대해:
- 현재 GreenTrip 강조 포인트
- 보강 필요 항목
- 발표/시연 시나리오

### 8) 정책 부합성 매트릭스 (`04_policy_alignment.md`) — 신규
2050 탄소중립 국가전략, 탄소중립 기본법, 문체부 「지속가능 관광 활성화 계획」, 지역화폐 제도 등과 GreenTrip 기능을 1:1 매핑:
| 정책 | 부합 기능 | 측정 지표 | 출처 |
|------|---------|---------|------|
| ... | ... | ... | ... |
→ 공모전 발전성(20점) 영역에서 직접적인 가점 근거가 된다.

### 9) 기대효과 ↔ KPI 매핑 (`04_impact_to_kpi.md`) — 신규
제안서 4장의 기대효과 4개 항목을 측정 가능한 KPI로 환원:
- 관광 탄소 감축 실천 도구 → 월간 누적 절감 CO₂(kg), 1인당 코스 사용률
- 지역 관광 활성화 → 강원도 시군구별 코스 생성 수, 비강원 사용자 비율
- 데이터 생태계 확장 → TourAPI 14종 호출량(KorService2 13종 + 두루누비), 호출 통계 대시보드 노출
- 정책 연계 확장성 → B2G 파트너 수, 지역화폐 PoC, ESG 리포트 발급 수

### 10) Evidence Ledger (`04_evidence_ledger.md`) — 신규
STRATEGY.md 부록. 모든 정량 주장의 출처 추적표:
| 주장 | 출처 URL | 수집일 | 신뢰도 | 사용 위치 |
|------|---------|-------|-------|---------|
| ... | ... | ... | ... | ... |
- 미검증 주장은 `[unverified]` + STRATEGY.md에 신뢰도 명시
- 제안서 1장의 75%·83%·4억 회 등 핵심 주장 우선 검증

### 최종 통합 (`STRATEGY.md` — 프로젝트 루트)
위 10개를 압축 합본. 1페이지 요약(Executive Summary)으로 시작. 부록에 정책 매핑·KPI 매핑·Evidence Ledger 포함.

## 분석 입력 의존성

`_workspace/benchmark/01_*` (경쟁), `02_*` (IA), `03_*` (디자인)이 모두 존재해야 정합성 있는 전략이 도출된다. 누락 시:
- 부분 분석으로 진행 + 가정 명시
- 분석 재실행 무한 대기 금지

## 작업 원칙

1. **선택은 trade-off** — 안 할 것을 명시
2. **숫자로 말한다** — RICE, 대비율, 사용자 수
3. **공모전 + 사업화 동시 충족** — 둘 다 만족하지 않으면 다시
4. **시그니처 ≤ 3개** — 많으면 흐릿
5. **가정은 별도 섹션** — 입력의 약점을 숨기지 않는다

## 출력 경로

- `_workspace/benchmark/04_*.md` (7개 세부 산출물)
- `STRATEGY.md` (프로젝트 루트 — 사용자 공유용)

## 후속 진화

전략은 한 번 만들고 끝나지 않는다:
- 실제 사용자 데이터 수집 후 KPI 갱신
- 신규 경쟁자 등장 → 포지셔닝 매트릭스 재배치
- 공모전 1차 심사 결과 → judge_mapping 보강

## 참고 자료

- DEVELOPMENT_PLAN.md 1장 (개요), 8장 (Phase 순서), 11장 (심사 기준)
- competitor-research, ia-analysis, design-pattern-analysis 산출물
