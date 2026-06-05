---
name: greentrip-benchmark
description: GreenTrip 벤치마크·전략 오케스트레이터. 유사 서비스 리서치(국내외 저탄소 여행·코스 추천·탄소 가시화·TourAPI 활용), 사이트 구성·하이라키·IA 분석, 디자인 패턴 분석, 제품 방향성·로드맵·KPI·심사 매핑을 4명 에이전트로 조율. 트리거 — "유사 서비스", "벤치마크", "벤치마킹", "경쟁 분석", "사이트 분석", "IA 분석", "디자인 분석", "방향성", "전략", "로드맵", "포지셔닝", "STRATEGY.md". 후속 — "재실행", "수정", "보완", "특정 영역만 다시"도 반드시 이 스킬을 사용. 개발 작업(Phase/Week 구현)은 greentrip-dev 스킬을 사용.
---

# GreenTrip Benchmark & Strategy Orchestrator

GreenTrip의 시장 지형을 파악하고 제품이 나아갈 방향을 도출하는 통합 스킬. 4명 분석가 에이전트를 조율하여 경쟁·IA·디자인 분석 → 전략 합성까지 수행한다.

## 실행 모드: 하이브리드

| Phase | 모드 | 이유 |
|-------|------|------|
| Phase A (병렬 리서치) | 서브 에이전트 | competitor / ia / design 3명이 독립 영역 동시 수집 |
| Phase B (전략 합성) | 에이전트 팀 | 발견 토론·합의 후 product-strategist가 종합 |

## 에이전트 구성

| 팀원 | 에이전트 타입 | 역할 | 스킬 | 출력 |
|------|-------------|------|------|------|
| competitor-researcher | general-purpose | 유사 서비스 매핑 | competitor-research | `_workspace/benchmark/01_*.md` |
| ia-analyst | general-purpose | IA·플로우 해부 | ia-analysis | `_workspace/benchmark/02_*.md` |
| design-pattern-analyst | general-purpose | 디자인 패턴 분석 | design-pattern-analysis | `_workspace/benchmark/03_*.md` |
| product-strategist | general-purpose | 전략·로드맵 | product-strategy | `_workspace/benchmark/04_*.md`, `STRATEGY.md` |

## 워크플로우

### Phase 0: 컨텍스트 확인

1. `_workspace/benchmark/` 존재 여부 확인
2. 실행 모드 결정:
   - **미존재** → 초기 실행. Phase 1로
   - **존재 + 사용자가 부분 수정 요청** → 부분 재실행. 해당 에이전트만 호출 (예: "디자인만 다시" → design-pattern-analyst만 재실행 → product-strategist가 영향 섹션 갱신)
   - **존재 + 새 입력(사용자가 새 경쟁자/스크린샷 제공)** → 증분 실행. 이전 산출물 + 새 입력을 함께 입력으로
   - **"처음부터 다시"** → `_workspace/benchmark/`를 `_workspace_benchmark_{YYYYMMDD_HHMMSS}/`로 이동 후 새 실행

### Phase 1: 준비

1. 사용자 입력 분석 — 분석 범위(국내/국외/특정 카테고리), 강조 축, 기간
2. `_workspace/benchmark/00_input/request.md`에 입력 요약 저장
3. 다음 3개 문서를 모두 Read하여 컨텍스트 확보:
   - `DEVELOPMENT_PLAN.md` 1장(개요), 4장(알고리즘), 7장(페이지 명세), 11장(심사 기준)
   - **`greentrip_proposal.md`** (프로젝트 루트) — 공모전 1차 심사 제출 제안서. 정량 주장·정책 인용·기대효과 4개 항목·발전 로드맵 3단계를 Phase A/B에서 검증·정합 대상으로 사용
   - `CLAUDE.md` — 현재 하네스 변경 이력
4. 세 문서가 어긋나는 항목(예: 제안서의 "Python 백엔드" vs DEVELOPMENT_PLAN의 "TS 단일 스택", 또는 제안서 10종 OpenAPI ↔ v1.6 후 14종 차이)을 미리 식별하여 Phase B의 product-strategist에게 입력으로 전달

### Phase A: 병렬 리서치 (서브 에이전트 모드)

**실행 모드:** 서브 에이전트

단일 메시지에서 3개 Agent 도구 동시 호출 (`run_in_background: true`):

