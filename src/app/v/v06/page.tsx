// Variant v06 — 당근 따뜻 (daangn-warm-civic)
// Inspiration: Daangn Seed Design, Kakao Bank, Naver Map V6
// Server Component. 모든 색은 inline style (palette 객체에서만 사용).
// 같은 페이지 안에 시그니처 1·2·3를 세로로 스택해 비교 가능.
import Link from 'next/link';
import {
  Sprout,
  Bike,
  Bus,
  Car,
  Clock,
  MapPin,
  Download,
  MessageCircle,
  Link2,
  ChevronRight,
  Star,
  Home,
  Search,
  Heart,
  User as UserIcon,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'GreenTrip · 당근 따뜻 (v06)',
  description:
    'Daangn Seed × Kakao Bank × Naver Map V6 — 이웃 존댓말 카피와 따뜻한 동네 톤, 매너온도 스타일 탄소 절감 칩.',
};

// 팔레트 — 모든 색은 여기서만 가져온다.
const palette = {
  bg: '#FFF8F2',
  fg: '#212124',
  primary: '#097A50',
  accent: '#FF7E36',
  muted: '#6B7280',
  surface: '#FFFFFF',
} as const;

// 보조 톤 (palette 파생: hex + alpha)
const tone = {
  primarySoft: 'rgba(9, 122, 80, 0.10)',
  accentSoft: 'rgba(255, 126, 54, 0.12)',
  fgSoft: 'rgba(33, 33, 36, 0.06)',
  fgLine: 'rgba(33, 33, 36, 0.08)',
  scrim: 'rgba(0, 0, 0, 0.55)',
} as const;

