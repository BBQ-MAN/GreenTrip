// Variant v08 — 무신사 에디토리얼 (musinsa-editorial-catalog)
// Server Component. 인라인 mock, 외부 데이터 호출 없음.
// 색상 토큰은 모두 인라인 style — tailwind.config 미오염.
import Link from 'next/link';
import { Download, Link2, MessageCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'GreenTrip v08 · 무신사 에디토리얼',
  description:
    '블랙-온-화이트 패션 매거진 그리드. 3안은 룩북 상품 카드, 색은 비교 코드만 허용.',
};

// ─────────────────────────────────────────────────────────────
// PALETTE (variant 카드와 1:1 일치)
// ─────────────────────────────────────────────────────────────
const C = {
  bg: '#FFFFFF',
  fg: '#0A0A0B',
  primary: '#097A50',
  accent: '#DC2626',
  muted: '#71717A',
  surface: '#F1F1F1',
  // 비교 코드 strip (룩북 카드 하단 1px 컬러띠 전용)
  car: '#D97706',
  transit: '#0E7490',
  active: '#097A50',
} as const;

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────
const COMPARE = [
  {
    key: 'car',
    label: 'KTX', // 라벨은 11px UPPERCASE — variant 카드 사양 그대로
    sub: '자가용',
    co2: '14.1',
    strip: C.car,
    accentEmoji: '🛣',
    recommended: false,
  },
  {
    key: 'transit',
    label: 'EXPRESS BUS',
    sub: '대중교통',
    co2: '4.6',
    strip: C.transit,
    accentEmoji: '🚌',
    recommended: true,
  },
  {
    key: 'active',
    label: 'BIKE+WALK',
    sub: '자전거+도보',
    co2: '0.2',
    strip: C.active,
    accentEmoji: '🚲',
    recommended: false,
  },
] as const;

