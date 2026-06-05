// /spot/[contentId] — 관광지 상세 페이지 (Server Component / RSC)
// 참조: DEVELOPMENT_PLAN.md §7, _workspace/00_input/week2_request.md (B)
//
// 데이터 페칭 전략:
//  - detail (detailCommon2 + detailIntro2 병합), images (detailImage2) 를 병렬 fetch
//  - revalidate 21600s (6h) / 86400s (24h) — TourAPI 캐시 주기와 정합
//  - 응답 없으면 notFound() → app router의 not-found.tsx로 위임
//  - 부분 실패(images만 실패)는 갤러리 fallback으로 계속 렌더
//
// ※ Week 2 시점 tourapi-integrator의 9개 Route는 병행 구현 중.
//   Route가 placeholder(501)인 동안엔 not-found 표시. Route 완성 직후 즉시 동작.
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { SpotGallery } from '@/components/spot/SpotGallery';
import { SpotDetail } from '@/components/spot/SpotDetail';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import type {
  SpotDetailCommon,
  SpotDetailIntro,
  SpotImage,
  TourAPIResponse,
} from '@/types/tour';

interface PageProps {
  params: { contentId: string };
  searchParams: { contentTypeId?: string };
}

/**
 * Route 응답 (단일 contentId 조회):
 *   items[0] = { common: SpotDetailCommon | null, intro: SpotDetailIntro | null, info?: ... }
 * UI에서는 두 객체를 단일 SpotDetail props로 flatten하여 사용.
 */
interface SpotDetailRouteItem {
  common: SpotDetailCommon | null;
  intro: SpotDetailIntro | null;
}

interface SpotPageData {
  detail: SpotDetailCommon & SpotDetailIntro;
  images: SpotImage[];
}

/**
 * Route의 분리 응답을 SpotDetail 컴포넌트가 기대하는 단일 객체로 병합.
 * common이 null이면 페이지 자체가 의미 없으므로 호출 측에서 notFound 처리.
 */
function flattenDetail(
  common: SpotDetailCommon | null,
  intro: SpotDetailIntro | null
): (SpotDetailCommon & SpotDetailIntro) | null {
  if (!common) return null;
  // intro 우선 spread 후 common이 덮어쓰기 (title 등 common 정의가 정답)
  return { ...(intro ?? ({} as SpotDetailIntro)), ...common };
}

/**
 * Base URL 결정.
 *  - 서버 RSC 환경에서는 절대 URL 필요. NEXT_PUBLIC_BASE_URL 우선.
 *  - Vercel/preview 환경: VERCEL_URL fallback
 *  - 로컬: http://localhost:3000
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

async function fetchSpotData(
  contentId: string,
  contentTypeId?: string
): Promise<SpotPageData | null> {
  const base = getBaseUrl();
  const detailQuery = new URLSearchParams({ contentId });
  if (contentTypeId) detailQuery.set('contentTypeId', contentTypeId);

  const [detailRes, imagesRes] = await Promise.allSettled([
    fetch(`${base}/api/tour/detail?${detailQuery.toString()}`, {
      next: { revalidate: 21600, tags: [`spot:${contentId}`] },
    }),
    fetch(`${base}/api/tour/images?contentId=${encodeURIComponent(contentId)}`, {
      next: { revalidate: 86400, tags: [`spot-images:${contentId}`] },
    }),
  ]);

  // detail 실패 또는 비정상 → null로 notFound 위임
  if (detailRes.status === 'rejected' || !detailRes.value.ok) {
    return null;
  }

  const detailJson = (await detailRes.value.json()) as TourAPIResponse<SpotDetailRouteItem>;
  if (!detailJson.items || detailJson.items.length === 0) {
    return null;
  }

  const { common, intro } = detailJson.items[0];
  const flattened = flattenDetail(common, intro);
  if (!flattened) return null;

  let images: SpotImage[] = [];
  if (imagesRes.status === 'fulfilled' && imagesRes.value.ok) {
    try {
      const imagesJson = (await imagesRes.value.json()) as TourAPIResponse<SpotImage>;
      images = imagesJson.items ?? [];
    } catch {
      images = [];
    }
  }

  return {
    detail: flattened,
    images,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // 메타데이터 페칭은 페이지 데이터와 별도 (Next.js가 중복 fetch는 dedupe)
  try {
    const data = await fetchSpotData(params.contentId);
    if (!data) {
      return { title: `관광지 ${params.contentId}` };
    }
    const { detail } = data;
    const fullAddress = [detail.addr1, detail.addr2].filter(Boolean).join(' ');
    return {
      title: detail.title,
      description: detail.overview
        ? detail.overview.replace(/<[^>]+>/g, '').slice(0, 160)
        : `${detail.title}${fullAddress ? ` · ${fullAddress}` : ''}`,
      openGraph: {
        title: detail.title,
        description: fullAddress,
        images: detail.firstimage ? [{ url: detail.firstimage }] : undefined,
      },
    };
  } catch {
    return { title: `관광지 ${params.contentId}` };
  }
}

export default async function SpotPage({ params, searchParams }: PageProps) {
  if (!params.contentId) notFound();

  const data = await fetchSpotData(params.contentId, searchParams.contentTypeId);
  if (!data) notFound();

  const { detail, images } = data;

  return (
    <main className="container max-w-5xl py-6 md:py-10 lg:py-12">
      {/* 뒤로가기 */}
      <nav aria-label="이전 페이지로 이동" className="mb-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-body-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          탐색으로 돌아가기
        </Link>
      </nav>

      <div className="space-y-6 md:space-y-8">
        <ErrorBoundary>
          <Suspense
            fallback={<LoadingSkeleton variant="image" ariaLabel="이미지 갤러리 불러오는 중" />}
          >
            <SpotGallery
              images={images}
              mainImage={detail.firstimage}
              alt={detail.title}
            />
          </Suspense>
        </ErrorBoundary>

        <SpotDetail spot={detail} />
      </div>
    </main>
  );
}
