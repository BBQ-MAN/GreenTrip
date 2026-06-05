// CourseCompareCard — 이동수단 3안 비교 카드 (시그니처 1 메인)
// Server Component (정적). 부모(/plan/result)가 클라이언트 콘텐츠로 감쌈.
// 참조: _workspace/benchmark/04_signatures.md 시그니처 1,
//      DEVELOPMENT_PLAN.md §7.3
//
// active === null 케이스 처리: "단거리 코스 부족" disabled card.
import Link from 'next/link';
import { Star, Clock, Wallet, MapPin, AlertCircle, Bike } from 'lucide-react';
import type { CourseOption, CourseCategory } from '@/types/course';
import { Button } from '@/components/ui/button';
import { formatCarbon } from '@/lib/carbon/formatter';
import { TransportBadge, CATEGORY_LABEL } from './TransportBadge';
import { CarbonGauge } from './CarbonGauge';
import { cn } from '@/lib/utils';

interface CourseCompareCardProps {
  /** null이면 "단거리 코스 부족" disabled card 렌더 */
  option: CourseOption | null;
  /** 보통 car 코스의 totalCO2g (절감률 산정 기준) */
  baselineCO2g: number;
  /** 추천안 ⭐ 배지 표시 여부 */
  isRecommended: boolean;
  /** "이 코스 선택" 클릭 시 (Week 5 /course/[id] 라우팅 전 임시 콜백) */
  onSelect?: () => void;
  /** 카드 자리에 표시할 카테고리 (null 케이스에서도 헤더 유지) */
  fallbackCategory?: CourseCategory;
  className?: string;
}

function formatDuration(min: number): string {
  if (!Number.isFinite(min) || min <= 0) return '—';
  if (min < 60) return `${Math.round(min)}분`;
  const hours = Math.floor(min / 60);
  const rest = Math.round(min % 60);
  return rest > 0 ? `${hours}시간 ${rest}분` : `${hours}시간`;
}

function formatCurrencyKRW(krw: number): string {
  if (!Number.isFinite(krw) || krw <= 0) return '무료';
  return `${Math.round(krw).toLocaleString('ko-KR')}원`;
}

/** 카드 외곽 — category별 컬러 액센트 (좌측 상단 4px 라인) */
const CATEGORY_ACCENT: Record<CourseCategory, string> = {
  car: 'border-l-4 border-l-transport-fast',
  transit: 'border-l-4 border-l-transport-balance',
  active: 'border-l-4 border-l-transport-eco',
};

