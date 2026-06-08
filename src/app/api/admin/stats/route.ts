// API Route: TourAPI 호출 통계 대시보드 (Phase 3 W15)
//
// 목적:
//   - cache.ts `incrStat()`가 누적한 일별 호출 카운트(`tour:stats:{endpoint}:{YYYY-MM-DD}`)를
//     14종 endpoint(KorService2 13 + 두루누비 1) × N일치 조회.
//   - ui-builder의 /admin/stats 페이지가 이 API의 응답을 Recharts로 시각화.
//
// 응답 shape:
//   { stats: [{ endpoint, daily: [{date, count}, ...], total }], activeEndpoints, totalEndpoints, period }
//
// 보안: Bearer 토큰 (ADMIN_TOKEN 환경변수). 미설정 시 모든 호출 401.
// 빌드 안전: Redis 미설정 환경에서도 import 통과 (lazy singleton).
// Forward-compat: 14종 endpoint 통계 + 미사용 2종(areaCode2·categoryCode2)은 의도적 제외.
import { NextResponse, type NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

/**
 * Upstash Redis lazy singleton — 빌드 시점 환경변수 부재로 throw되지 않도록 보장.
 */
let _redis: Redis | undefined;
function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

/**
 * 통계 추적 대상 14종 endpoint.
 *
 * KorService2 활성 13종 + 두루누비 1종.
 * 미사용 2종(areaCode2·categoryCode2)은 호출 0건 의무이므로 통계 대상에서 제외.
 * cache.ts `incrStat()`가 callTourAPI 성공 시점에 자동 누적.
 */
const ENDPOINTS = [
  // 코드 (정식 대체)
  'ldongCode2',
  'lclsSystmCode2',
  // 위치/지역
  'locationBasedList2',
  'areaBasedList2',
  // 검색
  'searchKeyword2',
  'searchFestival2',
  'searchStay2',
  // 상세
  'detailCommon2',
  'detailIntro2',
  'detailInfo2',
  'detailImage2',
  'detailPetTour2',
  // 동기화 (cron)
  'areaBasedSyncList2',
  // 두루누비 (별도 트랙, callDurunubiAPI 사용 시)
  'durunubi',
] as const;

function isAuthorized(req: NextRequest): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${token}`;
}

export async function GET(req: NextRequest) {
  // 1) 인증
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  // 2) 파라미터 (days 1~30, 기본 7)
  const daysParam = req.nextUrl.searchParams.get('days') ?? '7';
  const days = Math.min(30, Math.max(1, parseInt(daysParam, 10) || 7));

  // 3) 날짜 목록 생성 (오늘 ~ days-1 일 전, UTC, YYYY-MM-DD)
  //    cache.ts incrStat이 toISOString().slice(0,10)을 쓰므로 UTC로 일치시켜야 함.
  const today = new Date();
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  // 4) Redis 조회 — Redis 미설정 환경에서는 fromEnv() throw → 503 응답
  try {
    const r = getRedis();
    const stats = await Promise.all(
      ENDPOINTS.map(async (endpoint) => {
        const counts = await Promise.all(
          dates.map(async (date) => {
            const key = `tour:stats:${endpoint}:${date}`;
            let count = 0;
            try {
              count = (await r.get<number>(key)) ?? 0;
            } catch {
              count = 0;
            }
            return { date, count };
          }),
        );
        const total = counts.reduce((s, c) => s + c.count, 0);
        // daily는 과거 → 현재 순으로 (차트 X축 자연 순서)
        return { endpoint, daily: counts.reverse(), total };
      }),
    );

    return NextResponse.json({
      stats,
      activeEndpoints: stats.filter((s) => s.total > 0).length,
      totalEndpoints: ENDPOINTS.length,
      period: {
        days,
        from: dates[dates.length - 1],
        to: dates[0],
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: 'REDIS_UNAVAILABLE',
        message: e instanceof Error ? e.message : String(e),
      },
      { status: 503 },
    );
  }
}
