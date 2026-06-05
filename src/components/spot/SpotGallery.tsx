'use client';
// SpotGallery — 관광지 이미지 갤러리
// Client Component (썸네일 클릭으로 메인 이미지 교체, 키보드 ←/→ 탐색)
//
// Props 정합:
//  - images: detailImage2 결과 (originimgurl 우선)
//  - mainImage: detailCommon2의 firstimage fallback
//  - alt: 관광지 title (a11y)
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SpotImage } from '@/types/tour';
import { cn } from '@/lib/utils';

interface SpotGalleryProps {
  images: SpotImage[];
  mainImage?: string;
  alt: string;
  className?: string;
}

/**
 * 이미지 목록 정규화.
 * - detailImage2의 originimgurl을 우선
 * - 0건이면 mainImage(firstimage) 단일로 fallback
 * - 중복 URL 제거
 */
function buildImageList(images: SpotImage[], mainImage?: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const push = (url: string | undefined): void => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };
  // 갤러리가 비어있을 때 mainImage가 먼저 보이도록 prepend
  if (images.length === 0) push(mainImage);
  for (const img of images) push(img.originimgurl);
  // mainImage가 list에 없다면 처음에 추가
  if (images.length > 0 && mainImage && !seen.has(mainImage)) {
    urls.unshift(mainImage);
  }
  return urls;
}

export function SpotGallery({ images, mainImage, alt, className }: SpotGalleryProps) {
  const urls = useMemo(() => buildImageList(images, mainImage), [images, mainImage]);
  const [activeIdx, setActiveIdx] = useState(0);
  const total = urls.length;

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      setActiveIdx(((next % total) + total) % total);
    },
    [total]
  );

  const prev = useCallback(() => goTo(activeIdx - 1), [activeIdx, goTo]);
  const next = useCallback(() => goTo(activeIdx + 1), [activeIdx, goTo]);

  // 키보드 ←/→ 탐색
  useEffect(() => {
    if (total <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total, prev, next]);

  // Empty fallback
  if (total === 0) {
    return (
      <div
        role="img"
        aria-label={`${alt} (이미지 없음)`}
        className={cn(
          'flex aspect-tour w-full items-center justify-center rounded-lg bg-muted text-muted-foreground',
          className
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <ImageOff aria-hidden="true" className="h-10 w-10" />
          <span className="text-body-sm">제공 이미지가 없습니다</span>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label={`${alt} 이미지 갤러리`}
      className={cn('space-y-3', className)}
    >
      <div className="relative aspect-tour w-full overflow-hidden rounded-lg bg-muted">
        <Image
          key={urls[activeIdx]}
          src={urls[activeIdx]}
          alt={`${alt} 이미지 ${activeIdx + 1} / ${total}`}
          fill
          sizes="(max-width: 768px) 100vw, 1024px"
          priority={activeIdx === 0}
          className="object-cover"
        />
        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="이전 이미지"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-2 text-foreground shadow-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="다음 이미지"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-2 text-foreground shadow-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-foreground/70 px-2.5 py-1 text-caption text-background">
              {activeIdx + 1} / {total}
            </span>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <ul
          role="tablist"
          aria-label="썸네일"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {urls.map((url, i) => {
            const isActive = i === activeIdx;
            return (
              <li key={url} className="shrink-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${i + 1}번째 이미지로 이동`}
                  onClick={() => goTo(i)}
                  className={cn(
                    'relative block h-16 w-24 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-20 md:w-28',
                    isActive ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
                  )}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                    loading="lazy"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
