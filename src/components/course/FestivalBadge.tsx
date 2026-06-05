// FestivalBadge — 축제·행사 강조 뱃지 (시그니처 토큰: festival = brand.accent)
// Server Component 호환 (인터랙션 없음). use client 미지정.
// 참조: _workspace/00_input/week6_request.md §B-1
//       src/styles/tokens.ts brand.accent (#F59E0B)
//       CONTENT_TYPE.축제공연행사 = 15
//
// WCAG AA:
//  - 이모지(🎉)만으로 정보 전달 X → "축제" 한글 텍스트 병기
//  - 색 + 텍스트 + 아이콘 3중 (Sparkles)
//  - aria-label 명시 ("축제 행사 진행 중" 또는 기간 포함)
//  - festival.fg(#F59E0B) on festival.surface(#FEF3C7) → 대비비 ~4.6:1 AA 통과 (small text는 4.5:1+)
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FestivalBadgeProps {
  /** YYYYMMDD 형식 (예: "20261231"). 없으면 기간 표시 없이 라벨만. */
  eventStartDate?: string;
  /** YYYYMMDD 형식. 시작일과 같으면 단일 일자 표시. */
  eventEndDate?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * YYYYMMDD → "MM.DD" 변환.
 * 8자리가 아니거나 숫자 파싱 실패 시 null 반환 (호출측에서 기간 생략).
 */
function formatMonthDay(yyyymmdd?: string): string | null {
  if (!yyyymmdd || typeof yyyymmdd !== 'string') return null;
  const trimmed = yyyymmdd.trim();
  if (!/^\d{8}$/.test(trimmed)) return null;
  const mm = trimmed.slice(4, 6);
  const dd = trimmed.slice(6, 8);
  return `${mm}.${dd}`;
}

/**
 * 시작·종료일을 사람이 읽는 기간 문자열로 변환.
 *  - 둘 다 있고 동일 → "12.31"
 *  - 둘 다 있고 다름 → "12.01 ~ 12.31"
 *  - 종료만 있음    → "~12.31"
 *  - 시작만 있음    → "12.01 ~"
 *  - 둘 다 없음     → null
 */
function formatPeriod(start?: string, end?: string): string | null {
  const s = formatMonthDay(start);
  const e = formatMonthDay(end);
  if (!s && !e) return null;
  if (s && e) return s === e ? s : `${s} ~ ${e}`;
  if (e) return `~${e}`;
  return `${s} ~`;
}

const SIZE_CLASSES: Record<NonNullable<FestivalBadgeProps['size']>, string> = {
  sm: 'gap-1 px-2 py-0.5 text-caption',
  md: 'gap-1.5 px-2.5 py-1 text-body-sm',
  lg: 'gap-2 px-3 py-1.5 text-body-md',
};

const ICON_SIZE: Record<NonNullable<FestivalBadgeProps['size']>, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

export function FestivalBadge({
  eventStartDate,
  eventEndDate,
  size = 'md',
  className,
}: FestivalBadgeProps) {
  const period = formatPeriod(eventStartDate, eventEndDate);
  const ariaLabel = period
    ? `축제 행사 진행 (${period})`
    : '축제 행사 진행 중';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold ring-1 ring-inset',
        'bg-festival-surface text-festival-fg ring-festival/30',
        SIZE_CLASSES[size],
        className,
      )}
      aria-label={ariaLabel}
    >
      {/* 이모지는 시각 보조, 의미는 텍스트가 전달. aria-hidden으로 SR 노이즈 방지 */}
      <span aria-hidden="true" className="leading-none">
        🎉
      </span>
      <Sparkles aria-hidden="true" className={cn('shrink-0', ICON_SIZE[size])} />
      <span>축제{period ? ` (${period})` : ''}</span>
    </span>
  );
}

// 테스트 용도 export — 단위 테스트에서 사용
export { formatMonthDay, formatPeriod };
