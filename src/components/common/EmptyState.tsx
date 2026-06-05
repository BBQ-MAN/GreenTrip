// EmptyState — 빈 결과 + 대체 제안 CTA
// 참조: nextjs-ui-builder SKILL.md 로딩·빈 상태 가이드
import Link from 'next/link';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** 제목 (h2) — 짧고 명확하게 */
  title: string;
  /** 부가 설명 (선택) */
  description?: string;
  /** 좌측 상단 아이콘 (lucide). 미지정 시 Inbox */
  icon?: ReactNode;
  /** CTA 버튼 라벨 + 링크 (Next Link) */
  ctaLabel?: string;
  ctaHref?: string;
  /** 컨테이너 추가 클래스 */
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  ctaLabel,
  ctaHref,
  className,
}: EmptyStateProps) {
  return (
    <section
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-card p-8 text-center md:p-12',
        className
      )}
    >
      <div
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface text-brand"
      >
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div className="space-y-1">
        <h2 className="text-heading-sm text-foreground">{title}</h2>
        {description ? (
          <p className="text-body-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {ctaLabel && ctaHref ? (
        <Button asChild variant="default" size="sm">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </section>
  );
}
