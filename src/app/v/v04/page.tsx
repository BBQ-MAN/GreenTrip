// v04 — 스트라이프 렛저 (stripe-fintech-ledger)
// Variant comparison page (NOT main route). Static mock, no fetch.
// Inspiration: Stripe Annual Update 2025, Vercel Dashboard, Linear Insights.
// All color values come from the local PALETTE object via inline style — does NOT
// touch tailwind config or shared tokens. Self-contained.
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Link2,
  MessageSquare,
  Sparkle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '스트라이프 렛저 · GreenTrip 변형 v04',
  description:
    'Thin display + tabular-nums로 CO₂를 재무제표처럼 조판한 GreenTrip UI 변형 (v04 · stripe-fintech-ledger).',
};

// ---------------------------------------------------------------------------
// Palette — v04 전용 (인라인 style로만 사용, 외부 토큰 미오염)
// ---------------------------------------------------------------------------
const PAL = {
  bg: '#F6F9FC',
  fg: '#0A2540',
  primary: '#097A50',
  accent: '#635BFF',
  muted: '#425466',
  surface: '#FFFFFF',
  hairline: '#E3E8EE',
  fgSoft: 'rgba(10, 37, 64, 0.6)',
} as const;

// ---------------------------------------------------------------------------
// Mini 12-bar sparkline (inline SVG, decorative)
// ---------------------------------------------------------------------------
function Sparkline({
  values,
  stroke = PAL.accent,
  width = 96,
  height = 24,
}: {
  values: number[];
  stroke?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1 || 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - (v / max) * (height - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

function BarsMini({
  values,
  color = PAL.muted,
}: {
  values: number[];
  color?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div
      className="inline-flex items-end gap-[3px]"
      aria-hidden="true"
      style={{ height: 18 }}
    >
      {values.map((v, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 4,
            height: `${Math.max(2, (v / max) * 18)}px`,
            backgroundColor: color,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// QR — 1cm 사각형 mock (decorative)
// ---------------------------------------------------------------------------
function QrMock({ size = 72 }: { size?: number }) {
  // 7×7 deterministic pseudo-pattern
  const cells: number[] = [
    1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1,
    1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1,
  ];
  const n = 7;
  const c = size / n;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect
        x="0"
        y="0"
        width={size}
        height={size}
        fill={PAL.surface}
        stroke={PAL.accent}
        strokeWidth="1"
      />
      {cells.map((v, i) =>
        v ? (
          <rect
            key={i}
            x={(i % n) * c + 2}
            y={Math.floor(i / n) * c + 2}
            width={c - 2}
            height={c - 2}
            fill={PAL.accent}
          />
        ) : null,
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Section: HERO
// ---------------------------------------------------------------------------
function Hero() {
  return (
    <section
      aria-labelledby="v04-hero"
      style={{
        backgroundColor: PAL.bg,
        borderBottom: `1px solid ${PAL.hairline}`,
      }}
    >
      <div className="mx-auto max-w-5xl px-5 pb-14 pt-10 md:px-10 md:pb-20 md:pt-16">
        {/* 톱 메타 라인: 작은 UPPERCASE + dot */}
        <div className="flex items-center justify-between">
          <span
            className="font-medium tabular-nums"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: PAL.muted,
            }}
          >
            Trip Carbon Saved · 2026 Q2
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                backgroundColor: PAL.accent,
                display: 'inline-block',
              }}
            />
            <span
              className="font-medium"
              style={{
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: PAL.accent,
              }}
            >
              Recommended
            </span>
          </span>
        </div>

        {/* 거대 thin display */}
        <h1
          id="v04-hero"
          className="mt-6 font-light tabular-nums"
          style={{
            fontSize: 'clamp(72px, 18vw, 112px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: PAL.fg,
          }}
        >
          67.6
          <span
            className="font-light"
            style={{ fontSize: '0.45em', color: PAL.muted, marginLeft: 4 }}
          >
            %
          </span>
        </h1>

        {/* 부제 + 인라인 델타 + sparkline */}
        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p
            className="font-normal"
            style={{
              fontSize: 16,
              lineHeight: '24px',
              color: PAL.muted,
              maxWidth: 520,
            }}
          >
            이동수단 하나가 한 번의 여행 탄소를 1/3로 줄입니다. GreenTrip은
            그 차이를 재무제표처럼 조판합니다.
          </p>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1 font-light tabular-nums"
              style={{
                fontSize: 14,
                color: PAL.primary,
                letterSpacing: '-0.01em',
              }}
            >
              <ArrowDownRight aria-hidden="true" className="h-4 w-4" />
              −9.56 kg
            </span>
            <Sparkline
              values={[8, 7, 9, 6, 5, 7, 5, 4, 6, 4, 3, 3]}
              stroke={PAL.primary}
              width={104}
              height={22}
            />
          </div>
        </div>

        {/* KPI strip — 3컬럼, 라벨/숫자 좌측정렬 (재무제표 스타일) */}
        <dl
          className="mt-10 grid grid-cols-3 gap-0"
          style={{
            borderTop: `1px solid ${PAL.hairline}`,
            borderBottom: `1px solid ${PAL.hairline}`,
          }}
        >
          {[
            { label: 'CO₂ Saved', value: '9,556', unit: 'g' },
            { label: 'Tree-Year Eq.', value: '0.4', unit: '그루' },
            { label: 'TourAPI Sources', value: '14', unit: '종' },
          ].map((kpi, i) => (
            <div
              key={kpi.label}
              className="flex flex-col py-5 md:py-6"
              style={{
                paddingLeft: i === 0 ? 0 : 16,
                paddingRight: 16,
                borderLeft: i === 0 ? 'none' : `1px solid ${PAL.hairline}`,
              }}
            >
              <dt
                className="font-medium"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: PAL.muted,
                }}
              >
                {kpi.label}
              </dt>
              <dd
                className="mt-2 font-light tabular-nums"
                style={{
                  fontSize: 'clamp(28px, 6vw, 40px)',
                  letterSpacing: '-0.02em',
                  color: PAL.fg,
                  lineHeight: 1.05,
                }}
              >
                {kpi.value}
                <span
                  className="font-light"
                  style={{
                    fontSize: '0.42em',
                    color: PAL.muted,
                    marginLeft: 4,
                  }}
                >
                  {kpi.unit}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: 시그니처 1 — 3안 비교 mini (재무제표 라인 아이템 스타일)
// ---------------------------------------------------------------------------
type Row = {
  key: string;
  label: string;
  modeLabel: string;
  kg: number;
  delta: string;
  bars: number[];
  recommended?: boolean;
  baseline?: boolean;
};

function CompareCard({ row }: { row: Row }) {
  return (
    <article
      role="group"
      aria-label={`${row.label} ${row.kg}kg`}
      style={{
        backgroundColor: PAL.surface,
        border: `1px solid ${PAL.hairline}`,
        borderLeft: row.recommended
          ? `1px solid ${PAL.primary}`
          : `1px solid ${PAL.hairline}`,
        borderLeftWidth: row.recommended ? 1 : 1,
        boxShadow: 'none',
        padding: '20px 18px',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="flex flex-col"
    >
      {/* 추천안만 좌측 1px 액센트 바를 명시적 strip으로 보강 (1px hairline 위에 겹쳐 시각화) */}
      {row.recommended ? (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: PAL.primary,
          }}
        />
      ) : null}

      {/* 라벨 + 추천 dot */}
      <div className="flex items-center justify-between">
        <span
          className="font-medium"
          style={{
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: PAL.muted,
          }}
        >
          {row.label}
        </span>
        {row.recommended ? (
          <span
            aria-label="추천"
            className="inline-flex items-center gap-1"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: PAL.accent,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                backgroundColor: PAL.accent,
                display: 'inline-block',
              }}
            />
            Recommended
          </span>
        ) : null}
      </div>

      {/* 거대 thin 숫자 — 소수점 정렬 (tabular-nums) */}
      <div className="mt-4 flex items-baseline gap-2">
        <span
          className="font-light tabular-nums"
          style={{
            fontSize: 56,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: PAL.fg,
          }}
        >
          {row.kg.toFixed(1)}
        </span>
        <span
          className="font-light tabular-nums"
          style={{ fontSize: 16, color: PAL.muted }}
        >
          kg
        </span>
      </div>

      {/* 델타 + 인라인 4-bar sparkline (같은 행) */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1 font-light tabular-nums"
          style={{
            fontSize: 13,
            color: row.baseline ? PAL.muted : PAL.primary,
            letterSpacing: '-0.01em',
          }}
        >
          {row.baseline ? (
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          {row.delta}
        </span>
        <BarsMini
          values={row.bars}
          color={row.baseline ? PAL.muted : PAL.primary}
        />
      </div>

      {/* 12px muted 메타 */}
      <p
        className="mt-3"
        style={{ fontSize: 12, color: PAL.muted, letterSpacing: '-0.005em' }}
      >
        vs 자가용 기준 · {row.modeLabel}
      </p>
    </article>
  );
}

function CompareSection() {
  const rows: Row[] = [
    {
      key: 'car',
      label: 'CAR — 자가용',
      modeLabel: '67.3 km',
      kg: 14.1,
      delta: 'baseline',
      bars: [12, 13, 14, 14],
      baseline: true,
    },
    {
      key: 'transit',
      label: 'TRANSIT — 대중교통',
      modeLabel: '고속버스',
      kg: 4.6,
      delta: '−9.6 kg',
      bars: [12, 9, 6, 5],
      recommended: true,
    },
    {
      key: 'active',
      label: 'ACTIVE — 자전거+도보',
      modeLabel: '자전거 8.4 km',
      kg: 0.2,
      delta: '−13.9 kg',
      bars: [14, 8, 3, 1],
    },
  ];

  return (
    <section
      aria-labelledby="v04-compare"
      style={{ backgroundColor: PAL.bg }}
    >
      <div className="mx-auto max-w-5xl px-5 py-14 md:px-10 md:py-20">
        <div className="flex flex-col gap-1">
          <span
            className="font-medium"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: PAL.muted,
            }}
          >
            Signature 01 · Transport Ledger
          </span>
          <h2
            id="v04-compare"
            className="font-light tabular-nums"
            style={{
              fontSize: 'clamp(28px, 5vw, 36px)',
              letterSpacing: '-0.02em',
              color: PAL.fg,
              lineHeight: 1.1,
            }}
          >
            이동수단 3안, 한 줄로 정렬된 탄소 라인 아이템
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {rows.map((r) => (
            <CompareCard key={r.key} row={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: 시그니처 2 — 인증서 mini (재무제표 헤더 스타일)
// ---------------------------------------------------------------------------
function CertSection() {
  const rows: Array<[string, string]> = [
    ['Issued', '2026.06.16'],
    ['Course', '강원도 1박2일'],
    ['Transport', '고속버스'],
    ['Distance Saved', '67.3 km'],
    ['CO₂ Saved', '9.6 kg'],
    ['Tree-Year Equiv.', '0.4 그루'],
    ['Data Source', '한국관광공사 TourAPI'],
    ['Method', 'Haversine × 배출계수'],
    ['Verifier', 'GreenTrip Carbon Engine v1.6'],
  ];

  return (
    <section
      aria-labelledby="v04-cert"
      style={{
        backgroundColor: PAL.surface,
        borderTop: `1px solid ${PAL.hairline}`,
        borderBottom: `1px solid ${PAL.hairline}`,
      }}
    >
      <div className="mx-auto max-w-5xl px-5 py-14 md:px-10 md:py-20">
        <div className="flex flex-col gap-1">
          <span
            className="font-medium"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: PAL.muted,
            }}
          >
            Signature 02 · Certificate
          </span>
          <h2
            id="v04-cert"
            className="font-light tabular-nums"
            style={{
              fontSize: 'clamp(28px, 5vw, 36px)',
              letterSpacing: '-0.02em',
              color: PAL.fg,
              lineHeight: 1.1,
            }}
          >
            발급증명 — 재무제표 헤더 포맷
          </h2>
        </div>

        <article
          aria-label="강원도 1박2일 고속버스 코스 인증서 미니"
          className="mt-8"
          style={{
            border: `1px solid ${PAL.hairline}`,
            backgroundColor: PAL.surface,
            padding: '24px 22px',
          }}
        >
          {/* 상단 라벨 라인 */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className="font-medium"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: PAL.muted,
                }}
              >
                Certificate No.
              </span>
              <div
                className="mt-2 font-light tabular-nums"
                style={{
                  fontSize: 'clamp(56px, 14vw, 96px)',
                  letterSpacing: '-0.02em',
                  color: PAL.fg,
                  lineHeight: 0.95,
                }}
              >
                GT-2406-0042
              </div>
            </div>
            <QrMock size={72} />
          </div>

          {/* 라벨/값 2컬럼 표 */}
          <dl
            className="mt-7"
            style={{ borderTop: `1px solid ${PAL.hairline}` }}
          >
            {rows.map(([label, value], i) => (
              <div
                key={label}
                className="grid grid-cols-2 gap-4 py-3 md:grid-cols-[1fr_1fr]"
                style={{
                  borderBottom:
                    i === rows.length - 1
                      ? 'none'
                      : `1px solid ${PAL.hairline}`,
                }}
              >
                <dt
                  className="font-medium tabular-nums"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: PAL.muted,
                  }}
                >
                  {label}
                </dt>
                <dd
                  className="font-normal tabular-nums"
                  style={{ fontSize: 14, color: PAL.fg, textAlign: 'right' }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* 시그너처 라인 */}
          <div
            className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2"
            style={{ borderTop: `1px solid ${PAL.hairline}`, paddingTop: 18 }}
          >
            <div>
              <div
                aria-hidden="true"
                style={{
                  height: 1,
                  backgroundColor: PAL.fg,
                  width: '80%',
                  marginBottom: 6,
                }}
              />
              <span
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 11,
                  color: PAL.muted,
                  letterSpacing: '0.04em',
                }}
              >
                AUTH · GreenTrip Engine
              </span>
            </div>
            <div>
              <div
                aria-hidden="true"
                style={{
                  height: 1,
                  backgroundColor: PAL.fg,
                  width: '80%',
                  marginBottom: 6,
                }}
              />
              <span
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 11,
                  color: PAL.muted,
                  letterSpacing: '0.04em',
                }}
              >
                CO-SIGNED · 한국관광공사 TourAPI
              </span>
            </div>
          </div>

          {/* Share row — 다운로드 / 카카오 / 링크 복사 */}
          <div
            className="mt-7 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="인증서 공유"
          >
            {[
              { Icon: Download, label: 'PDF 다운로드' },
              { Icon: MessageSquare, label: '카카오톡 공유' },
              { Icon: Link2, label: '링크 복사' },
            ].map(({ Icon, label }, i) => (
              <span
                key={label}
                role="button"
                aria-label={label}
                tabIndex={-1}
                className="inline-flex items-center gap-1.5"
                style={{
                  border: `1px solid ${PAL.hairline}`,
                  backgroundColor: PAL.surface,
                  color: i === 0 ? PAL.accent : PAL.fg,
                  fontSize: 12,
                  letterSpacing: '0.02em',
                  padding: '8px 12px',
                  minHeight: 44,
                  lineHeight: '20px',
                }}
              >
                <Icon
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  style={{ strokeWidth: 1.25 }}
                />
                {label}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: 시그니처 3 — Carbon Scale + Before/After
// ---------------------------------------------------------------------------
function ScaleSection() {
  // 4-tier ribbon: ≤2 / ≤6 / ≤12 / >12 — 이번 여행은 4.6kg → tier 2
  const tiers = [
    { label: 'A · ≤ 2kg', min: 0, max: 2 },
    { label: 'B · ≤ 6kg', min: 2, max: 6 },
    { label: 'C · ≤ 12kg', min: 6, max: 12 },
    { label: 'D · > 12kg', min: 12, max: 16 },
  ];
  const tripKg = 4.6;
  const baselineKg = 14.1;
  // 16kg 스케일 기준 마커 위치(%)
  const markerPct = (tripKg / 16) * 100;
  const baselinePct = (baselineKg / 16) * 100;

  return (
    <section
      aria-labelledby="v04-scale"
      style={{ backgroundColor: PAL.bg }}
    >
      <div className="mx-auto max-w-5xl px-5 py-14 md:px-10 md:py-20">
        <div className="flex flex-col gap-1">
          <span
            className="font-medium"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: PAL.muted,
            }}
          >
            Signature 03 · Carbon Scale
          </span>
          <h2
            id="v04-scale"
            className="font-light tabular-nums"
            style={{
              fontSize: 'clamp(28px, 5vw, 36px)',
              letterSpacing: '-0.02em',
              color: PAL.fg,
              lineHeight: 1.1,
            }}
          >
            등급 라인 — Before / After
          </h2>
        </div>

        {/* Before/After thin numerics */}
        <div
          className="mt-8 grid grid-cols-2 gap-0"
          style={{
            borderTop: `1px solid ${PAL.hairline}`,
            borderBottom: `1px solid ${PAL.hairline}`,
          }}
        >
          <div
            className="flex flex-col py-6"
            style={{ paddingRight: 16 }}
          >
            <span
              className="font-medium"
              style={{
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: PAL.muted,
              }}
            >
              Before · 자가용
            </span>
            <div
              className="mt-2 font-light tabular-nums"
              style={{
                fontSize: 'clamp(48px, 11vw, 80px)',
                letterSpacing: '-0.02em',
                color: PAL.muted,
                lineHeight: 1,
                textDecoration: 'line-through',
                textDecorationThickness: '1px',
              }}
            >
              14.1
              <span style={{ fontSize: '0.35em', marginLeft: 4 }}>kg</span>
            </div>
          </div>
          <div
            className="flex flex-col py-6"
            style={{
              paddingLeft: 16,
              borderLeft: `1px solid ${PAL.hairline}`,
            }}
          >
            <span
              className="inline-flex items-center gap-1.5 font-medium"
              style={{
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: PAL.accent,
              }}
            >
              <Sparkle aria-hidden="true" className="h-3 w-3" />
              After · 고속버스
            </span>
            <div
              className="mt-2 font-light tabular-nums"
              style={{
                fontSize: 'clamp(48px, 11vw, 80px)',
                letterSpacing: '-0.02em',
                color: PAL.fg,
                lineHeight: 1,
              }}
            >
              4.6
              <span
                style={{
                  fontSize: '0.35em',
                  marginLeft: 4,
                  color: PAL.muted,
                }}
              >
                kg
              </span>
            </div>
          </div>
        </div>

        {/* 4-tier ribbon */}
        <div
          className="mt-10"
          role="img"
          aria-label={`이 여행은 ${tripKg}kg 으로 B 등급 (≤ 6kg) 입니다`}
        >
          {/* tier 라벨 */}
          <div className="grid grid-cols-4 gap-0">
            {tiers.map((t, i) => (
              <span
                key={t.label}
                className="font-medium tabular-nums"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: i === 1 ? PAL.primary : PAL.muted,
                  paddingLeft: i === 0 ? 0 : 8,
                }}
              >
                {t.label}
              </span>
            ))}
          </div>

          {/* ribbon — 1px hairline 분할, A/B/C/D 4컬럼 */}
          <div
            className="relative mt-3"
            style={{
              height: 28,
              backgroundColor: PAL.surface,
              border: `1px solid ${PAL.hairline}`,
              display: 'grid',
              gridTemplateColumns: '12.5% 25% 37.5% 25%', // 0-2 / 2-6 / 6-12 / 12-16
            }}
          >
            {[
              `${PAL.primary}1F`, // ~12% opacity primary
              `${PAL.primary}3D`, // ~24%
              `${PAL.accent}29`,
              `${PAL.fg}1A`,
            ].map((bg, i) => (
              <span
                key={i}
                aria-hidden="true"
                style={{
                  backgroundColor: bg,
                  borderLeft: i === 0 ? 'none' : `1px solid ${PAL.hairline}`,
                }}
              />
            ))}

            {/* baseline marker (strike-through grey) */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: -6,
                bottom: -6,
                left: `${baselinePct}%`,
                width: 1,
                backgroundColor: PAL.muted,
              }}
            />
            {/* trip marker (primary 6px dot stem) */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: -8,
                bottom: -8,
                left: `${markerPct}%`,
                width: 2,
                backgroundColor: PAL.primary,
              }}
            />
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: -14,
                left: `calc(${markerPct}% - 5px)`,
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: PAL.primary,
              }}
            />
          </div>

          {/* x-axis 숫자 */}
          <div className="mt-2 grid grid-cols-4 gap-0">
            {['0', '2', '6', '12'].map((n, i) => (
              <span
                key={n}
                className="font-light tabular-nums"
                style={{
                  fontSize: 11,
                  color: PAL.muted,
                  letterSpacing: '-0.01em',
                  paddingLeft: i === 0 ? 0 : 8,
                }}
              >
                {n}kg
              </span>
            ))}
          </div>

          {/* 캡션 */}
          <p
            className="mt-5 font-normal"
            style={{
              fontSize: 14,
              lineHeight: '22px',
              color: PAL.muted,
              maxWidth: 560,
            }}
          >
            14.1kg → 4.6kg. 이 코스는{' '}
            <span style={{ color: PAL.primary }}>B 등급</span> (≤ 6kg)에
            안착했으며, 자가용 baseline 마커는 D 등급 구간에 머뭅니다.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Footer — /v 카탈로그로 돌아가기
// ---------------------------------------------------------------------------
function FooterNav() {
  return (
    <footer
      style={{
        backgroundColor: PAL.bg,
        borderTop: `1px solid ${PAL.hairline}`,
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-10">
        <Link
          href="/v"
          aria-label="GreenTrip 변형 카탈로그로 돌아가기"
          className="inline-flex items-center gap-1.5"
          style={{
            fontSize: 12,
            letterSpacing: '0.02em',
            color: PAL.fg,
            textDecoration: 'none',
          }}
        >
          ← /v 카탈로그로 돌아가기
        </Link>
        <span
          className="font-medium tabular-nums"
          style={{
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: PAL.muted,
          }}
        >
          v04 · stripe-fintech-ledger
        </span>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function V04Page() {
  return (
    <main style={{ backgroundColor: PAL.bg, color: PAL.fg }}>
      <Hero />
      <CompareSection />
      <CertSection />
      <ScaleSection />
      <FooterNav />
    </main>
  );
}
