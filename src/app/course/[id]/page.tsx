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
import { ChevronLeft, MapPin } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { TimelineView } from '@/components/course/TimelineView';
import { TransportBadge, categoryFromMode } from '@/components/course/TransportBadge';
import { BeforeAfterCompare } from '@/components/course/BeforeAfterCompare';
import { FestivalBadge } from '@/components/course/FestivalBadge';
import { PetBadge } from '@/components/spot/PetBadge';
import { ReportCTA } from '@/components/report/ReportCTA';
import { CONTENT_TYPE } from '@/lib/tourapi/constants';
import { CourseMap } from './CourseMap';
import type { TransportMode } from '@/types/course';

export const dynamic = 'force-dynamic';

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

  // 축제 강조 (Week 6~7): course.includeFestival=true 이고 waypoints 중 contentType=15 존재
  const festivalWaypoints = course.waypoints.filter(
    (wp) => wp.contentType === CONTENT_TYPE.축제공연행사,
  );
  const hasFestival = course.includeFestival && festivalWaypoints.length > 0;
  const festivalName = festivalWaypoints[0]?.title;

  // 반려동물 강조 (Week 8~9): course.includePet=true이면 펫프렌들리 풀에서 선별된 코스.
  // waypoint별 isPetFriendly 메타는 미보존이므로 boolean 단일 분기.
  const hasPetCourse = course.includePet === true;
  const petSpotCount = course.waypoints.length;

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

        {/* 축제 강조 배너 — includeFestival ON + 실제 contentType=15 waypoint 존재 시 */}
        {hasFestival ? (
          <div
            className="flex flex-wrap items-center gap-3 rounded-lg border border-festival/30 bg-festival-surface/50 p-3 md:p-4"
            role="region"
            aria-label="행사 기간 포함 코스 안내"
          >
            <FestivalBadge size="md" />
            <p className="text-body-sm text-foreground md:text-body-md">
              <span className="font-semibold">{festivalName}</span>
              {festivalWaypoints.length > 1 ? (
                <span className="text-muted-foreground">
                  {' '}
                  외 {festivalWaypoints.length - 1}건
                </span>
              ) : null}
              <span className="text-muted-foreground">{' '}행사 기간 포함 코스</span>
            </p>
          </div>
        ) : null}

        {/* 반려동물 강조 배너 — course.includePet ON (Week 8~9). 축제와 동시 표시 가능. */}
        {hasPetCourse ? (
          <div
            className="flex flex-wrap items-center gap-3 rounded-lg border border-pet/30 bg-pet-surface/50 p-3 md:p-4"
            role="region"
            aria-label="반려동물 동반 코스 안내"
          >
            <PetBadge size="md" />
            <p className="text-body-sm text-foreground md:text-body-md">
              <span className="font-semibold text-pet">반려동물 동반 코스</span>
              <span className="text-muted-foreground">
                {' '}— 펫프렌들리 장소 {petSpotCount}곳만 선별
              </span>
            </p>
          </div>
        ) : null}

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
          includePet={hasPetCourse}
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
          includePet={hasPetCourse}
        />
      </section>

      {/* 하단 CTA — 시그니처 2 본격 (Phase 2 W10~11):
          ReportCTA = POST /api/report/generate → router.push(`/report/{reportId}`) */}
      <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <ReportCTA courseId={course.id} />
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
