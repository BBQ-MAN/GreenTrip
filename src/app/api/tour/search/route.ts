// API Route: TourAPI 검색 — searchKeyword2 OR areaBasedList2 OR lclsSystmCode2 분기
// v1.6: categoryCode2(미사용·삭제예정) → lclsSystmCode2 정식 대체.
//
// 모드 분기:
//   - keyword 있음 → searchKeyword2 (전국 키워드 검색)
//   - mode=category → lclsSystmCode2 (분류체계 코드 조회)
//   - 기본 (areaCode만) → areaBasedList2 (지역 기반)
//
// 쿼리 (keyword 모드):
//   keyword(필수), areaCode?, contentTypeId?, lDongRegnCd?, lDongSignguCd?, lclsSystm1~3?, numOfRows?, pageNo?, arrange?
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
import {
  clampNumOfRows,
  clampPageNo,
  TOUR_PARAM_LIMITS,
} from '@/lib/tourapi/params';
import { tourErrorResponse } from '@/lib/apiError';
import type {
  SpotItem,
  LclsSystmCodeItem,
  TourAPIResponse,
} from '@/types/tour';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode');
  const keyword = searchParams.get('keyword');

  // 모드 1: lclsSystmCode2 (분류체계 코드 조회)
  if (mode === 'category') {
    const endpoint = 'lclsSystmCode2' as const;
    const params = {
      lclsSystm1: searchParams.get('lclsSystm1') ?? undefined,
      lclsSystm2: searchParams.get('lclsSystm2') ?? undefined,
      // H-3: 코드 조회는 전체 목록이 필요해 완화 상한(100) 적용
      numOfRows: clampNumOfRows(
        searchParams.get('numOfRows'),
        100,
        TOUR_PARAM_LIMITS.numOfRowsMaxCode,
      ),
      pageNo: clampPageNo(searchParams.get('pageNo')),
    };

    const cacheKey = tourCacheKey(endpoint, params);
    const cached = await getCached<TourAPIResponse<LclsSystmCodeItem>>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    try {
      const result = await callTourAPI<LclsSystmCodeItem>(endpoint, params);
      await setCached(cacheKey, result, TOUR_CACHE_TTL.lclsSystmCode2);
      void incrStat(endpoint);
      return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });
    } catch (e) {
      return tourErrorResponse('tour/search:lclsSystmCode2', e);
    }
  }

  // 모드 2: searchKeyword2 (키워드 있음)
  if (keyword) {
    const endpoint = 'searchKeyword2' as const;
    const params = {
      keyword,
      areaCode: searchParams.get('areaCode') ?? undefined,
      sigunguCode: searchParams.get('sigunguCode') ?? undefined,
      contentTypeId: searchParams.get('contentTypeId') ?? undefined,
      lclsSystm1: searchParams.get('lclsSystm1') ?? undefined,
      lclsSystm2: searchParams.get('lclsSystm2') ?? undefined,
      numOfRows: clampNumOfRows(searchParams.get('numOfRows')),
      pageNo: clampPageNo(searchParams.get('pageNo')),
      arrange: searchParams.get('arrange') ?? 'A',
    };

    const cacheKey = tourCacheKey(endpoint, params);
    const cached = await getCached<TourAPIResponse<SpotItem>>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    try {
      const result = await callTourAPI<SpotItem>(endpoint, params);
      await setCached(cacheKey, result, TOUR_CACHE_TTL.searchKeyword2);
      void incrStat(endpoint);
      return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });
    } catch (e) {
      return tourErrorResponse('tour/search:searchKeyword2', e);
    }
  }

  // 모드 3 (기본): areaBasedList2 (areaCode 있어야 함)
  const areaCode = searchParams.get('areaCode');
  if (!areaCode) {
    return NextResponse.json(
      {
        error: 'MISSING_PARAMS',
        message: 'keyword OR areaCode required (or mode=category)',
      },
      { status: 400 },
    );
  }

  const endpoint = 'areaBasedList2' as const;
  const params = {
    areaCode,
    sigunguCode: searchParams.get('sigunguCode') ?? undefined,
    contentTypeId: searchParams.get('contentTypeId') ?? undefined,
    lclsSystm1: searchParams.get('lclsSystm1') ?? undefined,
    lclsSystm2: searchParams.get('lclsSystm2') ?? undefined,
    lclsSystm3: searchParams.get('lclsSystm3') ?? undefined,
    numOfRows: clampNumOfRows(searchParams.get('numOfRows')),
    pageNo: clampPageNo(searchParams.get('pageNo')),
    arrange: searchParams.get('arrange') ?? 'A',
  };

  const cacheKey = tourCacheKey(endpoint, params);
  const cached = await getCached<TourAPIResponse<SpotItem>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const result = await callTourAPI<SpotItem>(endpoint, params);
    await setCached(cacheKey, result, TOUR_CACHE_TTL.areaBasedList2);
    void incrStat(endpoint);
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });
  } catch (e) {
    return tourErrorResponse('tour/search:areaBasedList2', e);
  }
}
