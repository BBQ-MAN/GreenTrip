// API Route: TourAPI areaBasedSyncList2 — 동기화 (변경/추가/삭제 contentId 수집)
// v1.6: KorService2 마이그레이션. Phase 3 W14 본격 구현 (cron + 인증).
//
// 호출 주체:
//   1) Vercel Cron — 매일 03:00 UTC (vercel.json). Authorization: Bearer ${CRON_SECRET} 헤더 자동.
//   2) 관리자 수동 — curl -H "Authorization: Bearer $ADMIN_TOKEN" ...
//
// 쿼리: modifiedTime? (YYYYMMDD), areaCode? (기본 강원=32), numOfRows?, pageNo?
//
// 동작:
//   - syncRecentChanges() 호출 → areaBasedSyncList2
//   - 변경 contentId 목록 수집
//   - incrStat('areaBasedSyncList2') 통계 누적
//   - 응답: { success, count, contentIds, syncedAt }
//
// 보안: Bearer 토큰 검증. ADMIN_TOKEN/CRON_SECRET 모두 미설정 시 모든 호출 401 (안전 기본).
// 캐시: 없음 (cron 트리거, 매번 새 데이터 필요).
// MVP: DB upsert 없음 — 변경 contentId 목록 + 통계 누적만 (Phase 4+ 별도 캐시 테이블).
import { NextResponse, type NextRequest } from 'next/server';
import { syncRecentChanges } from '@/lib/tourapi/sync';
import { TourAPIError } from '@/lib/tourapi/client';
import { incrStat } from '@/lib/tourapi/cache';
import { GENERIC_MESSAGES, logRouteError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

const ENDPOINT = 'areaBasedSyncList2';

/**
 * Bearer 토큰 검증. ADMIN_TOKEN·CRON_SECRET 둘 다 미설정이면 모든 호출 거부 (안전 기본값).
 *
 * Vercel Cron이 vercel.json의 cron path를 호출할 때 자동으로
 * `Authorization: Bearer ${process.env.CRON_SECRET}` 헤더를 추가한다.
 * 관리자 수동 호출은 `Authorization: Bearer ${ADMIN_TOKEN}`을 사용한다.
 * 따라서 Bearer 토큰이 ADMIN_TOKEN 또는 CRON_SECRET 중 어느 쪽과 일치해도 통과시킨다.
 * (둘을 동일값으로 운영해도 되고, 서로 다른 값으로 운영해도 cron·관리자 양쪽이 동작.)
 */
function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  if (!auth) return false;

  const candidates = [process.env.ADMIN_TOKEN, process.env.CRON_SECRET].filter(
    (t): t is string => Boolean(t),
  );
  if (candidates.length === 0) return false; // 두 환경변수 모두 미설정 = 잠금

  return candidates.some((token) => auth === `Bearer ${token}`);
}

export async function GET(req: NextRequest) {
  // 1) 인증
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  // 2) 파라미터
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
  if (Number.isNaN(areaCode) || areaCode < 1 || areaCode > 99) {
    return NextResponse.json(
      { error: 'INVALID_PARAM', message: 'areaCode out of range' },
      { status: 400 },
    );
  }

  // 3) 동기화 (areaBasedSyncList2 호출)
  try {
    const { items, totalCount } = await syncRecentChanges(modifiedTime, areaCode);

    // 4) 변경 contentId 목록 수집
    const contentIds = items
      .map((it) => (it as { contentid?: string | number }).contentid)
      .filter((v): v is string | number => v !== undefined && v !== '');

    // 5) 호출 통계 누적 (Redis 미설정이어도 silent 무시)
    void incrStat(ENDPOINT);

    // 6) 응답 (MVP: DB upsert 없음, 변경 목록 + 메타만)
    return NextResponse.json(
      {
        success: true,
        count: contentIds.length,
        totalCount,
        areaCode,
        contentIds,
        syncedAt: new Date().toISOString(),
      },
      { headers: { 'X-Cache': 'MISS', 'X-Source': 'sync' } },
    );
  } catch (e) {
    // M-3: 원본 메시지는 서버 로그로만 — 응답에는 코드 + 일반 메시지
    logRouteError('tour/sync', e);
    const err = e instanceof TourAPIError ? e : null;
    return NextResponse.json(
      {
        success: false,
        error: err?.code ?? 'TOUR_API_ERROR',
        message: GENERIC_MESSAGES.tour,
      },
      { status: 503 },
    );
  }
}