// ---------------------------------------------------------------------------
// HERO — 16:10 풀블리드 골든아워 일러스트 (CSS 그라데이션, 외부 이미지 X)
//        하단 좌측 스크림 위 친근 헤드라인 + 우측 상단 매너온도 칩
// ---------------------------------------------------------------------------
function Hero() {
  return (
    <section
      aria-labelledby="v06-hero-title"
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: palette.surface }}
    >
      {/* 16:10 풀블리드 일러스트 영역 */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: '16 / 10',
          background: `linear-gradient(180deg, #FFD9A8 0%, #FFB07A 38%, #F58A4A 70%, #C95B2D 100%)`,
        }}
        role="img"
        aria-label="강원 골든아워 마을 풍경"
      >
        {/* 먼 산 실루엣 */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0"
          style={{
            bottom: '32%',
            height: '28%',
            background: `linear-gradient(180deg, rgba(105, 70, 50, 0.55) 0%, rgba(75, 50, 40, 0.85) 100%)`,
            clipPath:
              'polygon(0 60%, 8% 38%, 18% 50%, 28% 22%, 40% 44%, 52% 18%, 65% 40%, 78% 28%, 90% 48%, 100% 36%, 100% 100%, 0 100%)',
          }}
        />
        {/* 가까운 언덕 + 마을 */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '38%',
            background: `linear-gradient(180deg, #4B6B3A 0%, #2F4827 100%)`,
            clipPath:
              'polygon(0 38%, 12% 26%, 22% 34%, 34% 20%, 46% 30%, 58% 18%, 72% 28%, 84% 22%, 100% 34%, 100% 100%, 0 100%)',
          }}
        />
        {/* 태양 */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            top: '18%',
            right: '14%',
            width: 72,
            height: 72,
            borderRadius: '9999px',
            background:
              'radial-gradient(circle at 35% 35%, #FFE4B5 0%, #FFB347 65%, rgba(255,179,71,0) 100%)',
            filter: 'blur(1px)',
          }}
        />

        {/* 매너온도 칩 (우측 상단) */}
        <div className="absolute right-4 top-4 z-10">
          <span
            role="status"
            aria-label="이번 코스 탄소 절감 4.2킬로그램"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold shadow-sm"
            style={{
              backgroundColor: palette.surface,
              color: palette.primary,
              border: `1px solid ${tone.primarySoft}`,
            }}
          >
            <span aria-hidden="true">🌱</span>
            <span className="tabular-nums">탄소 절감 4.2kg</span>
          </span>
        </div>

        {/* 하단 좌측 스크림 + 헤드라인 */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 px-5 pb-7 pt-12 md:px-8 md:pb-9"
          style={{
            background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${tone.scrim} 70%, rgba(0,0,0,0.7) 100%)`,
          }}
        >
          <div className="max-w-md">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
              style={{
                backgroundColor: 'rgba(255,255,255,0.16)',
                color: palette.surface,
                backdropFilter: 'blur(4px)',
              }}
            >
              <span aria-hidden="true">📍</span>
              강원 이웃 동네
            </span>
            <h1
              id="v06-hero-title"
              className="mt-2 font-semibold tracking-tight text-[28px] leading-[34px] md:text-[40px] md:leading-[46px]"
              style={{ color: palette.surface }}
            >
              오늘은 어디로
              <br />
              가볼까요?
            </h1>
            <p
              className="mt-2 text-[14px] leading-[22px] md:text-[15px]"
              style={{ color: 'rgba(255,255,255,0.88)' }}
            >
              이동수단 하나만 바꿔도{' '}
              <span className="font-semibold tabular-nums">67.6%</span>가
              달라져요. 이웃이 추천하는 코스로 떠나볼까요?
            </p>
          </div>
        </div>
      </div>

      {/* KPI strip — 따뜻한 카드 띠 */}
      <div className="px-5 pt-5 md:px-8">
        <div
          className="grid grid-cols-3 gap-2 rounded-2xl p-3 md:gap-4 md:p-4"
          style={{
            backgroundColor: palette.surface,
            border: `1px solid ${tone.fgLine}`,
            boxShadow: '0 1px 0 rgba(33,33,36,0.04)',
          }}
        >
          <KpiCell
            value="9,556g"
            label="이번 절감"
            color={palette.primary}
          />
          <KpiCell value="0.4그루" label="소나무 환산" color={palette.fg} />
          <KpiCell value="14종" label="공공 API" color={palette.accent} />
        </div>
      </div>

      {/* 모바일 하단 5탭 네비 — 데코 (실제 라우팅 없음) */}
      <nav
        aria-label="모바일 네비게이션 (데모)"
        className="mx-5 mt-4 mb-2 flex items-center justify-between rounded-full px-2 py-2 md:mx-8"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${tone.fgLine}`,
        }}
      >
        {[
          { Icon: Home, label: '홈', active: true },
          { Icon: Search, label: '둘러보기' },
          { Icon: Sprout, label: '내 코스' },
          { Icon: Heart, label: '좋아요' },
          { Icon: UserIcon, label: '이웃' },
        ].map(({ Icon, label, active }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className="flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1 text-[11px] font-medium"
            style={{
              color: active ? palette.primary : palette.muted,
              backgroundColor: active ? tone.primarySoft : 'transparent',
            }}
          >
            <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
            {label}
          </button>
        ))}
      </nav>
    </section>
  );
}

