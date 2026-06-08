// /not-found — 글로벌 404 페이지 (App Router 컨벤션)
// Server Component. Layout(Header/Footer)을 그대로 받음.
//
// 시그니처 2 깔때기 유지 — 막다른 길에서 코스 생성/탐색으로 유도.
import Link from 'next/link';
import type { Metadata } from 'next';
import { Compass, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <PageContainer className="flex flex-col items-center text-center">
      <span
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-surface text-brand"
      >
        <Compass className="h-6 w-6" />
      </span>
      <p className="numeric mt-6 text-numeric-hero leading-none text-brand">
        404
      </p>
      <h1 className="mt-4 text-display-sm font-extrabold tracking-tight text-foreground md:text-display-md">
        길을 잃은 것 같아요
      </h1>
      <p className="mt-3 max-w-md text-body-md text-muted-foreground">
        요청하신 페이지를 찾을 수 없습니다. URL이 정확한지 확인하거나
        아래에서 다른 경로로 이동해 보세요.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/plan" aria-label="코스 만들기 페이지로 이동">
            코스 만들기
            <ArrowRight aria-hidden="true" className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/explore">큐레이션 코스 보기</Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
