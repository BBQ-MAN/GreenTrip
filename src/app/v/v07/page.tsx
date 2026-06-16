// /v/v07 — 변형 데모: 퍼딩 데이터 에세이 (pudding-pinned-chart-essay)
// 단일 RSC. data-fetch 없음. 모든 색은 인라인 style (variant palette 격리).
// 영감: The Pudding, Pitchfork, Aeon — 차트가 본문이 되는 데이터 저널리즘.
import Link from 'next/link';
import { Star, Download, MessageCircle, Link2, QrCode } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '퍼딩 데이터 에세이 — GreenTrip v07',
  description:
    '스크롤 잠금 차트가 본문이 되고 글이 차트를 주석하는 데이터 저널리즘 에세이 변형(v07).',
};

// ───────────────────────────────────────────────────────────────
// Palette — variant 전용 (tailwind.config 미수정)
// ───────────────────────────────────────────────────────────────
const P = {
  bg: '#F4F1EA',
  fg: '#1B1B1B',
  primary: '#097A50',
  accent: '#FF5A36',
  muted: '#6B6557',
  surface: '#EAE5D6',
  hairline: 'rgba(27,27,27,0.14)',
} as const;

// 3안 mock — 강원 코스 예시 (랜딩 page.tsx MOCK_RESULT와 정합)
interface ModeRow {
  key: string;
  label: string;
  enLabel: string;
  co2Kg: number;
  color: string;
  note: string;
  recommended?: boolean;
}
const MODES: ReadonlyArray<ModeRow> = [
  {
    key: 'car',
    label: '자가용',
    enLabel: 'Private car',
    co2Kg: 14.1,
    color: '#C68A1E', // amber — fast
    note: '기준선 (baseline)',
  },
  {
    key: 'transit',
    label: '대중교통',
    enLabel: 'Express bus',
    co2Kg: 4.6,
    color: '#0F7C82', // teal — balance
    note: '추천 — 67.6% 절감',
    recommended: true,
  },
  {
    key: 'active',
    label: '자전거+도보',
    enLabel: 'Bike + walk',
    co2Kg: 0.2,
    color: P.primary, // green — eco
    note: '98.6% 절감 (단거리 한정)',
  },
] as const;

