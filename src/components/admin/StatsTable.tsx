// StatsTable — TourAPI endpoint별 일별 호출 카운트 표 (Server Component)
// Phase 3 W15 — /admin/stats 페이지 구성품.
//
// 입력 shape: GET /api/admin/stats 응답의 stats 배열.
//   [{ endpoint: string, daily: [{date, count}], total: number }, ...]
//
// 표시 전략:
//   - 가로 스크롤 컨테이너 (모바일에서 14종 endpoint × N일은 폭을 초과)
//   - 첫 열 sticky: endpoint 이름
//   - 마지막 열 sticky: total
//   - 미사용 2종(areaCode2·categoryCode2)은 라우트 자체에서 제외되어 표에 등장하지 않음 (의도)
import { cn } from '@/lib/utils';

export interface StatsRow {
  endpoint: string;
  daily: Array<{ date: string; count: number }>;
  total: number;
}

interface StatsTableProps {
  stats: StatsRow[];
}

// 날짜 표시는 MM-DD로 축약 (헤더 폭 절감, 전체 기간은 페이지 상단에 명시)
function formatShort(date: string): string {
  return date.slice(5); // 'YYYY-MM-DD' → 'MM-DD'
}

export function StatsTable({ stats }: StatsTableProps) {
  if (stats.length === 0) {
    return (
      <p className="text-body-sm text-muted-foreground">
        조회 가능한 통계가 없습니다.
      </p>
    );
  }

  // 모든 row의 daily는 동일 길이/날짜 (라우트가 ENDPOINTS × dates 동일하게 생성)
  const dates = stats[0]?.daily.map((d) => d.date) ?? [];

  return (
    <section aria-labelledby="stats-table-title" className="space-y-2">
      <h2 id="stats-table-title" className="text-heading-sm text-foreground">
        Endpoint × 일별 호출
      </h2>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[640px] text-body-sm">
          <thead className="bg-muted/40">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left font-semibold text-foreground"
              >
                Endpoint
              </th>
              {dates.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className="numeric px-3 py-2 text-right font-semibold text-muted-foreground"
                >
                  {formatShort(d)}
                </th>
              ))}
              <th
                scope="col"
                className="numeric sticky right-0 bg-muted/40 px-3 py-2 text-right font-semibold text-foreground"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((row) => {
              const inactive = row.total === 0;
              return (
                <tr
                  key={row.endpoint}
                  className={cn(
                    'border-t',
                    inactive ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-medium"
                  >
                    {row.endpoint}
                    {inactive ? (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-caption">
                        미호출
                      </span>
                    ) : null}
                  </th>
                  {row.daily.map((d) => (
                    <td
                      key={d.date}
                      className="numeric px-3 py-2 text-right"
                    >
                      {d.count.toLocaleString('ko-KR')}
                    </td>
                  ))}
                  <td className="numeric sticky right-0 bg-card px-3 py-2 text-right font-semibold">
                    {row.total.toLocaleString('ko-KR')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
