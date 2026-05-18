---
name: competitor-research
description: GreenTrip 벤치마크 리서치 스킬. 저탄소·지속가능 여행 플래너, 코스 추천, 탄소발자국 가시화, 한국관광공사 API 활용 서비스를 식별하고 카테고리별로 정리. WebSearch/WebFetch로 사실 검증하고 출처 명시. competitor-researcher 에이전트가 사용.
---

# Competitor Research — 벤치마크 리서치

## 언제 사용하는가

- GreenTrip의 시장 지형 최초 매핑
- 특정 카테고리(예: 국외 친환경 여행 앱) 심화 조사
- 새 경쟁자 등장 알림 후 매트릭스 갱신

## 카테고리 정의

| 카테고리 | 정의 | 예시 |
|---------|------|------|
| 직접 경쟁 (국내) | 저탄소 여행 플래너, 강원도 관광 큐레이션 | 강원관광재단 앱, 강원더(WonderGangwon) |
| 직접 경쟁 (국외) | 친환경 여행 플래너, 지속가능 호텔 큐레이션 | BookDifferent, BeCause, Wayaj |
| 인접 (코스 추천) | AI 코스 생성·여행 일정 추천 | 트리플, 마이리얼트립, Wanderlog |
| 인접 (대중교통) | 친환경 이동 옵션 비교 | Citymapper, Komoot |
| 영감 (탄소 가시화) | 개인 탄소발자국 트래커 | Joro, Klima, Persefoni |
| 영감 (가치소비) | 지속가능성 인증·환산 메타포 | Wren, Too Good To Go |
| 데이터 활용 사례 | TourAPI 또는 공공데이터 활용 서비스 | 대한민국구석구석, 역대 공모전 수상작 |

## 분석 매트릭스 (각 서비스마다)

```markdown
## {Service Name}

- **URL**: {공식 사이트 / 앱스토어}
- **카테고리**: {위 분류}
- **국가/지역**: {KR / Global / EU 등}
- **수집일**: 2026-MM-DD

### 정체성
- 한 줄 가치 제안: "{slogan}"
- 타깃: {1차 페르소나} / {2차 페르소나}

### 핵심 기능 (3~5개)
1. ...
2. ...

### 차별 포인트
- ...

### BM
- 무료 / 광고 / 프리미엄 / 수수료 / B2B / B2G

### 사용 데이터
- {API/공공데이터/내부 큐레이션}

### UX 강점 (모방 후보)
- ...

### 약점 / 사용자 컴플레인
- ...

### 출처
- {URL 1}
- {URL 2}
- [unverified] {2차 출처만 있는 주장}
```

## 작업 절차

1. **시드 리스트 작성** — 사용자가 제공한 단서 + 도메인 지식으로 후보 20개 나열
2. **카테고리 분류** — 위 7개 카테고리에 배치, 중복 가능
3. **샘플링** — 직접 5~7개, 인접 5개, 영감 3~5개로 압축
4. **각 서비스 1차 조사** — WebFetch로 공식 사이트, 슬로건/타깃/기능 추출
5. **출처 검증** — 주장마다 URL 동반. 못 찾으면 [unverified]
6. **비교 매트릭스 작성** — 서비스 × 분석 축 표
7. **인사이트 5개** — 한 줄 요약, 출처 매핑

## 검색 쿼리 템플릿

```
# 국내 직접 경쟁
"강원도 관광 앱" / "친환경 여행 큐레이션"
"한국관광공사 OpenAPI 활용 서비스"

# 국외 직접 경쟁
"sustainable travel planner" / "low carbon trip app"
"eco-friendly tourism app"

# 탄소 가시화
"personal carbon footprint tracker app"
"carbon offset visualization UX"

# 공모전 동향
"관광데이터 활용 공모전 수상작 2025"
"TourAPI 활용 사례 2024 2025"
```

## 작업 원칙

1. **출처 없는 주장 금지** — [unverified] 태그 의무
2. **사양은 빠르게 변함** — 수집일 명시
3. **편향 균형** — 한국어 검색 + 영문 검색 의무
4. **공모전 맥락** — TourAPI 활용 사례·강원도 관련 서비스 우선
5. **깊이 > 양** — 매트릭스 빈 칸 채우는 것보다 핵심 통찰 5개가 가치

## 시장 통계·정책 출처 수집 (제안서 정합)

`greentrip_proposal.md` 1장의 정량 주장과 4장의 정책 인용은 공모전 심사에 직접적인 영향을 미친다. 다음을 1차 출처와 함께 수집하여 `_workspace/benchmark/01_market_evidence.md`에 정리한다:

| 주장 / 인용 | 추적 대상 | 우선 출처 |
|------------|---------|---------|
| 내국인 여행 4억 회 | 한국관광공사 KTO 통계, 문체부 보도자료 | kto.visitkorea.or.kr |
| 관광교통이 관광 탄소 약 75% | 환경부·문체부·학술논문 | me.go.kr / mcst.go.kr |
| 한국인 83% 지속가능 여행 의향 | Booking.com Sustainable Travel Report 2025 | booking.com/sustainability-report |
| 2050 탄소중립 국가전략 | 2050탄소중립녹색성장위원회 | 2050cnc.go.kr |
| 탄소중립 기본법 | 국가법령정보센터 | law.go.kr |
| 「지속가능 관광 활성화 계획」 | 문체부 보도자료·계획 문서 | mcst.go.kr |

각 주장은 다음 형식으로 기록:
```markdown
## 주장: {원문}
- 출처: {URL}
- 수집일: 2026-MM-DD
- 신뢰도: High / Medium / [unverified]
- 사용 위치: 제안서 1장 / SWOT / KPI / 발전성 매핑
```

product-strategist의 `04_evidence_ledger.md` 작성 시 이 파일을 기반으로 한다.

## 출력 경로

- `_workspace/benchmark/01_competitor_landscape.md`
- `_workspace/benchmark/01_competitor_matrix.md`
- `_workspace/benchmark/01_insights.md`
- `_workspace/benchmark/01_market_evidence.md` — **신규: 시장 통계·정책 출처 추적**

## 참고 자료

- DEVELOPMENT_PLAN.md 1.2 (핵심 가치), 11장 (심사 기준)
