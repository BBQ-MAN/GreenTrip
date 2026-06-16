// v05 — 랩드 9:16 (spotify-wrapped-dark)
// Server Component. 정적 mock — 데이터 fetch 없음.
// 인스피레이션: Spotify Wrapped 2025, Strava Year in Sport, Doconomy
//
// 시그니처 분기:
//   - 다크 캔버스(#0E1A14) + 일렉트릭 라임(#7CD992) + 앰버 액센트(#FFD93D)
//   - 9:16 풀스크린 카드 데크, 거대 숫자(viewport의 60%), 휴먼 리프레이밍 한 문장
//   - 인증서 == 공유 카드 그 자체
// 메인 라이트 라우트(/, /plan/result, /report/[id])와의 차이:
//   - 다크 모드 단독 변형
//   - 카드-로우 3안 → 스냅 캐러셀
//   - 모든 색상은 인라인 style (tailwind.config 미터치)
import Link from 'next/link';
import {
  Download,
  Link2,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Hash,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'v05 · 랩드 9:16 — GreenTrip',
  description:
    '다크 캔버스에 한 화면을 가득 채우는 거대 숫자와 휴먼 리프레이밍. 9:16 공유 카드 데크 (variant v05).',
};

// 팔레트 — 모든 색은 여기서만 읽음. tailwind.config 미터치.
const C = {
  bg: '#0E1A14',
  fg: '#F2F7F2',
  primary: '#7CD992', // electric lime
  accent: '#FFD93D', // amber
  muted: '#6B7568',
  surface: '#1A2A20',
  // compare_pattern 도미넌트 컬러
  amber: '#FFD93D',
  teal: '#2DD4BF',
  green: '#7CD992',
} as const;

