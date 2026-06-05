// API Route: TourAPI areaBasedList2 + ldongCode2 (옵션) 프록시
// v1.6: areaCode2(미사용·삭제예정) → ldongCode2 정식 대체.
//
// 모드 1 (지역기반 관광지 리스트, 기본):
//   쿼리: areaCode(필수), sigunguCode?, contentTypeId?, lDongRegnCd?, lDongSignguCd?, lclsSystm1?, numOfRows?, pageNo?, arrange?
//
// 모드 2 (법정동 코드 조회, mode=ldong):
//   쿼리: lDongRegnCd?, lDongSignguCd?
//
// 모드 3 (강원 시군구 정적 매핑, mode=sigungu) — TourAPI 호출 없음:
//   GANGWON.sigungu 상수 반환.
import { NextRequest, NextResponse } from 'next/server';
import { callTourAPI, TourAPIError } from '@/lib/tourapi/client';
import {
  getCached,
  setCached,
  tourCacheKey,
  TOUR_CACHE_TTL,
  incrStat,
} from '@/lib/tourapi/cache';
import { GANGWON } from '@/lib/tourapi/constants';
import type {
  SpotItem,
  LdongCodeItem,
  TourAPIResponse,
} from '@/types/tour';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') ?? 'area';

  // 모드 3: 강원 시군구 정적 매핑 (외부 호출 없음)
  if (mode === 'sigungu') {
    const items = Object.entries(GANGWON.sigungu).map(([name, code]) => ({
      code: String(code),
      name,
    }));
    const result: TourAPIResponse<{ code: string; name: string }> = {
      items,
      totalCount: items.length,
      pageNo: 1,
      numOfRows: items.length,
    };
    return NextResponse.json(result, {
      headers: { 'X-Cache': 'HIT', 'X-Source': 'static' },
    });
  }

  // 모드 2: ldongCode2 (법정동 코드)
  if (mode === 'ldong') {
    const endpoint = 'ldongCode2' as const;
    const params = {
      lDongRegnCd: searchParams.get('lDongRegnCd') ?? undefined,
      lDongSignguCd: searchParams.get('lDongSignguCd') ?? undefined,
      numOfRows: searchParams.get('numOfRows') ?? '100',
      pageNo: searchParams.get('pageNo') ?? '1',
    };

    const cacheKey = tourCacheKey(endpoint, params);
    const cached = await getCached<TourAPIResponse<LdongCodeItem>>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    try {
      const result = await callTourAPI<LdongCodeItem>(endpoint, params);
      await setCached(cacheKey, result, TOUR_CACHE_TTL.ldongCode2);
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

  // 모드 1 (기본): areaBasedList2
  const endpoint = 'areaBasedList2' as const;
  const areaCode = searchParams.get('areaCode');

  if (!areaCode) {
    return NextResponse.json(
      { error: 'MISSING_PARAMS', message: 'areaCode required (mode=area)' },
      { status: 400 },
    );
  }

  const params = {
    areaCode,
    sigunguCode: searchParams.get('sigunguCode') ?? undefined,
    contentTypeId: searchParams.get('contentTypeId') ?? undefined,
    lDongRegnCd: searchParams.get('lDongRegnCd') ?? undefined,
    lDongSignguCd: searchParams.get('lDongSignguCd') ?? undefined,
    lclsSystm1: searchParams.get('lclsSystm1') ?? undefined,
    lclsSystm2: searchParams.get('lclsSystm2') ?? undefined,
    lclsSystm3: searchParams.get('lclsSystm3') ?? undefined,
    numOfRows: searchParams.get('numOfRows') ?? '20',
    pageNo: searchParams.get('pageNo') ?? '1',
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
    const err = e instanceof TourAPIError ? e : null;
    return NextResponse.json(
      { error: err?.code ?? 'TOUR_API_ERROR', message: err?.message ?? String(e) },
      { status: 503 },
    );
  }
}
