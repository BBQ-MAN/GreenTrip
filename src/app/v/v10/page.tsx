// v10 — 오틀리 일러스트 지노 (oatly-illustration-zine)
// illustration-first variant. No photos, no charts, no UI cards — only SVG, hand-lettering, typewriter mono.
// Inspiration: Oatly · Treedom · Kakao Bank. Cream + deep green + rust orange.
// All colors via inline style. Tailwind utilities used for spacing/layout/typography only.
import Link from 'next/link';
import { ArrowLeft, Download, MessageCircle, Link2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'v10 · 오틀리 일러스트 지노 — GreenTrip',
  description:
    '손그림 일러스트와 타자기 메모로 가득한 zine 변형 — 사진 0, 차트 0, 오직 SVG와 손글씨.',
};

// ---------------------------------------------------------------------------
// 팔레트 — Oatly cream / deep green / rust orange
// ---------------------------------------------------------------------------
const palette = {
  bg: '#F4ECDC',
  fg: '#1B1B1B',
  primary: '#005A3C',
  accent: '#E9531D',
  muted: '#7A6A56',
  surface: '#EADFC8',
} as const;

// ---------------------------------------------------------------------------
// 손그림 SVG 콜렉션 — 모두 stroke 기반, 비대칭, "1mm 미세 떨림" 느낌
// ---------------------------------------------------------------------------
function LeafDoodle({ size = 110 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 110"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 92 C 24 60, 44 32, 90 18 C 86 44, 70 78, 30 96 Z"
        stroke={palette.primary}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22 88 C 38 72, 56 56, 80 36"
        stroke={palette.primary}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M40 76 L 50 68" stroke={palette.primary} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M52 64 L 60 56" stroke={palette.primary} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M64 52 L 72 44" stroke={palette.primary} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BicycleDoodle({ size = 140 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 90) / 140}
      viewBox="0 0 140 90"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="30" cy="65" r="20" stroke={palette.fg} strokeWidth="2.4" fill="none" />
      <circle cx="108" cy="65" r="20" stroke={palette.fg} strokeWidth="2.4" fill="none" />
      <path
        d="M30 65 L 56 30 L 92 30 L 108 65 L 68 65 L 56 30"
        stroke={palette.fg}
        strokeWidth="2.4"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M56 30 L 50 18 L 60 18" stroke={palette.fg} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M92 30 L 98 16" stroke={palette.fg} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="68" cy="65" r="3" fill={palette.accent} />
    </svg>
  );
}

function TrainDoodle({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 80) / 140} viewBox="0 0 140 80" fill="none" aria-hidden="true">
      <path
        d="M12 56 L 12 22 Q 12 14 22 14 L 108 14 Q 122 14 130 28 L 130 56 Z"
        stroke={palette.fg}
        strokeWidth="2.4"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="22" y="22" width="22" height="18" stroke={palette.fg} strokeWidth="2" fill="none" />
      <rect x="50" y="22" width="22" height="18" stroke={palette.fg} strokeWidth="2" fill="none" />
      <rect x="78" y="22" width="22" height="18" stroke={palette.fg} strokeWidth="2" fill="none" />
      <circle cx="32" cy="64" r="6" stroke={palette.fg} strokeWidth="2" fill="none" />
      <circle cx="60" cy="64" r="6" stroke={palette.fg} strokeWidth="2" fill="none" />
      <circle cx="100" cy="64" r="6" stroke={palette.fg} strokeWidth="2" fill="none" />
      <path d="M118 26 L 124 22" stroke={palette.accent} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function FootprintsDoodle({ size = 110 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 110 110" fill="none" aria-hidden="true">
      <ellipse cx="32" cy="36" rx="11" ry="16" stroke={palette.fg} strokeWidth="2.2" fill="none" />
      <circle cx="22" cy="22" r="3" stroke={palette.fg} strokeWidth="1.6" fill="none" />
      <circle cx="34" cy="16" r="3" stroke={palette.fg} strokeWidth="1.6" fill="none" />
      <circle cx="44" cy="22" r="3" stroke={palette.fg} strokeWidth="1.6" fill="none" />
      <ellipse cx="74" cy="74" rx="11" ry="16" stroke={palette.fg} strokeWidth="2.2" fill="none" />
      <circle cx="64" cy="60" r="3" stroke={palette.fg} strokeWidth="1.6" fill="none" />
      <circle cx="76" cy="54" r="3" stroke={palette.fg} strokeWidth="1.6" fill="none" />
      <circle cx="86" cy="60" r="3" stroke={palette.fg} strokeWidth="1.6" fill="none" />
    </svg>
  );
}

