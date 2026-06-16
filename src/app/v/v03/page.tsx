// v03 — 파타고니아 저널 (patagonia-field-journal)
// 디자인 변형 카탈로그용 단일 페이지. 데이터 페치 없음, 완전 정적 mock.
// 모든 색상은 inline style의 PALETTE에서만 가져온다(tailwind.config 미수정).
import Link from 'next/link';
import {
  Download,
  MessageCircle,
  Link2,
  ArrowLeft,
  PenLine,
  Wind,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'v03 · 파타고니아 저널 — GreenTrip 디자인 변형',
  description:
    '크림 캔버스에 풀블리드 강원 풍경 다큐와 손글씨 라우트 라인, 데이터는 영양정보 라벨처럼 인쇄된 GreenTrip 변형(v03).',
};

// ---------------------------------------------------------------------------
// PALETTE — variant card 그대로
// ---------------------------------------------------------------------------
const P = {
  bg: '#F4EFE6',
  fg: '#1B1B1B',
  primary: '#3B5A3A',
  accent: '#C84B25',
  muted: '#7A6A56',
  surface: '#EAE3D2',
} as const;

// ---------------------------------------------------------------------------
// SVG — 강원 산악 다큐 사진을 대체하는 풀블리드 풍경(외부 이미지 금지)
//   - layered ridges + 안개층 + 손그림 라우트 라인
// ---------------------------------------------------------------------------
function MountainScene({
  withRoute = true,
  variant = 'before',
}: {
  withRoute?: boolean;
  variant?: 'before' | 'after';
}) {
  // before(자가용): 회색 도로 라인. after(저탄소): 손그림 곡선 + 핀.
  return (
    <svg
      role="img"
      aria-label={
        variant === 'before' ? '강원 산악 풍경 (기존 자가용 경로)' : '강원 산악 풍경 (저탄소 경로)'
      }
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      {/* 하늘 — 빈티지 인쇄 톤 */}
      <defs>
        <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9C9A3" />
          <stop offset="60%" stopColor="#C7B68E" />
          <stop offset="100%" stopColor="#A9A083" />
        </linearGradient>
        <linearGradient id={`fog-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4EFE6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#F4EFE6" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="800" height="500" fill={`url(#sky-${variant})`} />

      {/* 먼 산 */}
      <path
        d="M0 290 L80 240 L160 270 L240 220 L320 260 L400 210 L480 250 L560 215 L640 245 L720 220 L800 250 L800 500 L0 500 Z"
        fill="#6E7A60"
        opacity="0.55"
      />

      {/* 안개 띠 */}
      <rect x="0" y="260" width="800" height="80" fill={`url(#fog-${variant})`} />

      {/* 중간 산 */}
      <path
        d="M0 360 L120 290 L220 330 L320 280 L420 320 L540 275 L640 315 L760 280 L800 305 L800 500 L0 500 Z"
        fill="#4F5E48"
        opacity="0.8"
      />

      {/* 앞산 / 호숫가 */}
      <path
        d="M0 430 L100 380 L200 420 L320 370 L440 410 L560 380 L680 410 L800 385 L800 500 L0 500 Z"
        fill="#3B4A38"
      />

      {/* 호수 반사 (옅게) */}
      <rect x="0" y="430" width="800" height="70" fill="#5B6A52" opacity="0.35" />

      {/* 라우트 라인 */}
      {withRoute && variant === 'before' ? (
        // 자가용: 회색 직선 도로 (절단된 풍경)
        <g>
          <path
            d="M40 470 Q 220 360 400 380 T 760 300"
            fill="none"
            stroke="#1B1B1B"
            strokeWidth="3"
            strokeDasharray="2 6"
            opacity="0.55"
          />
        </g>
      ) : null}

      {withRoute && variant === 'after' ? (
        // 저탄소: 손그림 곡선 + 둥근 끝점
        <g>
          <path
            d="M50 460 Q 180 400 260 420 Q 340 440 420 360 Q 510 280 600 300 Q 690 320 750 240"
            fill="none"
            stroke={P.accent}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.92"
          />
          {/* 라인 위 점선 보조 — 손그림 느낌 */}
          <path
            d="M50 460 Q 180 400 260 420 Q 340 440 420 360 Q 510 280 600 300 Q 690 320 750 240"
            fill="none"
            stroke={P.accent}
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="0 7"
            opacity="0.55"
          />
          {/* 시작·종점 핀 */}
          <circle cx="50" cy="460" r="5" fill={P.accent} />
          <circle cx="750" cy="240" r="5" fill={P.accent} />
          <circle cx="750" cy="240" r="11" fill="none" stroke={P.accent} strokeWidth="1.5" />
        </g>
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------
export default function V03Page() {
  return (
    <main
      className="min-h-screen"
      style={{ background: P.bg, color: P.fg }}
      aria-label="v03 파타고니아 저널 변형"
    >
      {/* ============================================================ */}
      {/* HERO — 풀블리드 다큐 + 손그림 라우트                            */}
      {/* ============================================================ */}
      <section aria-labelledby="hero-title" className="relative">
        {/* 풀블리드 사진 (16:10) */}
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: '16 / 10', maxHeight: '70vh' }}
        >
          <MountainScene withRoute variant="after" />

          {/* 타자기 핀 — 라인 끝(우상단) */}
          <div
            aria-hidden="true"
            className="absolute right-4 top-4 md:right-8 md:top-8"
            style={{
              background: P.bg,
              color: P.fg,
              borderColor: P.fg,
            }}
          >
            <div
              className="border px-2.5 py-1.5 font-mono text-[11px] tracking-tight md:text-[12px]"
              style={{ borderColor: P.fg }}
            >
              <span className="tabular-nums">~12.4 kg CO₂e</span>
            </div>
          </div>

          {/* 이슈 번호 — 좌상단 매거진 마크 */}
          <div
            aria-hidden="true"
            className="absolute left-4 top-4 md:left-8 md:top-8"
          >
            <div
              className="font-mono text-[10px] uppercase tracking-[0.18em] md:text-[11px]"
              style={{ color: P.bg }}
            >
              <div>GreenTrip · Field Journal</div>
              <div className="mt-0.5" style={{ opacity: 0.85 }}>
                Issue 03 · 강원
              </div>
            </div>
          </div>
        </div>

        {/* 매거진 칼럼 — 사진 아래 떨어진 본문 (max-w 640px) */}
        <div className="px-5 pb-10 pt-8 md:px-8 md:pb-16 md:pt-12">
          <div className="mx-auto" style={{ maxWidth: 640 }}>
            <div
              className="font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: P.muted }}
            >
              — A field report
            </div>

            <h1
              id="hero-title"
              className="mt-3 font-medium tracking-tight"
              style={{
                color: P.fg,
                fontSize: 'clamp(2.25rem, 7vw, 5rem)',
                lineHeight: 1.02,
                letterSpacing: '-0.02em',
              }}
            >
              이동수단 하나가{' '}
              <span style={{ color: P.accent }}>67.6%</span>를 바꿉니다.
            </h1>

            <p
              className="mt-6 font-normal text-[17px] leading-[28px]"
              style={{ color: P.fg }}
            >
              우리는 강원의 같은 풍경을 두 번 다녀왔습니다. 한 번은 고속도로
              위에서, 한 번은 고속버스와 두 발로. 풍경은 같지만, 남긴 자국은
              세 배 이상 달랐습니다. 아래는 그 기록입니다.
            </p>

            {/* KPI strip — 매거진 본문 폭 안 */}
            <dl
              className="mt-8 grid grid-cols-3 gap-3 border-y py-5 md:gap-6"
              style={{ borderColor: P.fg }}
              aria-label="핵심 지표"
            >
              <div>
                <dt
                  className="font-mono text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: P.muted }}
                >
                  Saved
                </dt>
                <dd
                  className="mt-1 font-mono tracking-tight tabular-nums"
                  style={{ color: P.fg, fontSize: '1.5rem', lineHeight: 1.1 }}
                >
                  9,556<span className="text-[12px]" style={{ color: P.muted }}>g</span>
                </dd>
              </div>
              <div>
                <dt
                  className="font-mono text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: P.muted }}
                >
                  Trees · 1y
                </dt>
                <dd
                  className="mt-1 font-mono tracking-tight tabular-nums"
                  style={{ color: P.fg, fontSize: '1.5rem', lineHeight: 1.1 }}
                >
                  0.4<span className="text-[12px]" style={{ color: P.muted }}>그루</span>
                </dd>
              </div>
              <div>
                <dt
                  className="font-mono text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: P.muted }}
                >
                  Sources
                </dt>
                <dd
                  className="mt-1 font-mono tracking-tight tabular-nums"
                  style={{ color: P.fg, fontSize: '1.5rem', lineHeight: 1.1 }}
                >
                  14<span className="text-[12px]" style={{ color: P.muted }}>종 API</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SIGNATURE 1 — Before/After diptych (compare_pattern)         */}
      {/* ============================================================ */}
      <section
        aria-labelledby="sig1-title"
        className="border-t px-5 py-12 md:px-8 md:py-20"
        style={{ borderColor: P.fg }}
      >
        <div className="mx-auto" style={{ maxWidth: 1080 }}>
          <header className="mb-8 md:mb-12">
            <div
              className="font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: P.muted }}
            >
              No. 01 · Diptych
            </div>
            <h2
              id="sig1-title"
              className="mt-2 font-medium tracking-tight"
              style={{
                color: P.fg,
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              같은 풍경, 두 개의 자국
            </h2>
            <p
              className="mt-3 font-normal text-[17px] leading-[28px]"
              style={{ color: P.muted, maxWidth: 560 }}
            >
              차트도, 게이지도 없습니다. 풍경 자체가 비교입니다.
            </p>
          </header>

          {/* Diptych — 모바일 1열, md+ 2열 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {/* BEFORE */}
            <figure className="flex flex-col">
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: '4 / 5' }}
                role="group"
                aria-label="기존 자가용 경로 풍경"
              >
                <MountainScene withRoute variant="before" />
                <div
                  className="absolute left-3 top-3 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
                  style={{ borderColor: P.bg, color: P.bg }}
                >
                  Before
                </div>
              </div>
              <figcaption
                className="mt-3 flex items-baseline justify-between border-b pb-3"
                style={{ borderColor: P.fg }}
              >
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.18em]"
                  style={{ color: P.muted }}
                >
                  기존 · 자가용
                </span>
                <span
                  className="font-mono tracking-tight tabular-nums"
                  style={{ color: P.fg, fontSize: '1.75rem', lineHeight: 1 }}
                >
                  12.4<span className="text-[12px]" style={{ color: P.muted }}>kg</span>
                </span>
              </figcaption>
            </figure>

            {/* AFTER */}
            <figure className="flex flex-col">
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: '4 / 5' }}
                role="group"
                aria-label="저탄소 경로 풍경"
              >
                <MountainScene withRoute variant="after" />
                <div
                  className="absolute left-3 top-3 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
                  style={{ borderColor: P.accent, color: P.accent, background: P.bg }}
                >
                  After
                </div>
              </div>
              <figcaption
                className="mt-3 flex items-baseline justify-between border-b pb-3"
                style={{ borderColor: P.fg }}
              >
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.18em]"
                  style={{ color: P.primary }}
                >
                  저탄소 · 고속버스 + 도보
                </span>
                <span
                  className="font-mono tracking-tight tabular-nums"
                  style={{ color: P.accent, fontSize: '1.75rem', lineHeight: 1 }}
                >
                  4.0<span className="text-[12px]" style={{ color: P.muted }}>kg</span>
                </span>
              </figcaption>
            </figure>
          </div>

          {/* 3안 매거진 사이드바 인덱스 — 하단 */}
          <aside
            className="mt-10 grid grid-cols-1 gap-0 border-t md:grid-cols-3"
            style={{ borderColor: P.fg }}
            aria-label="이동수단 3안 인덱스"
          >
            {[
              {
                idx: '01',
                label: '자가용',
                eng: 'Private Car',
                co2: '14.1',
                tone: 'fast' as const,
                note: '빠르지만 자국이 가장 깊다.',
              },
              {
                idx: '02',
                label: '대중교통',
                eng: 'Public Transit',
                co2: '4.6',
                tone: 'balance' as const,
                note: '추천 — 균형 잡힌 선택.',
                star: true,
              },
              {
                idx: '03',
                label: '자전거 + 도보',
                eng: 'Active',
                co2: '0.2',
                tone: 'eco' as const,
                note: '가장 작은 자국. 짧은 코스에서만.',
              },
            ].map((opt) => (
              <div
                key={opt.idx}
                className="flex flex-col gap-1 border-b px-4 py-5 md:border-b-0 md:border-r md:px-5 md:py-6 last:md:border-r-0"
                style={{ borderColor: P.fg }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: P.muted }}
                  >
                    {opt.idx} · {opt.eng}
                  </span>
                  {opt.star ? (
                    <span
                      role="img"
                      aria-label="추천 코스"
                      className="border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em]"
                      style={{ borderColor: P.accent, color: P.accent }}
                    >
                      ★ Recommended
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <span
                    className="font-medium tracking-tight"
                    style={{ color: P.fg, fontSize: '1.25rem' }}
                  >
                    {opt.label}
                  </span>
                  <span
                    className="font-mono tracking-tight tabular-nums"
                    style={{
                      color: opt.tone === 'eco' || opt.tone === 'balance' ? P.primary : P.fg,
                      fontSize: '1.5rem',
                      lineHeight: 1,
                    }}
                  >
                    {opt.co2}
                    <span className="text-[11px]" style={{ color: P.muted }}>
                      {' '}
                      kg
                    </span>
                  </span>
                </div>
                <p
                  className="mt-1 font-normal text-[14px] leading-[22px]"
                  style={{ color: P.muted }}
                >
                  {opt.note}
                </p>
              </div>
            ))}
          </aside>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SIGNATURE 2 — Carbon Receipt (영양정보 라벨)                   */}
      {/* ============================================================ */}
      <section
        aria-labelledby="sig2-title"
        className="border-t px-5 py-12 md:px-8 md:py-20"
        style={{ borderColor: P.fg, background: P.bg }}
      >
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <header className="mb-8">
            <div
              className="font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: P.muted }}
            >
              No. 02 · Receipt
            </div>
            <h2
              id="sig2-title"
              className="mt-2 font-medium tracking-tight"
              style={{
                color: P.fg,
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              인증서 — 한 줄씩 인쇄된 자국
            </h2>
          </header>

          {/* 영양정보 라벨 카드 */}
          <article
            aria-label="강원도 1박2일 고속버스 코스 탄소 영수증"
            className="border-2 p-5 md:p-8"
            style={{
              background: P.surface,
              borderColor: P.fg,
              color: P.fg,
            }}
          >
            {/* 라벨 헤더 */}
            <div
              className="border-b-2 pb-3"
              style={{ borderColor: P.fg }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-[0.25em]"
                style={{ color: P.muted }}
              >
                GreenTrip
              </div>
              <div
                className="mt-1 font-mono font-medium uppercase tracking-tight"
                style={{ color: P.fg, fontSize: '1.5rem', letterSpacing: '0.02em' }}
              >
                Carbon Receipt
              </div>
            </div>

            {/* 코스 메타 */}
            <dl
              className="mt-4 grid grid-cols-2 gap-y-1 border-b pb-4 font-mono text-[12px] tabular-nums"
              style={{ borderColor: P.fg, color: P.fg }}
            >
              <dt style={{ color: P.muted }}>Course</dt>
              <dd className="text-right">강원도 1박2일</dd>
              <dt style={{ color: P.muted }}>Mode</dt>
              <dd className="text-right">고속버스 + 도보</dd>
              <dt style={{ color: P.muted }}>Issued</dt>
              <dd className="text-right">2026.06.16</dd>
              <dt style={{ color: P.muted }}>Serial</dt>
              <dd className="text-right">GT-2603-0416</dd>
            </dl>

            {/* 영수증 라인 */}
            <div className="mt-4">
              <div
                className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.15em]"
                style={{ color: P.muted }}
              >
                <span>Line item</span>
                <span>kg CO₂e</span>
              </div>
              <ul
                className="mt-2 divide-y font-mono text-[14px] tabular-nums"
                style={{
                  color: P.fg,
                  // divide color via inline borders on children
                }}
                aria-label="이동·활동별 탄소 라인 항목"
              >
                {[
                  ['서울 → 속초 · 고속버스', '2.10'],
                  ['속초 시내 · 도보', '0.00'],
                  ['속초 → 양양 · 시외버스', '1.40'],
                  ['양양 해변 · 자전거', '0.05'],
                  ['양양 → 강릉 · KTX', '0.45'],
                  ['강릉 → 서울 · KTX', '0.00'],
                ].map(([label, val]) => (
                  <li
                    key={label}
                    className="flex items-baseline justify-between py-1.5"
                    style={{ borderColor: P.muted, borderTopWidth: 1 }}
                  >
                    <span>{label}</span>
                    <span style={{ color: P.fg }}>{val}</span>
                  </li>
                ))}
              </ul>

              {/* 합계 */}
              <div
                className="mt-2 flex items-baseline justify-between border-t-2 pt-2 font-mono"
                style={{ borderColor: P.fg }}
              >
                <span
                  className="text-[11px] uppercase tracking-[0.18em]"
                  style={{ color: P.muted }}
                >
                  Total saved
                </span>
                <span
                  className="tracking-tight tabular-nums"
                  style={{ color: P.accent, fontSize: '1.75rem', lineHeight: 1 }}
                >
                  −9.6<span className="ml-1 text-[12px]" style={{ color: P.muted }}>kg</span>
                </span>
              </div>
              <div
                className="mt-1 flex items-baseline justify-between font-mono text-[12px] tabular-nums"
                style={{ color: P.muted }}
              >
                <span>Trees · 1y equivalent</span>
                <span style={{ color: P.fg }}>0.4 그루</span>
              </div>
            </div>

            {/* 서명 줄 */}
            <div
              className="mt-6 grid grid-cols-2 gap-6 border-t pt-4"
              style={{ borderColor: P.fg }}
            >
              <div>
                <div
                  className="h-8 border-b"
                  style={{ borderColor: P.fg }}
                  aria-hidden="true"
                />
                <div
                  className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: P.muted }}
                >
                  Signature
                </div>
              </div>
              <div>
                <div
                  className="flex h-8 items-end font-mono text-[13px]"
                  style={{ color: P.fg }}
                >
                  2026.06.16
                </div>
                <div
                  className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: P.muted }}
                >
                  Date
                </div>
              </div>
            </div>
          </article>

          {/* 공유 줄 — 라벨 아래 한 줄 */}
          <div
            className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-b pb-5 font-mono text-[12px] uppercase tracking-[0.15em]"
            style={{ borderColor: P.fg, color: P.fg }}
            role="group"
            aria-label="인증서 공유"
          >
            <button
              type="button"
              className="inline-flex items-center gap-2"
              aria-label="PDF로 내려받기"
              style={{ color: P.fg }}
            >
              <Download aria-hidden="true" className="h-3.5 w-3.5" />
              Download
            </button>
            <span aria-hidden="true" style={{ color: P.muted }}>
              ·
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2"
              aria-label="카카오로 공유"
              style={{ color: P.fg }}
            >
              <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
              Kakao
            </button>
            <span aria-hidden="true" style={{ color: P.muted }}>
              ·
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-2"
              aria-label="링크 복사"
              style={{ color: P.fg }}
            >
              <Link2 aria-hidden="true" className="h-3.5 w-3.5" />
              Copy link
            </button>
            <span
              className="ml-auto inline-flex items-center gap-1.5"
              style={{ color: P.muted }}
            >
              <PenLine aria-hidden="true" className="h-3.5 w-3.5" />
              hand-stamped
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SIGNATURE 3 — Carbon Scale + Before/After                    */}
      {/* ============================================================ */}
      <section
        aria-labelledby="sig3-title"
        className="border-t px-5 py-12 md:px-8 md:py-20"
        style={{ borderColor: P.fg }}
      >
        <div className="mx-auto" style={{ maxWidth: 880 }}>
          <header className="mb-10">
            <div
              className="font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: P.muted }}
            >
              No. 03 · Scale
            </div>
            <h2
              id="sig3-title"
              className="mt-2 font-medium tracking-tight"
              style={{
                color: P.fg,
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              어디쯤에 착지했나
            </h2>
            <p
              className="mt-3 font-normal text-[17px] leading-[28px]"
              style={{ color: P.muted, maxWidth: 560 }}
            >
              네 칸짜리 리본 위, 이번 여행은 두 번째 칸에 머물렀습니다.
            </p>
          </header>

          {/* 4-tier ribbon */}
          <div
            role="img"
            aria-label="탄소 4단계 리본: ≤2kg 최저, ≤6kg 낮음(이 여행이 여기), ≤12kg 보통, 12kg 초과 높음"
            className="relative"
          >
            <div className="grid grid-cols-4 overflow-hidden border-2" style={{ borderColor: P.fg }}>
              {[
                { label: '≤ 2 kg', sub: 'minimal', shade: 0.95 },
                { label: '≤ 6 kg', sub: 'low', shade: 0.7, active: true },
                { label: '≤ 12 kg', sub: 'medium', shade: 0.45 },
                { label: '> 12 kg', sub: 'high', shade: 0.2 },
              ].map((tier) => (
                <div
                  key={tier.label}
                  className="relative flex flex-col items-start gap-1 px-3 py-4 md:px-5 md:py-5"
                  style={{
                    background: `rgba(59, 90, 58, ${tier.shade})`,
                    color: tier.shade > 0.5 ? P.bg : P.fg,
                  }}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ opacity: 0.85 }}>
                    {tier.sub}
                  </span>
                  <span className="font-mono tracking-tight tabular-nums" style={{ fontSize: '1rem' }}>
                    {tier.label}
                  </span>
                  {tier.active ? (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]"
                      style={{
                        background: P.bg,
                        color: P.accent,
                        borderColor: P.accent,
                      }}
                    >
                      You are here
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Before / After 큰 수치 */}
          <div
            className="mt-16 grid grid-cols-1 items-end gap-8 border-t pt-10 md:grid-cols-[1fr_auto_1fr]"
            style={{ borderColor: P.fg }}
            aria-label="기존 대비 최적화 결과"
          >
            <div>
              <div
                className="font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{ color: P.muted }}
              >
                Baseline · 자가용
              </div>
              <div
                className="mt-2 font-mono tracking-tight tabular-nums"
                style={{
                  color: P.muted,
                  fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
                  lineHeight: 1,
                  textDecoration: 'line-through',
                  textDecorationThickness: '2px',
                }}
              >
                14.1<span className="ml-1 text-[14px]" style={{ color: P.muted }}>kg</span>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="hidden items-center justify-center md:flex"
              style={{ color: P.accent }}
            >
              <Wind className="h-8 w-8" />
            </div>

            <div>
              <div
                className="font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{ color: P.primary }}
              >
                Optimized · 고속버스 + 도보
              </div>
              <div
                className="mt-2 font-medium tracking-tight tabular-nums"
                style={{
                  color: P.accent,
                  fontSize: 'clamp(3rem, 9vw, 5rem)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                4.6<span className="ml-1 text-[16px]" style={{ color: P.muted }}>kg</span>
              </div>
              <div
                className="mt-3 font-mono text-[12px] tabular-nums"
                style={{ color: P.primary }}
              >
                − 9.6 kg · 67.6% 절감
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER                                                       */}
      {/* ============================================================ */}
      <footer
        className="border-t px-5 py-10 md:px-8 md:py-14"
        style={{ borderColor: P.fg }}
      >
        <div
          className="mx-auto flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          style={{ maxWidth: 1080 }}
        >
          <div>
            <div
              className="font-mono text-[10px] uppercase tracking-[0.25em]"
              style={{ color: P.muted }}
            >
              GreenTrip · Field Journal · v03
            </div>
            <div
              className="mt-1 font-medium tracking-tight"
              style={{ color: P.fg, fontSize: '1.25rem', letterSpacing: '-0.01em' }}
            >
              파타고니아 저널 — patagonia-field-journal
            </div>
          </div>

          <Link
            href="/v"
            aria-label="디자인 변형 카탈로그로 돌아가기"
            className="inline-flex items-center gap-2 self-start border px-3 py-2 font-mono text-[12px] uppercase tracking-[0.18em] md:self-end"
            style={{ borderColor: P.fg, color: P.fg }}
          >
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            /v 카탈로그로 돌아가기
          </Link>
        </div>
      </footer>
    </main>
  );
}