| 에이전트 | subagent_type | 입력 | 출력 | model | run_in_background |
|---------|--------------|------|------|-------|-------------------|
| competitor-researcher | general-purpose | 분석 범위 + DEVELOPMENT_PLAN.md 1장 | `_workspace/benchmark/01_*.md` | opus | true |
| ia-analyst | general-purpose | DEVELOPMENT_PLAN.md 7장 (자체 IA 점검 기준) | `_workspace/benchmark/02_*.md` | opus | true |
| design-pattern-analyst | general-purpose | (선택) 사용자 제공 스크린샷 + 카테고리 컨벤션 | `_workspace/benchmark/03_*.md` | opus | true |

> 세 에이전트는 처음에는 독립 실행 (각각 자기 영역 정리). 1차 결과 도출 후 Phase B에서 통합.

**병렬 실행의 한계:**
- ia-analyst와 design-pattern-analyst는 competitor-researcher의 우선순위 목록이 있으면 더 좋은 결과를 낸다.
- 따라서 권장: competitor-researcher를 먼저 실행하여 시드 매트릭스 생성 → 이후 ia/design 병렬.
- 사용자가 시간 제약 명시 시 3개 완전 병렬도 허용.

**산출물 검증:**
- 각 에이전트가 자신의 출력 파일 5개 이내로 정리했는지 확인
- 출처 URL이 모든 주장에 동반되는지 sampling

### Phase B: 전략 합성 (에이전트 팀 모드)

**실행 모드:** 에이전트 팀

Phase A의 서브 에이전트 결과를 기반으로 팀을 구성:

```
TeamCreate(
  team_name: "greentrip-strategy-team",
  members: [
    { name: "competitor-researcher", agent_type: "general-purpose", model: "opus",
      prompt: ".claude/agents/competitor-researcher.md 참조. _workspace/benchmark/01_* 산출물 책임자로 Q&A 응답 + 가설 검증." },
    { name: "ia-analyst", agent_type: "general-purpose", model: "opus",
      prompt: ".claude/agents/ia-analyst.md 참조. _workspace/benchmark/02_* 산출물 책임자로 Q&A 응답 + 가설 검증." },
    { name: "design-pattern-analyst", agent_type: "general-purpose", model: "opus",
      prompt: ".claude/agents/design-pattern-analyst.md 참조. _workspace/benchmark/03_* 산출물 책임자로 Q&A 응답 + 가설 검증." },
    { name: "product-strategist", agent_type: "general-purpose", model: "opus",
      prompt: ".claude/agents/product-strategist.md 참조. Phase A 결과를 종합하여 04_* 및 STRATEGY.md를 작성. 검증이 필요한 가설은 SendMessage로 해당 분석가에게 질문." }
  ]
)
```

**작업 분배:**
```
TaskCreate(tasks: [
  { title: "포지셔닝 도출", assignee: "product-strategist" },
  { title: "SWOT 작성", assignee: "product-strategist" },
  { title: "시그니처 3개 후보 제시", assignee: "product-strategist", depends_on: ["포지셔닝 도출"] },
  { title: "MVP+ 우선순위 RICE 점수화", assignee: "product-strategist" },
  { title: "로드맵 v2 작성", assignee: "product-strategist", depends_on: ["MVP+ 우선순위"] },
  { title: "KPI 설계", assignee: "product-strategist" },
  { title: "공모전 심사 매핑", assignee: "product-strategist" },
  { title: "STRATEGY.md 통합", assignee: "product-strategist", depends_on: ["로드맵 v2", "KPI 설계", "공모전 심사 매핑"] },
  { title: "경쟁 가설 검증 응답", assignee: "competitor-researcher" },
  { title: "IA 가설 검증 응답", assignee: "ia-analyst" },
  { title: "디자인 시그니처 검증 응답", assignee: "design-pattern-analyst" },
])
```

**통신 규칙:**
- product-strategist는 시그니처/포지셔닝 가설을 SendMessage로 분석가에게 질문 (예: "BookDifferent의 손그림 톤이 카테고리 컨벤션이라고 했는데 모방 가능한가?")
- 분석가는 자기 산출물에 대한 Q&A에만 응답 (새 조사 금지)
- 충돌하는 데이터는 양쪽 출처 병기 (product-strategist가 04_swot/positioning에서 명시)

### Phase 4: 최종 산출물 검증

1. 모든 task 완료 대기 (TaskGet)
2. `STRATEGY.md` Read하여 다음 검증:
   - 7개 섹션(positioning/swot/signatures/mvp+/roadmap/kpi/judge_mapping) 모두 포함
   - Executive Summary 1페이지 이내
   - 각 주장에 출처 또는 분석 근거 매핑
   - "안 할 것" 명시 (trade-off 명확)
   - 공모전 심사 매핑이 11장 4개 영역 모두 커버
