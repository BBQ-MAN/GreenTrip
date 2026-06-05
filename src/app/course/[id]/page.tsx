// /course/[id] — 저장된 코스 상세 페이지
// 참조: DEVELOPMENT_PLAN.md §7.4, _workspace/00_input/week5_request.md §C
//
// 구성 (모바일 퍼스트):
//   [헤더]   코스 제목 + TransportBadge + 거리 + BeforeAfterCompare(절감)
//   [지도]   KakaoMap (dynamic ssr:false) + RouteOverlay + SpotMarker × N
//   [타임라인] TimelineView (waypoints + connector)
//   [CTA]    "탄소 리포트 보기" → /report/[id] (Week 10~11 본격)
//            "다시 만들기" → /plan
// 데이터:  RSC가 직접 prisma 조회 (Server Component, fetch 없이 안전).
// 404:     notFound() → not-found.tsx (EmptyState + /plan CTA)

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, MapPin, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { TimelineView } from '@/components/course/TimelineView';
import { TransportBadge, categoryFromMode } from '@/components/course/TransportBadge';
import { BeforeAfterCompare } from '@/components/course/BeforeAfterCompare';
import { CourseMap } from './CourseMap';
import type { TransportMode } from '@/types/course';

// 강원 중심 좌표 (춘천 시청) — 좌표 누락 시 fallback
const GANGWON_CENTER = { lat: 37.8813, lng: 127.7298 };

interface CourseDetailPageProps {
  params: { id: string };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { id } = params;

  // RSC에서 직접 Prisma 조회 — fetch 우회로 hydration overhead 최소화
  const course = await prisma.course.findUnique({
    where: { id },
    include: { waypoints: { orderBy: { order: 'asc' } } },
  });

  if (!course) {
    notFound();
  }

  const transportMode = course.transportMode as TransportMode;
  const category = categoryFromMode(transportMode);

  // 지도 중심: 첫 waypoint 좌표 (없으면 강원 중심)
  const firstWp = course.waypoints[0];
  const mapCenter = firstWp
    ? { lat: firstWp.lat, lng: firstWp.lng }
    : GANGWON_CENTER;

  return (
    <main className="container max-w-5xl py-6 md:py-10">
      {/* 헤더 */}
      <header className="mb-6 space-y-4 md:mb-8">
        <p className="inline-flex items-center gap-1.5 text-body-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="h-4 w-4" />
          <span>{course.region}</span>
          {course.duration ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{course.duration}</span>
            </>
          ) : null}
        </p>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-display-sm text-foreground md:text-display-md">
            {course.title}
          </h1>
          <TransportBadge mode={transportMode} category={category} size="md" />
        </div>

        {/* 요약 지표 */}
        <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-card p-4 md:grid-cols-4 md:p-5">
          <div>
            <dt className="text-caption text-muted-foreground">총 거리</dt>
            <dd className="numeric mt-0.5 text-heading-sm font-semibold text-foreground">
              {course.totalDistanceKm.toFixed(1)} km
            </dd>
          </div>
          <div>
            <dt className="text-caption text-muted-foreground">총 탄소</dt>
            <dd className="numeric mt-0.5 text-heading-sm font-semibold text-foreground">
              {(course.totalCarbonG / 1000).toFixed(1)} kg
            </dd>
          </div>
          <div>
            <dt className="text-caption text-muted-foreground">자가용 기준</dt>
            <dd className="numeric mt-0.5 text-heading-sm font-semibold text-muted-foreground line-through">
              {(course.baselineCarbonG / 1000).toFixed(1)} kg
            </dd>
          </div>
          <div>
            <dt className="text-caption text-muted-foreground">절감량</dt>
            <dd className="numeric mt-0.5 text-heading-sm font-extrabold text-transport-eco">
              −{(course.savedCarbonG / 1000).toFixed(1)} kg
            </dd>
          </div>
        </dl>

        {/* Before/After (비-자가용일 때만) */}
        {transportMode !== 'car' && course.savedCarbonG > 0 ? (
          <BeforeAfterCompare
            baselineG={course.baselineCarbonG}
            optimizedG={course.totalCarbonG}
            mode={transportMode}
          />
        ) : null}
      </header>

      {/* 지도 섹션 */}
      <section aria-labelledby="course-map-title" className="mb-8 space-y-3">
        <h2
          id="course-map-title"
          className="text-heading-sm text-foreground md:text-heading-md"
        >
          지도에서 경로 보기
        </h2>
        <CourseMap
          waypoints={course.waypoints.map((wp) => ({
            id: wp.id,
            lat: wp.lat,
            lng: wp.lng,
            title: wp.title,
            imageUrl: wp.imageUrl,
            contentId: wp.contentId,
            contentType: wp.contentType,
          }))}
          category={category}
          center={mapCenter}
        />
      </section>

      {/* 타임라인 섹션 */}
      <section aria-labelledby="course-timeline-title" className="mb-8 space-y-3">
        <h2
          id="course-timeline-title"
          className="text-heading-sm text-foreground md:text-heading-md"
        >
          여행 일정
        </h2>
        <TimelineView
          waypoints={course.waypoints}
          transportMode={transportMode}
        />
      </section>

      {/* 하단 CTA */}
      <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="default">
          <Link href={`/report/${course.id}`}>
            <Sparkles aria-hidden="true" className="mr-1.5 h-4 w-4" />
            탄소 리포트 보기
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/plan">
            <ChevronLeft aria-hidden="true" className="mr-1 h-4 w-4" />
            다시 만들기
          </Link>
        </Button>
      </div>
    </main>
  );
}
