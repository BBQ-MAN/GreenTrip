// API Route: TourAPI locationBasedList2 프록시
// v1.6: KorService2 단일 사용. 응답 shape `{ items, totalCount, pageNo, numOfRows }`.
//
// 쿼리: mapX(경도), mapY(위도), radius(미터, 기본 5000), contentTypeId?, numOfRows?, pageNo?, arrange?
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
import type { SpotItem, TourAPIResponse } from '@/types/tour';

const ENDPOINT = 'locationBasedList2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mapX = searchParams.get('mapX');
  const mapY = searchParams.get('mapY');
  const radius = searchParams.get('radius') ?? '5000';
  const contentTypeId = searchParams.get('contentTypeId') ?? undefined;
  const numOfRows = searchParams.get('numOfRows') ?? '20';
  const pageNo = searchParams.get('pageNo') ?? '1';
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
    const err = e instanceof TourAPIError ? e : null;
    return NextResponse.json(
      {
        error: err?.code ?? 'TOUR_API_ERROR',
        message: err?.message ?? String(e),
      },
      { status: 503 },
    );
  }
}
