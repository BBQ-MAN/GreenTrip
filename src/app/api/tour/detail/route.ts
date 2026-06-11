// API Route: TourAPI 상세 — detailCommon2 + detailIntro2 + detailInfo2(옵션) 병합
// v1.6: KorService2 마이그레이션 + detailInfo2(반복정보) 신규 통합.
//
// 쿼리: contentId(필수), contentTypeId? (intro·info에서 사용),
//        includeInfo=Y? (detailInfo2 함께 호출, 기본 N)
//
// 응답 shape (다른 라우트와 일관):
//   { items: [{ common, intro, info? }], totalCount: 1, pageNo: 1, numOfRows: 1 }
//   - 상세는 단일 contentId 조회이므로 items 길이는 항상 0 또는 1
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { callTourAPI } from '@/lib/tourapi/client';
import { tourErrorResponse } from '@/lib/apiError';
import {
  getCached,
  setCached,
  tourCacheKey,
  TOUR_CACHE_TTL,
  incrStat,
} from '@/lib/tourapi/cache';
import type {
  SpotDetailCommon,
  SpotDetailIntro,
  SpotDetailInfo,
  TourAPIResponse,
} from '@/types/tour';

export interface SpotDetailMerged {
  common: SpotDetailCommon | null;
  intro: SpotDetailIntro | null;
  info: SpotDetailInfo[] | null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get('contentId');
  const contentTypeId = searchParams.get('contentTypeId') ?? undefined;
  const includeInfo = searchParams.get('includeInfo') === 'Y';

  if (!contentId) {
    return NextResponse.json(
      { error: 'MISSING_PARAMS', message: 'contentId required' },
      { status: 400 },
    );
  }

  const cacheParams = { contentId, contentTypeId, includeInfo: includeInfo ? 'Y' : 'N' };
  const cacheKey = tourCacheKey('detail:merged', cacheParams);
  const cached = await getCached<TourAPIResponse<SpotDetailMerged>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    // 병렬 호출 (single-flight + 캐시는 client/cache 레벨에서 별도 동작)
    const [commonRes, introRes, infoRes] = await Promise.all([
      callTourAPI<SpotDetailCommon>('detailCommon2', { contentId }),
      callTourAPI<SpotDetailIntro>('detailIntro2', {
        contentId,
        contentTypeId,
      }),
      includeInfo
        ? callTourAPI<SpotDetailInfo>('detailInfo2', { contentId, contentTypeId })
        : Promise.resolve({
            items: [] as SpotDetailInfo[],
            totalCount: 0,
            pageNo: 1,
            numOfRows: 0,
          }),
    ]);

    const merged: SpotDetailMerged = {
      common: commonRes.items[0] ?? null,
      intro: introRes.items[0] ?? null,
      info: includeInfo ? infoRes.items : null,
    };

    const hasAny = merged.common !== null || merged.intro !== null;
    const result: TourAPIResponse<SpotDetailMerged> = {
      items: hasAny ? [merged] : [],
      totalCount: hasAny ? 1 : 0,
      pageNo: 1,
      numOfRows: hasAny ? 1 : 0,
    };

    // TTL은 가장 짧은 detailIntro2 기준 (6h). detailInfo2가 24h이지만 병합 결과는 통합 단축.
    await setCached(cacheKey, result, TOUR_CACHE_TTL.detailIntro2);
    void incrStat('detailCommon2');
    void incrStat('detailIntro2');
    if (includeInfo) void incrStat('detailInfo2');
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });
  } catch (e) {
    return tourErrorResponse('tour/detail:merged', e);
  }
}
