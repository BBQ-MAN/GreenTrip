# GreenTrip (그린트립)

저탄소 관광 코스 플래너 웹 서비스. 2026 관광데이터 활용 공모전 출품작.

**3대 문서:**
- `DEVELOPMENT_PLAN.md` — 기술 상세 스펙 (디렉토리·DB·API·알고리즘·페이지)
- `greentrip_proposal.md` — 공모전 1차 심사 제출 제안서 (시장·정책·발전 로드맵·기대효과)
- `STRATEGY.md` — 제품 방향성 (벤치마크 결과로 도출, `greentrip-benchmark` 스킬이 생성)

세 문서가 어긋나면 qa-reviewer가 검출하고 사용자에게 보고. 변경 시 다른 두 문서에 미치는 영향을 오케스트레이터가 분석.

## 하네스: GreenTrip Development

**목표:** DEVELOPMENT_PLAN.md 기반의 Phase/Week별 기능을 에이전트 팀으로 구현·검증.

**트리거:** GreenTrip 개발 관련 요청("Phase N Week M 구현", "TourAPI 연동", "탄소 계산", "코스 생성", "지도 통합", "인증서 구현", "QA 검증" 등)과 공모전 준비 요청("제출 준비", "제출물", "운영계정", "위치기반 등록", "배포 점검", "강원 RTO", "PT 준비", "발표자료", "데모 시연", "리허설"), 후속 작업("다시", "수정", "보완", "업데이트", "제출 상태 업데이트") 시 `greentrip-dev` 스킬을 사용하라.

## 하네스: GreenTrip Benchmark & Strategy

**목표:** 유사 서비스(국내외 저탄소 여행·코스 추천·탄소 가시화·TourAPI 활용)의 구성·하이라키·디자인을 분석하여 GreenTrip 제품 방향성·로드맵·KPI를 도출.

**트리거:** "유사 서비스 분석", "벤치마크", "벤치마킹", "경쟁 분석", "사이트 분석", "IA 분석", "디자인 분석", "방향성", "전략", "로드맵", "포지셔닝", "STRATEGY.md" 요청과 후속 작업("재실행", "수정", "보완", "특정 영역만 다시") 시 `greentrip-benchmark` 스킬을 사용하라.

## 트랙 분리 원칙