// 9:16 카드 공통 셸 (375×667 모바일 기준; 9:16은 aspect-[9/16])
function CardFrame({
  children,
  bg,
  fg,
  ariaLabel,
}: {
  children: React.ReactNode;
  bg: string;
  fg: string;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="relative flex aspect-[9/16] w-full flex-col overflow-hidden rounded-3xl px-6 py-7"
      style={{ backgroundColor: bg, color: fg }}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 1. Hero — 9:16 풀스크린 카드, 거대 67.6% + 휴먼 리프레이밍
// ──────────────────────────────────────────────────────────────────────────
function HeroCard() {
  return (
    <section aria-labelledby="v05-hero" className="px-4 pt-6 md:pt-10">
      <div className="mx-auto w-full max-w-[420px]">
        {/* 상단 이어모듈 — 워드마크 + 변형 라벨 */}
        <div className="mb-4 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: C.primary }}
          >
            <Sparkles aria-hidden="true" className="h-3 w-3" />
            GreenTrip · 랩드 9:16
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: C.surface, color: C.muted }}
          >
            v05
          </span>
        </div>

        <CardFrame bg={C.bg} fg={C.fg} ariaLabel="히어로 카드 — 67.6% 절감">
          {/* 워터마크 그리드 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(${C.primary} 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* 상단 라벨 */}
          <div className="relative flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: C.accent }}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.muted }}
            >
              2026 / 강원
            </span>
          </div>

          {/* 거대 숫자 — viewport의 60% */}
          <h1
            id="v05-hero"
            className="relative mt-auto font-black tabular-nums leading-[0.85] tracking-[-0.04em]"
            style={{
              color: C.primary,
              fontSize: 'clamp(96px, 36vw, 168px)',
            }}
          >
            67.6%
          </h1>

          {/* 휴먼 리프레이밍 */}
          <p
            className="relative mt-4 max-w-[18ch] text-[18px] font-semibold leading-snug"
            style={{ color: C.fg }}
          >
            ={' '}
            <span style={{ color: C.accent }}>나무 47그루</span>가{' '}
            <br />한 달간 흡수하는 양
          </p>

          {/* 우측 하단 워드마크 */}
          <div className="relative mt-6 flex items-end justify-between">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: C.muted }}
            >
              이동수단 하나가 바꾸는 것
            </span>
            <span
              className="font-black tracking-[-0.03em]"
              style={{ color: C.primary, fontSize: '18px' }}
            >
              GreenTrip
            </span>
          </div>
        </CardFrame>

        {/* KPI 스트립 — 카드 아래 가로 슬라이드 */}
        <div
          className="mt-4 grid grid-cols-3 gap-2 rounded-2xl px-3 py-3"
          style={{ backgroundColor: C.surface }}
          aria-label="누적 KPI"
        >
          {[
            { v: '9,556g', l: '절감' },
            { v: '0.4', l: '그루' },
            { v: '14종', l: 'API' },
          ].map((k) => (
            <div key={k.l} className="flex flex-col items-center">
              <span
                className="font-black tabular-nums tracking-[-0.03em]"
                style={{ color: C.primary, fontSize: '18px' }}
              >
                {k.v}
              </span>
              <span
                className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: C.muted }}
              >
                {k.l}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 2. 시그니처 1 — 3안 비교 (스냅스크롤 캐러셀, 9:16)
// ──────────────────────────────────────────────────────────────────────────
type CompareSlide = {
  bg: string;
  fg: string;
  pillBg: string;
  pillFg: string;
  label: string;
  value: string;
  unit: string;
  oneLine: string;
  recommended: boolean;
  contrastSub: string;
};

const COMPARE_SLIDES: CompareSlide[] = [
  {
    bg: C.amber,
    fg: '#1A1408',
    pillBg: '#1A1408',
    pillFg: C.amber,
    label: '자가용',
    value: '14.1',
    unit: 'kg',
    oneLine: '한 명이 하루 숨쉬는 탄소의 두 배',
    recommended: false,
    contrastSub: 'rgba(26,20,8,0.65)',
  },
  {
    bg: C.teal,
    fg: '#04201E',
    pillBg: '#04201E',
    pillFg: C.teal,
    label: '대중교통',
    value: '4.6',
    unit: 'kg',
    oneLine: '커피 한 잔 만드는 데 드는 탄소만큼',
    recommended: true,
    contrastSub: 'rgba(4,32,30,0.7)',
  },
  {
    bg: C.green,
    fg: '#08221A',
    pillBg: '#08221A',
    pillFg: C.green,
    label: '자전거+도보',
    value: '0.2',
    unit: 'kg',
    oneLine: '거의 0에 가깝습니다',
    recommended: false,
    contrastSub: 'rgba(8,34,26,0.7)',
  },
];

function CompareDeck() {
  return (
    <section
      aria-labelledby="v05-compare-title"
      className="mt-12"
      style={{ backgroundColor: C.bg }}
    >
      <div className="mx-auto w-full max-w-[420px] px-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2
            id="v05-compare-title"
            className="font-black tracking-[-0.03em]"
            style={{ color: C.fg, fontSize: '22px' }}
          >
            3안, 슬라이드로
          </h2>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: C.muted }}
          >
            → 옆으로 넘겨요
          </span>
        </div>

        {/* 스냅스크롤 캐러셀 */}
        <div
          role="region"
          aria-label="이동수단 3안 비교 캐러셀"
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4"
          style={{ scrollPaddingLeft: '1rem' }}
        >
          {COMPARE_SLIDES.map((s, i) => (
            <article
              key={s.label}
              aria-label={`${s.label} 코스, CO₂ ${s.value}${s.unit}${s.recommended ? ' (추천)' : ''}`}
              className="relative flex aspect-[9/16] w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl px-5 py-6"
              style={{ backgroundColor: s.bg, color: s.fg }}
            >
              {/* 상단 라벨 + 추천 배지 */}
              <div className="flex items-center justify-between">
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
                  style={{ backgroundColor: s.pillBg, color: s.pillFg }}
                >
                  슬라이드 {i + 1} / 3
                </span>
                {s.recommended ? (
                  <span
                    role="img"
                    aria-label="추천"
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black"
                    style={{ backgroundColor: s.pillBg, color: s.pillFg }}
                  >
                    <span aria-hidden="true">⭐</span> 추천
                  </span>
                ) : null}
              </div>

              {/* 거대 숫자 */}
              <div className="mt-auto">
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-black tabular-nums leading-none tracking-[-0.04em]"
                    style={{ fontSize: 'clamp(72px, 22vw, 112px)' }}
                  >
                    {s.value}
                  </span>
                  <span
                    className="font-black tracking-[-0.02em]"
                    style={{ fontSize: '24px' }}
                  >
                    {s.unit}
                  </span>
                </div>
                <p
                  className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: s.contrastSub }}
                >
                  {s.label} · CO₂
                </p>
              </div>

              {/* 한 문장 */}
              <p
                className="mt-5 text-[15px] font-semibold leading-snug"
                style={{ color: s.fg }}
              >
                {s.oneLine}
              </p>
            </article>
          ))}
        </div>

        {/* 도트 인디케이터 (장식) */}
        <div
          className="flex justify-center gap-1.5"
          role="presentation"
          aria-hidden="true"
        >
          {COMPARE_SLIDES.map((s, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === 1 ? '24px' : '8px',
                backgroundColor: i === 1 ? C.primary : C.muted,
                opacity: i === 1 ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 3. 시그니처 2 — 인증서 (9:16 공유 카드 그 자체)
// ──────────────────────────────────────────────────────────────────────────
function CertificateShareCard() {
  return (
    <section
      aria-labelledby="v05-cert-title"
      className="mt-12"
      style={{ backgroundColor: C.bg }}
    >
      <div className="mx-auto w-full max-w-[420px] px-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2
            id="v05-cert-title"
            className="font-black tracking-[-0.03em]"
            style={{ color: C.fg, fontSize: '22px' }}
          >
            인증서 = 공유 카드
          </h2>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: C.muted }}
          >
            카카오 1080×1920
          </span>
        </div>

        <CardFrame
          bg={C.bg}
          fg={C.fg}
          ariaLabel="강원도 1박2일 고속버스 코스 인증서 — 9.6kg 절감, 0.4그루"
        >
          {/* 글로우 그라데이션 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 18%, ${C.primary}1F 0%, transparent 60%)`,
            }}
          />

          {/* 상단 60% — 거대 숫자 + 워드마크 */}
          <div className="relative flex flex-1 flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: C.accent }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: C.muted }}
              >
                Carbon Saving · 2026.06.16
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span
                className="font-black tabular-nums leading-[0.85] tracking-[-0.04em]"
                style={{
                  color: C.primary,
                  fontSize: 'clamp(80px, 30vw, 144px)',
                }}
              >
                −9.6
              </span>
              <span
                className="font-black tracking-[-0.02em]"
                style={{ color: C.primary, fontSize: '28px' }}
              >
                kg
              </span>
            </div>

            <p
              className="mt-1 text-[12px] font-bold uppercase tracking-[0.16em]"
              style={{ color: C.muted }}
            >
              CO₂ saved · vs. 자가용
            </p>

            <p
              className="mt-5 max-w-[20ch] text-[15px] font-semibold leading-snug"
              style={{ color: C.fg }}
            >
              ={' '}
              <span style={{ color: C.accent }} className="tabular-nums">
                0.4그루
              </span>
              의 소나무가 1년간 흡수하는 양
            </p>
          </div>

          {/* 하단 33% — 메타 + 해시 + QR */}
          <div
            className="relative mt-4 flex items-end justify-between border-t pt-4"
            style={{ borderColor: `${C.muted}40` }}
          >
            <div className="flex flex-col gap-1">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: C.muted }}
              >
                코스
              </span>
              <span
                className="font-black tracking-[-0.02em]"
                style={{ color: C.fg, fontSize: '15px' }}
              >
                강원도 1박2일
              </span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: C.primary }}
              >
                고속버스 · 5개 관광지
              </span>
              <span
                className="mt-1 inline-flex items-center gap-1 text-[10px] tabular-nums"
                style={{ color: C.muted }}
              >
                <Hash aria-hidden="true" className="h-2.5 w-2.5" />
                gt-v05-9a3f2b
              </span>
            </div>

            {/* 인라인 QR (SVG) */}
            <div
              aria-label="QR 코드 (장식)"
              role="img"
              className="h-[68px] w-[68px] rounded-md p-1.5"
              style={{ backgroundColor: C.fg }}
            >
              <svg viewBox="0 0 7 7" className="h-full w-full" aria-hidden="true">
                {[
                  [0, 0, 3, 3],
                  [4, 0, 3, 3],
                  [0, 4, 3, 3],
                  [1, 1, 1, 1],
                  [5, 1, 1, 1],
                  [1, 5, 1, 1],
                  [4, 4, 1, 1],
                  [6, 4, 1, 1],
                  [4, 6, 1, 1],
                  [6, 6, 1, 1],
                  [3, 3, 1, 1],
                ].map(([x, y, w, h], i) => (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={C.bg}
                  />
                ))}
              </svg>
            </div>
          </div>
        </CardFrame>

        {/* 공유 행 — 한 번 탭 = 카카오톡 시트 */}
        <div
          role="group"
          aria-label="공유 액션"
          className="mt-3 grid grid-cols-3 gap-2"
        >
          {[
            { Icon: Download, label: '저장', primary: false },
            { Icon: MessageCircle, label: '카카오톡 공유', primary: true },
            { Icon: Link2, label: '링크 복사', primary: false },
          ].map(({ Icon, label, primary }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-[12px] font-bold tracking-tight transition-opacity hover:opacity-80"
              style={{
                backgroundColor: primary ? C.primary : C.surface,
                color: primary ? C.bg : C.fg,
                border: primary ? 'none' : `1px solid ${C.muted}40`,
              }}
            >
              <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 4. 시그니처 3 — Carbon Scale Ribbon + Before/After
// ──────────────────────────────────────────────────────────────────────────
type Tier = { id: 'A' | 'B' | 'C' | 'D'; label: string; range: string; max: number };
const TIERS: Tier[] = [
  { id: 'A', label: '에코', range: '≤ 2kg', max: 2 },
  { id: 'B', label: '저탄소', range: '≤ 6kg', max: 6 },
  { id: 'C', label: '보통', range: '≤ 12kg', max: 12 },
  { id: 'D', label: '고탄소', range: '> 12kg', max: 999 },
];

function tierColor(t: Tier['id']): string {
  switch (t) {
    case 'A':
      return C.primary;
    case 'B':
      return C.teal;
    case 'C':
      return C.accent;
    case 'D':
      return '#FF6B6B';
  }
}

// 이 코스(4.6kg)가 들어가는 티어 = B
const CURRENT_TIER: Tier['id'] = 'B';

function CarbonScaleSection() {
  return (
    <section
      aria-labelledby="v05-scale-title"
      className="mt-12 pb-10"
      style={{ backgroundColor: C.bg }}
    >
      <div className="mx-auto w-full max-w-[420px] px-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2
            id="v05-scale-title"
            className="font-black tracking-[-0.03em]"
            style={{ color: C.fg, fontSize: '22px' }}
          >
            탄소 스케일
          </h2>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: C.muted }}
          >
            4-tier ribbon
          </span>
        </div>

        {/* Before / After 거대 숫자 */}
        <div
          role="group"
          aria-label="Before/After 비교"
          className="rounded-3xl p-6"
          style={{ backgroundColor: C.surface }}
        >
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.muted }}
            >
              Before
            </span>
            <span
              className="text-[10px] tabular-nums"
              style={{ color: C.muted }}
            >
              · 자가용
            </span>
          </div>
          <p
            className="font-black tabular-nums leading-none tracking-[-0.03em] line-through"
            style={{
              color: C.muted,
              fontSize: 'clamp(40px, 14vw, 64px)',
              textDecorationColor: C.muted,
              textDecorationThickness: '3px',
            }}
            aria-label="이전 14.1kg (취소선)"
          >
            14.1<span className="text-[24px]">kg</span>
          </p>

          {/* 화살표 */}
          <div className="mt-3 flex items-center gap-1.5">
            <ChevronRight
              aria-hidden="true"
              className="h-3 w-3 rotate-90"
              style={{ color: C.primary }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.primary }}
            >
              대중교통으로 바꾸면
            </span>
          </div>

          {/* After — 히어로 numeric */}
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: C.muted }}
            >
              After
            </span>
          </div>
          <p
            className="font-black tabular-nums leading-none tracking-[-0.04em]"
            style={{
              color: C.primary,
              fontSize: 'clamp(72px, 28vw, 144px)',
            }}
          >
            4.6<span style={{ fontSize: '32px' }}>kg</span>
          </p>
          <p
            className="mt-2 text-[13px] font-semibold"
            style={{ color: C.fg }}
          >
            ={' '}
            <span style={{ color: C.accent }} className="tabular-nums">
              9.5kg
            </span>{' '}
            절감 ·{' '}
            <span style={{ color: C.primary }} className="tabular-nums">
              67.6%
            </span>
          </p>
        </div>

        {/* 4-tier 리본 */}
        <div
          role="img"
          aria-label="탄소 4단계 스케일, 현재 코스는 저탄소(B) 구간"
          className="mt-5"
        >
          <div className="flex h-12 overflow-hidden rounded-full" style={{ border: `1px solid ${C.muted}40` }}>
            {TIERS.map((t) => {
              const isCurrent = t.id === CURRENT_TIER;
              return (
                <div
                  key={t.id}
                  className="relative flex flex-1 items-center justify-center"
                  style={{
                    backgroundColor: isCurrent ? tierColor(t.id) : `${tierColor(t.id)}25`,
                  }}
                >
                  <span
                    className="font-black tracking-tight"
                    style={{
                      color: isCurrent ? C.bg : tierColor(t.id),
                      fontSize: '14px',
                    }}
                  >
                    {t.id}
                  </span>
                  {isCurrent ? (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
                      style={{ backgroundColor: tierColor(t.id) }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.14em]">
            {TIERS.map((t) => (
              <div
                key={t.id}
                className="flex flex-col items-center"
                style={{ color: t.id === CURRENT_TIER ? C.fg : C.muted }}
              >
                <span>{t.label}</span>
                <span
                  className="tabular-nums font-normal"
                  style={{ color: C.muted }}
                >
                  {t.range}
                </span>
              </div>
            ))}
          </div>

          <p
            className="mt-4 text-center text-[13px] font-semibold"
            style={{ color: C.fg }}
          >
            이 코스는{' '}
            <span style={{ color: C.primary }} className="font-black">
              저탄소(B)
            </span>{' '}
            구간에 들어갑니다
          </p>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 5. Footer
// ──────────────────────────────────────────────────────────────────────────
function FooterStrip() {
  return (
    <footer
      aria-label="페이지 하단"
      className="border-t py-8"
      style={{
        backgroundColor: C.bg,
        borderColor: `${C.muted}30`,
      }}
    >
      <div className="mx-auto flex w-full max-w-[420px] items-center justify-between px-4">
        <Link
          href="/v"
          className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-tight transition-opacity hover:opacity-70"
          style={{ color: C.primary }}
          aria-label="v 카탈로그로 돌아가기"
        >
          ← /v 카탈로그로 돌아가기
        </Link>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: C.muted }}
        >
          v05 · 랩드 9:16
        </span>
      </div>
    </footer>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────────
export default function V05Page() {
  return (
    <main
      className="min-h-dvh"
      style={{
        backgroundColor: C.bg,
        color: C.fg,
        fontFeatureSettings: '"tnum" 1, "ss01" 1',
      }}
    >
      <HeroCard />
      <CompareDeck />
      <CertificateShareCard />
      <CarbonScaleSection />
      <FooterStrip />
    </main>
  );
}
