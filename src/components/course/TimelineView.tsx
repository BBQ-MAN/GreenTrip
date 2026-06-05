// TimelineView — 코스 방문 순서별 카드 세로 리스트 + 구간 연결선
// Server Component (정적 렌더 only)
// 참조: DEVELOPMENT_PLAN.md §7.4 (타임라인 뷰), nextjs-ui-builder SKILL.md
//
// 구조:
//   <ol role="list">
//     <li role="listitem">[Waypoint 카드]</li>
//     <div>다음 지점까지 X km · Y g CO₂ · 이동수단 아이콘</div>  ← 카드 사이 connector
//     ...
//   </ol>
// 모바일 1열, 좌측 vertical line으로 시각적 연결.
// WCAG AA: role/list+listitem, 이미지 alt, 색 + 텍스트 병기.

import Image from 'next/image';
import { Clock, MapPin } from 'lucide-react';
import type { Waypoint, TransportMode } from '@/types/course';
import { formatCarbon } from '@/lib/carbon/formatter';
import { cn } from '@/lib/utils';
import { CONTENT_TYPE } from '@/lib/tourapi/constants';
import { TransportBadge, MODE_LABEL } from './TransportBadge';
import { FestivalBadge } from './FestivalBadge';
import { PetBadge } from '@/components/spot/PetBadge';

interface TimelineViewProps {
  /** Prisma Waypoint 배열 (order ASC 정렬되어 있어야 함) */
  waypoints: Waypoint[];
  /** 전체 코스 이동수단 — 카드 사이 connector 라벨에 사용 */
  transportMode: TransportMode;
  /**
   * 반려동물 동반 코스 여부 (Week 8~9).
   * true이면 모든 waypoint 카드에 pet-friendly 시각 강조 + PetBadge.
   * (waypoint 자체에 isPetFriendly 미보존 → course.includePet boolean으로 일괄 분기)
   */
  includePet?: boolean;
  className?: string;
}

function formatStay(min: number | null | undefined): string {
  if (!min || !Number.isFinite(min) || min <= 0) return '체류시간 미정';
  if (min < 60) return `약 ${Math.round(min)}분 체류`;
  const hours = Math.floor(min / 60);
  const rest = Math.round(min % 60);
  return rest > 0
    ? `약 ${hours}시간 ${rest}분 체류`
    : `약 ${hours}시간 체류`;
}

function formatKm(km: number | null | undefined): string {
  if (km == null || !Number.isFinite(km)) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function TimelineView({
  waypoints,
  transportMode,
  includePet = false,
  className,
}: TimelineViewProps) {
  if (waypoints.length === 0) {
    return (
      <p className="text-body-sm text-muted-foreground">
        등록된 관광지가 없습니다.
      </p>
    );
  }

  return (
    <ol
      role="list"
      aria-label="코스 방문 순서별 타임라인"
      className={cn('relative flex flex-col gap-0', className)}
    >
      {waypoints.map((wp, index) => {
        const isLast = index === waypoints.length - 1;
        const hasConnector = !isLast && wp.distToNext != null;
        const isFestival = wp.contentType === CONTENT_TYPE.축제공연행사;
        // course.includePet=true이면 모든 waypoint가 pet-friendly 필터 통과 풀에서 선택됨.
        // → 모든 카드에 동일 시각 강조 (waypoint별 개별 메타 미보존).
        const showPetEmphasis = includePet;

        return (
          <li
            key={wp.id}
            role="listitem"
            className="relative flex flex-col"
            aria-label={`${index + 1}번째 방문지${isFestival ? ' (축제 행사)' : ''}${showPetEmphasis ? ' (반려동물 동반 가능)' : ''}: ${wp.title}`}
          >
            {/* 카드 — 축제/반려동물 surface + ring 강조. 동시 가능 시 축제 우선 + 반려동물은 PetBadge로 표현. */}
            <article
              className={cn(
                'relative flex gap-3 rounded-lg border bg-card p-4 shadow-sm md:gap-4 md:p-5',
                isFestival && 'bg-festival-surface/40 ring-1 ring-festival/30',
                !isFestival && showPetEmphasis && 'bg-pet-surface/40 ring-1 ring-pet/30',
              )}
            >
              {/* 순서 라벨 */}
              <div
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-transport-eco text-body-sm font-bold text-white md:h-9 md:w-9"
              >
                {index + 1}
              </div>

              {/* 본문 */}
              <div className="flex min-w-0 flex-1 gap-3">
                {/* 이미지 (있을 때만) */}
                {wp.imageUrl ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted md:h-20 md:w-20">
                    <Image
                      src={wp.imageUrl}
                      alt={`${wp.title} 사진`}
                      fill
                      sizes="(max-width: 768px) 64px, 80px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground md:h-20 md:w-20"
                  >
                    <MapPin className="h-6 w-6" />
                  </div>
                )}

                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="truncate text-body-md font-semibold text-foreground md:text-heading-sm">
                    {wp.title}
                  </h3>
                  {wp.address ? (
                    <p className="truncate text-body-sm text-muted-foreground">
                      <MapPin
                        aria-hidden="true"
                        className="mr-1 inline h-3.5 w-3.5"
                      />
                      {wp.address}
                    </p>
                  ) : null}
                  <p className="inline-flex items-center gap-1 text-caption text-muted-foreground">
                    <Clock aria-hidden="true" className="h-3 w-3" />
                    {formatStay(wp.stayMinutes)}
                  </p>
                  {/* 축제 강조 — 카드 내 마지막 line에 FestivalBadge.
                      Waypoint는 eventStart/End를 보유하지 않으므로 라벨만 표시. */}
                  {isFestival || showPetEmphasis ? (
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {isFestival ? <FestivalBadge size="sm" /> : null}
                      {showPetEmphasis ? <PetBadge size="sm" /> : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>

            {/* 카드 사이 connector (다음 지점까지) */}
            {hasConnector ? (
              <div
                className="flex items-stretch gap-3 py-2 md:gap-4 md:py-3"
                aria-label={`다음 지점까지: ${formatKm(wp.distToNext)}, ${formatCarbon(
                  wp.carbonToNext ?? 0,
                )}, 이동수단: ${MODE_LABEL[transportMode]}`}
              >
                {/* 좌측 vertical line — 순서 라벨 폭과 정렬 */}
                <div
                  aria-hidden="true"
                  className="flex w-8 justify-center md:w-9"
                >
                  <span className="block w-0.5 bg-border" />
                </div>

                {/* 우측 정보 — 거리·CO₂·이동수단 */}
                <div className="flex flex-1 flex-wrap items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-body-sm">
                  <span className="text-muted-foreground">다음 지점까지</span>
                  <span className="numeric font-semibold text-foreground">
                    {formatKm(wp.distToNext)}
                  </span>
                  <span aria-hidden="true" className="text-border">
                    ·
                  </span>
                  <span className="numeric font-semibold text-transport-eco">
                    {formatCarbon(wp.carbonToNext ?? 0)} CO₂
                  </span>
                  <span className="ml-auto">
                    <TransportBadge
                      mode={transportMode}
                      size="sm"
                      iconOnly={false}
                    />
                  </span>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
