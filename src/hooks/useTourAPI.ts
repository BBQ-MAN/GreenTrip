'use client';
// useTourAPI — SWR 기반 TourAPI 훅 묶음
// 참조: DEVELOPMENT_PLAN.md §3.2, _workspace/00_input/week2_request.md
//
// 합의 사항 (tourapi-integrator):
//  - 모든 Route 응답 shape: { items: T[], totalCount, pageNo, numOfRows }
//  - 에러 응답: { error, message? } + HTTP 4xx/5xx
//  - 캐시 헤더: X-Cache: HIT|MISS|STALE
//
// 도메인 타입은 src/types/tour.ts에서만 import.

import useSWR, { type SWRConfiguration, type SWRResponse } from 'swr';
import type {
  SpotItem,
  FestivalItem,
  SpotDetailCommon,
  SpotDetailIntro,
  SpotDetailInfo,
  SpotImage,
  PetInfo,
  TourAPIResponse,
} from '@/types/tour';
// LodgingItem — /api/tour/lodging 라우트가 정규화 후 반환하는 타입 (StayItem 확장).
import type { LodgingItem } from '@/lib/course/lodging';

// ---------------------------------------------------------------------------
// Fetcher — JSON 페치. 에러 응답이면 throw하여 SWR error로 전달.
// ---------------------------------------------------------------------------

class TourAPIClientError extends Error {
  readonly status: number;
  readonly resultCode?: string;
  constructor(message: string, status: number, resultCode?: string) {
    super(message);
    this.name = 'TourAPIClientError';
    this.status = status;
    this.resultCode = resultCode;
  }
}

async function fetcher<T>(url: string): Promise<TourAPIResponse<T>> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    let detail: { error?: string; message?: string; resultCode?: string } = {};
    try {
      detail = await res.json();
    } catch {
      /* body 비어있을 수 있음 */
    }
    throw new TourAPIClientError(
      detail.message || detail.error || `HTTP ${res.status}`,
      res.status,
      detail.resultCode
    );
  }
  return (await res.json()) as TourAPIResponse<T>;
}

const baseSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false, // TourAPI 캐시 6h~24h 이므로 잦은 리페치 불필요
  revalidateOnReconnect: true,
  shouldRetryOnError: (err: unknown) => {
    // 4xx 클라이언트 에러는 재시도 X
    if (err instanceof TourAPIClientError) return err.status >= 500;
    return true;
  },
  errorRetryCount: 2,
};

// ---------------------------------------------------------------------------
// Query helpers — URLSearchParams 빌더 (undefined 값 자동 제거)
// ---------------------------------------------------------------------------

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    q.set(k, String(v));
  }
  return q.toString();
}

// ---------------------------------------------------------------------------
// 1) useLocationSpots — locationBasedList2 (위치 기반 관광지 목록)
// ---------------------------------------------------------------------------

export function useLocationSpots(
  mapX: number | null,
  mapY: number | null,
  radius = 5000,
  contentTypeId?: number,
  config?: SWRConfiguration
): SWRResponse<TourAPIResponse<SpotItem>, TourAPIClientError> {
  const ready = typeof mapX === 'number' && typeof mapY === 'number';
  const key = ready
    ? `/api/tour/location?${buildQuery({ mapX, mapY, radius, contentTypeId })}`
    : null;
  return useSWR<TourAPIResponse<SpotItem>, TourAPIClientError>(
    key,
    fetcher,
    { ...baseSWRConfig, ...config }
  );
}

// ---------------------------------------------------------------------------
// 2) useAreaSpots — areaBasedList2 (지역 기반 관광지 목록)
// ---------------------------------------------------------------------------

export function useAreaSpots(
  areaCode: number | null,
  sigunguCode?: number,
  contentTypeId?: number,
  arrange: 'A' | 'C' | 'D' = 'A',
  config?: SWRConfiguration
): SWRResponse<TourAPIResponse<SpotItem>, TourAPIClientError> {
  const key =
    typeof areaCode === 'number'
      ? `/api/tour/search?${buildQuery({ areaCode, sigunguCode, contentTypeId, arrange })}`
      : null;
  return useSWR<TourAPIResponse<SpotItem>, TourAPIClientError>(
    key,
    fetcher,
    { ...baseSWRConfig, ...config }
  );
}

// ---------------------------------------------------------------------------
// 3) useSearchSpots — searchKeyword2 (키워드 검색)
// ---------------------------------------------------------------------------

export function useSearchSpots(
  keyword: string,
  contentTypeId?: number,
  areaCode?: number,
  config?: SWRConfiguration
): SWRResponse<TourAPIResponse<SpotItem>, TourAPIClientError> {
  const trimmed = keyword.trim();
  const key =
    trimmed.length >= 1
      ? `/api/tour/search?${buildQuery({ keyword: trimmed, contentTypeId, areaCode })}`
      : null;
  return useSWR<TourAPIResponse<SpotItem>, TourAPIClientError>(
    key,
    fetcher,
    { ...baseSWRConfig, ...config }
  );
}

