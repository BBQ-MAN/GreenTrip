// StatsChart — TourAPI 14종 endpoint 총 호출 막대 차트 (Client, Recharts)
// Phase 3 W15 — /admin/stats 페이지 구성품.
//
// 표시 전략:
//   - X축: endpoint 14개 (areaCode2/categoryCode2 미사용 2종은 라우트에서 제외)
//   - Y축: 기간 내 총 호출 수
//   - 막대 색: 활용(>0)은 brand green, 미호출(=0)은 muted gray
//     → 미호출이 시각적으로 즉시 식별되도록 ("호출 0건 의무" 검증 시각화)
//   - 막대가 짧아 라벨이 안 보일 수 있으므로 LabelList로 총합 표기
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from 'recharts';
import type { StatsRow } from './StatsTable';

interface StatsChartProps {
  stats: StatsRow[];
}

// CarbonChart와 동일 hex 토큰 정합
const COLOR_ACTIVE = '#0B8C5C'; // transport.eco / brand
const COLOR_INACTIVE = '#9CA3AF'; // gray-400

export function StatsChart({ stats }: StatsChartProps) {
  const data = stats.map((s) => ({
    endpoint: s.endpoint,
    total: s.total,
  }));
  const active = data.filter((d) => d.total > 0).length;
  const summary = `endpoint ${data.length}개 중 ${active}개 활성, 기간 총 호출 수 막대 차트`;

  return (
    <section aria-labelledby="stats-chart-title" className="space-y-2">
      <h2 id="stats-chart-title" className="text-heading-sm text-foreground">
        Endpoint별 총 호출
      </h2>
      <div
        role="img"
        aria-label={summary}
        className="h-72 w-full rounded-lg border bg-card p-4 md:h-80"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 16, right: 16, left: 0, bottom: 56 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="endpoint"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={56}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(11,140,92,0.06)' }}
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                fontSize: 13,
              }}
              formatter={(v: number) => [
                `${v.toLocaleString('ko-KR')} 회`,
                '호출 수',
              ]}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell
                  key={d.endpoint}
                  fill={d.total > 0 ? COLOR_ACTIVE : COLOR_INACTIVE}
                />
              ))}
              <LabelList
                dataKey="total"
                position="top"
                style={{ fontSize: 11, fill: '#374151' }}
                formatter={(v: number) => (v > 0 ? v : '')}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
