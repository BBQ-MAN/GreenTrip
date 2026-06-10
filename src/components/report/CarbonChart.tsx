// CarbonChart — 구간별 탄소 배출 vs 자가용 baseline 비교
// Client Component (Recharts SVG 인터랙션 + ResponsiveContainer ResizeObserver).
// 참조: _workspace/00_input/week10_request.md §C-3, DEVELOPMENT_PLAN.md §7.5
//
// Recharts는 fill에 hex 문자열을 직접 요구 → tokens.ts hex와 1:1 정합 유지.
// (Kakao Polyline과 동일 트레이드오프 — TRANSPORT_COLORS 참조)
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';

export interface CarbonChartDatum {
  /** 구간 라벨 (예: "구간 1") */
  name: string;
  /** 실제 배출량 (g) */
  actual: number;
  /** 자가용 baseline 배출량 (g) */
  baseline: number;
}

export interface CarbonChartProps {
  data: CarbonChartDatum[];
  /** 접근성: 차트 데이터 요약 (스크린리더용) */
  ariaSummary?: string;
}

// Recharts 인라인 hex — tokens.ts 와 1:1 정합.
// transport.eco (#097A50) = 실제 (저탄소 선택)
// transport.fast (#F59E0B) = 자가용 baseline
const COLOR_ACTUAL = '#097A50';
const COLOR_BASELINE = '#F59E0B';

export function CarbonChart({ data, ariaSummary }: CarbonChartProps) {
  const summary =
    ariaSummary ??
    `구간 ${data.length}개에 대한 실제 탄소 배출량과 자가용 기준 비교 차트`;

  return (
    <div
      role="img"
      aria-label={summary}
      className="h-64 w-full md:h-72"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="name"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            label={{
              value: 'CO₂ (g)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6B7280' },
            }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(11,140,92,0.06)' }}
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #E5E7EB',
              fontSize: 13,
            }}
            formatter={(v: number) => [`${Math.round(v)} g`, undefined]}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar
            dataKey="actual"
            name="실제 (저탄소)"
            fill={COLOR_ACTUAL}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="baseline"
            name="자가용 기준"
            fill={COLOR_BASELINE}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
