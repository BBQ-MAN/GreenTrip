// API Route: TourAPI searchFestival2 프록시
// v1.6: KorService2 마이그레이션. Phase 2 W6~7에서 본격 활용, Week 2에 기본 구현.
//
// 쿼리: eventStartDate(필수, YYYYMMDD), eventEndDate?, areaCode?, sigunguCode?, numOfRows?, pageNo?, arrange?
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { callTourAPI } from '@/lib/tourapi/client';
import { clampNumOfRows, clampPageNo } from '@/lib/tourapi/params';
import { tourErrorResponse } from '@/lib/apiError';
import {
  getCached,
  setCached,
  tourCacheKey,
  TOUR_CACHE_TTL,
  incrStat,
} from '@/lib/tourapi/cache';
import type { FestivalItem, TourAPIResponse } from '@/types/tour';

const ENDPOINT = 'searchFestival2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventStartDate = searchParams.get('eventStartDate');

  if (!eventStartDate || !/^\d{8}$/.test(eventStartDate)) {
    return NextResponse.json(
      {
        error: 'MISSING_PARAMS',
        message: 'eventStartDate (YYYYMMDD) required',
      },
      { status: 400 },
    );
  }

  const params = {
    eventStartDate,
    eventEndDate: searchParams.get('eventEndDate') ?? undefined,
    areaCode: searchParams.get('areaCode') ?? undefined,
    sigunguCode: searchParams.get('sigunguCode') ?? undefined,
    numOfRows: clampNumOfRows(searchParams.get('numOfRows')),
    pageNo: clampPageNo(searchParams.get('pageNo')),
    arrange: searchParams.get('arrange') ?? 'A',
  };

  const cacheKey = tourCacheKey(ENDPOINT, params);
  const cached = await getCached<TourAPIResponse<FestivalItem>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const result = await callTourAPI<FestivalItem>(ENDPOINT, params);
    await setCached(cacheKey, result, TOUR_CACHE_TTL.searchFestival2);
    void incrStat(ENDPOINT);
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });
  } catch (e) {
    return tourErrorResponse(`tour/festival:${ENDPOINT}`, e);
  }
}