export function CourseCompareCard({
  option,
  baselineCO2g,
  isRecommended,
  onSelect,
  fallbackCategory = 'active',
  className,
}: CourseCompareCardProps) {
  // ===== option === null: 단거리 코스 부족 =====
  if (!option) {
    return (
      <article
        className={cn(
          'flex h-full flex-col rounded-lg border-2 border-dashed bg-muted/30 p-5',
          'border-l-4 border-l-muted-foreground/30',
          className,
        )}
        aria-label="단거리 코스 부족"
      >
        <div className="mb-3 flex items-center gap-2 text-caption text-muted-foreground">
          <Bike aria-hidden="true" className="h-4 w-4" />
          {CATEGORY_LABEL[fallbackCategory]} 코스
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-heading-sm text-foreground">
            단거리 코스 부족
          </h3>
          <p className="text-body-sm text-muted-foreground">
            10km 반경 내 관광지가 2개 이상 필요합니다.
            <br />
            지역·테마를 조정해 보세요.
          </p>
        </div>
      </article>
    );
  }

  // ===== 정상 케이스 =====
  const cat = option.category;
  const savedG = Math.max(0, baselineCO2g - option.totalCO2g);
  const savedPercent =
    baselineCO2g > 0 ? Math.round((savedG / baselineCO2g) * 100) : 0;
  const isBaseline = cat === 'car';

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md focus-within:shadow-md',
        CATEGORY_ACCENT[cat],
        isRecommended && 'ring-2 ring-transport-eco ring-offset-2',
        className,
      )}
      aria-label={`${CATEGORY_LABEL[cat]} 코스, ${formatCarbon(option.totalCO2g)}`}
    >
      {/* 추천 ⭐ 뱃지 (우측 상단) */}
      {isRecommended ? (
        <span
          className="absolute -right-2 -top-2 inline-flex items-center gap-1 rounded-full bg-transport-eco px-2.5 py-1 text-caption font-semibold text-white shadow-md"
          aria-label="추천 코스"
        >
          <Star aria-hidden="true" className="h-3.5 w-3.5 fill-white" />
          추천
        </span>
      ) : null}

      {/* 헤더 — 카테고리 라벨 + 이동수단 배지 */}
      <header className="mb-3 flex items-center justify-between gap-2">
        <span className="text-caption font-semibold text-muted-foreground">
          {CATEGORY_LABEL[cat]}
        </span>
        <TransportBadge mode={option.mode} category={cat} size="sm" />
      </header>

      {/* CarbonGauge (시그니처 3) — 메인 numeric */}
      <div className="mb-4">
        <CarbonGauge
          totalCO2g={option.totalCO2g}
          baselineCO2g={isBaseline ? undefined : baselineCO2g}
          size="lg"
          showBar
        />
      </div>

      {/* 절감 요약 (비-baseline일 때만) */}
      {!isBaseline && savedG > 0 ? (
        <div className="mb-4 rounded-md bg-transport-eco/10 px-3 py-2">
          <p className="text-body-sm text-transport-eco">
            자가용 대비{' '}
            <span className="numeric font-extrabold">
              −{formatCarbon(savedG)}
            </span>{' '}
            <span className="font-semibold">({savedPercent}%)</span> 절감
          </p>
        </div>
      ) : null}

      {/* 지표 그리드 — 시간·거리·비용 */}
      <dl className="mb-4 grid grid-cols-3 gap-2 border-t pt-3 text-center">
        <div>
          <dt className="flex items-center justify-center gap-1 text-caption text-muted-foreground">
            <Clock aria-hidden="true" className="h-3 w-3" />
            시간
          </dt>
          <dd className="numeric mt-0.5 text-body-md font-semibold text-foreground">
            {formatDuration(option.durationMin)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center justify-center gap-1 text-caption text-muted-foreground">
            <MapPin aria-hidden="true" className="h-3 w-3" />
            거리
          </dt>
          <dd className="numeric mt-0.5 text-body-md font-semibold text-foreground">
            {option.totalKm.toFixed(1)} km
          </dd>
        </div>
        <div>
          <dt className="flex items-center justify-center gap-1 text-caption text-muted-foreground">
            <Wallet aria-hidden="true" className="h-3 w-3" />
            비용
          </dt>
          <dd className="numeric mt-0.5 text-body-md font-semibold text-foreground">
            {formatCurrencyKRW(option.estimatedCostKRW)}
          </dd>
        </div>
      </dl>

      {/* 관광지 수 (간단 요약) */}
      <p className="mb-4 text-caption text-muted-foreground">
        관광지 <span className="font-semibold text-foreground">
          {option.waypoints.length}곳
        </span>{' '}
        방문 · {option.segments.length}구간
      </p>

      {/* CTA — "이 코스 선택" */}
      <div className="mt-auto pt-2">
        {onSelect ? (
          <Button
            type="button"
            onClick={onSelect}
            variant={isRecommended ? 'default' : 'outline'}
            className="w-full"
          >
            이 코스 선택
          </Button>
        ) : (
          <Button asChild variant={isRecommended ? 'default' : 'outline'} className="w-full">
            <Link
              href={`/plan/result?selected=${cat}`}
              aria-label={`${CATEGORY_LABEL[cat]} 코스 선택`}
            >
              이 코스 선택
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