3. 누락·약점 발견 시 product-strategist에게 SendMessage로 보강 요청

### Phase 5: 정리

1. TeamDelete
2. `_workspace/benchmark/` 보존
3. 사용자에게 `STRATEGY.md` 요약 보고:
   - 핵심 포지셔닝 1문장
   - 시그니처 3개
   - P0 기능 3개
   - 다음 단계 제안 (예: "Phase 4 기능 중 리더보드부터 시작하시려면 `greentrip-dev` 스킬로 진입하세요")
4. **피드백 요청**: "전략 방향에서 수정하거나 깊이 들어갈 영역이 있나요?"

## 데이터 흐름

```
[리더] 
  ↓ Phase A: 서브 에이전트 3명 병렬
  ├── competitor-researcher → _workspace/benchmark/01_*.md
  ├── ia-analyst            → _workspace/benchmark/02_*.md
  └── design-pattern-analyst→ _workspace/benchmark/03_*.md
  ↓
  Phase B: TeamCreate (4명 팀)
  ├── product-strategist가 01/02/03 Read + 가설 SendMessage
  ├── 3명 분석가가 자기 영역 가설 검증 응답
  └── product-strategist → _workspace/benchmark/04_*.md → STRATEGY.md
  ↓
  TeamDelete
  ↓
  [리더: STRATEGY.md 검증 + 사용자 보고]
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| WebSearch/WebFetch 실패 | 다른 검색어로 1회 재시도, 실패 시 가용 정보 한도로 진행 + 한계 명시 |
| 분석가 1명 산출물 부실 | product-strategist가 가정 명시하고 진행 (무한 대기 금지) |
| 출처 검증 실패 | 해당 주장에 [unverified] 태그 + STRATEGY.md에 신뢰도 표기 |
| 분석가 간 데이터 충돌 (예: 같은 서비스에 대해 IA와 디자인 평가 상충) | product-strategist가 양쪽 병기 후 가설 형태로 SWAT에 반영 |
| 사용자가 새 경쟁사 추가 요청 (실행 중) | 현재 흐름 완료 후 증분 실행으로 처리 |

## 테스트 시나리오

### 정상 흐름

1. 사용자: "유사 서비스 분석하고 GreenTrip의 방향성 도출해줘"
2. Phase 0: `_workspace/benchmark/` 미존재 → 초기 실행
3. Phase 1: DEVELOPMENT_PLAN.md 1·7·11장 Read
4. Phase A:
   - competitor-researcher 우선 실행 → 01_competitor_landscape.md (20개 서비스 매트릭스)
   - ia-analyst + design-pattern-analyst 병렬 실행 → 02_*, 03_*
5. Phase B: 팀 구성, product-strategist가 통합 → STRATEGY.md
6. Phase 4: STRATEGY.md 검증, 누락된 KPI 섹션 보강 요청 → 추가 완료
7. Phase 5: 팀 해제, 요약 보고
8. 결과: `_workspace/benchmark/01~04_*.md` + `STRATEGY.md` 생성

### 부분 재실행 흐름

1. 사용자: "디자인 부분만 다시 분석해줘. 친환경 브랜드 톤이 약한 것 같아"
2. Phase 0: `_workspace/benchmark/` 존재 → 부분 재실행
3. design-pattern-analyst만 서브 에이전트로 호출, 입력에 "친환경 톤 강조" 명시
4. 03_*.md 갱신
5. product-strategist를 단독 호출하여 04_signatures.md, STRATEGY.md의 영향 섹션 갱신
6. 사용자에게 변경 요약 보고

### 에러 흐름

1. competitor-researcher가 국외 사례 5개 중 3개의 출처를 못 찾음
2. 해당 카드에 [unverified] 태그
3. product-strategist가 SWAT의 "위협(국외 빅테크 진입)" 항목에서 [unverified] 비중 명시
4. STRATEGY.md에 "신뢰도: 국외 경쟁 70% / 국내 95%" 표기

## 후속 작업 키워드 (재트리거 보장)

다음 요청에서 이 스킬이 재트리거되어야 한다:
- "전략 다시" / "STRATEGY 업데이트" / "로드맵 보완"
- "리더보드 RICE 점수 재계산"
- "공모전 심사 매핑 강화"
- "디자인 시그니처 변경"
- "특정 경쟁사만 더 깊이"
- 새 입력(스크린샷·기사) 첨부 시
