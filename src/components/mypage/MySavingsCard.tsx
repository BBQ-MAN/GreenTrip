// MySavingsCard — 본인 누적 탄소 절감 hero
// Server Component. aggregateUserSavings(userId) 결과 전달받는 형태로 분리.
// 참조: SavingsHistory.tsx (사이트 전체) 패턴 복제, 시그니처 2 강화.
import { Leaf, Sprout } from 'lucide-react';
import type { UserSavings } from '@/lib/carbon/aggregator';

interface MySavingsCardProps {
  savings: UserSavings;
}

export function MySavingsCard({ savings }: MySavingsCardProps) {
  return (
    <section
      className="rounded-lg border bg-card p-6 text-center"
      aria-label="내가 절감한 누적 탄소"
    >
      <p className="inline-flex items-center justify-center gap-1.5 text-caption text-muted-foreground">
        <Leaf aria-hidden="true" className="h-3.5 w-3.5 text-cert" />
        내가 지금까지 절감한 탄소
      </p>
      <p
        className="numeric mt-2 text-numeric-hero leading-none text-cert"
        aria-live="polite"
      >
        {savings.totalSavedKg.toLocaleString('ko-KR')}
        <span className="ml-1 align-baseline text-heading-md font-extrabold">
          kg
        </span>
      </p>
      <p className="mt-2 text-body-md text-foreground">CO₂를 절감했어요</p>
      <dl className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t pt-4 text-body-sm">
        <div className="flex items-center gap-1.5">
          <Sprout aria-hidden="true" className="h-4 w-4 text-cert" />
          <dt className="text-muted-foreground">소나무</dt>
          <dd className="numeric font-bold text-foreground">
            {savings.treeEq.toLocaleString('ko-KR')}그루
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="text-muted-foreground">생성 코스</dt>
          <dd className="numeric font-bold text-foreground">
            {savings.courseCount.toLocaleString('ko-KR')}건
          </dd>
        </div>
      </dl>
    </section>
  );
}