| 요청 성격 | 사용 스킬 |
|---------|---------|
| 코드 구현·기능 개발·QA | `greentrip-dev` |
| 공모전 제출물·배포 점검·PT/시연 준비 | `greentrip-dev` (공모전 준비 트랙: submission-manager·pt-director) |
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
| 2026-06-10 | 하네스 전면 재점검 + 드리프트 정정 | carbon-course-engine(§5 후보 풀 v1→v2 endpoint), qa-reviewer.md(§TourAPI 체크리스트 v1 10종→v2 13종+두루누비+미사용 2종 0건), greentrip-qa §E(두루누비 N/A 단서+문서 정합 승격 규칙), 산출물 `_workspace/audit_{harness,implementation,uiux}_20260610.md` | 3축 감사(하네스·구현·UI/UX) 결과 v1.6 마이그레이션 미반영 드리프트 2건(高) 정정. 잔여 이슈: 두루누비 실호출 0건(문서 "14종" 주장과 모순, 신청 상태 확인 필요), cron 인증 fragile, 접근성 AA 대비 위반 3건 — 코드 트랙(greentrip-dev)에서 처리. |
| 2026-06-10 | 감사 후속 코드 수정 9건 완료 | tokens.ts·globals.css·tailwind.config(브랜드 그린 #0B8C5C→#097A50 AA 5.37:1, text-display-sm 정의), TransportBadge·FestivalBadge·SpotMarker·kakao.ts·RouteOverlay·StatsChart·CarbonChart·og/cert(구색·앰버 전경 일괄 보정), ReportCTA·ShareButtons(alert→인라인 role="alert"), manifest+PNG 아이콘 4종, sync/route(ADMIN_TOKEN∨CRON_SECRET), course/generate(duration optional+'당일'), useTourAPI(useLodging 필터·LodgingItem), constants·.env.example(두루누비 API-14) | greentrip-dev 부분 재실행(ui-builder+tourapi-integrator 병렬→qa-reviewer 검증→리더 잔존색 7곳 마감). tsc·build 통과, 구색 라이브 잔존 0건. 미결: ① 두루누비 실호출(신청 상태 의사결정 대기) ② Phase 4+ 하네스 보강(제출물·PT·강원 RTO 전담) ③ P2 UI(버튼 hover·접근성 점수 출력 가시화·터치 타깃·radiogroup 키보드) ④ cron timing-safe 비교(低). |
| 2026-06-10 | 공모전 준비 트랙 하네스 보강 | agents/(+2: submission-manager·pt-director) + skills/(+2: contest-submission·pt-demo-production), greentrip-dev(에이전트 표·공모전 준비 트랙 섹션·트리거), CLAUDE.md(트리거·트랙 분리 표) | 감사에서 식별된 역량 공백 해소: ① 제출물·배포·임계경로(09-21 제출/10-21 합격/10-28 PT/11-05 시상) 전담 — 운영계정·위치기반 등록·강원 RTO 의향서 추적 포함, `_workspace/submission/` 산출 ② PT 발표·데모 시연 제작 전담 — 심사 기준 역설계 스토리라인·클릭 단위 스크립트·리스크 제거·Q&A 은행, `_workspace/pt/` 산출. 실행 모드는 서브 에이전트(결과 전달 중심). |
| 2026-06-10 | P2 잔여 UI 6건 완료 | button.tsx(hover 브랜드화), CourseOptionForm(터치 타깃 44px·radiogroup roving tabindex·이모지 aria-hidden), plan/page(모바일 가이드 disclosure), spot/[contentId]+AccessibilityScoreCard 신규(접근성 점수 4축 출력 가시화 — calculateAccessibility 서버 산출, 새 API 0건) | 2026-06-10 UI/UX 감사 P2 전량 해소. tsc·build 통과. 잔여 미결: ① 두루누비 실호출(의사결정 대기) ② cron timing-safe(低) ③ 접근성 카드의 코스 상세 확장(코스 응답 shape 협의 필요). |
| 2026-06-11 | 개발 언어모델 변경 대응 — 모델 하드코딩 제거 | agents/ 12종(frontmatter `model: opus`→`inherit`), greentrip-dev·greentrip-benchmark(TeamCreate 스니펫 `model: "opus"` 제거 + 모델 정책 명문화) | 개발 모델 교체(→ Fable 5)로 구모델 하드코딩 22곳이 드리프트화. 세션 모델 상속으로 전환해 향후 모델 변경에 무관하게 유지. |
| 2026-06-11 | 신모델 4축 적대적 재감사 (선행 작업 전면 재검토) | 산출물 `_workspace/reaudit_{harness_docs,domain,api_security,uiux}_20260611.md` | 구모델 감사가 놓친 이슈 발견: ① 보안 高 4건(IDOR·admin 토큰 URL 노출·TourAPI 쿼터 소진 DoS·rate limit fail-open) ② 도메인 高 3건(구간합≠총합 반올림 모순·랜딩 67%↔68% 불일치·pickRecommended가 CO₂ 미비교) ③ 문서 高 2건(제안서 "14종" 선언 vs 표 11종 자기모순, "10종 불변" 스테일 3곳) ④ 하네스 中(v1.1 정량 정정·AA 색 보정의 스킬 역전파 누락, 신설 스킬 트리거 충돌). 6/10 수정 9+6건은 회귀 0 확인. 수정은 후속 트랙에서 처리. |
| 2026-06-11 | 재감사 후속 수정 4트랙 완료 | **보안**: course/[id]·report 정찰면 축소+idempotent 발급(IDOR), AdminStatsClient 신규(Bearer 헤더, URL 토큰 제거), tourapi/params.ts(쿼터 클램프), rateLimit 인메모리 폴백+IP 신뢰 체인+matcher 확장, apiError.ts(e.message 비노출). **도메인**: 총합=Σ(반올림 구간) 자기일관, pickRecommended CO₂ 최소(방문지 수 공정성 규칙), 접근성 부정문 제외(테스트 197=174+23). **UI**: 랜딩 68% 통일, 다크 theme-color seam 제거, FormField 전환(aria), progressbar, tier 경계 25/70. **문서/하네스**: 제안서 §3.1 표 14종 완성(v1.2), "10종 불변" 스테일 4곳, v1.1 정량 7곳, 디자인 토큰 정본 동기화 6파일, 신설 스킬 트리거 충돌 해소, judge_mapping 스테일 | 신모델 재감사 발견 高 9건 전량 + 中 다수 해소. refix QA(경계면 8항목) 통과 후 Medium 1건(코스 조회 정책 이원화→공유 표면 공개로 정합)·Low 1건(resultCode 복원) 리더 마감. tsc·build·테스트 전체 그린. **보류(사용자 결정)**: ① 두루누비 실호출 vs 13종 하향 ② 로드맵 충돌(전국 17개 시기)·제안서 본문 v1.1 반영 — 수정안 제출 가능 여부 연동 ③ PT 시간 5분 vs 10분 요강 확인. |
| 2026-06-11 | 제안서 v1.3 + PT 자료 4종 초판 | greentrip_proposal.md(§4.1 단계적 확장 정합: 강원→제주→권역→전국 17개, v1.1 정량 본문 기적용 확인), STRATEGY.md v1.7(§5·부록 C-2/C-3 해소·SWOT 라벨 84%/75%), 04_roadmap_v2 동기화, `_workspace/pt/`(pt_storyline·demo_script·qa_bank·rehearsal_checklist — 5분 기본+10분 확장 슬롯, 한 장면=3안 카드 68%, Q&A 17문항 출처 연결, 두루누비 시연 제외) | 재감사 보류 M-4·M-5 해소(로드맵 충돌은 STRATEGY 단계적 확장을 정본으로). PT는 pt-director 첫 가동 — `[요강 미확인]` 5건(시간·발표자·형식·Q&A·네트워크)은 10-21 합격 안내문 수령 시 확정. 잔여 의사결정: 두루누비 실호출 vs 13종 하향. |