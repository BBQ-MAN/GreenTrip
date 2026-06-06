// /explore — 큐레이션 ThemeCourse 그리드
// async Server Component. Prisma 직접 조회.
// 참조: _workspace/00_input/week12_request.md §D-3, DEVELOPMENT_PLAN §7.7
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ThemeCourseCard } from '@/components/explore/ThemeCourseCard';
import { EmptyState } from '@/components/explore/EmptyState';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '큐레이션 코스',
  description: '강원도 저탄소 여행 추천 테마 코스 — GreenTrip',
};

export default async function ExplorePage() {
  const themes = await prisma.themeCourse.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 py-6 md:py-8">
      <header className="space-y-2">
        <h1 className="text-display-sm font-extrabold tracking-tight text-foreground md:text-display-md">
          큐레이션 코스
        </h1>
        <p className="text-body-md text-muted-foreground">
          강원도 저탄소 여행 추천 테마 코스 — 대중교통·자전거·도보 중심.
        </p>
      </header>

      {themes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <ThemeCourseCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}
    </main>
  );
}
