// /v/v02 — 구글 플라이트 인라인 (google-flights-inline-leaf)
// One-line pitch: 가격·시간·CO₂가 같은 행에 동등한 컬럼으로 서는 OTA 비교 표면
// Server Component (no client state). 모든 색은 인라인 style로 — variant palette 격리.
//
// 시그니처:
//   1. Hero — 가로형 플래너 위젯 + 동사형 카피 "Compare by CO₂"
//   2. 시그니처 1 — 결과 행 3개 (정렬 토글 탭 / 행 단위 비교)
//   3. 시그니처 2 — 결제 영수증 톤 인증서 (라벨-값 2컬럼 + 미니 공유 아이콘)
//   4. 시그니처 3 — Carbon Scale 리본 + Before/After
//   5. Footer — /v 카탈로그로 돌아가기
import Link from 'next/link';
import {
  Search,
  Car,
  Bus,
  Bike,
  Leaf,
  ArrowRight,
  Calendar,
  Users,
  MapPin,
  Clock,
  Wallet,
  ChevronRight,
  Download,
  MessageCircle,
  Link2,
  Star,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'v02 · 구글 플라이트 인라인 — GreenTrip 디자인 변형',
  description:
    'OTA(Google Flights/Booking) 표면을 차용해 CO₂를 가격·시간과 동등한 컬럼으로 비교하는 GreenTrip 변형 시안.',
};

// ---- variant palette ------------------------------------------------------
const PAL = {
  bg: '#F8FAFC',
  fg: '#202124',
  primary: '#1E8E3E',
  accent: '#1A73E8',
  muted: '#5F6368',
  surface: '#FFFFFF',
} as const;

const BORDER = '#E5E7EB';
const BORDER_SOFT = '#EEF1F4';
const LEAF_BG = '#E8F5EC'; // primary 12% 톤
const ACCENT_SOFT = '#E8F0FE'; // accent 12% 톤

// ---- mock data ------------------------------------------------------------
type Row = {
  id: 'car' | 'transit' | 'active';
  icon: typeof Car;
  label: string;
  vehicle: string;
  duration: string;
  durationMin: number;
  fareKRW: number;
  co2Kg: number;
  savedPct: number; // vs baseline (car)
  recommended: boolean;
};

const ROWS: Row[] = [
  {
    id: 'car',
    icon: Car,
    label: '자가용',
    vehicle: '내 차',
    duration: '1시간 7분',
    durationMin: 67,
    fareKRW: 6730,
    co2Kg: 14.1,
    savedPct: 0,
    recommended: false,
  },
  {
    id: 'transit',
    icon: Bus,
    label: '대중교통',
    vehicle: '고속버스',
    duration: '1시간 13분',
    durationMin: 73,
    fareKRW: 4038,
    co2Kg: 4.6,
    savedPct: 68,
    recommended: true,
  },
  {
    id: 'active',
    icon: Bike,
    label: '자전거+도보',
    vehicle: '두루누비 자전거길',
    duration: '34분',
    durationMin: 34,
    fareKRW: 0,
    co2Kg: 0.2,
    savedPct: 99,
    recommended: false,
  },
];

function formatFare(krw: number) {
  if (krw <= 0) return '무료';
  return `${krw.toLocaleString('ko-KR')}원`;
}

