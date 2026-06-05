'use client';
// CourseMap — /course/[id] 의 지도 영역 Client island
// 참조: Next.js 14 — next/dynamic({ ssr: false })는 Client Component 안에서만 허용.
//      RSC인 page.tsx에서 dynamic({ ssr: false })를 직접 사용하면 build/runtime 에러.
//
// page.tsx가 prisma 조회 결과의 좌표만 추출해서 prop으로 전달 → 본 컴포넌트가 KakaoMap을 dynamic import.

import dynamic from 'next/dynamic';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { RouteOverlay } from '@/components/map/RouteOverlay';
import { SpotMarker } from '@/components/map/SpotMarker';
import type { CourseCategory } from '@/types/course';

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

export interface CourseMapWaypoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  imageUrl?: string | null;
  contentId: string;
  contentType: number;
}

interface CourseMapProps {
  waypoints: CourseMapWaypoint[];
  category: CourseCategory;
  center: { lat: number; lng: number };
  /**
   * 반려동물 동반 코스 여부 (Week 8~9).
   * true이면 모든 SpotMarker InfoWindow에 "🐾 반려동물 동반" 리본 표시.
   */
  includePet?: boolean;
}

export function CourseMap({
  waypoints,
  category,
  center,
  includePet = false,
}: CourseMapProps) {
  return (
    <KakaoMap
      center={center}
      level={9}
      className="h-[300px] w-full overflow-hidden rounded-lg border md:h-[400px]"
    >
      <RouteOverlay
        waypoints={waypoints.map((wp) => ({
          lat: wp.lat,
          lng: wp.lng,
          title: wp.title,
        }))}
        category={category}
        highlight
      />
      {waypoints.map((wp, index) => (
        <SpotMarker
          key={wp.id}
          lat={wp.lat}
          lng={wp.lng}
          title={wp.title}
          order={index + 1}
          imageUrl={wp.imageUrl ?? undefined}
          contentId={wp.contentId}
          contentTypeId={wp.contentType}
          isPetFriendly={includePet}
        />
      ))}
    </KakaoMap>
  );
}
