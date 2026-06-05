// LoadingSkeleton — Tailwind animate-pulse 기반 placeholder
// 참조: shadcn/ui Skeleton 패턴 (별도 패키지 없이 div + animate-pulse)
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  /** 라인 수 (기본 3) */
  lines?: number;
  /** 단일 라인 높이 클래스 (기본 h-4) */
  height?: string;
  /** 컨테이너 추가 클래스 */
  className?: string;
  /** 형태: 'lines' (텍스트 라인) | 'card' (카드형) | 'image' (이미지 블록) */
  variant?: 'lines' | 'card' | 'image';
  /** 접근성: 로딩 상태에 대한 aria-label (기본 '불러오는 중') */
  ariaLabel?: string;
}

/**
 * 단일 Skeleton 블록.
 * 다양한 형태(라인/카드/이미지)를 지원하며, prefers-reduced-motion을 자동 존중.
 */
export function LoadingSkeleton({
  lines = 3,
  height = 'h-4',
  className,
  variant = 'lines',
  ariaLabel = '불러오는 중',
}: LoadingSkeletonProps) {
  if (variant === 'image') {
    return (
      <div
        role="status"
        aria-label={ariaLabel}
        aria-busy="true"
        className={cn(
          'aspect-tour w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none',
          className
        )}
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        role="status"
        aria-label={ariaLabel}
        aria-busy="true"
        className={cn(
          'space-y-4 rounded-lg border bg-card p-6',
          className
        )}
      >
        <div className="aspect-tour w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        <div className="space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>
        <span className="sr-only">{ariaLabel}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
      className={cn('flex flex-col gap-3', className)}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded bg-muted motion-reduce:animate-none',
            height,
            // 마지막 라인은 짧게
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}