// ===========================================================================
// Section 1 — Hero (가로형 플래너 위젯 + 동사형 카피)
// ===========================================================================
function HeroBlock() {
  return (
    <section
      aria-labelledby="v02-hero-title"
      style={{ backgroundColor: PAL.bg, color: PAL.fg }}
      className="px-4 pt-10 pb-8 md:px-8 md:pt-16 md:pb-12"
    >
      <div className="mx-auto max-w-5xl">
        {/* eyebrow */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
          style={{
            backgroundColor: ACCENT_SOFT,
            color: PAL.accent,
            border: `1px solid ${PAL.accent}33`,
          }}
        >
          <Leaf aria-hidden="true" className="h-3 w-3" />
          GreenTrip · 변형 v02 · 구글 플라이트 인라인
        </div>

        {/* 동사형 카피 */}
        <h1
          id="v02-hero-title"
          className="mt-5 font-semibold tracking-tight"
          style={{
            fontSize: '2.25rem',
            lineHeight: 1.05,
            color: PAL.fg,
          }}
        >
          Compare by CO₂.
        </h1>
        <p
          className="mt-3 text-[14px] font-normal leading-[20px]"
          style={{ color: PAL.muted }}
        >
          이동수단 하나가{' '}
          <span
            className="font-medium tabular-nums"
            style={{ color: PAL.primary }}
          >
            67.6%
          </span>
          를 바꿉니다. 가격·시간 옆 컬럼에서 탄소를 비교하세요.
        </p>

        {/* KPI strip */}
        <div
          className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]"
          style={{ color: PAL.muted }}
          aria-label="핵심 지표"
        >
          <span className="inline-flex items-baseline gap-1">
            <span
              className="font-medium tabular-nums"
              style={{ color: PAL.fg, fontSize: '15px' }}
            >
              9,556g
            </span>
            절감
          </span>
          <span aria-hidden="true" style={{ color: BORDER }}>
            |
          </span>
          <span className="inline-flex items-baseline gap-1">
            <span
              className="font-medium tabular-nums"
              style={{ color: PAL.fg, fontSize: '15px' }}
            >
              0.4
            </span>
            그루
          </span>
          <span aria-hidden="true" style={{ color: BORDER }}>
            |
          </span>
          <span className="inline-flex items-baseline gap-1">
            <span
              className="font-medium tabular-nums"
              style={{ color: PAL.fg, fontSize: '15px' }}
            >
              14종
            </span>
            API
          </span>
        </div>

        {/* 가로형 플래너 위젯 — Booking 톤 #1A73E8 얇은 보더 */}
        <div
          role="search"
          aria-label="여행 계획 위젯"
          className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg md:grid-cols-[1.3fr_1.3fr_1fr_1fr_auto]"
          style={{
            backgroundColor: BORDER_SOFT,
            border: `1px solid ${PAL.accent}`,
            boxShadow: `0 1px 0 ${PAL.accent}14`,
          }}
        >
          <PlannerField icon={MapPin} label="출발" value="서울" />
          <PlannerField icon={MapPin} label="도착" value="강원 강릉" />
          <PlannerField icon={Calendar} label="기간" value="1박 2일" />
          <PlannerField icon={Users} label="동반자" value="성인 2명" />
          <button
            type="button"
            aria-label="검색"
            className="flex items-center justify-center gap-2 px-5 py-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: PAL.accent }}
          >
            <Search aria-hidden="true" className="h-4 w-4" />
            검색
          </button>
        </div>

        <p
          className="mt-3 text-[12px]"
          style={{ color: PAL.muted }}
          aria-hidden="true"
        >
          데모 시안 — 입력은 비활성 상태입니다.
        </p>
      </div>
    </section>
  );
}

