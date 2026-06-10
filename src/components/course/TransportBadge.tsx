// TransportBadge — 이동수단 배지 (시그니처 1: transport 3-tier 컬러)
// Server Component (정적 렌더만, 인터랙션 없음)
// 참조: _workspace/benchmark/04_signatures.md 시그니처 1
//
// transport.car(fast=주황 #F59E0B) / transport.transit(balance=청록 #0E7490) /
// transport.active(eco=초록 #097A50). WCAG AA: 색 + 아이콘 + 텍스트 3중.
import { Car, Bus, TrainFront, Bike, Footprints } from 'lucide-react';
import type { TransportMode, CourseCategory } from '@/types/course';
import { cn } from '@/lib/utils';

interface TransportBadgeProps {
  mode: TransportMode;
  /** category를 명시하면 컬러 그룹을 강제 (없으면 mode → category 자동 추론) */
  category?: CourseCategory;
  size?: 'sm' | 'md' | 'lg';
  /** 라벨 없이 아이콘만 (좁은 공간용) */
  iconOnly?: boolean;
  className?: string;
}

/**
 * mode → CourseCategory 추론 (3-tier 컬러 매핑).
 * - car → 'car' (fast)
 * - express_bus/city_bus/train_* → 'transit' (balance)
 * - bicycle/walking → 'active' (eco)
 */
export function categoryFromMode(mode: TransportMode): CourseCategory {
  if (mode === 'car') return 'car';
  if (mode === 'bicycle' || mode === 'walking') return 'active';
  return 'transit';
}

/** mode → 한글 라벨 */
const MODE_LABEL: Record<TransportMode, string> = {
  car: '자가용',
  express_bus: '고속버스',
  city_bus: '시내버스',
  train_ktx: 'KTX',
  train_itx: 'ITX',
  bicycle: '자전거',
  walking: '도보',
};

/** category → 큰 카테고리 한글 라벨 (배지 상단 표시용) */
const CATEGORY_LABEL: Record<CourseCategory, string> = {
  car: '속도',
  transit: '균형',
  active: '저탄소',
};

/** category → Tailwind 토큰 매핑 (tailwind.config.ts colors.transport.*) */
const CATEGORY_STYLES: Record<
  CourseCategory,
  { bg: string; fg: string; ring: string; icon: string }
> = {
  car: {
    // fast — amber. 배경/링은 transport.fast(#F59E0B), 전경 텍스트·아이콘은
    // transport.fast-fg(#92400E amber-800)로 분리해 WCAG AA 통과 (on white 7.09:1).
    bg: 'bg-transport-fast/10',
    fg: 'text-transport-fast-fg',
    ring: 'ring-transport-fast/30',
    icon: 'text-transport-fast-fg',
  },
  transit: {
    // balance — teal (transport.balance #0E7490)
    bg: 'bg-transport-balance/10',
    fg: 'text-transport-balance',
    ring: 'ring-transport-balance/30',
    icon: 'text-transport-balance',
  },
  active: {
    // eco — green (transport.eco #097A50)
    bg: 'bg-transport-eco/10',
    fg: 'text-transport-eco',
    ring: 'ring-transport-eco/30',
    icon: 'text-transport-eco',
  },
};

function ModeIcon({ mode, className }: { mode: TransportMode; className?: string }) {
  const common = cn('shrink-0', className);
  switch (mode) {
    case 'car':
      return <Car aria-hidden="true" className={common} />;
    case 'express_bus':
    case 'city_bus':
      return <Bus aria-hidden="true" className={common} />;
    case 'train_ktx':
    case 'train_itx':
      return <TrainFront aria-hidden="true" className={common} />;
    case 'bicycle':
      return <Bike aria-hidden="true" className={common} />;
    case 'walking':
      return <Footprints aria-hidden="true" className={common} />;
  }
}

export function TransportBadge({
  mode,
  category,
  size = 'md',
  iconOnly = false,
  className,
}: TransportBadgeProps) {
  const cat = category ?? categoryFromMode(mode);
  const styles = CATEGORY_STYLES[cat];
  const label = MODE_LABEL[mode];
  const groupLabel = CATEGORY_LABEL[cat];

  const sizeClasses = {
    sm: 'gap-1 px-2 py-0.5 text-caption',
    md: 'gap-1.5 px-2.5 py-1 text-body-sm',
    lg: 'gap-2 px-3 py-1.5 text-body-md',
  }[size];

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium ring-1 ring-inset',
        styles.bg,
        styles.fg,
        styles.ring,
        sizeClasses,
        className,
      )}
      // 색 + 아이콘 + 텍스트 3중. iconOnly일 때만 aria-label로 보강.
      aria-label={iconOnly ? `${groupLabel}: ${label}` : undefined}
    >
      <ModeIcon mode={mode} className={cn(iconSize, styles.icon)} />
      {iconOnly ? null : <span>{label}</span>}
    </span>
  );
}

export { MODE_LABEL, CATEGORY_LABEL };