// ───────────────────────────────────────────────────────────────
// 1) HERO — Pitchfork 점수 스타일 (좌측 거대 numeric + 우측 italic)
// ───────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      aria-labelledby="v07-hero-title"
      style={{ backgroundColor: P.bg, color: P.fg, borderBottom: `1px solid ${P.hairline}` }}
    >
      {/* 메타 스트립 — mono caps */}
      <div
        className="mx-auto max-w-[1100px] px-5 pt-6 pb-3 md:px-10 md:pt-10"
      >
        <p
          className="font-mono tracking-[0.18em] text-[10px] uppercase md:text-[11px]"
          style={{ color: P.muted }}
        >
          Issue 07 · Data Essay · 강원 1박2일 · 2026.06
        </p>
      </div>

      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-6 px-5 pb-10 md:grid-cols-5 md:gap-10 md:px-10 md:pb-16">
        {/* 좌측 2/5 — 거대 wedge 67.6% */}
        <div className="md:col-span-2 md:border-r md:pr-8" style={{ borderColor: P.hairline }}>
          <div
            className="font-bold tracking-tight"
            style={{
              color: P.primary,
              fontSize: 'clamp(96px, 30vw, 192px)',
              lineHeight: 0.82,
              letterSpacing: '-0.04em',
            }}
            aria-label="67.6 퍼센트"
          >
            67<span style={{ color: P.accent }}>.</span>6
            <span
              className="font-mono align-top"
              style={{ fontSize: '0.28em', color: P.muted, marginLeft: '0.05em' }}
            >
              %
            </span>
          </div>
          <p
            className="mt-3 font-mono uppercase tracking-[0.18em] text-[10px]"
            style={{ color: P.muted }}
          >
            CO₂ saved · car → bus
          </p>
        </div>

        {/* 우측 3/5 — italic 헤드 + 메타 + KPI 스트립 */}
        <div className="md:col-span-3 md:pt-2">
          <h1
            id="v07-hero-title"
            className="font-bold tracking-tight"
            style={{
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 5vw, 44px)',
              lineHeight: 1.14,
              color: P.fg,
            }}
          >
            Korea&rsquo;s cleanest 1-day route,
            <br />
            <span style={{ color: P.primary }}>by the numbers.</span>
          </h1>

          <p
            className="mt-6 font-normal text-[18px] leading-[30px] md:text-[19px] md:leading-[32px]"
            style={{ color: P.fg }}
          >
            이동수단 하나가 67.6%를 바꿉니다. 같은 강원도 67.3km를{' '}
            <strong style={{ color: P.accent }}>자가용 14.1kg</strong> 대신{' '}
            <strong style={{ color: P.primary }}>고속버스 4.6kg</strong>으로 옮기면 — 한 사람당 소나무
            0.4그루의 1년치 흡수량이 남습니다. 아래 차트가 그 이야기를 합니다.
          </p>

          {/* KPI 스트립 — mono caps */}
          <dl
            className="mt-8 grid grid-cols-3 gap-3 border-t border-b py-4 text-left"
            style={{ borderColor: P.hairline }}
          >
            {[
              { k: 'CO₂ saved', v: '9,556', u: 'g' },
              { k: 'Trees / yr', v: '0.4', u: '그루' },
              { k: 'TourAPI', v: '14', u: '종' },
            ].map((m) => (
              <div key={m.k}>
                <dt
                  className="font-mono uppercase tracking-[0.16em] text-[10px]"
                  style={{ color: P.muted }}
                >
                  {m.k}
                </dt>
                <dd
                  className="mt-1 font-mono tracking-tight tabular-nums"
                  style={{ color: P.fg, fontSize: '28px', fontWeight: 700, lineHeight: 1 }}
                >
                  {m.v}
                  <span
                    className="ml-1 font-normal"
                    style={{ fontSize: '13px', color: P.muted }}
                  >
                    {m.u}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────
// 2) 시그니처 1 — Pudding 스크롤 잠금 (정적 재현 — 3 단계 단락이 차트 옆에 누적)
//    실제 sticky JS는 클라이언트 컴포넌트가 필요하므로,
//    여기선 *시각적 청사진*으로 단락 3개 + 차트 1개를 좌우 그리드로 박제.
// ───────────────────────────────────────────────────────────────
function CompareEssay() {
  // 차트 바 — 최대값(자가용 14.1) 기준 폭 비율
  const max = MODES[0].co2Kg;
  return (
    <section
      aria-labelledby="v07-compare-title"
      style={{ backgroundColor: P.bg, color: P.fg, borderBottom: `1px solid ${P.hairline}` }}
    >
      <div className="mx-auto max-w-[1100px] px-5 py-12 md:px-10 md:py-20">
        {/* 캡션 — mono caps */}
        <p
          className="font-mono uppercase tracking-[0.18em] text-[10px]"
          style={{ color: P.muted }}
        >
          Chapter 01 · The three options, side by side
        </p>
        <h2
          id="v07-compare-title"
          className="mt-3 font-bold tracking-tight"
          style={{
            fontStyle: 'italic',
            fontSize: 'clamp(24px, 4vw, 36px)',
            lineHeight: 1.2,
          }}
        >
          Scroll the chart. The story moves with it.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
          {/* 좌측 — 본문 단락 3개 (스크롤 시 강조될 단계) */}
          <article className="flex flex-col gap-8 order-2 md:order-1">
            {MODES.map((m, i) => (
              <div
                key={m.key}
                className="border-l-2 pl-4"
                style={{ borderColor: m.color }}
              >
                <p
                  className="font-mono uppercase tracking-[0.16em] text-[10px]"
                  style={{ color: P.muted }}
                >
                  Step 0{i + 1} · {m.enLabel}
                </p>
                <p
                  className="mt-2 font-normal text-[18px] leading-[30px] md:text-[19px] md:leading-[32px]"
                  style={{ color: P.fg }}
                >
                  {i === 0 && (
                    <>
                      <span
                        className="float-left mr-2 font-bold leading-[0.82]"
                        style={{
                          color: m.color,
                          fontSize: '64px',
                          paddingTop: '6px',
                        }}
                        aria-hidden="true"
                      >
                        K
                      </span>
                      자가용으로 67.3km를 달리면{' '}
                      <strong className="font-mono tabular-nums" style={{ color: m.color }}>
                        14.1kg
                      </strong>
                      의 CO₂가 나옵니다. 이게 우리의 기준선이고, 대부분의 여행이 이 막대에서 시작합니다.
                    </>
                  )}
                  {i === 1 && (
                    <>
                      같은 거리를 고속버스로 옮기면{' '}
                      <strong className="font-mono tabular-nums" style={{ color: m.color }}>
                        4.6kg
                      </strong>
                      . 거의 3분의 1로 줄어들죠. 시간은 6분 더 걸리지만, 이게 우리가{' '}
                      <em>추천</em>으로 뽑은 이유입니다.
                    </>
                  )}
                  {i === 2 && (
                    <>
                      도심 단거리(8.4km)는 자전거+도보로{' '}
                      <strong className="font-mono tabular-nums" style={{ color: m.color }}>
                        0.2kg
                      </strong>{' '}
                      — 사실상 0. 그래서 차트 막대가 거의 보이지 않습니다.{' '}
                      <strong style={{ color: P.accent }}>Δ −67.6%</strong>는 그 빈 자리에서 옵니다.
                    </>
                  )}
                </p>
              </div>
            ))}
          </article>

          {/* 우측 — 3-bar 차트 (sticky 자리를 정적으로 박제) */}
          <figure
            className="order-1 md:order-2 md:sticky md:top-8 self-start rounded-md p-6 md:p-8"
            style={{ backgroundColor: P.surface, border: `1px solid ${P.hairline}` }}
            aria-label="이동수단별 CO₂ 배출 비교 차트"
          >
            <figcaption
              className="font-mono uppercase tracking-[0.16em] text-[10px]"
              style={{ color: P.muted }}
            >
              Fig. 01 · CO₂ kg per person · 67.3 km
            </figcaption>

            <ul className="mt-6 flex flex-col gap-5" role="list">
              {MODES.map((m) => {
                const pct = Math.max(2, (m.co2Kg / max) * 100);
                return (
                  <li key={m.key}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span
                        className="font-mono uppercase tracking-[0.14em] text-[11px]"
                        style={{ color: P.fg }}
                      >
                        {m.enLabel}
                        {m.recommended ? (
                          <span
                            className="ml-2 inline-flex items-center gap-1 rounded-sm px-1.5 py-[1px]"
                            style={{ backgroundColor: P.accent, color: '#fff', fontSize: '9px' }}
                            aria-label="추천"
                          >
                            <Star aria-hidden="true" className="h-2.5 w-2.5 fill-white" />
                            PICK
                          </span>
                        ) : null}
                      </span>
                      <span
                        className="font-mono tracking-tight tabular-nums"
                        style={{ color: m.color, fontSize: '20px', fontWeight: 700 }}
                      >
                        {m.co2Kg.toFixed(1)}
                        <span className="ml-1" style={{ fontSize: '11px', color: P.muted }}>
                          kg
                        </span>
                      </span>
                    </div>
                    <div
                      className="h-7 w-full overflow-hidden"
                      style={{ backgroundColor: 'rgba(27,27,27,0.06)' }}
                      role="img"
                      aria-label={`${m.label} ${m.co2Kg.toFixed(1)} 킬로그램`}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: m.color,
                          transition: 'width 250ms ease',
                        }}
                      />
                    </div>
                    <p
                      className="mt-1 font-mono uppercase tracking-[0.14em] text-[10px]"
                      style={{ color: P.muted }}
                    >
                      {m.note}
                    </p>
                  </li>
                );
              })}
            </ul>

            {/* Δ 라벨 — 마지막 단계에서 등장하는 그 라벨 */}
            <div
              className="mt-6 flex items-baseline justify-between border-t pt-4"
              style={{ borderColor: P.hairline }}
            >
              <span
                className="font-mono uppercase tracking-[0.16em] text-[10px]"
                style={{ color: P.muted }}
              >
                Δ Car → Bus
              </span>
              <span
                className="font-mono tracking-tight tabular-nums"
                style={{ color: P.accent, fontSize: '32px', fontWeight: 700, lineHeight: 1 }}
              >
                −67.6%
              </span>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────
// 3) 시그니처 2 — MUBI 크레딧 인증서 (단일 640px 칼럼, 드롭캡 + mono 크레딧)
// ───────────────────────────────────────────────────────────────
function CertEssay() {
  return (
    <section
      aria-labelledby="v07-cert-title"
      style={{ backgroundColor: P.surface, color: P.fg, borderBottom: `1px solid ${P.hairline}` }}
    >
      <div className="mx-auto max-w-[1100px] px-5 py-12 md:px-10 md:py-20">
        <p
          className="font-mono uppercase tracking-[0.18em] text-[10px]"
          style={{ color: P.muted }}
        >
          Chapter 02 · The receipt
        </p>

        <article
          className="mx-auto mt-6 max-w-[640px] rounded-md px-6 py-10 md:px-12 md:py-14"
          style={{ backgroundColor: P.bg, border: `1px solid ${P.hairline}` }}
          aria-label="저탄소 여행 인증서"
        >
          <h2
            id="v07-cert-title"
            className="font-bold tracking-tight"
            style={{
              fontStyle: 'italic',
              fontSize: 'clamp(26px, 4vw, 38px)',
              lineHeight: 1.18,
              color: P.fg,
            }}
          >
            Verified Low-Carbon Trip
          </h2>
          <p
            className="mt-1 font-mono uppercase tracking-[0.18em] text-[10px]"
            style={{ color: P.muted }}
          >
            GreenTrip · Carbon Saving Certificate
          </p>

          {/* 드롭캡 본문 */}
          <p
            className="mt-7 font-normal text-[18px] leading-[32px] md:text-[19px] md:leading-[34px]"
            style={{ color: P.fg }}
          >
            <span
              className="float-left mr-3 font-bold"
              style={{
                color: P.primary,
                fontSize: '80px',
                lineHeight: '0.82',
                paddingTop: '8px',
              }}
              aria-hidden="true"
            >
              O
            </span>
            n a clear day in 2026, a traveler chose the bus over the car for a round trip through
            Gangwon. The route saved{' '}
            <strong className="font-mono tabular-nums" style={{ color: P.primary }}>
              9.6 kg
            </strong>{' '}
            of CO₂ — about a pine tree&rsquo;s annual breath. This certificate verifies that trip.
          </p>

          {/* 크레딧 스트립 — mono caps */}
          <dl
            className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-b py-5 md:grid-cols-4"
            style={{ borderColor: P.hairline }}
          >
            {[
              { k: 'Route', v: '강원도 1박2일' },
              { k: 'Date', v: '2026.06.16' },
              { k: 'CO₂ saved', v: '−9.6 kg' },
              { k: 'Hash', v: 'a7f2…0c91' },
            ].map((c) => (
              <div key={c.k}>
                <dt
                  className="font-mono uppercase tracking-[0.16em] text-[10px]"
                  style={{ color: P.muted }}
                >
                  {c.k}
                </dt>
                <dd
                  className="mt-1 font-mono tabular-nums"
                  style={{ color: P.fg, fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em' }}
                >
                  {c.v}
                </dd>
              </div>
            ))}
          </dl>

          {/* 트리 + 이동수단 보조 라인 */}
          <p
            className="mt-5 font-mono uppercase tracking-[0.16em] text-[10px]"
            style={{ color: P.muted }}
          >
            Equivalent · 0.4 trees / yr · Transport: Express bus
          </p>

          {/* 우측 하단 — 공유 행 + QR */}
          <div className="mt-8 flex items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.14em] text-[10px]"
                style={{ color: P.fg, borderBottom: `1px solid ${P.fg}`, paddingBottom: '2px' }}
                aria-label="인증서 PNG 다운로드"
              >
                <Download aria-hidden="true" className="h-3 w-3" />
                Download
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.14em] text-[10px]"
                style={{ color: P.fg, borderBottom: `1px solid ${P.fg}`, paddingBottom: '2px' }}
                aria-label="카카오로 공유"
              >
                <MessageCircle aria-hidden="true" className="h-3 w-3" />
                Kakao
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.14em] text-[10px]"
                style={{ color: P.fg, borderBottom: `1px solid ${P.fg}`, paddingBottom: '2px' }}
                aria-label="링크 복사"
              >
                <Link2 aria-hidden="true" className="h-3 w-3" />
                Copy link
              </button>
            </div>

            <div
              className="flex h-14 w-14 items-center justify-center rounded-sm"
              style={{ backgroundColor: P.fg, color: P.bg }}
              role="img"
              aria-label="인증서 QR 코드"
            >
              <QrCode aria-hidden="true" className="h-8 w-8" />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────
// 4) 시그니처 3 — Carbon Scale 리본 (4-tier) + Before/After
// ───────────────────────────────────────────────────────────────
function CarbonScale() {
  const tiers = [
    { label: '≤ 2 kg', range: '0–2', color: P.primary, en: 'Excellent' },
    { label: '≤ 6 kg', range: '2–6', color: '#0F7C82', en: 'Good', current: true },
    { label: '≤ 12 kg', range: '6–12', color: '#C68A1E', en: 'Average' },
    { label: '> 12 kg', range: '12+', color: P.accent, en: 'Heavy', baseline: true },
  ];

  return (
    <section
      aria-labelledby="v07-scale-title"
      style={{ backgroundColor: P.bg, color: P.fg, borderBottom: `1px solid ${P.hairline}` }}
    >
      <div className="mx-auto max-w-[1100px] px-5 py-12 md:px-10 md:py-20">
        <p
          className="font-mono uppercase tracking-[0.18em] text-[10px]"
          style={{ color: P.muted }}
        >
          Chapter 03 · Where this trip lands
        </p>
        <h2
          id="v07-scale-title"
          className="mt-3 font-bold tracking-tight"
          style={{
            fontStyle: 'italic',
            fontSize: 'clamp(24px, 4vw, 36px)',
            lineHeight: 1.2,
          }}
        >
          The carbon scale, in four tiers.
        </h2>

        {/* 리본 — 4 tier */}
        <ol
          className="mt-10 grid grid-cols-4 overflow-hidden rounded-sm"
          style={{ border: `1px solid ${P.hairline}` }}
        >
          {tiers.map((t) => (
            <li
              key={t.label}
              className="relative flex flex-col items-start gap-1 p-4 md:p-5"
              style={{
                backgroundColor: t.current ? t.color : 'transparent',
                color: t.current ? '#fff' : P.fg,
                borderRight: `1px solid ${P.hairline}`,
              }}
              aria-current={t.current ? 'true' : undefined}
            >
              <span
                className="font-mono uppercase tracking-[0.14em] text-[10px]"
                style={{ color: t.current ? 'rgba(255,255,255,0.85)' : P.muted }}
              >
                {t.en}
              </span>
              <span
                className="font-mono tabular-nums"
                style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}
              >
                {t.label}
              </span>
              {t.current ? (
                <span
                  className="mt-1 font-mono uppercase tracking-[0.16em] text-[10px]"
                  style={{ color: '#fff' }}
                  aria-label="이 코스가 위치한 구간"
                >
                  ▶ You are here
                </span>
              ) : null}
              {t.baseline ? (
                <span
                  className="mt-1 font-mono uppercase tracking-[0.16em] text-[10px]"
                  style={{ color: P.muted }}
                >
                  baseline lives here
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        {/* Before / After — variant hero numeric */}
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          {/* Before */}
          <div className="border-t pt-6" style={{ borderColor: P.hairline }}>
            <p
              className="font-mono uppercase tracking-[0.18em] text-[10px]"
              style={{ color: P.muted }}
            >
              Before · car baseline
            </p>
            <div
              className="mt-2 font-mono tabular-nums tracking-tight"
              style={{
                color: P.muted,
                fontSize: 'clamp(72px, 14vw, 112px)',
                lineHeight: 0.86,
                textDecoration: 'line-through',
                textDecorationThickness: '3px',
              }}
              aria-label="변경 전 14.1 kg"
            >
              14.1
              <span style={{ fontSize: '0.32em', marginLeft: '0.08em' }}>kg</span>
            </div>
          </div>

          {/* After — 거대 hero 숫자 */}
          <div className="border-t pt-6" style={{ borderColor: P.hairline }}>
            <p
              className="font-mono uppercase tracking-[0.18em] text-[10px]"
              style={{ color: P.accent }}
            >
              After · express bus
            </p>
            <div
              className="mt-2 font-mono tabular-nums tracking-tight"
              style={{
                color: P.primary,
                fontSize: 'clamp(96px, 18vw, 168px)',
                lineHeight: 0.82,
                letterSpacing: '-0.03em',
                fontWeight: 700,
              }}
              aria-label="변경 후 4.6 kg"
            >
              4.6
              <span
                style={{
                  fontSize: '0.28em',
                  marginLeft: '0.08em',
                  color: P.muted,
                  fontWeight: 500,
                }}
              >
                kg
              </span>
            </div>
            <p
              className="mt-3 font-mono uppercase tracking-[0.16em] text-[11px]"
              style={{ color: P.accent }}
            >
              Δ −9,556 g · −67.6% · 0.4 trees / yr
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────
// 5) Footer
// ───────────────────────────────────────────────────────────────
function FooterStrip() {
  return (
    <footer style={{ backgroundColor: P.fg, color: P.bg }}>
      <div className="mx-auto flex max-w-[1100px] flex-col gap-3 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-10 md:py-10">
        <p
          className="font-mono uppercase tracking-[0.18em] text-[10px]"
          style={{ color: 'rgba(244,241,234,0.6)' }}
        >
          GreenTrip · v07 · pudding-pinned-chart-essay
        </p>
        <Link
          href="/v"
          className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.16em] text-[11px]"
          style={{ color: P.bg, borderBottom: `1px solid ${P.bg}`, paddingBottom: '2px' }}
          aria-label="변형 카탈로그로 돌아가기"
        >
          ← /v 카탈로그로 돌아가기
        </Link>
      </div>
    </footer>
  );
}

// ───────────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────────
export default function V07Page() {
  return (
    <main
      style={{
        backgroundColor: P.bg,
        color: P.fg,
        fontFamily:
          '"Source Serif 4", "Source Serif Pro", Georgia, "Noto Serif KR", serif',
      }}
    >
      <Hero />
      <CompareEssay />
      <CertEssay />
      <CarbonScale />
      <FooterStrip />
    </main>
  );
}
