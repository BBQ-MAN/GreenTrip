// SpotCard — 관광지 카드 (검색·리스트·근처 결과 공용)
// Server Component (인터랙션 없음, Link만 사용)
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { SpotItem } from '@/types/tour';
import { cn } from '@/lib/utils';
import { CONTENT_TYPE_LABEL } from '@/lib/tourapi/categories';

interface SpotCardProps {
  spot: SpotItem;
  /** 거리 표시 옵션 (locationBased 응답일 때 dist 사용) */
  showDistance?: boolean;
  /** 카드 외곽 클래스 오버라이드 */
  className?: string;
}

function formatDistance(meters?: number): string | null {
  if (typeof meters !== 'number' || Number.isNaN(meters)) return null;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function SpotCard({ spot, showDistance = false, className }: SpotCardProps) {
  const typeLabel = CONTENT_TYPE_LABEL[spot.contenttypeid] ?? '기타';
  const distance = showDistance ? formatDistance(spot.dist) : null;
  const href = `/spot/${spot.contentid}?contentTypeId=${spot.contenttypeid}`;
  const fullAddress = [spot.addr1, spot.addr2].filter(Boolean).join(' ').trim();
  const image = spot.firstimage || spot.firstimage2;

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md focus-within:shadow-md',
        className
      )}
    >
      <Link
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`${spot.title} 상세 보기`}
      >
        <div className="relative aspect-tour w-full overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={spot.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-240 ease-standard group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center text-muted-foreground"
            >
              <MapPin className="h-8 w-8" />
            </div>
          )}
          <span
            className="absolute left-3 top-3 inline-flex items-center rounded-full bg-brand-surface px-2.5 py-1 text-caption text-brand"
          >
            {typeLabel}
          </span>
        </div>

        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 text-heading-sm text-foreground">
            {spot.title}
          </h3>
          {fullAddress ? (
            <p className="flex items-start gap-1.5 text-body-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="line-clamp-2">{fullAddress}</span>
            </p>
          ) : null}
          {distance ? (
            <p className="text-caption text-brand">현재 위치로부터 {distance}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

// CONTENT_TYPE_LABEL은 @/lib/tourapi/categories 에서 import 하세요 (단일 진원지).
export { CONTENT_TYPE_LABEL };
