---
name: greentrip-dev
description: GreenTrip(저탄소 여행 플래너) 개발 오케스트레이터. DEVELOPMENT_PLAN.md 기반의 Phase/Week별 기능 구현, TourAPI 연동, 탄소 계산, 코스 생성, UI 구축, 지도 통합, QA를 에이전트 팀으로 조율. 트리거 — "Phase N Week M 구현", "TourAPI 연동", "탄소 계산", "코스 생성", "그린트립/GreenTrip 개발". 후속 — "재실행", "업데이트", "수정", "보완", "이전 결과 개선", "특정 Week만 다시", "Phase 2 시작" 등 이어지는 작업도 반드시 이 스킬을 사용.
---

# GreenTrip Development Orchestrator

GreenTrip(저탄소 여행 플래너) 에이전트 팀을 조율하여 DEVELOPMENT_PLAN.md에 명시된 Phase/Week별 기능을 구현하는 통합 스킬.

## 실행 모드: 에이전트 팀

감독자 + 전문가 풀 패턴. 리더(오케스트레이터)가 주차 요청을 분석하여 적합한 전문가에게 작업을 배분하고, 팀원들은 SendMessage로 조율하며 자체 진행한다.

## 에이전트 구성

| 팀원 | 에이전트 타입 | 역할 | 스킬 | 출력 위치 |
|------|-------------|------|------|----------|
| architect | general-purpose | 구조·Prisma·타입·환경 | nextjs-architect | src/types/, prisma/, next.config 등 |
| tourapi-integrator | general-purpose | TourAPI 10종·캐싱·Routes | tourapi-integration | src/lib/tourapi/, src/app/api/tour/ |
| domain-logic | general-purpose | 탄소·거리·코스 최적화 | carbon-course-engine | src/lib/carbon/, src/lib/course/, src/lib/map/distance.ts |
| ui-builder | general-purpose | 페이지·컴포넌트·훅 | nextjs-ui-builder | src/app/, src/components/, src/hooks/ |
| map-integrator | general-purpose | Kakao Maps SDK | kakao-maps-integration | src/lib/map/kakao.ts, src/components/map/ |
| qa-reviewer | general-purpose | 통합 정합성 검증 | greentrip-qa | `_workspace/{week}_qa_report.md` |

## 워크플로우

### Phase 0: 컨텍스트 확인

기존 산출물 존재 여부를 확인하여 실행 모드를 결정한다:

1. `_workspace/` 디렉토리 존재 여부 확인
2. 프로젝트 소스 상태 확인 (Glob `src/**/*`)
3. 실행 모드 결정:
   - **`_workspace/` 미존재 + 소스 없음** → 초기 실행 (예: Week 1부터 시작). Phase 1로 진행
   - **소스 존재 + 사용자가 "Week N 구현" 새 요청** → 증분 실행. 이전 Week 산출물을 Read로 파악 후 Phase 2
   - **소스 존재 + 사용자가 "수정/보완"** → 부분 재실행. 해당 영역 담당 에이전트만 호출
   - **"처음부터 다시"** → 기존 `_workspace/`를 `_workspace_{YYYYMMDD_HHMMSS}/`로 이동 후 새 실행

### Phase 1: 준비

1. 사용자 요청 분석 — 어떤 Phase/Week/기능을 다루는지
2. DEVELOPMENT_PLAN.md의 해당 섹션을 Read (예: Week 3 요청 → 4.1 탄소 계산, 4.2 코스 생성, 7.3 결과 페이지 섹션)
3. 작업 디렉토리에 `_workspace/` 생성 (없으면)
4. 입력 요약을 `_workspace/00_input/{week}_request.md`에 저장

### Phase 2: 팀 구성

