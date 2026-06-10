// GreenTrip Design Tokens
// 참조: _workspace/benchmark/03_design_proposal.md §8
// - WCAG AA 통과 (대비 검증 §10)
// - 라이트/다크 동시 정의
// - 시그니처: Carbon Scale 4단계, Transport 3안, numeric.hero 56px

export const tokens = {
  color: {
    brand: {
      // primary.light: #097A50 — WCAG AA 보정 (구 #0B8C5C 4.27:1 미달 → 5.37:1 통과).
      // 전경 텍스트·링크·버튼 배경 전반에 쓰이므로 전경 안전값으로 어둡게.
      primary: { light: '#097A50', dark: '#34D399' },
      // hover는 primary보다 한 단계 더 진하게 유지 (구 #097A50 → #06734A 5.90:1)
      primaryHover: { light: '#06734A', dark: '#6EE7B7' },
      primarySurface: { light: '#ECFDF5', dark: '#064E3B' },
      secondary: { light: '#0E7490', dark: '#22D3EE' },
      secondarySurface: { light: '#ECFEFF', dark: '#164E63' },
      accent: { light: '#F59E0B', dark: '#FBBF24' },
    },
    semantic: {
      success: { light: '#097A50', dark: '#34D399' }, // AA 보정 (brand.primary 동기화)
      warning: { light: '#D97706', dark: '#FBBF24' },
      danger: { light: '#DC2626', dark: '#F87171' },
      info: { light: '#0E7490', dark: '#22D3EE' },
    },
    // ★ 시그니처 1: Carbon Scale 4단계 신호등
    carbon: {
      low: {
        bg: { light: '#D1FAE5', dark: '#064E3B' },
        fg: { light: '#065F46', dark: '#6EE7B7' },
        label: '저탄소',
        maxKg: 2,
      },
      mid: {
        bg: { light: '#FEF3C7', dark: '#78350F' },
        fg: { light: '#92400E', dark: '#FCD34D' },
        label: '균형',
        maxKg: 6,
      },
      high: {
        bg: { light: '#FED7AA', dark: '#7C2D12' },
        fg: { light: '#9A3412', dark: '#FDBA74' },
        label: '주의',
        maxKg: 12,
      },
      severe: {
        bg: { light: '#FECACA', dark: '#7F1D1D' },
        fg: { light: '#991B1B', dark: '#FCA5A5' },
        label: '고탄소',
        maxKg: Infinity,
      },
    },
    // ★ 시그니처 2: Transport 3안 컬러 코딩
    // 주의: eco/balance/fast(light)는 차트 막대·채움 등 면적 배경(graphical object 3:1)
    //       에도 쓰이고, 전경 텍스트/아이콘에도 쓰인다.
    //  - eco는 전경 텍스트로 쓰이므로 AA 보정값(#097A50, on white 5.37:1).
    //  - fast(#F59E0B)는 면적 배경으로는 적합하나 전경 텍스트(2.15:1 FAIL)로는 부적합 →
    //    전경 전용 fastFg(#92400E amber-800, on white 7.09:1)를 분리 추가.
    transport: {
      eco: { light: '#097A50', dark: '#34D399' }, // 저탄소 안 (AA 보정)
      balance: { light: '#0E7490', dark: '#22D3EE' }, // 균형 안
      fast: { light: '#F59E0B', dark: '#FBBF24' }, // 속도 안 (배경/그래픽 전용)
      fastFg: { light: '#92400E', dark: '#FBBF24' }, // 속도 안 전경 텍스트/아이콘 전용
    },
    surface: {
      base: { light: '#F8FAF7', dark: '#0A0F0D' },
      card: { light: '#FFFFFF', dark: '#0F1714' },
      elevated: { light: '#FFFFFF', dark: '#1A2421' },
      subtle: { light: '#F3F4F2', dark: '#1A2421' },
      border: { light: '#E5E7EB', dark: '#2A3833' },
      divider: { light: '#F0F0EE', dark: '#1F2A26' },
    },
    text: {
      primary: { light: '#0F1F1A', dark: '#F5F7F4' },
      secondary: { light: '#4B5563', dark: '#9CA3AF' },
      tertiary: { light: '#6B7280', dark: '#6B7280' },
      inverse: { light: '#FFFFFF', dark: '#0F1F1A' },
      brand: { light: '#097A50', dark: '#34D399' }, // AA 보정 (brand.primary 동기화)
      danger: { light: '#DC2626', dark: '#F87171' },
    },
  },

  font: {
    family: {
      sans: 'Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      numeric: 'Pretendard Variable, Pretendard, system-ui, sans-serif',
    },
    size: {
      'display-lg': { px: 48, lh: 55, weight: 800 },
      'display-md': { px: 36, lh: 44, weight: 800 },
      'display-sm': { px: 30, lh: 38, weight: 800 },
      'heading-lg': { px: 28, lh: 36, weight: 700 },
      'heading-md': { px: 22, lh: 30, weight: 700 },
      'heading-sm': { px: 18, lh: 25, weight: 600 },
      'body-lg': { px: 17, lh: 27, weight: 400 },
      'body-md': { px: 16, lh: 26, weight: 400 },
      'body-sm': { px: 14, lh: 21, weight: 400 },
      caption: { px: 12, lh: 17, weight: 500 },
      // ★ 시그니처 3: Numeric typography
      'numeric-hero': { px: 56, lh: 56, weight: 800 },
      'numeric-lg': { px: 36, lh: 36, weight: 800 },
      'numeric-md': { px: 22, lh: 24, weight: 700 },
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },

  radius: { none: 0, sm: 6, md: 10, lg: 14, xl: 20, '2xl': 28, full: 9999 },

  shadow: {
    sm: {
      light: '0 1px 2px rgba(15,31,26,0.06)',
      dark: '0 1px 2px rgba(0,0,0,0.4)',
    },
    md: {
      light: '0 4px 12px rgba(15,31,26,0.08)',
      dark: '0 4px 12px rgba(0,0,0,0.5)',
    },
    lg: {
      light: '0 12px 32px rgba(15,31,26,0.10)',
      dark: '0 12px 32px rgba(0,0,0,0.6)',
    },
    brand: {
      light: '0 8px 24px rgba(11,140,92,0.20)',
      dark: '0 8px 24px rgba(52,211,153,0.25)',
    },
  },

  motion: {
    duration: { fast: 150, base: 240, slow: 400, counter: 720 },
    easing: {
      standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },

  aspect: { tour: '16/9', course: '4/3', square: '1/1', map: '4/3' },

  container: { max: 1280, prose: 720 },
} as const;

export type Tokens = typeof tokens;
