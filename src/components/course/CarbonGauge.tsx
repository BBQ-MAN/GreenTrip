// CarbonGauge — Carbon Scale 4단계 신호등 (시그니처 3 핵심)
// Server Component (정적, 인터랙션 없음)
// 참조: _workspace/benchmark/04_signatures.md 시그니처 3, src/styles/tokens.ts carbon.*
//
// 4단계 배지 + 큰 numeric:
//   ≤ 2 kg : carbon.low  (green-100 / 🌿)
//   2 ~ 6  : carbon.mid  (yellow-100 / ⚖️)
//   6 ~ 12 : carbon.high (orange-100 / ⚠️)
//   > 12   : carbon.severe (red-100 / 🔥)
// (tokens.ts carbon.{low|mid|high|severe}.maxKg 값과 일치)
//
// WCAG AA: 색 + 아이콘 + 텍스트 라벨 3중. (색약 대응)
import { Leaf, Scale, AlertTriangle, Flame } from 'lucide-react';
import { formatCarbon } from '@/lib/carbon/formatter';
import { cn } from '@/lib/utils';

export type CarbonTier = 'low' | 'mid' | 'high' | 'severe';

interface CarbonGaugeProps {
  /** 총 CO₂ 배출량 (g) */
  totalCO2g: number;
  /** 비교 기준 (자가용 baseline 등). 지정 시 절감률 % 표시 */
  baselineCO2g?: number;
  /** 표시 크기: hero(56px numeric) / lg / md / sm */
  size?: 'hero' | 'lg' | 'md' | 'sm';
  /** progress bar variant 표시 여부 (기본 true) */
  showBar?: boolean;
  /** 컨테이너 클래스 오버라이드 */
  className?: string;
}

/** g → kg 변환 후 tier 결정. tokens.ts carbon.*.maxKg 와 정합 */
export function carbonTier(co2g: number): CarbonTier {
  const kg = co2g / 1000;
  if (kg <= 2) return 'low';
  if (kg <= 6) return 'mid';
  if (kg <= 12) return 'high';
  return 'severe';
}

const TIER_META: Record<
  CarbonTier,
  {
    label: string;
    bg: string;
    fg: string;
    bar: string;
    Icon: typeof Leaf;
    emoji: string;
  }
> = {
  low: {
    label: '저탄소',
    bg: 'bg-carbon-low-bg',
    fg: 'text-carbon-low-fg',
    bar: 'bg-transport-eco',
    Icon: Leaf,
    emoji: '🌿',
  },
  mid: {
    label: '균형',
    bg: 'bg-carbon-mid-bg',
    fg: 'text-carbon-mid-fg',
    bar: 'bg-transport-balance',
    Icon: Scale,
    emoji: '⚖️',
  },
  high: {
    label: '주의',
    bg: 'bg-carbon-high-bg',
    fg: 'text-carbon-high-fg',
    bar: 'bg-transport-fast',
    Icon: AlertTriangle,
    emoji: '⚠️',
  },
  severe: {
    label: '고탄소',
    bg: 'bg-carbon-severe-bg',
    fg: 'text-carbon-severe-fg',
    bar: 'bg-destructive',
    Icon: Flame,
    emoji: '🔥',
  },
};

/**
 * Progress bar에서 현재 값이 차지하는 비율 (0~100).
 * baselineCO2g가 있으면 그 값을 100으로 잡고, 없으면 12kg을 100으로 잡는다.
 */
function calcBarPercent(co2g: number, baselineCO2g?: number): number {
  const max = baselineCO2g && baselineCO2g > 0 ? baselineCO2g : 12_000; // 12kg = severe 임계
  return Math.min(100, Math.max(2, Math.round((co2g / max) * 100)));
}

export function CarbonGauge({
  totalCO2g,
  baselineCO2g,
  size = 'lg',
  showBar = true,
  className,
}: CarbonGaugeProps) {
  const tier = carbonTier(totalCO2g);
  const meta = TIER_META[tier];
  const barPercent = calcBarPercent(totalCO2g, baselineCO2g);

  const numericClass = {
    hero: 'text-numeric-hero',
    lg: 'text-numeric-lg',
    md: 'text-numeric-md',
    sm: 'text-heading-md',
  }[size];

  // 절감률 계산 (소수점 없이)
  const savedG = baselineCO2g ? baselineCO2g - totalCO2g : 0;
  const savedPercent =
    baselineCO2g && baselineCO2g > 0
      ? Math.round((savedG / baselineCO2g) * 100)
      : null;

  return (
    <div
      className={cn('space-y-2', className)}
      role="group"
      aria-label={`탄소 배출 ${meta.label} 등급, ${formatCarbon(totalCO2g)}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className={cn('numeric font-extrabold tracking-tight', numericClass, meta.fg)}>
          {formatCarbon(totalCO2g)}
        </p>

        {/* 4단계 배지 — 색 + 아이콘 + 텍스트 3중 */}
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-caption font-semibold',
            meta.bg,
            meta.fg,
          )}
        >
          <meta.Icon aria-hidden="true" className="h-3.5 w-3.5" />
          {meta.label}
        </span>
      </div>

      {showBar ? (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={baselineCO2g ?? 12_000}
          aria-valuenow={Math.round(totalCO2g)}
          aria-label="탄소 배출 게이지"
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-720 ease-decelerate motion-reduce:transition-none',
              meta.bar,
            )}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      ) : null}

      {savedPercent !== null && savedPercent > 0 ? (
        <p className="text-caption text-muted-foreground">
          자가용 대비{' '}
          <span className="font-semibold text-transport-eco">
            {savedPercent}% 절감
          </span>
        </p>
      ) : null}
    </div>
  );
}
