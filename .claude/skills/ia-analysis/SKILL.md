---
name: ia-analysis
description: 정보 구조(IA) 분석 스킬. 벤치마크 서비스의 사이트맵, 페이지 템플릿, 사용자 플로우, URL 컨벤션, 네비게이션 패턴을 추출. GreenTrip에 적용할/회피할 IA 패턴을 식별. ia-analyst 에이전트가 사용.
---

# IA Analysis — 정보 구조 분석

## 언제 사용하는가

- 벤치마크 우선 서비스 5~10개의 IA 해부
- GreenTrip 자체 IA 점검·개선 제안
- 새 페이지/플로우 추가 전 카테고리 컨벤션 확인

## 분석 단위 4종

### 1) 사이트맵 트리
페이지 계층 구조를 트리로. 인증 벽이 있는 페이지는 `🔒` 표시.

```
Service: AllTrails
├── /
├── /explore
│   ├── ?lat=&lng=  (지오 검색)
│   └── ?activity=hiking
├── /trail/[id]
│   ├── /overview
│   ├── /reviews
│   └── /photos
├── /list/[id]
├── /community 🔒
├── /profile 🔒
│   ├── /activities
│   └── /settings
└── /auth
    ├── /login
    └── /signup
```

### 2) 페이지 템플릿 매트릭스

| 템플릿 | 핵심 요소 | 발견 위치 | GreenTrip 적용 |
|-------|---------|---------|---------------|
| 히어로 + CTA | full-bleed 이미지, 1-line slogan, 1-2 CTA | AllTrails /, Komoot / | 직접 적용 |
| 결과 비교 카드 | 가로 N안, 추천 뱃지, 핵심 수치 강조 | Skyscanner /flights, Joro /actions | **직접 적용 (3안)** |
| 타임라인 상세 | 세로 시간순 카드, 연결선, 거리/시간 메타 | Wanderlog itinerary | 코스 상세 |
| 인증서 카드 | 정사각 또는 9:16, 공유 버튼 | Wren certificate | 탄소 리포트 |

### 3) 사용자 플로우 시퀀스

핵심 작업 3~5개를 화면 전이로:

```
[ Komoot: 자전거 경로 만들기 ]

[/] → "Plan a tour" CTA
  ↓
[/plan-tour] 시작점 입력 (지도 또는 검색)
  ↓
[/plan-tour?from=...] 목적지 또는 라운드트립
  ↓ 옵션 (스포츠 종류, 난이도)
[/route-result] 추천 경로 N개, 거리/시간/오르막
  ↓ 선택
[/route/[id]] 상세 (지도 + 고도 차트)
  ↓
[저장 → /profile/tours]
```

### 4) 네비게이션 패턴

| 패턴 | 사용 시점 | 장단점 |
|-----|---------|-------|
| 모바일 하단 탭 4~5개 | 자주 쓰는 영역 | 발견성 ↑, 슬롯 한정 |
| 햄버거 메뉴 | 부가 영역 | 슬롯 무제한, 발견성 ↓ |
| 탑바 검색 | 검색이 핵심일 때 | 즉시 액션, 다른 정보 가림 |
| 플로팅 CTA | 1개 핵심 액션 | 명확, 거슬릴 수 있음 |

## 분석 도구

1. **공식 사이트 탐색** — 모바일 우선, 데스크탑 비교
2. **`/sitemap.xml`, `/robots.txt`** — 공개된 페이지 목록
3. **DevTools Network** — 페이지 전환 시 호출되는 API와 라우팅
4. **회원가입 깔때기 추적** — 어디서 가입 강요? lazy login 여부
5. **빈/에러 상태 캡처** — 의외로 차별화 포인트

## GreenTrip IA 갭 검증 (자체 점검)

DEVELOPMENT_PLAN.md 7장 페이지 맵과 벤치마크를 비교:

- [ ] 현재 페이지: /, /plan, /plan/result, /course/[id], /spot/[contentId], /report/[id], /explore, /mypage
- [ ] 누락 후보 검증:
  - 리더보드 (`/leaderboard`) — 누적 절감 ranking
  - 챌린지 (`/challenge`) — 게임화
  - 커뮤니티 (`/community`) — 후기·공유
  - 검색 결과 (`/search`) — 통합 검색
  - 정책·가이드 (`/about/sustainability`) — 신뢰성
- [ ] 인증 위치 — lazy login이 가능한가? 현재 mypage 전에 강제 가입?

## 작업 원칙

1. **트리는 페이지, 시퀀스는 액션, 매트릭스는 비교** — 표현 도구 혼동 금지
2. **모바일 IA 우선** — GreenTrip은 모바일 퍼스트
3. **로그인 전/후 분리** — 전환 깔때기의 90%는 비로그인 IA에서 결정됨
4. **3-click 검증** — 핵심 액션까지 클릭 수 측정
5. **인증 강도 분류** — 즉시 강요 / 액션 시점 / lazy / optional

## 출력 경로

- `_workspace/benchmark/02_ia_sitemaps.md`
- `_workspace/benchmark/02_ia_templates.md`
- `_workspace/benchmark/02_ia_flows.md`
- `_workspace/benchmark/02_ia_insights.md` (적용/회피 패턴 + GreenTrip 갭 분석)

## 참고 자료

- DEVELOPMENT_PLAN.md 7장 (페이지 명세)
- competitor-researcher의 우선순위 서비스 목록