// ─────────────────────────────────────────────────────────────
// Hero — 100vh 풀블리드 흑백 + 좌하단 에디토리얼 헤드라인
// ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      aria-labelledby="v08-hero-title"
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: C.fg,
        color: C.bg,
        minHeight: '100vh',
      }}
    >
      {/* 흑백 강원 풍경 — CSS gradient + noise stripes (SVG/이미지 없음) */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(10,10,11,0.10) 0%, rgba(10,10,11,0.78) 75%, rgba(10,10,11,0.96) 100%),
            linear-gradient(135deg, #2a2a2c 0%, #1a1a1b 40%, #0a0a0b 100%),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px)
          `,
        }}
      />
      {/* 상단 마스트헤드 */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-6 md:px-10 md:pt-8">
        <span
          className="font-black uppercase tracking-[-0.02em]"
          style={{ color: C.bg, fontSize: '14px', letterSpacing: '0.08em' }}
        >
          GREENTRIP
        </span>
        <span
          className="font-mono uppercase"
          style={{ color: C.muted, fontSize: '10px', letterSpacing: '0.18em' }}
        >
          ISSUE 04 / 2026
        </span>
      </div>

      {/* hook 한 줄 — 작은 캡션 */}
      <div className="relative z-10 mt-8 px-5 md:mt-12 md:px-10">
        <p
          className="font-mono uppercase"
          style={{ color: C.muted, fontSize: '10px', letterSpacing: '0.22em' }}
        >
          EDITORIAL · LOW CARBON KOREA
        </p>
        <p
          className="mt-3 font-normal"
          style={{ color: C.bg, fontSize: '15px', lineHeight: '24px', maxWidth: '32rem' }}
        >
          이동수단 하나가 67.6%를 바꿉니다.
        </p>
      </div>

      {/* 좌하단 헤드라인 — Pretendard Black, Korean + Latin caps */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-10 md:px-10 md:pb-14">
        <h1
          id="v08-hero-title"
          className="font-black uppercase"
          style={{
            color: C.bg,
            // hero_size_rem: 7 → 모바일에서 4rem, md+ 7rem
            fontSize: 'clamp(2.5rem, 12vw, 7rem)',
            lineHeight: '0.92',
            letterSpacing: '-0.03em',
          }}
        >
          저탄소 한국,
          <br />
          COLLECTION
          <br />
          <span style={{ color: C.accent }}>NO. 04</span>
        </h1>

        {/* KPI strip — 라인 1개로 표기 */}
        <div
          className="mt-8 grid grid-cols-3 gap-px"
          style={{ borderTop: `1px solid ${C.muted}` }}
          role="list"
          aria-label="핵심 지표"
        >
          {[
            { v: '9,556g', k: '절감' },
            { v: '0.4', k: '그루' },
            { v: '14', k: 'API' },
          ].map((it) => (
            <div
              key={it.k}
              role="listitem"
              className="flex flex-col pt-4"
              style={{ borderRight: `1px solid ${C.muted}` }}
            >
              <span
                className="font-black tabular-nums"
                style={{
                  color: C.bg,
                  fontSize: 'clamp(1.5rem, 6vw, 2.25rem)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {it.v}
              </span>
              <span
                className="mt-1 font-mono uppercase"
                style={{ color: C.muted, fontSize: '10px', letterSpacing: '0.18em' }}
              >
                {it.k}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 시그니처 1 — 3안 룩북 그리드 (8px gutter, hard edge, 0px radius)
// ─────────────────────────────────────────────────────────────
function CompareGrid() {
  return (
    <section
      aria-labelledby="v08-compare-title"
      style={{ backgroundColor: C.bg, color: C.fg }}
      className="px-5 py-14 md:px-10 md:py-20"
    >
      {/* 섹션 마스트 */}
      <div
        className="mb-8 flex flex-col gap-1 md:mb-12"
        style={{ borderBottom: `2px solid ${C.fg}`, paddingBottom: '16px' }}
      >
        <span
          className="font-mono uppercase"
          style={{ color: C.muted, fontSize: '10px', letterSpacing: '0.22em' }}
        >
          LOOKBOOK · 01
        </span>
        <h2
          id="v08-compare-title"
          className="font-black uppercase"
          style={{
            color: C.fg,
            fontSize: 'clamp(1.75rem, 6vw, 3rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          THREE WAYS,
          <br />
          ONE ROUTE.
        </h2>
        <p
          className="mt-2 font-normal"
          style={{ color: C.muted, fontSize: '15px', lineHeight: '24px' }}
        >
          강원 1박2일 · 67.3km. 같은 거리, 다른 배출.
        </p>
      </div>

      {/* 3-up 하드 그리드, 8px gutter */}
      <div
        className="grid grid-cols-1 md:grid-cols-3"
        style={{ gap: '8px' }}
        role="list"
        aria-label="이동수단 3안 비교"
      >
        {COMPARE.map((item) => (
          <article
            key={item.key}
            role="listitem"
            aria-label={`${item.sub} ${item.co2}kg`}
            className="relative flex flex-col"
            style={{
              backgroundColor: C.surface,
              color: C.fg,
              borderRadius: 0,
            }}
          >
            {/* 상단 사진 4:5 — 톤 다운 그라데이션으로 대체 */}
            <div
              aria-hidden="true"
              className="relative w-full"
              style={{
                aspectRatio: '4 / 5',
                background:
                  item.key === 'car'
                    ? 'linear-gradient(160deg, #3a3a3c 0%, #1f1f20 100%)'
                    : item.key === 'transit'
                      ? 'linear-gradient(160deg, #2c2c2e 0%, #0f0f10 100%)'
                      : 'linear-gradient(160deg, #4a4a4c 0%, #232324 100%)',
              }}
            >
              {/* 그림 노이즈 라인 (사진 질감 흉내) */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)',
                }}
              />
              {/* 좌상단 작은 인덱스 */}
              <span
                className="absolute left-3 top-3 font-mono uppercase"
                style={{
                  color: C.bg,
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  opacity: 0.75,
                }}
              >
                0{COMPARE.indexOf(item) + 1} / 03
              </span>
              {/* 우상단 추천 도장 — accent #DC2626, -8deg, 빨간 잉크 */}
              {item.recommended ? (
                <span
                  className="absolute font-black uppercase"
                  aria-label="추천 코스"
                  style={{
                    right: '12px',
                    top: '12px',
                    color: C.bg,
                    backgroundColor: C.accent,
                    fontSize: '11px',
                    letterSpacing: '0.15em',
                    padding: '6px 10px',
                    transform: 'rotate(-8deg)',
                    border: `2px solid ${C.bg}`,
                  }}
                >
                  추천 ★
                </span>
              ) : null}
              {/* 중앙 이모지 (장식, aria-hidden) */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden="true"
                style={{ fontSize: '64px', opacity: 0.35 }}
              >
                {item.accentEmoji}
              </div>
            </div>

            {/* 하단 정보 블록 */}
            <div className="flex flex-col px-4 py-4" style={{ backgroundColor: C.bg }}>
              <span
                className="font-mono uppercase"
                style={{
                  color: C.muted,
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                }}
              >
                {item.label}
              </span>
              <span
                className="mt-1 font-normal"
                style={{ color: C.fg, fontSize: '13px' }}
              >
                {item.sub}
              </span>

              {/* 거대 40px Black 숫자 */}
              <div className="mt-3 flex items-baseline gap-1">
                <span
                  className="font-black tabular-nums"
                  style={{
                    color: C.fg,
                    fontSize: '40px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  {item.co2}
                </span>
                <span
                  className="font-black"
                  style={{ color: C.fg, fontSize: '14px' }}
                >
                  kg
                </span>
                <span
                  className="ml-auto font-mono uppercase"
                  style={{ color: C.muted, fontSize: '10px', letterSpacing: '0.18em' }}
                >
                  CO₂
                </span>
              </div>

              {/* 마지막 1px 하단 컬러 스트립 */}
              <div
                aria-hidden="true"
                className="mt-4"
                style={{
                  height: '1px',
                  backgroundColor: item.strip,
                  width: '100%',
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 시그니처 2 — A24 룩북 커버 인증서
// ─────────────────────────────────────────────────────────────
function CertificateBlock() {
  return (
    <section
      aria-labelledby="v08-cert-title"
      style={{ backgroundColor: C.surface, color: C.fg }}
      className="px-5 py-14 md:px-10 md:py-20"
    >
      <div
        className="mb-8 flex flex-col gap-1"
        style={{ borderBottom: `2px solid ${C.fg}`, paddingBottom: '16px' }}
      >
        <span
          className="font-mono uppercase"
          style={{ color: C.muted, fontSize: '10px', letterSpacing: '0.22em' }}
        >
          CERTIFIED · 02
        </span>
        <h2
          id="v08-cert-title"
          className="font-black uppercase"
          style={{
            color: C.fg,
            fontSize: 'clamp(1.75rem, 6vw, 3rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          CARBON
          <br />
          RECEIPT.
        </h2>
      </div>

      {/* 인증서 — 풀폭 화이트 카드, hard edge */}
      <article
        aria-label="강원도 1박2일 고속버스 코스 인증서 −9.6kg 0.4그루"
        className="relative mx-auto w-full max-w-2xl overflow-hidden"
        style={{
          backgroundColor: C.bg,
          color: C.fg,
          borderRadius: 0,
          border: `1px solid ${C.fg}`,
        }}
      >
        {/* 상단 4:5 사진 */}
        <div
          aria-hidden="true"
          className="relative w-full"
          style={{
            aspectRatio: '4 / 5',
            background:
              'linear-gradient(180deg, #1a1a1b 0%, #2a2a2c 60%, #3a3a3c 100%)',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 5px)',
            }}
          />
          <span
            className="absolute left-4 top-4 font-mono uppercase"
            style={{
              color: C.bg,
              fontSize: '10px',
              letterSpacing: '0.22em',
              opacity: 0.85,
            }}
          >
            GANGWON · 2D1N
          </span>
          {/* 빨간 잉크 스탬프 — 우측 하단, -8deg */}
          <div
            className="absolute"
            aria-label="저탄소 인증 스탬프"
            style={{
              right: '20px',
              bottom: '20px',
              transform: 'rotate(-8deg)',
              border: `3px double ${C.accent}`,
              color: C.accent,
              padding: '10px 14px',
              fontSize: '11px',
              letterSpacing: '0.2em',
              fontWeight: 900,
              textTransform: 'uppercase',
              backgroundColor: 'rgba(220, 38, 38, 0.04)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            CERTIFIED
            <br />
            <span style={{ fontSize: '9px', letterSpacing: '0.1em' }}>
              N°2026-04
            </span>
          </div>
        </div>

        {/* 거대 캡션 */}
        <div className="px-5 py-6 md:px-8 md:py-10">
          <h3
            className="font-black uppercase"
            style={{
              color: C.fg,
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
            }}
          >
            LOW-CARBON
            <br />
            CERTIFIED.
          </h3>

          {/* mono 캡션 줄 */}
          <dl
            className="mt-6 grid grid-cols-1 md:grid-cols-3"
            style={{ borderTop: `1px solid ${C.fg}`, paddingTop: '12px' }}
          >
            <div
              className="py-2 md:py-0 md:pr-4"
              style={{ borderRight: `1px solid ${C.surface}` }}
            >
              <dt
                className="font-mono uppercase"
                style={{
                  color: C.muted,
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                }}
              >
                ROUTE
              </dt>
              <dd
                className="mt-1 font-normal"
                style={{ color: C.fg, fontSize: '13px' }}
              >
                강원 1박2일 · 고속버스
              </dd>
            </div>
            <div
              className="py-2 md:py-0 md:px-4"
              style={{ borderRight: `1px solid ${C.surface}` }}
            >
              <dt
                className="font-mono uppercase"
                style={{
                  color: C.muted,
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                }}
              >
                DATE
              </dt>
              <dd
                className="mt-1 font-normal tabular-nums"
                style={{ color: C.fg, fontSize: '13px' }}
              >
                2026.06.16
              </dd>
            </div>
            <div className="py-2 md:py-0 md:pl-4">
              <dt
                className="font-mono uppercase"
                style={{
                  color: C.muted,
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                }}
              >
                HASH
              </dt>
              <dd
                className="mt-1 font-mono"
                style={{ color: C.fg, fontSize: '12px' }}
              >
                a3f9 · 2c7e · 0b41
              </dd>
            </div>
          </dl>

          {/* 절감 numeric */}
          <div
            className="mt-6 flex items-end gap-6"
            style={{ borderTop: `2px solid ${C.fg}`, paddingTop: '20px' }}
          >
            <div className="flex flex-col">
              <span
                className="font-mono uppercase"
                style={{
                  color: C.muted,
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                }}
              >
                SAVED
              </span>
              <span
                className="font-black tabular-nums"
                style={{
                  color: C.fg,
                  fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                −9.6
                <span style={{ fontSize: '0.4em' }}> kg</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className="font-mono uppercase"
                style={{
                  color: C.muted,
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                }}
              >
                TREES
              </span>
              <span
                className="font-black tabular-nums"
                style={{
                  color: C.primary,
                  fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                0.4
              </span>
            </div>
          </div>

          {/* 공유 행 */}
          <div
            className="mt-6 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="인증서 공유"
          >
            {[
              { Icon: Download, label: 'DOWNLOAD' },
              { Icon: MessageCircle, label: 'KAKAO' },
              { Icon: Link2, label: 'COPY LINK' },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className="inline-flex items-center gap-2 font-mono uppercase"
                style={{
                  backgroundColor: C.fg,
                  color: C.bg,
                  border: 'none',
                  padding: '10px 14px',
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  cursor: 'pointer',
                  borderRadius: 0,
                }}
              >
                <Icon aria-hidden="true" style={{ width: 14, height: 14 }} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 시그니처 3 — Carbon Scale 4티어 + Before/After
// ─────────────────────────────────────────────────────────────
function CarbonScaleBlock() {
  // 4 tiers: ≤2 / ≤6 / ≤12 / >12. optimized 4.6 → tier 2 (idx 1).
  const tiers = [
    { label: '≤ 2', cap: 'PURE' },
    { label: '≤ 6', cap: 'LOW' },
    { label: '≤ 12', cap: 'MID' },
    { label: '> 12', cap: 'HIGH' },
  ];
  const activeIdx = 1; // 4.6kg → ≤6 tier

  return (
    <section
      aria-labelledby="v08-scale-title"
      style={{ backgroundColor: C.bg, color: C.fg }}
      className="px-5 py-14 md:px-10 md:py-20"
    >
      <div
        className="mb-8 flex flex-col gap-1"
        style={{ borderBottom: `2px solid ${C.fg}`, paddingBottom: '16px' }}
      >
        <span
          className="font-mono uppercase"
          style={{ color: C.muted, fontSize: '10px', letterSpacing: '0.22em' }}
        >
          SCALE · 03
        </span>
        <h2
          id="v08-scale-title"
          className="font-black uppercase"
          style={{
            color: C.fg,
            fontSize: 'clamp(1.75rem, 6vw, 3rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          BEFORE
          <br />
          AFTER.
        </h2>
      </div>

      {/* 4-tier ribbon */}
      <div
        className="grid grid-cols-4"
        style={{ gap: '4px' }}
        role="list"
        aria-label="Carbon scale 4 tiers"
      >
        {tiers.map((t, i) => {
          const active = i === activeIdx;
          return (
            <div
              key={t.cap}
              role="listitem"
              className="flex flex-col items-start px-3 py-4"
              style={{
                backgroundColor: active ? C.fg : C.surface,
                color: active ? C.bg : C.fg,
                borderRadius: 0,
                position: 'relative',
              }}
              aria-current={active ? 'true' : undefined}
            >
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  color: active ? C.bg : C.muted,
                }}
              >
                {t.cap}
              </span>
              <span
                className="mt-1 font-black tabular-nums"
                style={{
                  fontSize: 'clamp(1rem, 4vw, 1.5rem)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {t.label}
              </span>
              <span
                className="mt-1 font-mono"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  color: active ? C.bg : C.muted,
                }}
              >
                kg
              </span>
              {active ? (
                <span
                  className="absolute font-mono uppercase"
                  style={{
                    bottom: '-22px',
                    left: '12px',
                    color: C.accent,
                    fontSize: '10px',
                    letterSpacing: '0.22em',
                    fontWeight: 900,
                  }}
                  aria-label="현재 코스 위치"
                >
                  ▲ YOU
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Before / After numeric face-off */}
      <div
        className="mt-16 grid grid-cols-1 md:grid-cols-2"
        style={{ gap: '8px' }}
      >
        {/* Before */}
        <div
          className="flex flex-col px-5 py-6 md:px-8 md:py-10"
          style={{ backgroundColor: C.surface, borderRadius: 0 }}
        >
          <span
            className="font-mono uppercase"
            style={{ color: C.muted, fontSize: '10px', letterSpacing: '0.22em' }}
          >
            BEFORE · 자가용
          </span>
          <span
            className="mt-3 font-black tabular-nums"
            style={{
              color: C.muted,
              fontSize: 'clamp(3rem, 14vw, 6rem)',
              letterSpacing: '-0.02em',
              lineHeight: 0.95,
              textDecoration: 'line-through',
              textDecorationThickness: '4px',
              textDecorationColor: C.accent,
            }}
          >
            14.1
            <span style={{ fontSize: '0.3em' }}> kg</span>
          </span>
          <span
            className="mt-2 font-normal"
            style={{ color: C.muted, fontSize: '13px' }}
          >
            기준 배출 · CO₂
          </span>
        </div>

        {/* After */}
        <div
          className="relative flex flex-col px-5 py-6 md:px-8 md:py-10"
          style={{ backgroundColor: C.fg, color: C.bg, borderRadius: 0 }}
        >
          <span
            className="font-mono uppercase"
            style={{ color: C.bg, fontSize: '10px', letterSpacing: '0.22em', opacity: 0.7 }}
          >
            AFTER · 대중교통
          </span>
          <span
            className="mt-3 font-black tabular-nums"
            style={{
              color: C.bg,
              fontSize: 'clamp(3rem, 14vw, 6rem)',
              letterSpacing: '-0.02em',
              lineHeight: 0.95,
            }}
          >
            4.6
            <span style={{ fontSize: '0.3em' }}> kg</span>
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className="font-black tabular-nums"
              style={{
                color: C.accent,
                fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
                letterSpacing: '-0.02em',
              }}
            >
              −67.6%
            </span>
            <span
              className="font-mono uppercase"
              style={{
                color: C.bg,
                fontSize: '10px',
                letterSpacing: '0.22em',
                opacity: 0.7,
              }}
            >
              감축률
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────
function FooterBlock() {
  return (
    <footer
      aria-label="페이지 푸터"
      style={{
        backgroundColor: C.fg,
        color: C.bg,
        borderTop: `1px solid ${C.muted}`,
      }}
      className="px-5 py-10 md:px-10 md:py-14"
    >
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p
            className="font-mono uppercase"
            style={{ color: C.muted, fontSize: '10px', letterSpacing: '0.22em' }}
          >
            GREENTRIP · VARIANT v08
          </p>
          <p
            className="mt-1 font-black uppercase"
            style={{
              color: C.bg,
              fontSize: 'clamp(1.25rem, 4vw, 2rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            무신사 에디토리얼.
          </p>
        </div>
        <Link
          href="/v"
          aria-label="v 카탈로그로 돌아가기"
          className="inline-flex items-center gap-2 font-mono uppercase"
          style={{
            color: C.bg,
            backgroundColor: 'transparent',
            border: `1px solid ${C.bg}`,
            padding: '12px 16px',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textDecoration: 'none',
            borderRadius: 0,
          }}
        >
          ← /v 카탈로그로 돌아가기
        </Link>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function V08Page() {
  return (
    <main
      style={{ backgroundColor: C.bg, color: C.fg }}
      className="min-h-screen w-full"
    >
      <Hero />
      <CompareGrid />
      <CertificateBlock />
      <CarbonScaleBlock />
      <FooterBlock />
    </main>
  );
}
