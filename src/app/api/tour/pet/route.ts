// API Route: TourAPI detailPetTour2 프록시 — 반려동물 동반 정보
// v1.6: KorService2 마이그레이션. Phase 2 W8~9에서 본격 활용.
//
// 쿼리: contentId(필수), contentTypeId?
//   - contentId 없이도 호출 가능(전체 반려동반 가능 목록) → KorService2에서 contentId 옵션
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { callTourAPI, TourAPIError } from '@/lib/tourapi/client';
import {
  getCached,
  setCached,
  tourCacheKey,
  TOUR_CACHE_TTL,
  incrStat,
} from '@/lib/tourapi/cache';
import type { PetInfo, TourAPIResponse } from '@/types/tour';

const ENDPOINT = 'detailPetTour2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const params = {
    contentId: searchParams.get('contentId') ?? undefined,
    contentTypeId: searchParams.get('contentTypeId') ?? undefined,
    numOfRows: searchParams.get('numOfRows') ?? '20',
    pageNo: searchParams.get('pageNo') ?? '1',
  };

  const cacheKey = tourCacheKey(ENDPOINT, params);
  const cached = await getCached<TourAPIResponse<PetInfo>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const result = await callTourAPI<PetInfo>(ENDPOINT, params);
    await setCached(cacheKey, result, TOUR_CACHE_TTL.detailPetTour2);
    void incrStat(ENDPOINT);
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });
  } catch (e) {
    const err = e instanceof TourAPIError ? e : null;
    return NextResponse.json(
      { error: err?.code ?? 'TOUR_API_ERROR', message: err?.message ?? String(e) },
      { status: 503 },
    );
  }
}
