// PageContainer — max-w + 패딩 통일
// Server Component (정적)
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  /** 콘텐츠 폭 — 기본 'default'(1280px), 'prose'는 본문 위주 페이지 */
  variant?: 'default' | 'prose';
  className?: string;
  as?: 'main' | 'div' | 'section';
}

export function PageContainer({
  children,
  variant = 'default',
  className,
  as: Tag = 'main',
}: PageContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-4 py-8 md:px-6 md:py-12',
        variant === 'prose' ? 'max-w-prose' : 'max-w-[1280px]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