function PlannerField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ backgroundColor: PAL.surface }}
    >
      <Icon
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
        style={{ color: PAL.muted }}
      />
      <div className="min-w-0">
        <div
          className="text-[11px] uppercase tracking-wide"
          style={{ color: PAL.muted }}
        >
          {label}
        </div>
        <div
          className="truncate text-[14px] font-semibold"
          style={{ color: PAL.fg }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Section 2 — 시그니처 1: 3안 비교 inline rows + 정렬 토글 탭
// ===========================================================================
function CompareInlineBlock() {
  return (
    <section
      aria-labelledby="v02-compare-title"
      style={{ backgroundColor: PAL.bg }}
      className="px-4 py-8 md:px-8 md:py-12"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2
              id="v02-compare-title"
              className="font-semibold tracking-tight"
              style={{ fontSize: '20px', lineHeight: 1.2, color: PAL.fg }}
            >
              결과 3건
            </h2>
            <p
              className="mt-1 text-[13px]"
              style={{ color: PAL.muted }}
            >
              서울 → 강원 강릉 · 1박 2일
            </p>
          </div>

          {/* 정렬 토글 탭 */}
          <div
            role="tablist"
            aria-label="결과 정렬"
            className="inline-flex overflow-hidden rounded-full text-[13px]"
            style={{ border: `1px solid ${BORDER}`, backgroundColor: PAL.surface }}
          >
            <SortTab label="시간순" active={false} />
            <SortTab label="비용순" active={false} />
            <SortTab label="CO₂순" active={true} />
          </div>
        </div>

        {/* 결과 행들 */}
        <ul
          className="mt-5 flex flex-col gap-px overflow-hidden rounded-lg"
          style={{ backgroundColor: BORDER_SOFT, border: `1px solid ${BORDER}` }}
        >
          {ROWS.map((row) => (
            <CompareRow key={row.id} row={row} />
          ))}
        </ul>

        {/* 컬럼 동등성 강조 라벨 */}
        <p
          className="mt-4 text-[12px]"
          style={{ color: PAL.muted }}
        >
          가격·시간 옆에 CO₂가{' '}
          <span style={{ color: PAL.primary, fontWeight: 600 }}>
            동등한 컬럼
          </span>
          으로 정렬됩니다.
        </p>
      </div>
    </section>
  );
}

function SortTab({ label, active }: { label: string; active: boolean }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className="px-3 py-1.5 font-medium transition-colors"
      style={{
        backgroundColor: active ? PAL.fg : 'transparent',
        color: active ? PAL.surface : PAL.muted,
      }}
    >
      {label}
    </button>
  );
}

function CompareRow({ row }: { row: Row }) {
  const Icon = row.icon;
  const recommended = row.recommended;

  return (
    <li
      role="article"
      aria-label={`${row.label} ${row.vehicle} ${row.duration} ${formatFare(row.fareKRW)} CO₂ ${row.co2Kg}kg${recommended ? ' 추천' : ''}`}
      className="relative"
      style={{
        backgroundColor: PAL.surface,
        // 추천안 좌측 4px primary 라인
        borderLeft: recommended ? `4px solid ${PAL.primary}` : '4px solid transparent',
      }}
    >
      {/* 모바일: 2행 grid · md+: 단일 가로 라인 */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4 md:grid-cols-[44px_1.4fr_1fr_1fr_1fr_auto] md:gap-4 md:px-5">
        {/* 1) 아이콘 */}
        <div
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{
            backgroundColor: row.id === 'car' ? '#F1F3F4' : LEAF_BG,
            color: row.id === 'car' ? PAL.muted : PAL.primary,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* 2) 교통수단 — 모바일에서는 가로폭 채움 */}
        <div className="min-w-0 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[15px] font-semibold"
              style={{ color: PAL.fg }}
            >
              {row.label}
            </span>
            {recommended ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{
                  backgroundColor: LEAF_BG,
                  color: PAL.primary,
                }}
                aria-label="추천"
              >
                <Star aria-hidden="true" className="h-3 w-3" />
                추천
              </span>
            ) : null}
          </div>
          <div
            className="mt-0.5 text-[13px]"
            style={{ color: PAL.muted }}
          >
            {row.vehicle}
          </div>
        </div>

        {/* 3) 소요시간 */}
        <Cell label="소요시간" icon={Clock}>
          <span
            className="font-medium tabular-nums"
            style={{ color: PAL.fg, fontSize: '15px' }}
          >
            {row.duration}
          </span>
        </Cell>

        {/* 4) 요금 */}
        <Cell label="요금" icon={Wallet}>
          <span
            className="font-medium tabular-nums"
            style={{ color: PAL.fg, fontSize: '15px' }}
          >
            {formatFare(row.fareKRW)}
          </span>
        </Cell>

        {/* 5) CO₂ leaf 배지 — 가격과 같은 사이즈/weight */}
        <Cell label="CO₂" icon={Leaf}>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium tabular-nums"
            style={{
              backgroundColor: row.id === 'car' ? '#FEF2F2' : LEAF_BG,
              color: row.id === 'car' ? '#B42318' : PAL.primary,
              fontSize: '14px',
              border: `1px solid ${row.id === 'car' ? '#FECDCA' : `${PAL.primary}33`}`,
            }}
          >
            <Leaf aria-hidden="true" className="h-3.5 w-3.5" />
            {row.co2Kg.toFixed(1)}kg
            {row.savedPct > 0 ? (
              <span style={{ color: PAL.primary, fontSize: '12px' }}>
                −{row.savedPct}%
              </span>
            ) : null}
          </span>
        </Cell>

        {/* 6) CTA */}
        <div className="col-span-3 mt-2 flex justify-end md:col-span-1 md:mt-0">
          <button
            type="button"
            aria-label={`${row.label} 선택`}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: recommended ? PAL.primary : 'transparent',
              color: recommended ? PAL.surface : PAL.accent,
              border: recommended
                ? `1px solid ${PAL.primary}`
                : `1px solid ${PAL.accent}66`,
            }}
          >
            선택
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