function CarDoodle({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 80) / 140} viewBox="0 0 140 80" fill="none" aria-hidden="true">
      <path
        d="M8 56 L 18 32 Q 22 24 32 24 L 96 24 Q 106 24 114 32 L 132 50 L 132 60 L 8 60 Z"
        stroke={palette.fg}
        strokeWidth="2.4"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M28 24 L 40 38 L 100 38 L 110 28" stroke={palette.fg} strokeWidth="2" fill="none" />
      <circle cx="36" cy="64" r="8" stroke={palette.fg} strokeWidth="2.2" fill="none" />
      <circle cx="100" cy="64" r="8" stroke={palette.fg} strokeWidth="2.2" fill="none" />
      <path d="M118 36 Q 130 30 130 22" stroke={palette.accent} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M124 44 Q 132 40 134 32" stroke={palette.accent} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function TrophyDoodle({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M18 10 L 46 10 L 44 32 Q 44 42 32 42 Q 20 42 20 32 Z"
        stroke={palette.fg}
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M18 14 Q 8 14 8 22 Q 8 30 20 30" stroke={palette.fg} strokeWidth="2.2" fill="none" />
      <path d="M46 14 Q 56 14 56 22 Q 56 30 44 30" stroke={palette.fg} strokeWidth="2.2" fill="none" />
      <path d="M28 42 L 28 50 L 36 50 L 36 42" stroke={palette.fg} strokeWidth="2.2" fill="none" />
      <path d="M20 54 L 44 54" stroke={palette.fg} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M32 18 L 33 22 L 37 22 L 34 25 L 35 29 L 32 27 L 29 29 L 30 25 L 27 22 L 31 22 Z" stroke={palette.accent} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowScribble({ width = 120, height = 60 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 60" fill="none" aria-hidden="true">
      <path
        d="M6 44 Q 30 8, 64 22 Q 92 34, 102 18"
        stroke={palette.accent}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M102 18 L 96 12 M102 18 L 108 12"
        stroke={palette.accent}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function DashBorder() {
  return (
    <svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 400 240"
      fill="none"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <rect
        x="6"
        y="6"
        width="388"
        height="228"
        rx="4"
        stroke={palette.fg}
        strokeWidth="1.8"
        strokeDasharray="5 6"
        fill="none"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 3안 데이터 (mock) — Korean 라벨, mono 라벨 콜라주용
// ---------------------------------------------------------------------------
const COMPARE = [
  {
    key: 'car',
    label: '자가용',
    en: 'a private car',
    co2: '14.1 kg',
    Doodle: CarDoodle,
    rotate: '-2deg',
    recommended: false,
    note: '편하지만 무겁다',
  },
  {
    key: 'transit',
    label: '대중교통',
    en: 'a bus or train',
    co2: '4.6 kg',
    Doodle: TrainDoodle,
    rotate: '1.5deg',
    recommended: true,
    note: 'pick this one',
  },
  {
    key: 'active',
    label: '자전거 + 도보',
    en: 'bike & foot',
    co2: '0.2 kg',
    Doodle: BicycleDoodle,
    rotate: '-1deg',
    recommended: false,
    note: '가장 가벼운 발걸음',
  },
] as const;

// ---------------------------------------------------------------------------
// Carbon Scale — 4 tiers (≤2 / ≤6 / ≤12 / >12). 손그림 reel 형태.
// ---------------------------------------------------------------------------
const TIERS = [
  { label: '≤ 2 kg', name: 'A', desc: '거의 0', stroke: false },
  { label: '≤ 6 kg', name: 'B', desc: '깨어있는', stroke: true }, // optimized 4.6 lands here
  { label: '≤ 12 kg', name: 'C', desc: '평균', stroke: false },
  { label: '> 12 kg', name: 'D', desc: '무거운', stroke: false }, // baseline 14.1 lands here
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function V10Page() {
  return (
    <main
      className="min-h-screen w-full"
      style={{
        backgroundColor: palette.bg,
        color: palette.fg,
        fontFamily:
          '"Courier New", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      }}
    >
      {/* =========================================================
          1. HERO — 거대한 핸드레터드 wordmark + 회전된 일러스트
          ========================================================= */}
      <section
        aria-labelledby="v10-hero"
        className="relative overflow-hidden px-5 pt-12 pb-16 md:px-12 md:pt-24 md:pb-28"
      >
        {/* 잉크 텍스처 — 종이 위 큰 동심원 (페일) */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 400 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="320" cy="120" r="180" stroke={palette.surface} strokeWidth="1.2" fill="none" />
          <circle cx="320" cy="120" r="140" stroke={palette.surface} strokeWidth="1.2" fill="none" />
          <circle cx="60" cy="520" r="160" stroke={palette.surface} strokeWidth="1.2" fill="none" />
        </svg>

        {/* 좌상단 잎 일러스트 — 회전 */}
        <div
          className="absolute left-3 top-4 md:left-10 md:top-10"
          style={{ transform: 'rotate(-12deg)' }}
        >
          <LeafDoodle size={90} />
        </div>

        {/* 우상단 자전거 일러스트 — 회전 */}
        <div
          className="absolute right-2 top-8 md:right-12 md:top-16"
          style={{ transform: 'rotate(6deg)' }}
        >
          <BicycleDoodle size={120} />
        </div>

        <div className="relative mx-auto max-w-3xl">
          {/* 상단 메타 — 타자기 라인 */}
          <p
            className="font-mono text-[12px] tracking-widest uppercase"
            style={{ color: palette.muted }}
          >
            ISSUE №01 / 2026-06-16 / 강원
          </p>

          {/* 거대한 핸드레터드 wordmark */}
          <h1
            id="v10-hero"
            className="mt-8 font-black tracking-tight"
            style={{
              color: palette.primary,
              fontSize: 'clamp(3.5rem, 18vw, 8rem)',
              lineHeight: '0.85',
              letterSpacing: '-0.04em',
              transform: 'rotate(-1.5deg)',
              fontStretch: 'condensed',
            }}
          >
            GREEN
            <br />
            TRIP.
          </h1>

          {/* 타자기 sub */}
          <p
            className="mt-6 font-mono text-[15px] leading-[24px] md:text-[17px]"
            style={{ color: palette.fg }}
          >
            a low-carbon zine for korean trips,
            <br />
            since 2026.
          </p>

          {/* 후크 — 회전된 손글씨 풍 */}
          <p
            className="mt-10 font-black tracking-tight md:text-[44px]"
            style={{
              color: palette.fg,
              fontSize: 'clamp(1.6rem, 6vw, 2.75rem)',
              lineHeight: '1.05',
              transform: 'rotate(0.5deg)',
            }}
          >
            이동수단 <span style={{ color: palette.accent }}>하나</span>가
            <br />
            <span
              style={{
                backgroundImage: `linear-gradient(transparent 60%, ${palette.accent}55 60%)`,
              }}
              className="tabular-nums"
            >
              67.6%
            </span>
            를 바꿉니다.
          </p>

          {/* KPI strip — 회전된 종이쪽 3개 */}
          <ul
            aria-label="핵심 지표"
            className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
          >
            {[
              { n: '9,556g', l: '한 코스 절감', r: '-2.2deg' },
              { n: '0.4', l: '나무 그루', r: '1.5deg' },
              { n: '14종', l: 'TourAPI 활용', r: '-0.8deg' },
            ].map((k) => (
              <li
                key={k.l}
                className="relative px-5 py-4"
                style={{
                  backgroundColor: palette.surface,
                  transform: `rotate(${k.r})`,
                  boxShadow: `2px 2px 0 0 ${palette.fg}`,
                }}
              >
                <span
                  className="font-mono font-bold tabular-nums"
                  style={{
                    color: palette.primary,
                    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {k.n}
                </span>
                <span
                  className="block font-mono text-[12px] tracking-wide uppercase mt-1"
                  style={{ color: palette.muted }}
                >
                  {k.l}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 하단 좌측 잎 */}
        <div
          className="absolute bottom-2 left-2 md:bottom-6 md:left-8"
          style={{ transform: 'rotate(160deg)' }}
        >
          <LeafDoodle size={70} />
        </div>
      </section>

      {/* 구분선 — 손그림 점선 */}
      <DividerScribble />

      {/* =========================================================
          2. 시그니처 1 — 3안 콜라주 zine 페이지
          ========================================================= */}
      <section
        aria-labelledby="v10-compare"
        className="relative px-5 py-16 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-3xl">
          <p
            className="font-mono text-[12px] tracking-widest uppercase"
            style={{ color: palette.accent }}
          >
            page 02 — three ways to go
          </p>
          <h2
            id="v10-compare"
            className="mt-3 font-black tracking-tight"
            style={{
              color: palette.fg,
              fontSize: 'clamp(2rem, 7vw, 3rem)',
              lineHeight: '0.95',
              letterSpacing: '-0.03em',
            }}
          >
            같은 여행지,
            <br />
            <span style={{ color: palette.primary }}>다른 발자국.</span>
          </h2>

          <p
            className="mt-6 font-mono text-[15px] leading-[24px] max-w-xl"
            style={{ color: palette.muted }}
          >
            세 장의 종이가 책상 위에 흩어져 있습니다. 하나씩 집어드세요.
          </p>

          {/* 3안 — 손그림 zine 콜라주. 겹치게 보이려고 약간씩 회전 + 음수 마진. */}
          <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-3 md:gap-6">
            {COMPARE.map((opt, idx) => {
              const Doodle = opt.Doodle;
              return (
                <article
                  key={opt.key}
                  aria-label={`${opt.label} 코스, ${opt.co2}`}
                  className="relative px-5 py-6 md:px-6 md:py-7"
                  style={{
                    backgroundColor: opt.recommended ? palette.surface : '#FFFFFF',
                    transform: `rotate(${opt.rotate}) translateY(${idx * 4}px)`,
                    boxShadow: opt.recommended
                      ? `4px 4px 0 0 ${palette.primary}`
                      : `3px 3px 0 0 ${palette.fg}`,
                    border: `1.5px solid ${palette.fg}`,
                  }}
                >
                  {/* 종이 모서리 점선 보더 (손그림) */}
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="96"
                      height="96"
                      stroke={opt.recommended ? palette.primary : palette.muted}
                      strokeWidth="0.4"
                      strokeDasharray="1.5 2"
                      fill="none"
                    />
                  </svg>

                  {/* 추천 손글씨 화살표 */}
                  {opt.recommended ? (
                    <div
                      className="absolute -top-12 left-1/2 -translate-x-1/2"
                      aria-label="추천 코스"
                    >
                      <span
                        className="block font-black text-center mb-1"
                        style={{
                          color: palette.accent,
                          fontSize: '20px',
                          transform: 'rotate(-4deg)',
                          fontFamily: '"Bradley Hand", "Comic Sans MS", cursive',
                        }}
                      >
                        pick this one →
                      </span>
                      <div style={{ transform: 'rotate(8deg)' }}>
                        <ArrowScribble width={90} height={48} />
                      </div>
                    </div>
                  ) : null}

                  {/* 상단 라벨 — 타자기 라인 */}
                  <p
                    className="font-mono text-[11px] tracking-widest uppercase"
                    style={{ color: palette.muted }}
                  >
                    #{(idx + 1).toString().padStart(2, '0')} · {opt.en}
                  </p>

                  {/* 일러스트 */}
                  <div className="my-4 flex items-center justify-center">
                    <Doodle size={130} />
                  </div>

                  {/* 라벨 손글씨 + mono CO₂ 타자기 라벨 */}
                  <h3
                    className="font-black tracking-tight"
                    style={{
                      color: palette.fg,
                      fontSize: '24px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {opt.label}
                  </h3>

                  <div
                    className="mt-3 inline-block px-2 py-1"
                    style={{
                      backgroundColor: palette.fg,
                      color: palette.bg,
                    }}
                  >
                    <span className="font-mono font-bold tabular-nums text-[15px]">
                      {opt.co2} CO₂e
                    </span>
                  </div>

                  <p
                    className="mt-4 font-mono text-[13px] leading-[20px]"
                    style={{ color: palette.muted }}
                  >
                    {opt.note}
                  </p>
                </article>
              );
            })}
          </div>

          {/* 발자국 일러스트 — 단락 끝 sign-off */}
          <div
            className="mt-16 flex items-center justify-end gap-3"
            style={{ transform: 'rotate(2deg)' }}
          >
            <span
              className="font-mono text-[12px] tracking-widest uppercase"
              style={{ color: palette.muted }}
            >
              keep walking
            </span>
            <FootprintsDoodle size={80} />
          </div>
        </div>
      </section>

      <DividerScribble />

      {/* =========================================================
          3. 시그니처 2 — 인증서 = Oatly 패키지 라벨
          ========================================================= */}
      <section
        aria-labelledby="v10-cert"
        className="relative px-5 py-16 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-2xl">
          <p
            className="font-mono text-[12px] tracking-widest uppercase"
            style={{ color: palette.accent }}
          >
            page 03 — receipt
          </p>
          <h2
            id="v10-cert"
            className="mt-3 font-black tracking-tight"
            style={{
              color: palette.fg,
              fontSize: 'clamp(2rem, 7vw, 3rem)',
              lineHeight: '0.95',
              letterSpacing: '-0.03em',
            }}
          >
            영수증을
            <br />
            <span style={{ color: palette.accent }}>한 장</span> 드립니다.
          </h2>

          {/* 패키지 라벨 — 직사각 카드 + 손그림 점선 보더 */}
          <div
            className="relative mt-12 mx-auto px-6 py-10 md:px-10 md:py-12"
            style={{
              backgroundColor: palette.surface,
              color: palette.fg,
              maxWidth: '480px',
              transform: 'rotate(-0.8deg)',
              boxShadow: `5px 5px 0 0 ${palette.fg}`,
              border: `1.5px solid ${palette.fg}`,
            }}
          >
            <DashBorder />

            <div className="relative">
              {/* 트로피 일러스트 — 가운데 정렬, 살짝 회전 */}
              <div
                className="mx-auto flex justify-center mb-3"
                style={{ transform: 'rotate(-3deg)' }}
              >
                <TrophyDoodle size={68} />
              </div>

              {/* 타자기 헤더 */}
              <p
                className="text-center font-mono text-[11px] tracking-[0.3em] uppercase"
                style={{ color: palette.muted }}
              >
                — carbon receipt —
              </p>

              {/* 거대한 numeric */}
              <p
                className="mt-5 text-center font-mono font-bold tabular-nums"
                style={{
                  color: palette.primary,
                  fontSize: 'clamp(3rem, 14vw, 5rem)',
                  letterSpacing: '-0.04em',
                  lineHeight: '0.9',
                }}
              >
                67.6%
              </p>
              <p
                className="mt-2 text-center font-mono text-[13px]"
                style={{ color: palette.fg }}
              >
                less CO₂ than driving solo
              </p>

              {/* 점선 구분 */}
              <div
                className="my-6 mx-auto"
                style={{
                  height: '1px',
                  width: '80%',
                  backgroundImage: `repeating-linear-gradient(to right, ${palette.fg} 0 6px, transparent 6px 12px)`,
                }}
                aria-hidden="true"
              />

              {/* 코스 메타 — 타자기 mono */}
              <dl
                className="font-mono text-[13px] leading-[22px] mx-auto"
                style={{ color: palette.fg, maxWidth: '320px' }}
              >
                <div className="flex justify-between">
                  <dt style={{ color: palette.muted }}>course</dt>
                  <dd className="font-semibold">강원 1박2일 · 고속버스</dd>
                </div>
                <div className="flex justify-between mt-1">
                  <dt style={{ color: palette.muted }}>saved</dt>
                  <dd className="font-bold tabular-nums" style={{ color: palette.accent }}>
                    −9.6 kg CO₂e
                  </dd>
                </div>
                <div className="flex justify-between mt-1">
                  <dt style={{ color: palette.muted }}>= trees</dt>
                  <dd className="font-bold tabular-nums">0.4 그루</dd>
                </div>
              </dl>

              {/* 손글씨 서명 */}
              <p
                className="mt-8 text-center"
                style={{
                  color: palette.primary,
                  fontFamily: '"Bradley Hand", "Comic Sans MS", cursive',
                  fontSize: '22px',
                  transform: 'rotate(-2deg)',
                  display: 'inline-block',
                  width: '100%',
                }}
              >
                ~ GreenTrip
              </p>
              <p
                className="text-center font-mono text-[11px] tracking-widest uppercase mt-1"
                style={{ color: palette.muted }}
              >
                signed on 2026 · 06 · 16
              </p>

              {/* 점선 구분 */}
              <div
                className="my-6 mx-auto"
                style={{
                  height: '1px',
                  width: '80%',
                  backgroundImage: `repeating-linear-gradient(to right, ${palette.fg} 0 6px, transparent 6px 12px)`,
                }}
                aria-hidden="true"
              />

              {/* 공유 행 — 손그림 카카오 말풍선 + 다운로드 + 링크 */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  role="button"
                  aria-label="인증서 PDF 다운로드"
                  className="inline-flex items-center gap-2 px-3 py-2 font-mono text-[12px] tracking-widest uppercase"
                  style={{
                    backgroundColor: palette.fg,
                    color: palette.bg,
                    border: `1.5px solid ${palette.fg}`,
                  }}
                >
                  <Download aria-hidden="true" className="h-3.5 w-3.5" />
                  pdf
                </button>
                <button
                  type="button"
                  role="button"
                  aria-label="카카오톡으로 공유"
                  className="inline-flex items-center gap-2 px-3 py-2 font-mono text-[12px] tracking-widest uppercase"
                  style={{
                    backgroundColor: palette.accent,
                    color: '#FFFFFF',
                    border: `1.5px solid ${palette.fg}`,
                  }}
                >
                  <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                  kakao
                </button>
                <button
                  type="button"
                  role="button"
                  aria-label="공유 링크 복사"
                  className="inline-flex items-center gap-2 px-3 py-2 font-mono text-[12px] tracking-widest uppercase"
                  style={{
                    backgroundColor: palette.bg,
                    color: palette.fg,
                    border: `1.5px solid ${palette.fg}`,
                  }}
                >
                  <Link2 aria-hidden="true" className="h-3.5 w-3.5" />
                  copy link
                </button>
              </div>

              <p
                className="mt-5 text-center font-mono text-[11px] break-all"
                style={{ color: palette.muted }}
              >
                greentrip.kr/r/8K3vQ
              </p>
            </div>
          </div>

          {/* 라벨 옆 작은 잎 */}
          <div
            className="mx-auto mt-8 flex items-center justify-center gap-3"
            aria-hidden="true"
          >
            <LeafDoodle size={48} />
            <span
              className="font-mono text-[12px] tracking-widest uppercase"
              style={{ color: palette.muted }}
            >
              made with 식물
            </span>
            <LeafDoodle size={48} />
          </div>
        </div>
      </section>

      <DividerScribble />

      {/* =========================================================
          4. 시그니처 3 — Carbon Scale + Before/After
          ========================================================= */}
      <section
        aria-labelledby="v10-scale"
        className="relative px-5 py-16 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-3xl">
          <p
            className="font-mono text-[12px] tracking-widest uppercase"
            style={{ color: palette.accent }}
          >
            page 04 — the scale
          </p>
          <h2
            id="v10-scale"
            className="mt-3 font-black tracking-tight"
            style={{
              color: palette.fg,
              fontSize: 'clamp(2rem, 7vw, 3rem)',
              lineHeight: '0.95',
              letterSpacing: '-0.03em',
            }}
          >
            무게를
            <br />
            <span style={{ color: palette.primary }}>달아봅니다.</span>
          </h2>

          {/* Before / After — 거대한 numeric */}
          <div className="mt-12 grid grid-cols-2 gap-6 md:gap-10 items-end">
            <div style={{ transform: 'rotate(-2deg)' }}>
              <p
                className="font-mono text-[12px] tracking-widest uppercase"
                style={{ color: palette.muted }}
              >
                before
              </p>
              <p
                className="font-mono font-bold tabular-nums mt-1"
                style={{
                  color: palette.muted,
                  fontSize: 'clamp(2.5rem, 11vw, 5rem)',
                  letterSpacing: '-0.04em',
                  textDecoration: 'line-through',
                  textDecorationThickness: '4px',
                  lineHeight: '1',
                }}
              >
                14.1
              </p>
              <p
                className="font-mono text-[13px] mt-1"
                style={{ color: palette.muted }}
              >
                kg CO₂e · 자가용
              </p>
            </div>

            <div style={{ transform: 'rotate(2deg)' }}>
              <p
                className="font-mono text-[12px] tracking-widest uppercase"
                style={{ color: palette.accent }}
              >
                after
              </p>
              <p
                className="font-black tabular-nums mt-1"
                style={{
                  color: palette.primary,
                  fontSize: 'clamp(3.5rem, 18vw, 7rem)',
                  letterSpacing: '-0.05em',
                  lineHeight: '0.9',
                  fontFamily:
                    '"Courier New", ui-monospace, SFMono-Regular, monospace',
                  fontWeight: 900,
                }}
              >
                4.6
              </p>
              <p
                className="font-mono text-[13px] mt-1"
                style={{ color: palette.fg }}
              >
                kg CO₂e · 대중교통
              </p>
            </div>
          </div>

          {/* 절감 손글씨 강조 */}
          <p
            className="mt-10 text-center font-black"
            style={{
              color: palette.accent,
              fontSize: 'clamp(1.4rem, 5vw, 2.2rem)',
              transform: 'rotate(-1deg)',
            }}
          >
            ⇣ −9.6 kg · 67.6% 가벼워졌다 ⇣
          </p>

          {/* 4-tier ribbon — 손그림 reel. 각 tier가 작은 종이쪽처럼 */}
          <ol
            aria-label="탄소 등급 4단계"
            className="mt-14 grid grid-cols-4 gap-2 md:gap-4"
          >
            {TIERS.map((t, idx) => {
              const isMatch = t.stroke;
              return (
                <li
                  key={t.name}
                  className="relative px-2 py-4 md:px-3 md:py-6 text-center"
                  style={{
                    backgroundColor: isMatch ? palette.primary : palette.surface,
                    color: isMatch ? palette.bg : palette.fg,
                    border: `1.5px solid ${palette.fg}`,
                    boxShadow: isMatch
                      ? `3px 3px 0 0 ${palette.accent}`
                      : `2px 2px 0 0 ${palette.fg}`,
                    transform: `rotate(${(idx - 1.5) * 1.2}deg)`,
                  }}
                >
                  <span
                    className="block font-black"
                    style={{
                      fontSize: 'clamp(1.4rem, 5vw, 2rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: '1',
                    }}
                  >
                    {t.name}
                  </span>
                  <span
                    className="block font-mono text-[11px] tracking-widest uppercase mt-2"
                    style={{
                      color: isMatch ? palette.bg : palette.muted,
                    }}
                  >
                    {t.label}
                  </span>
                  <span
                    className="block font-mono text-[12px] mt-1"
                    style={{
                      color: isMatch ? palette.bg : palette.fg,
                    }}
                  >
                    {t.desc}
                  </span>

                  {/* 매치 표시 손글씨 */}
                  {isMatch ? (
                    <span
                      className="absolute -top-7 left-1/2 -translate-x-1/2 font-black"
                      style={{
                        color: palette.accent,
                        fontSize: '14px',
                        fontFamily: '"Bradley Hand", "Comic Sans MS", cursive',
                        transform: 'rotate(-6deg)',
                        whiteSpace: 'nowrap',
                      }}
                      aria-label="이 코스의 등급"
                    >
                      ★ here
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>

          <p
            className="mt-10 font-mono text-[13px] leading-[22px] text-center mx-auto max-w-md"
            style={{ color: palette.muted }}
          >
            거의 0 · 깨어있는 · 평균 · 무거운.
            <br />
            이 코스는 두 번째 칸에 멈춥니다.
          </p>
        </div>
      </section>

      {/* =========================================================
          5. FOOTER
          ========================================================= */}
      <footer
        className="px-5 py-12 md:px-12 md:py-16"
        style={{ borderTop: `1.5px dashed ${palette.fg}` }}
      >
        <div className="mx-auto max-w-3xl flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className="font-mono text-[11px] tracking-widest uppercase"
              style={{ color: palette.muted }}
            >
              end of issue №01
            </p>
            <p
              className="mt-2 font-black tracking-tight"
              style={{
                color: palette.primary,
                fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
                letterSpacing: '-0.03em',
                lineHeight: '0.95',
              }}
            >
              keep printing,
              <br />
              keep walking.
            </p>
          </div>

          <Link
            href="/v"
            aria-label="v 카탈로그로 돌아가기"
            className="inline-flex items-center gap-2 px-4 py-3 font-mono text-[13px] tracking-widest uppercase"
            style={{
              backgroundColor: palette.fg,
              color: palette.bg,
              border: `1.5px solid ${palette.fg}`,
              boxShadow: `3px 3px 0 0 ${palette.accent}`,
            }}
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            /v 카탈로그
          </Link>
        </div>

        <p
          className="mt-10 font-mono text-[11px] tracking-widest uppercase text-center"
          style={{ color: palette.muted }}
        >
          v10 · oatly-illustration-zine · greentrip 2026
        </p>
      </footer>
    </main>
  );
}

// ---------------------------------------------------------------------------
// DividerScribble — 손그림 점선 구분자
// ---------------------------------------------------------------------------
function DividerScribble() {
  return (
    <div
      aria-hidden="true"
      className="px-5 md:px-12"
      style={{ backgroundColor: palette.bg }}
    >
      <svg
        width="100%"
        height="24"
        viewBox="0 0 800 24"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M 0 12 Q 100 2, 200 12 T 400 12 T 600 12 T 800 12"
          stroke={palette.fg}
          strokeWidth="1.4"
          strokeDasharray="3 5"
          fill="none"
        />
      </svg>
    </div>
  );
}
