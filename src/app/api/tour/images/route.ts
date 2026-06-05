// API Route: TourAPI detailImage2 프록시 — 관광지 이미지 갤러리
// v1.6: KorService2 마이그레이션.
//
// 쿼리: contentId(필수), imageYN?(기본 Y), numOfRows?, pageNo?
//   - KorService2는 `subImageYN` 파라미터 미지원 (INVALID_REQUEST_PARAMETER_ERROR) → 호출 안 함
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
import type { SpotImage, TourAPIResponse } from '@/types/tour';

const ENDPOINT = 'detailImage2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get('contentId');

  if (!contentId) {
    return NextResponse.json(
      { error: 'MISSING_PARAMS', message: 'contentId required' },
      { status: 400 },
    );
  }

  const params = {
    contentId,
    imageYN: searchParams.get('imageYN') ?? 'Y',
    numOfRows: searchParams.get('numOfRows') ?? '20',
    pageNo: searchParams.get('pageNo') ?? '1',
  };

  const cacheKey = tourCacheKey(ENDPOINT, params);
  const cached = await getCached<TourAPIResponse<SpotImage>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const result = await callTourAPI<SpotImage>(ENDPOINT, params);
    await setCached(cacheKey, result, TOUR_CACHE_TTL.detailImage2);
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