1. 팀 생성 (세션당 1팀):
   ```
   TeamCreate(
     team_name: "greentrip-team",
     members: [
       { name: "architect", agent_type: "general-purpose", model: "opus",
         prompt: ".claude/agents/architect.md를 읽고 해당 역할을 수행. 현재 작업: {주차 요청}" },
       { name: "tourapi-integrator", agent_type: "general-purpose", model: "opus",
         prompt: ".claude/agents/tourapi-integrator.md를 읽고 해당 역할을 수행. 현재 작업: {주차 요청}" },
       { name: "domain-logic", agent_type: "general-purpose", model: "opus",
         prompt: ".claude/agents/domain-logic.md를 읽고 해당 역할을 수행. 현재 작업: {주차 요청}" },
       { name: "ui-builder", agent_type: "general-purpose", model: "opus",
         prompt: ".claude/agents/ui-builder.md를 읽고 해당 역할을 수행. 현재 작업: {주차 요청}" },
       { name: "map-integrator", agent_type: "general-purpose", model: "opus",
         prompt: ".claude/agents/map-integrator.md를 읽고 해당 역할을 수행. 현재 작업: {주차 요청}" },
       { name: "qa-reviewer", agent_type: "general-purpose", model: "opus",
         prompt: ".claude/agents/qa-reviewer.md를 읽고 해당 역할을 수행. 각 모듈 완성 직후 incremental QA 수행." }
     ]
   )
   ```
   > 주차 요청에 해당하지 않는 에이전트는 팀에서 제외 가능 (예: Week 1은 architect 단독으로 충분할 수 있음). **단, qa-reviewer는 항상 포함.**

2. 작업 분배 (`TaskCreate`) — 주차별 매트릭스는 아래 참조

### Phase 3: 구현

**실행 방식:** 팀원들이 자체 조율

- 팀원들은 `TaskCreate`로 할당된 작업을 claim하여 순차/병렬 실행
- 파일 경로·타입 공유는 SendMessage (예: architect가 `src/types/tour.ts` 만든 후 tourapi-integrator에게 알림)
- 의존성이 있는 작업은 `depends_on`으로 차단 (타입 정의 → API → UI 순)
- 리더는 유휴 알림을 모니터링, 막힌 팀원에게 개입

**Incremental QA 트리거:**
- tourapi-integrator가 Route 완성 → qa-reviewer에게 해당 API↔훅 교차 검증 요청
- ui-builder가 페이지 완성 → qa-reviewer에게 라우팅/타입 정합성 검증 요청
- Week 완료 전 QA 블로커가 해결되어야 다음 Week 진입

**산출물 저장:**

| 팀원 | 출력 경로 |
|------|----------|
| architect | 실제 파일 + `_workspace/{week}_architect_summary.md` |
| tourapi-integrator | 실제 파일 + `_workspace/{week}_tourapi_summary.md` |
| domain-logic | 실제 파일 + `_workspace/{week}_domain_summary.md` |
| ui-builder | 실제 파일 + `_workspace/{week}_ui_summary.md` |
| map-integrator | 실제 파일 + `_workspace/{week}_map_summary.md` |
| qa-reviewer | `_workspace/{week}_qa_report.md` |

### Phase 4: 통합 및 보고

1. 모든 팀원의 작업 완료 대기 (TaskGet)
2. 각 summary 파일 Read로 수집
3. qa-reviewer 리포트에 Blocker/High 잔존 시 해당 에이전트 재호출
4. 주차 완료 보고서 `_workspace/{week}_weekly_report.md` 작성 — 완성된 기능, 파일 목록, 다음 주차 선행 조건

### Phase 5: 정리

1. TeamDelete로 팀 해제
2. `_workspace/` 보존
3. 사용자에게 결과 요약 (완성된 페이지/API 목록, 남은 이슈, 다음 단계 제안)
4. **피드백 요청**: "이 주차 산출물에서 개선할 부분이 있나요?"

## 주차별 작업 매트릭스

### Phase 1 (Week 1~5)

