// AdminStatsClient — /admin/stats 클라이언트 본체 (재감사 H-2 대응)
//
// 인증 흐름:
//   1) 토큰 입력(password input) → fetch('/api/admin/stats', { Authorization: Bearer })
//   2) 200 → sessionStorage('greentrip:admin:token')에 보관 (탭 닫으면 소멸, URL·로그 비잔존)
//   3) 401 → 토큰 폐기 + 재입력 안내
//   4) 마운트 시 sessionStorage에 토큰이 있으면 자동 조회
//
// 검증 주체는 서버(/api/admin/stats)뿐 — 클라이언트는 토큰을 비교하지 않는다.
'use client';

import { useCallback, useEffect, useState } from 'react';
import { StatsTable, type StatsRow } from '@/components/admin/StatsTable';
import { StatsChart } from '@/components/admin/StatsChart';
import { Button } from '@/components/ui/button';

const TOKEN_STORAGE_KEY = 'greentrip:admin:token';

interface StatsResponse {
  stats: StatsRow[];
  activeEndpoints: number;
  totalEndpoints: number;
  period: { days: number; from: string; to: string };
}

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'unauthorized' }
  | { status: 'error'; httpStatus: number; code: string }
  | { status: 'success'; data: StatsResponse };

export function AdminStatsClient() {
  const [tokenInput, setTokenInput] = useState('');
  const [state, setState] = useState<FetchState>({ status: 'idle' });

  const fetchStats = useCallback(async (token: string) => {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/admin/stats?days=14', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setState({ status: 'unauthorized' });
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({ error: 'UNKNOWN' }))) as {
          error?: string;
        };
        setState({
          status: 'error',
          httpStatus: res.status,
          code: body.error ?? 'UNKNOWN',
        });
        return;
      }

      const data = (await res.json()) as StatsResponse;
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      setState({ status: 'success', data });
    } catch {
      setState({ status: 'error', httpStatus: 0, code: 'FETCH_FAILED' });
    }
  }, []);

  // 마운트 시 세션 토큰으로 자동 조회 (탭 단위 유지)
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (saved) void fetchStats(saved);
  }, [fetchStats]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = tokenInput.trim();
    if (!token) return;
    void fetchStats(token);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setTokenInput('');
    setState({ status: 'idle' });
  };

  // ── 인증 폼 (idle / unauthorized / error) ─────────────────────────────
  if (state.status !== 'success') {
    return (
      <main className="container mx-auto max-w-md px-4 py-12">
        <h1 className="text-display-sm font-extrabold tracking-tight text-foreground">
          관리자 인증
        </h1>
        <p className="mt-3 text-body-md text-muted-foreground">
          TourAPI 호출 통계 조회는 관리자 토큰이 필요합니다. 토큰은 이 탭의
          sessionStorage에만 보관되며 URL·서버 로그에 남지 않습니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label
            htmlFor="admin-token"
            className="block text-body-sm font-medium text-foreground"
          >
            관리자 토큰
          </label>
          <input
            id="admin-token"
            type="password"
            autoComplete="off"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-body-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="ADMIN_TOKEN"
          />
          <Button
            type="submit"
            disabled={state.status === 'loading' || tokenInput.trim() === ''}
            aria-busy={state.status === 'loading'}
            className="w-full"
          >
            {state.status === 'loading' ? '조회 중…' : '통계 조회'}
          </Button>
        </form>

        {state.status === 'unauthorized' ? (
          <p role="alert" className="mt-4 text-body-sm text-destructive">
            관리자 토큰이 일치하지 않습니다. 다시 입력해 주세요.
          </p>
        ) : null}
        {state.status === 'error' ? (
          <div role="alert" className="mt-4 space-y-2">
            <p className="text-body-sm text-destructive">
              통계 조회 실패 — 상태 코드 {state.httpStatus} ({state.code})
            </p>
            <p className="text-caption text-muted-foreground">
              Upstash Redis 환경변수(<code>UPSTASH_REDIS_REST_URL</code>,{' '}
              <code>UPSTASH_REDIS_REST_TOKEN</code>)가 설정되어 있는지
              확인하세요.
            </p>
          </div>
        ) : null}
      </main>
    );
  }

  // ── 통계 대시보드 (success) ───────────────────────────────────────────
  const { stats, period, activeEndpoints, totalEndpoints } = state.data;
  const totalHits = stats.reduce((s, r) => s + r.total, 0);

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 py-6 md:py-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-display-sm font-extrabold tracking-tight text-foreground md:text-display-md">
            TourAPI 호출 통계
          </h1>
          <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
            토큰 지우기
          </Button>
        </div>
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
