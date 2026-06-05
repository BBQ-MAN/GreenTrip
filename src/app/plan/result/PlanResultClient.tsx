'use client';
// PlanResultClient — /plan/result Client 부분
// Week 5 업데이트:
//   1. handleSelect → POST /api/course → router.push('/course/{id}') 본격 라우팅
//   2. <section aria-labelledby="map-title"> placeholder → KakaoMap + 3안 RouteOverlay 통합
//   3. CourseCompareCard.isPending 으로 저장 중 UX
//
// 참조: DEVELOPMENT_PLAN.md §7.3, _workspace/00_input/week5_request.md §C·§G
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ChevronLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { CourseCompareCard } from '@/components/course/CourseCompareCard';
import { BeforeAfterCompare } from '@/components/course/BeforeAfterCompare';
import { FestivalBadge } from '@/components/course/FestivalBadge';
import { RouteOverlay } from '@/components/map/RouteOverlay';
import { SpotMarker } from '@/components/map/SpotMarker';
import { useCourseStore } from '@/stores/courseStore';
import { GANGWON } from '@/lib/tourapi/constants';
import type { CourseCategory } from '@/types/course';

// KakaoMap은 Client + window.kakao 의존 → SSR 비활성화
const KakaoMap = dynamic(
  () => import('@/components/map/KakaoMap').then((m) => m.KakaoMap),
  {
    ssr: false,
    loading: () => (
      <LoadingSkeleton
        variant="image"
        className="h-[300px] md:h-[400px]"
        ariaLabel="지도를 불러오는 중"
      />
    ),
  },
);

// 강원 중심 좌표 (춘천 시청) — 좌표 누락 시 fallback
const GANGWON_CENTER = { lat: 37.8813, lng: 127.7298 };

function sigunguName(code?: number): string {
  if (!code) return '강원도 전역';
  const entry = Object.entries(GANGWON.sigungu).find(([, c]) => c === code);
  return entry ? entry[0] : `시군구 ${code}`;
}

export function PlanResultClient() {
  const router = useRouter();
  const lastResult = useCourseStore((s) => s.lastResult);
  const lastRequest = useCourseStore((s) => s.lastRequest);
  const [hydrated, setHydrated] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<CourseCategory | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

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
  const recommendedOption =
    recommended === 'car' ? car : recommended === 'transit' ? transit : active;

  // 지도 중심: 추천안 첫 spot 좌표 (없으면 car 첫 spot, 그것도 없으면 강원 중심)
  const firstSpot =
    recommendedOption?.waypoints[0] ?? car.waypoints[0] ?? null;
  const mapCenter = firstSpot
    ? { lat: firstSpot.lat, lng: firstSpot.lng }
    : GANGWON_CENTER;

  // 카드 선택 → POST /api/course → /course/{newId} 진입
  async function handleSelect(category: CourseCategory) {
    if (!lastResult || !lastRequest) return;
    const option =
      category === 'car'
        ? lastResult.car
        : category === 'transit'
          ? lastResult.transit
          : lastResult.active;
    if (!option) return;

    setPendingCategory(category);
    setSaveError(null);

    try {
      const res = await fetch('/api/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          option,
          baselineCO2g: lastResult.car.totalCO2g,
          region: '강원도',
          areaCode: lastRequest.areaCode ?? GANGWON.areaCode,
          duration: lastRequest.duration,
          includeFestival: lastRequest.includeFestival,
          includePet: lastRequest.includePet,
        }),
      });

      if (!res.ok) {
        let body: { message?: string; error?: string } = {};
        try {
          body = await res.json();
        } catch {
          /* empty body */
        }
        throw new Error(
          body.message ?? body.error ?? `저장 실패 (HTTP ${res.status})`,
        );
      }

      const { id } = (await res.json()) as { id: string };
      router.push(`/course/${id}`);
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : '코스 저장 중 오류가 발생했어요.',
      );
      setPendingCategory(null);
    }
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
        {/* 축제 ON 요청 시 mini 헤더 (단순 안내, 검증 없음) */}
        {lastRequest.includeFestival ? (
          <div className="inline-flex items-center gap-2">
            <FestivalBadge size="sm" />
            <span className="text-body-sm text-muted-foreground">
              행사 기간 코스를 만들었습니다.
            </span>
          </div>
        ) : null}
      </header>

      {/* Before/After 강조 (선택된 추천안 vs 자가용) */}
      {recommended !== 'car' ? (
        <div className="mb-8">
          <BeforeAfterCompare
            baselineG={baselineCO2g}
            optimizedG={
              recommended === 'transit'
                ? transit.totalCO2g
                : (active?.totalCO2g ?? transit.totalCO2g)
            }
            mode={
              recommended === 'transit'
                ? transit.mode
                : (active?.mode ?? transit.mode)
            }
          />
        </div>
      ) : null}

      {/* 저장 에러 표시 */}
      {saveError ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-body-sm text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{saveError}</span>
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
          isPending={pendingCategory === 'car'}
          onSelect={() => handleSelect('car')}
        />
        <CourseCompareCard
          option={transit}
          baselineCO2g={baselineCO2g}
          isRecommended={recommended === 'transit'}
          isPending={pendingCategory === 'transit'}
          onSelect={() => handleSelect('transit')}
        />
        <CourseCompareCard
          option={active}
          baselineCO2g={baselineCO2g}
          isRecommended={recommended === 'active'}
          isPending={pendingCategory === 'active'}
          fallbackCategory="active"
          onSelect={active ? () => handleSelect('active') : undefined}
        />
      </section>

      {/* 카카오맵 — 3안 RouteOverlay (추천안 highlight) + 추천안 SpotMarker */}
      <section
        aria-labelledby="map-title"
        className="mt-10 space-y-3"
      >
        <div className="space-y-1">
          <h2 id="map-title" className="text-heading-sm text-foreground">
            지도에서 경로 보기
          </h2>
          <p className="text-body-sm text-muted-foreground">
            3안 경로를 색상으로 구분해 표시합니다. 추천안은 굵게 강조됩니다.
          </p>
        </div>
        <KakaoMap
          center={mapCenter}
          level={9}
          className="h-[300px] w-full overflow-hidden rounded-lg border md:h-[400px]"
        >
          <RouteOverlay
            waypoints={car.waypoints.map((wp) => ({
              lat: wp.lat,
              lng: wp.lng,
              title: wp.title,
            }))}
            category="car"
            highlight={recommended === 'car'}
          />
          <RouteOverlay
            waypoints={transit.waypoints.map((wp) => ({
              lat: wp.lat,
              lng: wp.lng,
              title: wp.title,
            }))}
            category="transit"
            highlight={recommended === 'transit'}
          />
          {active ? (
            <RouteOverlay
              waypoints={active.waypoints.map((wp) => ({
                lat: wp.lat,
                lng: wp.lng,
                title: wp.title,
              }))}
              category="active"
              highlight={recommended === 'active'}
            />
          ) : null}

          {/* 추천안 spot만 마커 (혼잡 회피) */}
          {recommendedOption?.waypoints.map((wp, i) => (
            <SpotMarker
              key={wp.contentId}
              lat={wp.lat}
              lng={wp.lng}
              title={wp.title}
              order={i + 1}
              imageUrl={wp.imageUrl}
              contentId={wp.contentId}
              contentTypeId={wp.contentType}
            />
          ))}
        </KakaoMap>
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