| Week | 주요 작업 | 주 담당 | 협업 |
|------|----------|--------|------|
| 1 | Next.js 초기화, Prisma, 타입, 환경변수 | architect | - |
| 2 | TourAPI 클라이언트 7개 Route, 캐싱, 상세 페이지 | tourapi-integrator, ui-builder | architect(타입), qa |
| 3 | 탄소 계산, 거리, 코스 생성, 2-opt, /api/course/generate | domain-logic | architect(타입), qa |
| 4 | 랜딩, /plan, /plan/result, CourseCompareCard, CarbonGauge | ui-builder | domain-logic(shape), qa |
| 5 | Kakao Maps, RouteOverlay, /course/[id], TimelineView, DB 저장 | map-integrator, ui-builder | qa (E2E) |

### Phase 2 (Week 6~13)

| Week | 주요 작업 | 주 담당 |
|------|----------|--------|
| 6~7 | 축제 API + 필터 + UI 토글 | tourapi-integrator, domain-logic, ui-builder |
| 8~9 | 반려동물 API + 필터 + UI | tourapi-integrator, domain-logic, ui-builder |
| 10~11 | CarbonReport DB, 인증서 이미지(og), Recharts, 공유 | ui-builder, domain-logic |
| 12~13 | NextAuth, 마이페이지, ThemeCourse 시드, /explore, 접근성, **숙박 필터링(`/api/tour/lodging`)** | architect, tourapi-integrator, ui-builder, qa |

### Phase 3 (Week 14~17)

| Week | 주요 작업 | 주 담당 |
|------|----------|--------|
| 14 | next-pwa, manifest, 이미지 최적화, Lighthouse 90+, **TourAPI 동기화 cron(`/api/tour/sync`)** | architect, tourapi-integrator, ui-builder, qa |
| 15 | Vercel 배포, Sentry, Analytics, Rate Limit, **TourAPI 호출 통계 대시보드(심사 대응)** | architect, qa |
| 16~17 | QA 전수 검증, 버그 수정, 콘텐츠 보강, 데모 준비, **3대 문서 정합성 검증** | qa-reviewer 주도 |

### Phase 4+ 확장 (제안서 4장 단계별 로드맵 정합)

`STRATEGY.md`의 로드맵 v2와 정합. 본격 실행 전 product-strategist의 우선순위 표(`_workspace/benchmark/04_mvp_plus_priority.md`) 재확인.

| Phase | 주요 작업 | 주 담당 |
|-------|---------|--------|
| Phase 4 (2026.11~2027.01) — 게이미피케이션·커뮤니티 | 누적 절감 리더보드(`/leaderboard`), 챌린지(`/challenge`), 커뮤니티 후기(`/community`), 탄소 절감 포인트 적립 시스템 | architect(스키마), domain-logic(포인트 산정), ui-builder, qa |
| Phase 4 (병행) — 전국 확장 | 강원도 외 1개 지역(제주 또는 경상) 추가, ThemeCourse 콘텐츠 확장 | tourapi-integrator(지역코드), ui-builder |
| Phase 5 (2027.02~04) — B2G·B2B | 지자체 대시보드(ESG 리포트), 탄소 포인트 ↔ 지역화폐 교환 PoC, 친환경 숙소 제휴 5개 | architect, domain-logic, qa |
| Phase 6 (2027.05+) — 지속 | 전국 17개 시도, 모바일 앱(React Native 또는 Flutter), 관광빅데이터(방문자 수) 연동 분산 관광 | 전체 |

## 제안서 변경 트리거

`greentrip_proposal.md`가 변경되면 (예: 1차 심사 후 수정안 제출) 다음 영역의 영향 분석을 자동으로 수행:
1. 2장 "주요 기능" 변경 → ui-builder + domain-logic 영향
2. 3.1장 OpenAPI 10종 변경 → tourapi-integrator + qa(체크리스트) 영향
3. 4장 발전 로드맵 변경 → STRATEGY.md 로드맵 v2 갱신 트리거 (`greentrip-benchmark` 스킬로 재실행)
4. 4장 기술 스택 변경 → architect 영향. Python 백엔드처럼 전체 아키텍처 영향 시 사용자에게 확인.

