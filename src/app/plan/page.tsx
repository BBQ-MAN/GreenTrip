// /plan — 코스 옵션 입력 페이지 (Week 4)
// Server Component (RSC). 폼만 Client (CourseOptionForm).
// 참조: DEVELOPMENT_PLAN.md §7.2, _workspace/00_input/week4_request.md §A-2
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { CourseOptionForm } from '@/components/course/CourseOptionForm';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata: Metadata = {
  title: '코스 만들기',
  description:
    '지역·기간·테마를 선택하면 이동수단별 3가지 저탄소 코스를 자동 생성합니다.',
};

export default function PlanPage() {
  return (
    <PageContainer className="py-6 md:py-10">
      {/* 뒤로가기 + 빵 부스러기 */}
      <nav aria-label="페이지 경로" className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-body-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          홈으로
        </Link>
      </nav>

      <header className="mb-8 max-w-2xl">
        <h1 className="text-display-md text-foreground md:text-display-lg">
          코스 만들기
        </h1>
        <p className="mt-3 text-body-lg text-muted-foreground">
          지역과 기간, 테마를 선택하면{' '}
          <span className="font-semibold text-foreground">자가용·대중교통·자전거</span>{' '}
          3가지 이동수단별 코스를 동시에 비교해 드려요.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <CourseOptionForm />
        </div>

        {/* 가이드 패널 (데스크탑 우측) */}
        <aside
          aria-label="사용 가이드"
          className="hidden h-fit space-y-4 rounded-lg border bg-card p-5 lg:block"
        >
          <h2 className="text-heading-sm text-foreground">한눈에 알아두기</h2>
          <ul className="space-y-3 text-body-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-transport-fast" />
              <span>
                <strong className="text-foreground">속도</strong> — 자가용 기반 최단
                경로. CO₂가 가장 높습니다.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-transport-balance" />
              <span>
                <strong className="text-foreground">균형</strong> — 대중교통 가정. 시간은
                비슷하지만 탄소 1/3 수준.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-transport-eco" />
              <span>
                <strong className="text-foreground">저탄소</strong> — 자전거·도보 10km
                반경. 가능할 때만 표시됩니다.
              </span>
            </li>
          </ul>
          <p className="border-t pt-3 text-caption text-muted-foreground">
            코스 생성은 한국관광공사 TourAPI 14종 데이터를 사용합니다.
          </p>
        </aside>
      </div>
    </PageContainer>
  );
}
