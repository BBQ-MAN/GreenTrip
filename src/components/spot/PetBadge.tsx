// PetBadge — 반려동물 동반 가능 강조 뱃지 (시그니처 토큰: pet = brand.secondary teal)
// Server Component 호환 (인터랙션 없음). use client 미지정.
// 참조: _workspace/00_input/week8_request.md §B-1
//       src/styles/tokens.ts brand.secondary (#0E7490 teal)
//       src/components/course/FestivalBadge.tsx (Week 6~7 패턴 동일)
//
// WCAG AA:
//  - 이모지(🐾)만으로 정보 전달 X → "반려동물 동반" 한글 텍스트 병기
//  - 색 + 텍스트 + 아이콘 3중 (PawPrint)
//  - aria-label 명시 ("반려동물 동반" 또는 petInfo 요약 포함)
//  - pet.fg(#0E7490) on pet.surface(#CFFAFE cyan-100) → 대비비 4.79:1 AA 통과 (실측, reaudit N-5)
//
// 디자인 트레이드오프:
//  - pet.DEFAULT(#0E7490)은 transport.balance와 동일 hex이나, "반려동물" 의미와
//    "균형 이동수단" 의미를 CSS 클래스 수준에서 분리 (Week 6~7 festival/brand.accent 동일 패턴).
//  - contentType과 직교: 반려동물은 metadata, contentType 아님 (chkpet/PetInfo 보유로 판단).
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PetBadgeProps {
  /** detailPetTour2.petInfo 요약 텍스트 (있으면 aria-label에 앞 30자 포함) */
  petInfo?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PetBadgeProps['size']>, string> = {
  sm: 'gap-1 px-2 py-0.5 text-caption',
  md: 'gap-1.5 px-2.5 py-1 text-body-sm',
  lg: 'gap-2 px-3 py-1.5 text-body-md',
};

const ICON_SIZE: Record<NonNullable<PetBadgeProps['size']>, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

/**
 * petInfo 요약 (긴 텍스트 잘림). aria-label에 사용.
 * 30자 초과 시 "…" 추가.
 */
function summarize(petInfo: string | undefined): string {
  if (!petInfo) return '';
  const trimmed = petInfo.trim();
  if (trimmed.length <= 30) return trimmed;
  return `${trimmed.slice(0, 30)}…`;
}

export function PetBadge({ petInfo, size = 'md', className }: PetBadgeProps) {
  const summary = summarize(petInfo);
  const ariaLabel = summary
    ? `반려동물 동반 가능 (${summary})`
    : '반려동물 동반 가능';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold ring-1 ring-inset',
        'bg-pet-surface text-pet-fg ring-pet/30',
        SIZE_CLASSES[size],
        className,
      )}
      aria-label={ariaLabel}
    >
      {/* 이모지는 시각 보조, 의미는 텍스트가 전달. aria-hidden으로 SR 노이즈 방지 */}
      <span aria-hidden="true" className="leading-none">
        🐾
      </span>
      <PawPrint aria-hidden="true" className={cn('shrink-0', ICON_SIZE[size])} />
      <span>반려동물 동반</span>
    </span>
  );
}

// 테스트 용도 export
export { summarize };
