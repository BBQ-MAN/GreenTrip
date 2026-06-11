// API Route: TourAPI locationBasedList2 프록시
// v1.6: KorService2 단일 사용. 응답 shape `{ items, totalCount, pageNo, numOfRows }`.
//
// 쿼리: mapX(경도), mapY(위도), radius(미터, 기본 5000), contentTypeId?, numOfRows?, pageNo?, arrange?
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { callTourAPI } from '@/lib/tourapi/client';
import {
  getCached,
  setCached,
  tourCacheKey,
  TOUR_CACHE_TTL,
  incrStat,
} from '@/lib/tourapi/cache';
import { clampNumOfRows, clampPageNo, clampRadius } from '@/lib/tourapi/params';
import { tourErrorResponse } from '@/lib/apiError';
import type { SpotItem, TourAPIResponse } from '@/types/tour';

const ENDPOINT = 'locationBasedList2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mapX = searchParams.get('mapX');
  const mapY = searchParams.get('mapY');
  // H-3: 폭주값 클램프 (쿼터 소진·캐시 회피 방어) — 초과 값은 400이 아닌 클램프
  const radius = clampRadius(searchParams.get('radius'));
  const contentTypeId = searchParams.get('contentTypeId') ?? undefined;
  const numOfRows = clampNumOfRows(searchParams.get('numOfRows'));
  const pageNo = clampPageNo(searchParams.get('pageNo'));
  const arrange = searchParams.get('arrange') ?? 'E'; // E=거리순

  if (!mapX || !mapY) {
    return NextResponse.json(
      { error: 'MISSING_PARAMS', message: 'mapX, mapY required' },
      { status: 400 },
    );
  }

  const params = {
    mapX,
    mapY,
    radius,
    contentTypeId,
    numOfRows,
    pageNo,
    arrange,
  };

  const cacheKey = tourCacheKey(ENDPOINT, params);
  const cached = await getCached<TourAPIResponse<SpotItem>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const result = await callTourAPI<SpotItem>(ENDPOINT, params);
    await setCached(cacheKey, result, TOUR_CACHE_TTL.locationBasedList2);
    void incrStat(ENDPOINT);
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });
  } catch (e) {
    return tourErrorResponse(`tour/location:${ENDPOINT}`, e);
  }
}
