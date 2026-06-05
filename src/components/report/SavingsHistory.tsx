// SavingsHistory — 사이트 전체 누적 절감 KPI
// async Server Component (Prisma 직접 호출).
// 참조: _workspace/00_input/week10_request.md §C-5, STRATEGY.md 시그니처 2 (비로그인 100% 깔때기)
//
// "지금까지 GreenTrip 사용자들이 N kg 절감했어요" — 사용자 동기 부여 + KPI 가시화.
// Route Handler / RSC 안에서만 호출 (Prisma 의존).
import { Leaf } from 'lucide-react';
import { aggregateSiteSavings } from '@/lib/carbon/aggregator';

export async function SavingsHistory() {
  const stats = await aggregateSiteSavings();

  return (
    <section
      className="rounded-lg border bg-card p-6 text-center"
      aria-label="GreenTrip 사용자 전체 누적 탄소 절감량"
    >
      <p className="inline-flex items-center justify-center gap-1.5 text-caption text-muted-foreground">
        <Leaf aria-hidden="true" className="h-3.5 w-3.5 text-cert" />
        GreenTrip 사용자들이 지금까지 함께
      </p>
      <p
        className="numeric mt-2 text-numeric-hero leading-none text-cert"
        aria-live="polite"
      >
        {stats.totalSavedKg.toLocaleString('ko-KR')}
        <span className="ml-1 text-heading-md font-extrabold align-baseline">
          kg
        </span>
      </p>
      <p className="mt-2 text-body-md text-foreground">CO₂를 절감했어요</p>
      <p className="mt-3 text-caption text-muted-foreground">
        {stats.courseCount.toLocaleString('ko-KR')}개 코스 ·{' '}
        {stats.reportCount.toLocaleString('ko-KR')}건 인증
      </p>
    </section>
  );
}