오케스트레이터는 사용자가 "제안서가 바뀌었는데 코드에 영향이 있나?" 같은 질문을 하면 위 매트릭스로 응답한다.

## 데이터 흐름

```
[리더] → TeamCreate → 팀원 6명
          ↓
      TaskCreate (주차별 매트릭스)
          ↓
    architect → 타입/스키마 (SendMessage: "src/types/tour.ts 생성")
          ↓
    tourapi-integrator → Route/캐시 ←───→ qa-reviewer (교차 검증)
          ↓
    domain-logic → 탄소/코스 알고리즘 ←───→ qa-reviewer
          ↓
    ui-builder ←→ map-integrator → 페이지/컴포넌트 ←───→ qa-reviewer
          ↓
    _workspace/{week}_*_summary.md
          ↓
    [리더: 통합 + 주차 보고서]
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| 팀원 1명 중지 | 리더가 감지 → SendMessage로 상태 확인 → 1회 재시작 → 실패 시 작업 재할당 또는 누락 명시 |
| QA 블로커 미해결 | 해당 에이전트 재호출, 수정 확인 후 다음 Week 진입 |
| TourAPI 실제 호출 실패 (키 미설정) | 명시 에러 + 사용자에게 환경변수 설정 요청 |
| 타임아웃 | 현재까지 완성된 파일 보존, 미완료 작업은 `_workspace/`에 남겨 다음 재호출에서 이어받음 |
| 팀원 간 타입 충돌 | architect가 중재, 단일 진원지(src/types)에 맞춰 양쪽 수정 |
| DEVELOPMENT_PLAN.md 명세와 실제 코드 불일치 | 리더가 사용자에게 판단 요청 (명세 수정 vs 코드 수정) |

## 테스트 시나리오

### 정상 흐름 — Week 2 구현

1. 사용자: "Phase 1 Week 2를 구현해주세요"
2. Phase 0: `_workspace/` 미존재 + src/는 Week 1 산출물 있음 → 증분 실행
3. Phase 1: DEVELOPMENT_PLAN.md 3장(TourAPI 명세), 7.4장 관광지 상세 Read
4. Phase 2: 팀 구성 (architect, tourapi-integrator, ui-builder, qa-reviewer 활성)
5. Phase 3:
   - architect가 `src/types/tour.ts` 확장
   - tourapi-integrator가 7개 Route + cache.ts 구현, SendMessage로 훅 경로 공유
   - ui-builder가 useTourAPI 훅 + `/spot/[contentId]` 페이지 구현
   - qa-reviewer가 각 Route 완성 직후 대응 훅과 shape 교차 검증
6. Phase 4: qa-reviewer 리포트에 블로커 없음 확인 → weekly_report 작성
7. Phase 5: 팀 해제, 결과 요약, 피드백 요청
8. 결과: 7개 API Route, 캐시 래퍼, 훅, 상세 페이지, QA 통과 리포트

### 에러 흐름 — QA 블로커 발견

1. Week 2 Phase 3 중 qa-reviewer가 `/api/tour/location` 응답 shape과 훅 타입 불일치 발견
2. SendMessage로 tourapi-integrator + ui-builder 양쪽에 파일:라인 + 수정 제안 전달
3. tourapi-integrator가 Route의 unwrap 로직 수정
4. qa-reviewer 재검증 → 통과
5. Phase 4 진입, 블로커 해결 기록을 weekly_report에 명시

## 후속 작업 시나리오

사용자가 다음 요청을 하면 이 스킬이 트리거되어야 한다:
- "Week 3 다시 해줘"
- "탄소 계산 로직만 수정해줘"
- "이전 결과에서 축제 필터 보완"
- "CourseCompareCard 디자인 업데이트"
- "QA 리포트의 블로커 해결"

각 경우 Phase 0에서 기존 산출물을 파악하고, 해당 에이전트만 선택적으로 호출한다.
