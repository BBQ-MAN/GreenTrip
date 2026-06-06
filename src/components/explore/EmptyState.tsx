// EmptyState — /explore 페이지에서 ThemeCourse 시드가 없을 때 안내.
// Server Component (정적 안내 + CTA Link만).
import Link from 'next/link';
import { Compass, Sparkles } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 p-10 text-center">
      <span
        aria-hidden="true"
        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface text-brand"
      >
        <Compass className="h-6 w-6" />
      </span>
      <h2 className="text-heading-sm font-extrabold text-foreground">
        큐레이션 코스 준비 중
      </h2>
      <p className="mt-2 text-body-md text-muted-foreground">
        강원도 저탄소 테마 코스를 곧 만나보실 수 있어요.
        <br className="hidden sm:inline" />
        지금 바로 나만의 코스를 직접 만들어 보세요.
      </p>
      <Link
        href="/plan"
        className="mt-4 inline-flex items-center gap-1 rounded-md bg-brand px-4 py-2 text-body-sm font-semibold text-white hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Sparkles aria-hidden="true" className="h-4 w-4" />내 코스 만들기
      </Link>
    </div>
  );
}
