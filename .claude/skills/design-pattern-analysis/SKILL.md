---
name: design-pattern-analysis
description: 시각 디자인 패턴 분석 스킬. 벤치마크 서비스의 컬러, 타이포, 레이아웃, 컴포넌트, 모션, 아이콘/일러스트 톤을 추출하고 카테고리 컨벤션과 시그니처를 구분. GreenTrip 디자인 토큰 제안까지 진행. design-pattern-analyst 에이전트가 사용.
---

# Design Pattern Analysis — 시각 패턴 분석

## 언제 사용하는가

- 벤치마크 우선 서비스의 디자인 시스템 해부
- GreenTrip 디자인 토큰 초안 도출 (컬러·타이포·간격·컴포넌트)
- 디자인 컨벤션 vs 시그니처 식별
- 다크모드·접근성 검증

## 분석 항목

### 1) 컬러 시스템
- 브랜드 (primary, secondary, tertiary)
- 의미 (success/warn/error/info)
- 중립 (gray scale 9~12 단계)
- 표면 (background, surface, border)
- 다크모드 매핑
- 대비율 (WCAG AA 4.5:1 통과 여부)

### 2) 타이포그래피
- 폰트 패밀리 (한글/영문 페어링, 라이센스)
- 사이즈 스케일 (예: 12/14/16/18/20/24/32/48)
- 굵기 (300/400/500/700/800)
- 행간·자간
- 숫자 강조용 별도 처리 여부 (탄소 수치 등)

### 3) 레이아웃
- 그리드 (4/8/12 칼럼)
- 마진·패딩 스케일 (4/8/12/16/24/32/48/64)
- 카드 비율 (1:1, 4:3, 16:9)
- 브레이크포인트 (mobile/tablet/desktop)
- 최대 너비 (1200/1440)

### 4) 컴포넌트 패턴
| 컴포넌트 | 추출 항목 |
|---------|---------|
| Button | radius, padding, height, hover/active, disabled |
| Card | radius, shadow level, border, hover lift |
| Badge | size, variant (solid/outline), 위치 |
| Form | label 위치, error 표기, focus ring |
| Modal | overlay opacity, max-width, close affordance |
| Toast | 위치, 자동 닫힘 시간, 아이콘 |
| Skeleton | shimmer 여부, base color, 빈도 |
| Gauge/Progress | 두께, 그라디언트, 텍스트 위치 |

### 5) 모션
- 기본 트랜지션 길이 (보통 150~300ms)
- easing 함수 (cubic-bezier 값)
- 페이지 전환
- 마이크로 인터랙션 (hover, focus, success animation)
- `prefers-reduced-motion` 대응 여부

### 6) 아이콘/일러스트
- 라인 vs 솔리드
- 굵기 (1.5px / 2px)
- 톤 (친근 / 시리어스 / 플레이풀)
- 일러스트 스타일 (픽토그램 / 3D / 풍경 사진 / 손그림)

### 7) 이미지 처리
- 사진 톤 (warm/cool/neutral)
- 오버레이 (gradient, scrim)
- 마스킹 (rounded, organic shape)

### 8) 데이터 시각화 (탄소 가시화 카테고리 중점)
- 게이지 바 그라디언트
- 환산 메타포 (나무/지구/일상 행위)
- 차트 (Recharts 호환 검토)
- 숫자 카운터 애니메이션

## 분석 절차

1. **스크린샷 수집** — 모바일/데스크탑, 주요 5~8 페이지
2. **DevTools 토큰 추출** — computed style에서 color/font/spacing 읽기
3. **`:root` CSS 변수 확인** — 공개된 디자인 토큰
4. **반복 패턴 식별** — 3회 이상 등장만 패턴
5. **컨벤션 vs 시그니처 분류** — 카테고리 공통 vs 서비스 고유
6. **접근성 검증** — 대비율 계산, 색약 시뮬레이션
7. **GreenTrip 적용 후보 추출** — 토큰 값 제안

## 카테고리 컨벤션 (친환경/지속가능 카테고리)

이 영역에서 자주 보이는 컨벤션:
- 초록 계열 primary (`#10B981` ~ `#2E7D32`)
- 따뜻한 흙색 또는 베이지 surface
- 손그림 또는 자연 일러스트
- 큰 숫자 카운터 (절감량 강조)
- 그라디언트 게이지 바 (green → red)
- 사진 위 grain texture 또는 warm filter
- 라운드 코너 (12~24px)

**컨벤션을 답습하면 안전하지만 무색무취. 시그니처 1~2개로 차별화.**

## GreenTrip 디자인 토큰 제안 템플릿

```typescript
// src/styles/tokens.ts (또는 tailwind.config 확장)
export const tokens = {
  color: {
    brand: {
      primary: '#10B981',     // 초록 (지속가능)
      secondary: '#0EA5E9',   // 강원도 청정 sky
      accent: '#F59E0B',      // 절감량 강조
    },
    semantic: {
      success: '#10B981',
      warn: '#F59E0B',
      error: '#EF4444',
    },
    surface: {
      base: '#F8FAF7',        // 자연 톤 off-white
      card: '#FFFFFF',
      border: '#E5E7EB',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      inverse: '#FFFFFF',
    },
    carbon: {
      low:    '#D1FAE5',  // ≤ 1 kg
      mid:    '#FEF3C7',  //   1~5 kg
      high:   '#FED7AA',  //   5~10 kg
      severe: '#FECACA',  // > 10 kg
    },
  },
  font: {
    family: {
      sans: 'Pretendard, system-ui, sans-serif',
      number: 'Pretendard, sans-serif',
    },
    size: { xs:12, sm:14, base:16, lg:18, xl:20, '2xl':24, '3xl':32, '4xl':48 },
    weight: { regular:400, medium:500, bold:700, black:800 },
  },
  radius: { sm:6, md:12, lg:16, xl:24 },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.06)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 12px 32px rgba(0,0,0,0.10)',
  },
  motion: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    slow: '400ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
};
```

## 작업 원칙

1. **3회 이상 반복만 패턴** — 일회성 디자인은 노이즈
2. **컨벤션 ≠ 시그니처** — 컨벤션은 안전, 시그니처는 위험 + 임팩트
3. **토큰 값은 측정값** — 색이름 X, hex/rgb O
4. **접근성 의무** — 제안 토큰 모두 WCAG AA 통과 검증
5. **다크모드 동시 설계** — 단일 모드만 설계하면 후회

## 출력 경로

- `_workspace/benchmark/03_design_tokens_by_service.md`
- `_workspace/benchmark/03_design_conventions.md`
- `_workspace/benchmark/03_design_proposal.md`
- `_workspace/benchmark/03_design_components.md`

## 참고 자료

- DEVELOPMENT_PLAN.md 2.1 (Tailwind + shadcn/ui 스택)
- nextjs-ui-builder 스킬 (실제 구현 시 토큰 참조)
- WCAG 2.1 AA 가이드
