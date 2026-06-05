// API Route: TourAPI areaBasedSyncList2 — 동기화 (변경/추가/삭제 contentId 수집)
// v1.6: KorService2 마이그레이션. Week 2 호출 골격, Phase 3 W14에서 DB upsert 본격.
//
// 쿼리: modifiedTime? (YYYYMMDD), areaCode? (기본 강원=32), numOfRows?, pageNo?, arrange?
//
// 캐시: 없음 (cron 트리거 — 매번 새 데이터 필요)
import { NextRequest, NextResponse } from 'next/server';
import { syncRecentChanges } from '@/lib/tourapi/sync';
import { TourAPIError } from '@/lib/tourapi/client';
import { incrStat } from '@/lib/tourapi/cache';

const ENDPOINT = 'areaBasedSyncList2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modifiedTime = searchParams.get('modifiedTime') ?? undefined;
  const areaCodeStr = searchParams.get('areaCode');
  const areaCode = areaCodeStr ? Number(areaCodeStr) : 32;

  if (modifiedTime && !/^\d{8}$/.test(modifiedTime)) {
    return NextResponse.json(
      { error: 'INVALID_PARAM', message: 'modifiedTime must be YYYYMMDD' },
      { status: 400 },
    );
  }

  try {
    const { changed, items, totalCount } = await syncRecentChanges(modifiedTime, areaCode);
    void incrStat(ENDPOINT);
    // 다른 라우트와 응답 shape 일관 유지
    return NextResponse.json(
      {
        items,
        totalCount,
        pageNo: 1,
        numOfRows: items.length,
        changed,
      },
      { headers: { 'X-Cache': 'MISS', 'X-Source': 'sync' } },
    );
  } catch (e) {
    const err = e instanceof TourAPIError ? e : null;
    return NextResponse.json(
      { error: err?.code ?? 'TOUR_API_ERROR', message: err?.message ?? String(e) },
      { status: 503 },
    );
  }
}