// ---------------------------------------------------------------------------
// 4) useSpotDetail — detailCommon2 + detailIntro2 (+ optional detailInfo2)
//    Route(/api/tour/detail) 응답 정의 (tourapi-integrator 합의):
//      items[0] = { common: SpotDetailCommon|null, intro: SpotDetailIntro|null, info?: SpotDetailInfo[]|null }
//    UI에서 단일 객체로 다루고 싶을 때는 SpotPage가 common + intro를 flatten.
// ---------------------------------------------------------------------------

export interface SpotDetailMerged {
  common: SpotDetailCommon | null;
  intro: SpotDetailIntro | null;
  info?: SpotDetailInfo[] | null;
}

export function useSpotDetail(
  contentId: string | null,
  contentTypeId?: number,
  includeInfo?: boolean,
  config?: SWRConfiguration
): SWRResponse<TourAPIResponse<SpotDetailMerged>, TourAPIClientError> {
  const key = contentId
    ? `/api/tour/detail?${buildQuery({
        contentId,
        contentTypeId,
        includeInfo: includeInfo ? 'Y' : undefined,
      })}`
    : null;
  return useSWR<TourAPIResponse<SpotDetailMerged>, TourAPIClientError>(
    key,
    fetcher,
    { ...baseSWRConfig, ...config }
  );
}

// ---------------------------------------------------------------------------
// 5) useSpotImages — detailImage2 (관광지 이미지 갤러리)
// ---------------------------------------------------------------------------

export function useSpotImages(
  contentId: string | null,
  config?: SWRConfiguration
): SWRResponse<TourAPIResponse<SpotImage>, TourAPIClientError> {
  const key = contentId ? `/api/tour/images?${buildQuery({ contentId })}` : null;
  return useSWR<TourAPIResponse<SpotImage>, TourAPIClientError>(
    key,
    fetcher,
    { ...baseSWRConfig, ...config }
  );
}

// ---------------------------------------------------------------------------
// 6) useFestivals — searchFestival2 (축제·행사)
// ---------------------------------------------------------------------------

export function useFestivals(
  eventStartDate: string | null, // YYYYMMDD
  eventEndDate?: string,
  areaCode?: number,
  config?: SWRConfiguration
): SWRResponse<TourAPIResponse<FestivalItem>, TourAPIClientError> {
  const key = eventStartDate
    ? `/api/tour/festival?${buildQuery({ eventStartDate, eventEndDate, areaCode })}`
    : null;
  return useSWR<TourAPIResponse<FestivalItem>, TourAPIClientError>(
    key,
    fetcher,
    { ...baseSWRConfig, ...config }
  );
}

// ---------------------------------------------------------------------------
// 7) usePetInfo — detailPetTour2 (반려동물 동반여행)
// ---------------------------------------------------------------------------

export function usePetInfo(
  contentId: string | null,
  config?: SWRConfiguration
): SWRResponse<TourAPIResponse<PetInfo>, TourAPIClientError> {
  const key = contentId ? `/api/tour/pet?${buildQuery({ contentId })}` : null;
  return useSWR<TourAPIResponse<PetInfo>, TourAPIClientError>(
    key,
    fetcher,
    { ...baseSWRConfig, ...config }
  );
}

// ---------------------------------------------------------------------------
// 8) useLodging — searchStay2 (숙박 검색, Phase 2 활용)
//    /api/tour/lodging 라우트 정합:
//      - 쿼리 eco/pet/barrier 필터 지원 (route.ts §48-55)
//      - 응답은 StayItem이 아닌 LodgingItem (메타 부착, route.ts:97 / lib/course/lodging)
// ---------------------------------------------------------------------------

export interface UseLodgingOptions {
  sigunguCode?: number;
  /** 친환경(한옥/굿스테이 등) 숙소만 — route ?eco=true */
  eco?: boolean;
  /** 반려동물 동반 가능 숙소만 — route ?pet=true */
  pet?: boolean;
  /** 무장애(배리어프리) 숙소만 — route ?barrier=true */
  barrier?: boolean;
}

export function useLodging(
  areaCode: number | null,
  options?: UseLodgingOptions,
  config?: SWRConfiguration
): SWRResponse<TourAPIResponse<LodgingItem>, TourAPIClientError> {
  const { sigunguCode, eco, pet, barrier } = options ?? {};
  const key =
    typeof areaCode === 'number'
      ? `/api/tour/lodging?${buildQuery({
          areaCode,
          sigunguCode,
          // 라우트는 true/1/yes/on 을 truthy로 인식 — false는 파라미터 자체 생략
          eco: eco ? 'true' : undefined,
          pet: pet ? 'true' : undefined,
          barrier: barrier ? 'true' : undefined,
        })}`
      : null;
  return useSWR<TourAPIResponse<LodgingItem>, TourAPIClientError>(
    key,
    fetcher,
    { ...baseSWRConfig, ...config }
  );
}

export { TourAPIClientError };