function Cell({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Clock;
  children: React.ReactNode;
}) {
  return (
    <div className="hidden flex-col md:flex">
      <div
        className="flex items-center gap-1 text-[11px] uppercase tracking-wide"
        style={{ color: PAL.muted }}
      >
        <Icon aria-hidden="true" className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

// ===========================================================================
// Section 3 — 시그니처 2: 결제 영수증 톤 인증서
// ===========================================================================
function CertReceiptBlock() {
  return (
    <section
      aria-labelledby="v02-cert-title"
      style={{ backgroundColor: PAL.surface, borderTop: `1px solid ${BORDER}` }}
      className="px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="v02-cert-title"
          className="font-semibold tracking-tight"
          style={{ fontSize: '20px', lineHeight: 1.2, color: PAL.fg }}
        >
          그린 여행 영수증
        </h2>
        <p
          className="mt-1 text-[13px]"
          style={{ color: PAL.muted }}
        >
          결제 영수증 톤으로 재해석된 인증서.
        </p>

        <article
          aria-label="강원도 1박2일 고속버스 코스 인증서"
          className="mt-5 overflow-hidden rounded-lg md:max-w-md"
          style={{
            backgroundColor: PAL.surface,
            border: `1px solid ${BORDER}`,
            boxShadow: '0 1px 2px rgba(16,24,40,0.06)',
          }}
        >
          {/* 얇은 #1E8E3E 헤더 바 */}
          <header
            className="flex items-center justify-between px-4 py-2.5"
            style={{ backgroundColor: PAL.primary, color: PAL.surface }}
          >
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
              <Leaf aria-hidden="true" className="h-3.5 w-3.5" />
              lower emissions
            </span>
            <span
              className="font-medium tabular-nums"
              style={{ fontSize: '12px', opacity: 0.9 }}
            >
              CERT-2026-0616
            </span>
          </header>

          <div className="px-4 py-5 md:px-6 md:py-6">
            {/* 좌측 leaf 마크 + 코스명 */}
            <div className="flex items-start gap-3">
              <div
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: LEAF_BG, color: PAL.primary }}
              >
                <Leaf className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div
                  className="text-[12px] uppercase tracking-wide"
                  style={{ color: PAL.muted }}
                >
                  course
                </div>
                <div
                  className="mt-0.5 font-semibold leading-tight"
                  style={{ color: PAL.fg, fontSize: '15px' }}
                >
                  강원도 1박 2일 고속버스 코스
                </div>
              </div>
            </div>

            {/* 라벨-값 2컬럼 표 */}
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[14px]">
              <ReceiptRow label="CO₂ 절감">
                <span
                  className="font-medium tabular-nums"
                  style={{ color: PAL.primary }}
                >
                  −9.6 kg
                </span>
              </ReceiptRow>
              <ReceiptRow label="소나무 환산">
                <span className="font-medium tabular-nums" style={{ color: PAL.fg }}>
                  0.4 그루
                </span>
              </ReceiptRow>
              <ReceiptRow label="이동수단">
                <span style={{ color: PAL.fg }}>고속버스</span>
              </ReceiptRow>
              <ReceiptRow label="자가용 회피">
                <span className="font-medium tabular-nums" style={{ color: PAL.fg }}>
                  67 km
                </span>
              </ReceiptRow>
              <ReceiptRow label="발급일">
                <span className="font-medium tabular-nums" style={{ color: PAL.fg }}>
                  2026.06.16
                </span>
              </ReceiptRow>
            </dl>

            {/* 미니 공유 아이콘 버튼 3개 */}
            <div
              className="mt-5 flex items-center justify-end gap-1.5 border-t pt-4"
              style={{ borderColor: BORDER_SOFT }}
              role="group"
              aria-label="인증서 공유"
            >
              <ShareIconBtn icon={Download} label="PDF 다운로드" />
              <ShareIconBtn icon={MessageCircle} label="카카오 공유" />
              <ShareIconBtn icon={Link2} label="URL 복사" />
            </div>
          </div>

          {/* 영수증 풋터 */}
          <footer
            className="flex items-center justify-between px-4 py-2.5 text-[11px]"
            style={{
              borderTop: `1px dashed ${BORDER}`,
              backgroundColor: PAL.bg,
              color: PAL.muted,
            }}
          >
            <span>GreenTrip × 한국관광공사</span>
            <span className="font-medium tabular-nums">14종 API</span>
          </footer>
        </article>
      </div>
    </section>
  );
}

function ReceiptRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt style={{ color: PAL.muted }}>{label}</dt>
      <dd className="text-right">{children}</dd>
    </>
  );
}

function ShareIconBtn({
  icon: Icon,
  label,
}: {
  icon: typeof Download;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:opacity-80"
      style={{
        backgroundColor: PAL.bg,
        color: PAL.fg,
        border: `1px solid ${BORDER}`,
      }}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}

// ===========================================================================
// Section 4 — 시그니처 3: Carbon Scale 4-tier + Before/After
// ===========================================================================
const TIERS = [
  { id: 'a', label: '≤ 2kg', max: 2, color: '#1E8E3E' },
  { id: 'b', label: '≤ 6kg', max: 6, color: '#86C46A' },
  { id: 'c', label: '≤ 12kg', max: 12, color: '#F0B400' },
  { id: 'd', label: '> 12kg', max: Infinity, color: '#D93025' },
];

function CarbonScaleBlock() {
  const baseline = 14.1;
  const optimized = 4.6;
  // active tier index for optimized
  const optimizedTier = TIERS.findIndex((t) => optimized <= t.max);
  // % positions on a 0–16kg scale
  const SCALE_MAX = 16;
  const baselinePct = Math.min(100, (baseline / SCALE_MAX) * 100);
  const optimizedPct = Math.min(100, (optimized / SCALE_MAX) * 100);

  return (
    <section
      aria-labelledby="v02-scale-title"
      style={{ backgroundColor: PAL.bg, borderTop: `1px solid ${BORDER}` }}
      className="px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="v02-scale-title"
          className="font-semibold tracking-tight"
          style={{ fontSize: '20px', lineHeight: 1.2, color: PAL.fg }}
        >
          Carbon Scale
        </h2>
        <p className="mt-1 text-[13px]" style={{ color: PAL.muted }}>
          4단계 리본 위에 이 코스의 위치를 표시합니다.
        </p>

        {/* Before / After numeric */}
        <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-3">
          <div>
            <div
              className="text-[12px] uppercase tracking-wide"
              style={{ color: PAL.muted }}
            >
              baseline
            </div>
            <div
              className="font-medium tabular-nums"
              style={{
                color: PAL.muted,
                fontSize: '2.25rem',
                lineHeight: 1,
                textDecoration: 'line-through',
                textDecorationColor: '#D9302566',
              }}
            >
              14.1
              <span
                className="ml-1 font-normal"
                style={{ fontSize: '14px' }}
              >
                kg
              </span>
            </div>
          </div>

          <ArrowRight
            aria-hidden="true"
            className="mb-2 h-6 w-6"
            style={{ color: PAL.muted }}
          />

          <div>
            <div
              className="text-[12px] uppercase tracking-wide"
              style={{ color: PAL.primary }}
            >
              optimized
            </div>
            {/* variant hero numeric — 5rem semibold tracking-tight */}
            <div
              className="font-semibold tracking-tight tabular-nums"
              style={{
                color: PAL.primary,
                fontSize: '5rem',
                lineHeight: 1,
              }}
            >
              4.6
              <span
                className="ml-2 font-medium"
                style={{ fontSize: '20px', color: PAL.primary }}
              >
                kg
              </span>
            </div>
            <div
              className="mt-1 text-[13px]"
              style={{ color: PAL.primary }}
            >
              <span className="font-medium tabular-nums">−9,556g</span>{' '}
              <span style={{ color: PAL.muted }}>·</span>{' '}
              <span className="font-medium tabular-nums">68%</span> 절감
            </div>
          </div>
        </div>

        {/* 4-tier ribbon */}
        <div className="mt-8">
          <div
            role="img"
            aria-label={`Carbon scale 위 ${optimized}kg 위치, 4단계 중 ${optimizedTier + 1}단계`}
            className="relative h-3 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: BORDER_SOFT }}
          >
            <div className="absolute inset-0 grid grid-cols-4">
              {TIERS.map((t) => (
                <div
                  key={t.id}
                  style={{
                    backgroundColor: t.color,
                    opacity: 0.85,
                    borderRight: `2px solid ${PAL.bg}`,
                  }}
                />
              ))}
            </div>

            {/* baseline marker */}
            <div
              aria-hidden="true"
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${baselinePct}%` }}
            >
              <div
                className="h-5 w-0.5"
                style={{ backgroundColor: PAL.fg, opacity: 0.4 }}
              />
            </div>

            {/* optimized marker */}
            <div
              aria-hidden="true"
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${optimizedPct}%` }}
            >
              <div
                className="h-6 w-6 rounded-full"
                style={{
                  backgroundColor: PAL.surface,
                  border: `3px solid ${PAL.primary}`,
                  boxShadow: '0 1px 3px rgba(16,24,40,0.2)',
                }}
              />
            </div>
          </div>

          {/* tier legend */}
          <div
            className="mt-3 grid grid-cols-4 gap-2 text-[11px]"
            style={{ color: PAL.muted }}
          >
            {TIERS.map((t, i) => (
              <div key={t.id} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ backgroundColor: t.color }}
                />
                <span
                  className={i === optimizedTier ? 'font-semibold' : ''}
                  style={i === optimizedTier ? { color: PAL.fg } : undefined}
                >
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Section 5 — Footer
// ===========================================================================
function FooterBlock() {
  return (
    <footer
      style={{
        backgroundColor: PAL.surface,
        borderTop: `1px solid ${BORDER}`,
      }}
      className="px-4 py-6 md:px-8"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <Link
          href="/v"
          className="inline-flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-80"
          style={{ color: PAL.accent }}
          aria-label="변형 카탈로그로 돌아가기"
        >
          <ChevronRight
            aria-hidden="true"
            className="h-3.5 w-3.5 rotate-180"
          />
          /v 카탈로그로 돌아가기
        </Link>
        <span
          className="text-[12px]"
          style={{ color: PAL.muted }}
        >
          variant v02 · google-flights-inline-leaf
        </span>
      </div>
    </footer>
  );
}

// ===========================================================================
// Page
// ===========================================================================
export default function V02Page() {
  return (
    <main style={{ backgroundColor: PAL.bg, color: PAL.fg }}>
      <HeroBlock />
      <CompareInlineBlock />
      <CertReceiptBlock />
      <CarbonScaleBlock />
      <FooterBlock />
    </main>
  );
}