function KpiCell({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-1.5 text-center">
      <span
        className="font-bold tabular-nums text-[20px] leading-none md:text-[24px]"
        style={{ color }}
      >
        {value}
      </span>
      <span
        className="mt-1 text-[11px] font-medium md:text-[12px]"
        style={{ color: palette.muted }}
      >
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 시그니처 1 — 3안 비교 mini (Naver Map V6 thumb-zone, 4:6 사진 + 정보)
// ---------------------------------------------------------------------------
type ModeCard = {
  key: 'car' | 'transit' | 'active';
  icon: typeof Car;
  title: string;
  warmCopy: string;
  co2Kg: string;
  durationLabel: string;
  distanceLabel: string;
  recommended: boolean;
  photoGradient: string; // CSS gradient acting as photo
  photoEmoji: string;
};

const MODE_CARDS: ModeCard[] = [
  {
    key: 'car',
    icon: Car,
    title: '자가용으로 편하게',
    warmCopy: '제일 빠르긴 한데, 탄소가 조금 많아요.',
    co2Kg: '14.1',
    durationLabel: '1시간 7분',
    distanceLabel: '67.3km',
    recommended: false,
    photoGradient: `linear-gradient(135deg, #C7B299 0%, #8A6E54 100%)`,
    photoEmoji: '🛣️',
  },
  {
    key: 'transit',
    icon: Bus,
    title: '고속버스로 떠나는 강원',
    warmCopy: '이웃들이 가장 많이 추천한 코스예요.',
    co2Kg: '4.6',
    durationLabel: '1시간 13분',
    distanceLabel: '67.3km',
    recommended: true,
    photoGradient: `linear-gradient(135deg, #8FB68A 0%, #4B7A4A 100%)`,
    photoEmoji: '🚌',
  },
  {
    key: 'active',
    icon: Bike,
    title: '자전거로 즐기는 동해',
    warmCopy: '바람 맞으며 천천히, 거의 무탄소예요.',
    co2Kg: '0.2',
    durationLabel: '34분',
    distanceLabel: '8.4km',
    recommended: false,
    photoGradient: `linear-gradient(135deg, #FFD89A 0%, #FF7E36 100%)`,
    photoEmoji: '🚲',
  },
];

function CompareSection() {
  return (
    <section
      aria-labelledby="v06-compare-title"
      className="px-5 pt-10 pb-6 md:px-8 md:pt-12"
    >
      <header className="mb-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
          style={{
            backgroundColor: tone.primarySoft,
            color: palette.primary,
          }}
        >
          시그니처 1 · 3안 비교
        </span>
        <h2
          id="v06-compare-title"
          className="mt-3 font-semibold tracking-tight text-[22px] leading-[28px] md:text-[26px]"
          style={{ color: palette.fg }}
        >
          어떻게 떠나시겠어요?
        </h2>
        <p
          className="mt-1 text-[14px] leading-[22px]"
          style={{ color: palette.muted }}
        >
          이웃이 다녀온 코스 그대로, 이동수단만 골라보세요.
        </p>
      </header>

      <ul className="flex flex-col gap-3" role="list">
        {MODE_CARDS.map((c) => (
          <li key={c.key}>
            <CompareCard card={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CompareCard({ card }: { card: ModeCard }) {
  const Icon = card.icon;
  return (
    <article
      aria-label={`${card.title}, CO2 ${card.co2Kg}킬로그램`}
      className="relative flex w-full overflow-hidden rounded-2xl"
      style={{
        backgroundColor: palette.surface,
        border: `1px solid ${tone.fgLine}`,
        boxShadow: '0 1px 0 rgba(33,33,36,0.03)',
      }}
    >
      {/* 추천안: 좌측 8px 그린 라운드 라인 */}
      {card.recommended && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-2 bottom-2 w-[6px] rounded-full"
          style={{ backgroundColor: palette.primary }}
        />
      )}

      {/* 좌측 4 / 우측 6 비율 */}
      <div className="flex w-full">
        {/* 4: 사진 — CSS 그라데이션으로 따뜻한 동네 톤 */}
        <div
          className="relative flex shrink-0 items-end justify-end"
          style={{
            flexBasis: '40%',
            background: card.photoGradient,
            minHeight: 124,
          }}
          role="img"
          aria-label={`${card.title} 일러스트`}
        >
          <span
            aria-hidden="true"
            className="absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-[14px]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.85)',
              color: palette.fg,
            }}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
          </span>
          <span aria-hidden="true" className="m-2 text-[28px] drop-shadow-sm">
            {card.photoEmoji}
          </span>
        </div>

        {/* 6: 정보 */}
        <div className="flex flex-1 flex-col gap-2 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-semibold tracking-tight text-[15px] leading-[20px]"
              style={{ color: palette.fg }}
            >
              {card.title}
            </h3>
            {card.recommended && (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{
                  backgroundColor: tone.primarySoft,
                  color: palette.primary,
                }}
                aria-label="이웃 추천"
              >
                <Star
                  aria-hidden="true"
                  className="h-3 w-3"
                  fill={palette.primary}
                  stroke={palette.primary}
                />
                이웃 추천
              </span>
            )}
          </div>

          <p
            className="text-[13px] leading-[19px]"
            style={{ color: palette.muted }}
          >
            {card.warmCopy}
          </p>

          {/* 매너온도 스타일 mini-chips */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <MiniChip
              emoji="🌱"
              text={`${card.co2Kg}kg`}
              color={card.recommended ? palette.primary : palette.fg}
              bg={card.recommended ? tone.primarySoft : tone.fgSoft}
              srLabel={`이산화탄소 ${card.co2Kg}킬로그램`}
            />
            <MiniChip
              icon={Clock}
              text={card.durationLabel}
              color={palette.muted}
              bg={tone.fgSoft}
            />
            <MiniChip
              icon={MapPin}
              text={card.distanceLabel}
              color={palette.muted}
              bg={tone.fgSoft}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function MiniChip({
  emoji,
  icon: Icon,
  text,
  color,
  bg,
  srLabel,
}: {
  emoji?: string;
  icon?: typeof Clock;
  text: string;
  color: string;
  bg: string;
  srLabel?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium tabular-nums"
      style={{ backgroundColor: bg, color }}
      aria-label={srLabel}
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {Icon && <Icon aria-hidden="true" className="h-3 w-3" />}
      {text}
    </span>
  );
}

// ---------------------------------------------------------------------------
// 시그니처 2 — 인증서 mini (당근 거래 후기 카드 톤)
// ---------------------------------------------------------------------------
function CertSection() {
  return (
    <section
      aria-labelledby="v06-cert-title"
      className="px-5 py-8 md:px-8 md:py-10"
    >
      <header className="mb-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
          style={{
            backgroundColor: tone.accentSoft,
            color: palette.accent,
          }}
        >
          시그니처 2 · 이웃 인증
        </span>
        <h2
          id="v06-cert-title"
          className="mt-3 font-semibold tracking-tight text-[22px] leading-[28px] md:text-[26px]"
          style={{ color: palette.fg }}
        >
          다녀오신 코스를
          <br />
          이웃에게 자랑해볼까요?
        </h2>
      </header>

      <article
        aria-label="강원 이웃 인증서, 절감 4.2킬로그램"
        className="relative overflow-hidden rounded-3xl px-5 py-6 md:px-7 md:py-7"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${tone.fgLine}`,
          boxShadow: '0 4px 14px rgba(33,33,36,0.06)',
        }}
      >
        {/* 상단 친근 일러스트 잎 (inline SVG) */}
        <div className="flex items-center justify-center">
          <span
            aria-hidden="true"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: tone.primarySoft }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21c4-1 8-5 8-11 0-3-1-5-2-6-3 0-7 1-10 4-2 2-3 5-3 8 0 2 1 4 2 5l5-7"
                stroke={palette.primary}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {/* 카피 */}
        <div className="mt-4 text-center">
          <p
            className="text-[12px] font-semibold uppercase tracking-wider"
            style={{ color: palette.accent }}
          >
            Gangwon Neighbor Cert.
          </p>
          <h3
            className="mt-1 font-semibold tracking-tight text-[20px] leading-[26px]"
            style={{ color: palette.fg }}
          >
            강원 이웃 인증
          </h3>
          <p
            className="mt-1 text-[14px] leading-[22px]"
            style={{ color: palette.muted }}
          >
            <span className="font-semibold" style={{ color: palette.fg }}>
              강원도 1박2일 고속버스 코스
            </span>
            를 다녀오셨네요.
          </p>
        </div>

        {/* 큰 칩 두 개 */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <BigCertChip
            emoji="🌱"
            value="4.2kg"
            label="절감"
            color={palette.surface}
            bg={palette.primary}
          />
          <BigCertChip
            icon={Clock}
            value="6시간"
            label="이동"
            color={palette.surface}
            bg={palette.accent}
          />
        </div>

        {/* 환산 한 줄 */}
        <p
          className="mt-3 text-center text-[13px]"
          style={{ color: palette.muted }}
        >
          소나무{' '}
          <span
            className="font-bold tabular-nums"
            style={{ color: palette.fg }}
          >
            0.4그루
          </span>
          가 1년간 흡수하는 양이에요.
        </p>

        {/* 공유 영역 — 카카오 친구 추천 톤 */}
        <div
          className="mt-5 flex flex-col gap-2 rounded-2xl p-3"
          style={{ backgroundColor: palette.bg }}
        >
          <p
            className="px-1 text-[12px] font-medium"
            style={{ color: palette.muted }}
          >
            이웃에게 공유하기
          </p>
          <div className="grid grid-cols-3 gap-2">
            <ShareBtn icon={Download} label="저장" color={palette.fg} />
            <ShareBtn
              icon={MessageCircle}
              label="카카오"
              color={palette.surface}
              bg={palette.primary}
            />
            <ShareBtn icon={Link2} label="링크 복사" color={palette.fg} />
          </div>
        </div>
      </article>
    </section>
  );
}

function BigCertChip({
  emoji,
  icon: Icon,
  value,
  label,
  color,
  bg,
}: {
  emoji?: string;
  icon?: typeof Clock;
  value: string;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3"
      style={{ backgroundColor: bg }}
      aria-label={`${label} ${value}`}
    >
      <span aria-hidden="true" className="text-[18px]">
        {emoji ?? (Icon && <Icon className="h-4 w-4" />)}
      </span>
      <span
        className="font-bold tabular-nums text-[18px] leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span
        className="text-[12px] font-medium"
        style={{ color, opacity: 0.85 }}
      >
        {label}
      </span>
    </div>
  );
}

function ShareBtn({
  icon: Icon,
  label,
  color,
  bg,
}: {
  icon: typeof Download;
  label: string;
  color: string;
  bg?: string;
}) {
  return (
    <button
      type="button"
      aria-label={`${label} (데모)`}
      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold"
      style={{
        backgroundColor: bg ?? palette.surface,
        color,
        border: bg ? 'none' : `1px solid ${tone.fgLine}`,
      }}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// 시그니처 3 — Carbon Scale 4-tier ribbon + Before/After
// ---------------------------------------------------------------------------
const TIERS = [
  { label: '≤2kg', range: '아주 적음', color: '#3FA972' }, // primary 톤
  { label: '≤6kg', range: '괜찮아요', color: palette.primary },
  { label: '≤12kg', range: '조금 많음', color: palette.accent },
  { label: '>12kg', range: '많은 편', color: '#C95B2D' },
] as const;

function CarbonScaleSection() {
  // 4.6kg → tier index 1 (≤6kg)
  const currentTierIdx = 1;
  return (
    <section
      aria-labelledby="v06-scale-title"
      className="px-5 py-8 md:px-8 md:py-10"
    >
      <header className="mb-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
          style={{
            backgroundColor: tone.primarySoft,
            color: palette.primary,
          }}
        >
          시그니처 3 · 탄소 눈금
        </span>
        <h2
          id="v06-scale-title"
          className="mt-3 font-semibold tracking-tight text-[22px] leading-[28px] md:text-[26px]"
          style={{ color: palette.fg }}
        >
          이번 코스, 어디쯤인가요?
        </h2>
        <p
          className="mt-1 text-[14px] leading-[22px]"
          style={{ color: palette.muted }}
        >
          이웃들의 평균과 비교해 보세요.
        </p>
      </header>

      {/* 4-tier ribbon */}
      <div
        role="img"
        aria-label="탄소 배출 4단계 눈금, 현재 코스 ≤6kg 구간"
        className="overflow-hidden rounded-2xl"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${tone.fgLine}`,
        }}
      >
        <div className="grid grid-cols-4">
          {TIERS.map((t, i) => {
            const active = i === currentTierIdx;
            return (
              <div
                key={t.label}
                className="relative px-2 py-3 text-center"
                style={{
                  backgroundColor: active ? t.color : 'transparent',
                  color: active ? palette.surface : palette.muted,
                }}
              >
                <span
                  className="block font-bold tabular-nums text-[13px] leading-tight md:text-[14px]"
                  style={{
                    color: active ? palette.surface : palette.fg,
                  }}
                >
                  {t.label}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium md:text-[12px]">
                  {t.range}
                </span>
                {active && (
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.22)',
                      color: palette.surface,
                    }}
                  >
                    여기에요
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {/* 색 스트라이프 base */}
        <div className="flex h-1.5 w-full">
          {TIERS.map((t) => (
            <span
              key={t.label}
              aria-hidden="true"
              className="flex-1"
              style={{ backgroundColor: t.color, opacity: 0.7 }}
            />
          ))}
        </div>
      </div>

      {/* Before / After — hero numeric (5rem class) */}
      <div
        className="mt-4 grid grid-cols-1 gap-3 rounded-2xl p-5 md:grid-cols-2 md:p-6"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${tone.fgLine}`,
        }}
      >
        <div className="flex flex-col items-start">
          <span
            className="text-[12px] font-semibold uppercase tracking-wider"
            style={{ color: palette.muted }}
          >
            Before · 자가용
          </span>
          <span
            className="font-bold tabular-nums text-[40px] leading-none line-through md:text-[48px]"
            style={{ color: palette.muted }}
            aria-label="기존 14.1킬로그램"
          >
            14.1
            <span className="ml-1 text-[18px] font-semibold no-underline">
              kg
            </span>
          </span>
        </div>
        <div className="flex flex-col items-start">
          <span
            className="text-[12px] font-semibold uppercase tracking-wider"
            style={{ color: palette.primary }}
          >
            After · 고속버스
          </span>
          <span
            className="font-semibold tracking-tight font-bold tabular-nums leading-none"
            style={{
              color: palette.primary,
              fontSize: '5rem', // hero_size_rem: 5
              letterSpacing: '-0.02em',
            }}
            aria-label="최적화 후 4.6킬로그램"
          >
            4.6
            <span className="ml-1 align-top text-[18px] font-semibold">kg</span>
          </span>
          <span
            className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums"
            style={{
              backgroundColor: tone.primarySoft,
              color: palette.primary,
            }}
          >
            🌱 −9.6kg · 68% 절감
          </span>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function VariantFooter() {
  return (
    <footer
      className="px-5 pb-10 pt-4 md:px-8"
      style={{ color: palette.muted }}
    >
      <Link
        href="/v"
        aria-label="v 카탈로그로 돌아가기"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold"
        style={{
          backgroundColor: palette.surface,
          color: palette.fg,
          border: `1px solid ${tone.fgLine}`,
        }}
      >
        <ChevronRight
          aria-hidden="true"
          className="h-4 w-4 rotate-180"
        />
        /v 카탈로그로 돌아가기
      </Link>
      <p className="mt-3 text-[11px]" style={{ color: palette.muted }}>
        v06 · 당근 따뜻 (daangn-warm-civic) — Daangn Seed × Kakao Bank × Naver
        Map V6 영감
      </p>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function V06Page() {
  return (
    <main
      className="min-h-screen font-normal text-[16px] leading-[26px]"
      style={{ backgroundColor: palette.bg, color: palette.fg }}
    >
      {/* 모바일 우선 컨테이너 — md+에서 max-w 적용 */}
      <div className="mx-auto w-full max-w-[560px]">
        <Hero />
        <CompareSection />
        <CertSection />
        <CarbonScaleSection />
        <VariantFooter />
      </div>
    </main>
  );
}
