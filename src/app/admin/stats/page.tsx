// /admin/stats — TourAPI 호출 통계 대시보드 (Phase 3 W15, 심사 대응)
// async Server Component. 인증은 ?token=<ADMIN_TOKEN> query.
//
// 흐름:
//   1. searchParams.token === process.env.ADMIN_TOKEN 검증 (미설정 시 항상 차단)
//   2. /api/admin/stats?days=14 호출 (Authorization: Bearer ADMIN_TOKEN)
//   3. StatsTable(Server) + StatsChart(Client, Recharts) 합성
//
// 보안 메모(MVP 한정):
//   - query token은 단순한 보호 막이며 운영 환경에선 NextAuth role 또는 별도 인증으로 승격 필요.
//   - URL에 토큰이 남으므로 공유 금지 안내를 본문에 명시.
//
// noindex: 검색 엔진 색인 차단 (관리 페이지)
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { StatsTable, type StatsRow } from '@/components/admin/StatsTable';
import { StatsChart } from '@/components/admin/StatsChart';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin · TourAPI 통계',
  description: 'TourAPI 14종 endpoint 호출 통계 (관리자 전용)',
  robots: { index: false, follow: false },
};

interface StatsResponse {
  stats: StatsRow[];
  activeEndpoints: number;
  totalEndpoints: number;
  period: { days: number; from: string; to: string };
}

interface ErrorResponse {
  error: string;
  message?: string;
}

async function fetchStats(
  token: string,
): Promise<{ ok: true; data: StatsResponse } | { ok: false; status: number; error: ErrorResponse }> {
  const h = headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('host') ?? 'localhost:3000';
  const url = `${proto}://${host}/api/admin/stats?days=14`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      const error = (await res.json().catch(() => ({ error: 'UNKNOWN' }))) as ErrorResponse;
      return { ok: false, status: res.status, error };
    }
    const data = (await res.json()) as StatsResponse;
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: { error: 'FETCH_FAILED', message: e instanceof Error ? e.message : String(e) },
    };
  }
}

function TokenRequired({ reason }: { reason: 'missing-env' | 'mismatch' | 'missing-query' }) {
  // 사용자 안내 — 시그니처에 따라 메시지 분기 (운영자 디버깅 도움)
  const message =
    reason === 'missing-env'
      ? '서버에 ADMIN_TOKEN 환경변수가 설정되어 있지 않습니다.'
      : reason === 'missing-query'
        ? 'URL에 ?token=<관리자 토큰> 파라미터가 필요합니다.'
        : '관리자 토큰이 일치하지 않습니다.';
  return (
    <main className="container mx-auto max-w-md px-4 py-12">
      <h1 className="text-display-sm font-extrabold tracking-tight text-foreground">
        접근 권한 필요
      </h1>
      <p className="mt-4 text-body-md text-muted-foreground">{message}</p>
      <p className="mt-2 text-caption text-muted-foreground">
        예: <code className="rounded bg-muted px-1.5 py-0.5">/admin/stats?token=...</code>
      </p>
    </main>
  );
}

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const envToken = process.env.ADMIN_TOKEN;
  const queryToken = searchParams.token;

  if (!envToken) {
    return <TokenRequired reason="missing-env" />;
  }
  if (!queryToken) {
    return <TokenRequired reason="missing-query" />;
  }
  if (queryToken !== envToken) {
    return <TokenRequired reason="mismatch" />;
  }

  const result = await fetchStats(envToken);

  if (!result.ok) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-display-sm font-extrabold tracking-tight text-foreground">
          통계 조회 실패
        </h1>
        <p className="mt-4 text-body-md text-muted-foreground">
          상태 코드 {result.status} — {result.error.error}
        </p>
        {result.error.message ? (
          <pre className="mt-3 overflow-x-auto rounded-md border bg-muted/30 p-3 text-caption">
            {result.error.message}
          </pre>
        ) : null}
        <p className="mt-4 text-body-sm text-muted-foreground">
          Upstash Redis 환경변수(<code>UPSTASH_REDIS_REST_URL</code>,{' '}
          <code>UPSTASH_REDIS_REST_TOKEN</code>)가 설정되어 있는지 확인하세요.
        </p>
      </main>
    );
  }

  const { stats, period, activeEndpoints, totalEndpoints } = result.data;
  const totalHits = stats.reduce((s, r) => s + r.total, 0);

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 py-6 md:py-8">
      <header className="space-y-2">
        <h1 className="text-display-sm font-extrabold tracking-tight text-foreground md:text-display-md">
          TourAPI 호출 통계
        </h1>
        <p className="text-body-md text-muted-foreground">
          최근 {period.days}일 ({period.from} ~ {period.to})
        </p>
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-caption text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <dt>활용 endpoint</dt>
            <dd className="numeric font-semibold text-foreground">
              {activeEndpoints} / {totalEndpoints}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt>기간 내 총 호출</dt>
            <dd className="numeric font-semibold text-foreground">
              {totalHits.toLocaleString('ko-KR')} 회
            </dd>
          </div>
        </dl>
        <p className="text-caption text-muted-foreground">
          ※ 미사용 의무 2종(<code>areaCode2</code>, <code>categoryCode2</code>)은
          호출 0건 의무에 따라 통계 대상에서 제외됩니다.
        </p>
      </header>

      <StatsChart stats={stats} />
      <StatsTable stats={stats} />
    </main>
  );
}
