// BeforeAfterCompare — "자가용 12.4 kg → 본 코스 4.2 kg" 비교 (시그니처 3)
// Server Component (정적 표기). Too Good To Go 가격 차이 메타포 차용.
// 참조: _workspace/benchmark/04_signatures.md 시그니처 3,
//      _workspace/benchmark/03_design_components.md §2
import { ArrowRight, Sprout, Car as CarIcon } from 'lucide-react';
import type { TransportMode } from '@/types/course';
import {
  formatCarbon,
  treeEquivalent,
  carEquivalentKm,
} from '@/lib/carbon/formatter';
import { TransportBadge, categoryFromMode } from './TransportBadge';
import { cn } from '@/lib/utils';

interface BeforeAfterCompareProps {
  /** 자가용 baseline 배출량 (g) */
  baselineG: number;
  /** 선택안 배출량 (g) — 보통 transit/active의 totalCO2g */
  optimizedG: number;
  /** 선택안 이동수단 */
  mode: TransportMode;
  /** 컴팩트 모드 (카드 내부용) */
  compact?: boolean;
  className?: string;
}

export function BeforeAfterCompare({
  baselineG,
  optimizedG,
  mode,
  compact = false,
  className,
}: BeforeAfterCompareProps) {
  const savedG = Math.max(0, baselineG - optimizedG);
  const savedPercent =
    baselineG > 0 ? Math.round((savedG / baselineG) * 100) : 0;
  const trees = treeEquivalent(savedG);
  const equivKm = carEquivalentKm(savedG, 'car');
  const category = categoryFromMode(mode);

  return (
    <section
      className={cn(
        'rounded-lg border bg-card',
        compact ? 'p-4' : 'p-5 md:p-6',
        className,
      )}
      aria-label="자가용 대비 탄소 절감 비교"
    >
      {/* Before → After */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        {/* Before */}
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-caption text-muted-foreground">
            <CarIcon aria-hidden="true" className="h-3.5 w-3.5" />
            자가용 기준
          </span>
          <span
            className={cn(
              'numeric font-bold text-muted-foreground line-through decoration-2',
              compact ? 'text-heading-sm' : 'text-numeric-md',
            )}
          >
            {formatCarbon(baselineG)}
          </span>
        </div>

        <ArrowRight
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-muted-foreground"
        />

        {/* After (선택안) */}
        <div className="flex flex-col gap-1">
          <TransportBadge mode={mode} category={category} size="sm" />
          <span
            className={cn(
              'numeric font-extrabold tracking-tight text-transport-eco',
              compact ? 'text-heading-md' : 'text-numeric-lg',
            )}
          >
            {formatCarbon(optimizedG)}
          </span>
        </div>

        {/* 절감 강조 (큰 화면일 때만 추가 표기) */}
        {savedG > 0 ? (
          <div className="ml-auto flex flex-col items-end gap-0.5">
            <span className="text-caption text-muted-foreground">절감량</span>
            <span
              className={cn(
                'numeric font-extrabold text-transport-eco',
                compact ? 'text-heading-md' : 'text-numeric-md',
              )}
            >
              −{formatCarbon(savedG)}
            </span>
            <span className="text-caption font-semibold text-transport-eco">
              −{savedPercent}%
            </span>
          </div>
        ) : null}
      </div>

      {/* 등가 환산 — 절감이 있을 때만 (시그니처 3 EquivalentMetaphor 미니버전) */}
      {savedG > 0 && !compact ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-body-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Sprout
              aria-hidden="true"
              className="h-4 w-4 text-transport-eco"
            />
            소나무{' '}
            <span className="font-semibold text-foreground">
              {trees.toFixed(1)}그루
            </span>{' '}
            연간 흡수량
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CarIcon
              aria-hidden="true"
              className="h-4 w-4 text-muted-foreground"
            />
            자가용{' '}
            <span className="font-semibold text-foreground">
              {equivKm.toFixed(1)}km
            </span>{' '}
            회피
          </span>
        </div>
      ) : null}
    </section>
  );
}
