// API Route: TourAPI 숙박 — searchStay2 (우선) 또는 areaBasedList2 contentTypeId=32 (fallback)
// v1.6: KorService2 신규 searchStay2 우선 활용. Phase 2 W12~13에서 친환경/반려/대중교통 필터 본격.
//
// 쿼리:
//   areaCode?, sigunguCode?, numOfRows?, pageNo?, arrange?
//   mode=areaBased → areaBasedList2 contentTypeId=32 사용
//   (Week 2는 기본 검색만, 필터 로직은 W12~13)
import { NextRequest, NextResponse } from 'next/server';
import { callTourAPI, TourAPIError } from '@/lib/tourapi/client';
import {
  getCached,
  setCached,
  tourCacheKey,
  TOUR_CACHE_TTL,
  incrStat,
} from '@/lib/tourapi/cache';
import type { StayItem, TourAPIResponse } from '@/types/tour';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') ?? 'stay';

  // 모드 2: areaBasedList2 contentTypeId=32 (fallback)
  if (mode === 'areaBased') {
    const endpoint = 'areaBasedList2' as const;
    const params = {
      contentTypeId: '32',
      areaCode: searchParams.get('areaCode') ?? undefined,
      sigunguCode: searchParams.get('sigunguCode') ?? undefined,
      numOfRows: searchParams.get('numOfRows') ?? '20',
      pageNo: searchParams.get('pageNo') ?? '1',
      arrange: searchParams.get('arrange') ?? 'A',
    };

    const cacheKey = tourCacheKey(`lodging:${endpoint}`, params);
    const cached = await getCached<TourAPIResponse<StayItem>>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    try {
      const result = await callTourAPI<StayItem>(endpoint, params);
      await setCached(cacheKey, result, TOUR_CACHE_TTL.searchStay2);
      void incrStat(endpoint);
      return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });
    } catch (e) {
      const err = e instanceof TourAPIError ? e : null;
      return NextResponse.json(
        { error: err?.code ?? 'TOUR_API_ERROR', message: err?.message ?? String(e) },
        { status: 503 },
      );
    }
  }

  // 모드 1 (기본): searchStay2
  const endpoint = 'searchStay2' as const;
  const params = {
    areaCode: searchParams.get('areaCode') ?? undefined,
    sigunguCode: searchParams.get('sigunguCode') ?? undefined,
    numOfRows: searchParams.get('numOfRows') ?? '20',
    pageNo: searchParams.get('pageNo') ?? '1',
    arrange: searchParams.get('arrange') ?? 'A',
  };

  const cacheKey = tourCacheKey(endpoint, params);
  const cached = await getCached<TourAPIResponse<StayItem>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const result = await callTourAPI<StayItem>(endpoint, params);
    await setCached(cacheKey, result, TOUR_CACHE_TTL.searchStay2);
    void incrStat(endpoint);
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });
  } catch (e) {
    const err = e instanceof TourAPIError ? e : null;
    return NextResponse.json(
      { error: err?.code ?? 'TOUR_API_ERROR', message: err?.message ?? String(e) },
      { status: 503 },
    );
  }
}
