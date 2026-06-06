// ThemeCourseCard — 큐레이션 ThemeCourse 카드 (/explore 그리드 item)
// Server Component. ThemeCourse Prisma model 그대로 받음.
import Image from 'next/image';
import { MapPin, Layers, Compass } from 'lucide-react';
import type { ThemeCourse } from '@prisma/client';
import { MODE_LABEL } from '@/components/course/TransportBadge';
import type { TransportMode } from '@/types/course';

interface ThemeCourseCardProps {
  theme: ThemeCourse;
}

function transportLabel(transport: string): string {
  // ThemeCourse.transport는 TransportMode 7종 외에 'transit' 같은 카테고리도 들어올 수 있다.
  // MODE_LABEL에 있으면 그대로 쓰고, 없으면 한글 카테고리 fallback.
  const asMode = transport as TransportMode;
  if (MODE_LABEL[asMode]) return MODE_LABEL[asMode];
  switch (transport) {
    case 'transit':
      return '대중교통';
    case 'active':
      return '자전거·도보';
    case 'car':
      return '자가용';
    default:
      return transport;
  }
}

export function ThemeCourseCard({ theme }: ThemeCourseCardProps) {
  const transport = transportLabel(theme.transport);
  const spotCount = theme.spotIds?.length ?? 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md focus-within:shadow-md">
      <div className="relative aspect-tour w-full overflow-hidden bg-muted">
        {theme.imageUrl ? (
          <Image
            src={theme.imageUrl}
            alt={theme.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-240 ease-standard group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-muted-foreground"
          >
            <Compass className="h-10 w-10" />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-brand-surface px-2.5 py-1 text-caption font-semibold text-brand">
          {theme.region}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-background/90 px-2.5 py-1 text-caption font-medium text-foreground backdrop-blur">
          {theme.difficulty}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          <h3 className="line-clamp-2 text-heading-sm font-extrabold leading-snug text-foreground">
            {theme.title}
          </h3>
          <p className="line-clamp-3 text-body-sm text-muted-foreground">
            {theme.description}
          </p>
        </div>

        <dl className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 text-caption text-muted-foreground">
          <div className="inline-flex items-center gap-1">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
            <dt className="sr-only">이동수단</dt>
            <dd className="font-medium text-foreground">{transport}</dd>
          </div>
          {spotCount > 0 ? (
            <>
              <span aria-hidden="true">·</span>
              <div className="inline-flex items-center gap-1">
                <Layers aria-hidden="true" className="h-3.5 w-3.5" />
                <dt className="sr-only">관광지 수</dt>
                <dd>
                  관광지{' '}
                  <span className="numeric font-medium text-foreground">
                    {spotCount}
                  </span>
                  곳
                </dd>
              </div>
            </>
          ) : null}
        </dl>
      </div>
    </article>
  );
}
