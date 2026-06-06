// API Route: TourAPI 숙박 — searchStay2 (우선) 또는 areaBasedList2 contentTypeId=32 (fallback)
//
// v1.6 + Phase 2 W12~13:
//   - KorService2 신규 searchStay2 우선 활용.
//   - 친환경(eco)·반려(pet)·접근성(barrier) 필터 본격 + LodgingItem 메타 부착.
//
// 쿼리:
//   areaCode? (미지정 시 강원 32 fallback) / sigunguCode?
//   numOfRows?, pageNo?, arrange? (기본 동일)
//   mode=stay (기본 — searchStay2) | mode=areaBased (areaBasedList2 contentTypeId=32)
//   eco=true   : isEcoCertified (cat3=B02011600 한옥 OR raw goodstay/hanok/benikia='1')
//   pet=true   : isPetFriendly (chkpet="가능"|"Y"|"동반가능")
//   barrier=true : isBarrierFree (raw barrierfree='1')
//
// 응답 정규화 (LodgingItem):
//   StayItem + isEcoCertified/isPetFriendly/isBarrierFree(boolean) + ecoSources(string[])
//
// 친환경 분류 정책 (실측 후 결정 — 2026-06-05):
//   - searchStay2 응답에 goodstay/hanok/benikia/barrierfree/chkpet 모두 미포함(0/20 sample).
//   - detailIntro2(contentTypeId=32)에도 위 필드 부재 → KorService2에서 정식 제공 안 됨.
//   - 따라서 cat3 코드 'B02011600'(한옥체험관)을 hanok 친환경 분류 결정적 기준으로 채택.
//   - raw goodstay/hanok/benikia/barrierfree 필드는 forward-compat.
//
// 캐시 키: filter 옵션(eco/pet/barrier)을 포함 — 동일 areaCode라도 옵션별로 분리 저장.
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
import type { StayItem, TourAPIResponse } from '@/types/tour';
import { GANGWON } from '@/lib/tourapi/constants';
import {
  annotateLodging,
  applyLodgingFilters,
  type LodgingItem,
} from '@/lib/course/lodging';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') ?? 'stay';

  // 필터 옵션 — 쿼리 ?eco=true/?pet=true/?barrier=true (1·yes·on도 허용)
  const truthy = (v: string | null) =>
    v !== null && /^(true|1|yes|on)$/i.test(v);
  const filterOpts = {
    eco: truthy(searchParams.get('eco')),
    pet: truthy(searchParams.get('pet')),
    barrier: truthy(searchParams.get('barrier')),
  };

  // 강원 fallback (areaCode 미지정 시) — Phase 2 강원 시그니처 정합
  const areaCode = searchParams.get('areaCode') ?? String(GANGWON.areaCode);

  // 공통 파라미터 (mode별로 endpoint만 분기)
  const commonParams: Record<string, string | undefined> = {
    areaCode,
    sigunguCode: searchParams.get('sigunguCode') ?? undefined,
    numOfRows: searchParams.get('numOfRows') ?? '20',
    pageNo: searchParams.get('pageNo') ?? '1',
    arrange: searchParams.get('arrange') ?? 'A',
  };

  const endpoint =
    mode === 'areaBased'
      ? ('areaBasedList2' as const)
      : ('searchStay2' as const);
  const endpointParams =
    endpoint === 'areaBasedList2'
      ? { contentTypeId: '32', ...commonParams }
      : commonParams;

  // 캐시 키 — 필터 옵션 포함 (동일 areaCode라도 eco/pet/barrier별 분리 저장)
  const cacheKey = tourCacheKey(`lodging:${endpoint}`, {
    ...endpointParams,
    eco: filterOpts.eco ? '1' : undefined,
    pet: filterOpts.pet ? '1' : undefined,
    barrier: filterOpts.barrier ? '1' : undefined,
  });

  const cached = await getCached<TourAPIResponse<LodgingItem>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const raw = await callTourAPI<StayItem>(endpoint, endpointParams);
    // 메타 부착 → 필터 적용
    const annotated = raw.items.map(annotateLodging);
    const filtered = applyLodgingFilters(annotated, filterOpts);

    const result: TourAPIResponse<LodgingItem> = {
      items: filtered,
      // 원본 totalCount는 KorService2의 전체 풀 (페이지네이션 기준).
      // 필터 적용 시 페이지 내 실 통과 건수는 items.length로 별도 표시.
      totalCount: raw.totalCount,
      pageNo: raw.pageNo,
      numOfRows: filtered.length,
    };

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
