'use client';
// PlanResultClient — /plan/result Client 부분
// Zustand store에서 lastResult를 읽어 3안 비교 카드 렌더.
// store 비어있으면(직접 URL 접근·새로고침 등) EmptyState로 /plan 유도.
//
// 참조: DEVELOPMENT_PLAN.md §7.3, 시그니처 1·3 본격 발현 위치
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { CourseCompareCard } from '@/components/course/CourseCompareCard';
import { BeforeAfterCompare } from '@/components/course/BeforeAfterCompare';
import { useCourseStore } from '@/stores/courseStore';
import { GANGWON } from '@/lib/tourapi/constants';
import type { CourseCategory } from '@/types/course';

function sigunguName(code?: number): string {
  if (!code) return '강원도 전역';
  const entry = Object.entries(GANGWON.sigungu).find(
    ([, c]) => c === code,
  );
  return entry ? entry[0] : `시군구 ${code}`;
}

export function PlanResultClient() {
  const router = useRouter();
  const lastResult = useCourseStore((s) => s.lastResult);
  const lastRequest = useCourseStore((s) => s.lastRequest);
  const [hydrated, setHydrated] = useState(false);

  // sessionStorage hydration — store가 비어있는 상태로 첫 렌더되는 SSR 미스매치 방지
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="grid gap-4 md:grid-cols-3 md:gap-6" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-lg border bg-card motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  if (!lastResult || !lastRequest) {
    return (
      <EmptyState
        title="아직 생성된 코스가 없어요"
        description="먼저 지역과 기간을 선택해 코스를 만들어보세요."
        ctaLabel="코스 만들기"
        ctaHref="/plan"
      />
    );
  }

  const { car, transit, active, recommended } = lastResult;
  const baselineCO2g = car.totalCO2g;

  // 선택된 카테고리 추적 (Week 5 /course/[id] 라우팅 전 임시 표시)
  function handleSelect(cat: CourseCategory) {
    // Week 5에서 /course/[id]로 교체. 현재는 query state로 표시만.
    router.push(`/plan/result?selected=${cat}`);
  }

  return (
    <>
      {/* 요약 헤더 */}
      <header className="mb-8 space-y-3">
        <p className="inline-flex items-center gap-1.5 text-body-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="h-4 w-4" />
          <span>{sigunguName(lastRequest.sigunguCode)}</span>
          <span aria-hidden="true">·</span>
          <span>{lastRequest.duration ?? '기간 미지정'}</span>
        </p>
        <h1 className="text-display-md text-foreground md:text-display-lg">
          코스 3안 비교
        </h1>
        <p className="text-body-md text-muted-foreground">
          자가용 기준 대비 가장 적합한 이동수단을 추천드려요.
        </p>
      </header>

      {/* Before/After 강조 (선택된 추천안 vs 자가용) */}
      {recommended !== 'car' ? (
        <div className="mb-8">
          <BeforeAfterCompare
            baselineG={baselineCO2g}
            optimizedG={
              recommended === 'transit'
                ? transit.totalCO2g
                : active?.totalCO2g ?? transit.totalCO2g
            }
            mode={
              recommended === 'transit'
                ? transit.mode
                : active?.mode ?? transit.mode
            }
          />
        </div>
      ) : null}

      {/* 3안 비교 카드 — 모바일 1열 → md 3열 */}
      <section
        aria-label="코스 3안 비교"
        className="grid gap-4 md:grid-cols-3 md:gap-6"
      >
        <CourseCompareCard
          option={car}
          baselineCO2g={baselineCO2g}
          isRecommended={recommended === 'car'}
          onSelect={() => handleSelect('car')}
        />
        <CourseCompareCard
          option={transit}
          baselineCO2g={baselineCO2g}
          isRecommended={recommended === 'transit'}
          onSelect={() => handleSelect('transit')}
        />
        <CourseCompareCard
          option={active}
          baselineCO2g={baselineCO2g}
          isRecommended={recommended === 'active'}
          fallbackCategory="active"
          onSelect={active ? () => handleSelect('active') : undefined}
        />
      </section>

      {/* 카카오맵 placeholder — Week 5 RouteOverlay 통합 위치 */}
      <section
        aria-labelledby="map-title"
        className="mt-10 rounded-lg border bg-card p-5 md:p-6"
      >
        <h2 id="map-title" className="text-heading-sm text-foreground">
          지도에서 경로 보기
        </h2>
        <p className="mt-1 text-body-sm text-muted-foreground">
          3안 경로를 색상으로 구분해 지도에 표시해 드립니다.
        </p>
        <div
          role="img"
          aria-label="지도 영역 (Week 5에 통합 예정)"
          className="mt-4 flex aspect-map w-full items-center justify-center rounded-md border-2 border-dashed bg-muted/40 text-center"
        >
          <div className="space-y-2 px-4">
            <p className="text-body-md font-medium text-foreground">
              Kakao Maps — RouteOverlay
            </p>
            <p className="text-caption text-muted-foreground">
              Week 5 map-integrator 통합 예정 위치
              <br />
              (3안 경로 색상 구분: 주황·청록·초록)
            </p>
          </div>
        </div>
      </section>

      {/* 하단 액션 */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline">
          <Link href="/plan">
            <ChevronLeft aria-hidden="true" className="mr-1 h-4 w-4" />
            조건 다시 설정
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </>
  );
}
