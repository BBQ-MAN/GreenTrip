// v01 — "토스 그린" (toss-quiet-green)
// 98% 화이트 캔버스 위에 거대한 탭률러 숫자 하나로 모든 것을 말하는 토스풍 정렬.
// Server Component. 인터랙티브 요소는 모두 데코(role/aria만).
// 모든 색상은 인라인 style로만 지정 (tailwind.config 영향 회피).
import Link from 'next/link';
import { ArrowLeft, Download, MessageCircle, Link2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '토스 그린 — GreenTrip 디자인 변주',
  description:
    'v01 토스 그린 (toss-quiet-green) — 98% 화이트 캔버스 위 거대한 탭률러 숫자 하나로 모든 것을 말하는 핀테크 정렬 변주.',
};

// 변주 팔레트 (반드시 inline style로 소비) ------------------------------------
const P = {
  bg: '#FFFFFF',
  fg: '#202632',
  primary: '#097A50',
  accent: '#0064FF',
  muted: '#8B8C95',
  surface: '#F2F4F6',
  hairline: '#E5E7EB',
} as const;

// 3안 mock — 랜딩 MOCK_RESULT와 동일 데이터 소스(kg 단위로 표현) ---------------
const OPTIONS = [
  {
    key: 'car',
    label: '자가용',
    sub: 'KTX 없이, 문 앞부터',
    kg: 14.1,
    recommended: false,
  },
  {
    key: 'transit',
    label: '버스 + 자전거',
    sub: '고속버스 + 현지 자전거',
    kg: 4.6,
    recommended: true,
  },
  {
    key: 'active',
    label: '도보 + 자전거',
    sub: '단거리 액티브',
    kg: 0.2,
    recommended: false,
  },
] as const;

// ---------------------------------------------------------------------------
// Hero — 왼쪽 정렬 한 줄 동사형 헤드라인 + 단일 시각 앵커 67.6%
// ---------------------------------------------------------------------------
function Hero() {
  return (
    <section
      aria-labelledby="v01-hero"
      style={{ backgroundColor: P.bg, color: P.fg }}
      className="px-5 pt-10 pb-12 md:px-12 md:pt-20 md:pb-24"
    >
      <div className="mx-auto max-w-5xl">
        {/* 브랜드 마크 — 토스풍, 작고 조용히 */}
        <div className="mb-10 flex items-center gap-2 md:mb-14">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: P.primary }}
          />
          <span
            className="text-[13px] font-semibold tracking-tight tabular-nums"
            style={{ color: P.fg }}
          >
            GreenTrip
          </span>
          <span
            className="text-[12px] font-medium"
            style={{ color: P.muted }}
          >
            · v01 toss-quiet-green
          </span>
        </div>

        {/* 한 줄 동사형 헤드라인 — 5% 표면적 */}
        <h1
          id="v01-hero"
          className="font-bold tracking-tight text-[18px] leading-[26px] md:text-[20px] md:leading-[28px]"
          style={{ color: P.fg }}
        >
          서울에서 속초까지,{' '}
          <span style={{ color: P.primary }}>68% 줄였어요</span>
        </h1>

        {/* 단일 시각 앵커 — 96px Pretendard SemiBold, tabular, -2% tracking */}
        <div className="mt-10 flex items-baseline gap-3 md:mt-14">
          <span
            className="font-semibold tabular-nums"
            style={{
              color: P.fg,
              fontSize: '6rem',
              lineHeight: '0.95',
              letterSpacing: '-0.02em',
            }}
            aria-label="이산화탄소 67.6 퍼센트 절감"
          >
            67.6
          </span>
          <span
            className="font-semibold tabular-nums"
            style={{
              color: P.fg,
              fontSize: '2.5rem',
              lineHeight: '1',
              letterSpacing: '-0.02em',
            }}
            aria-hidden="true"
          >
            %
          </span>
        </div>
        <div
          className="mt-2 text-[16px] leading-[24px] font-normal"
          style={{ color: P.muted, opacity: 0.85 }}
        >
          kg CO₂ 기준 · 자가용 대비
        </div>

        {/* KPI strip — 영수증 라인 3종 */}
        <dl
          className="mt-10 grid grid-cols-3 gap-0 overflow-hidden rounded-2xl md:mt-14"
          style={{ backgroundColor: P.surface }}
        >
          {[
            { dt: '절감', dd: '9,556', unit: 'g' },
            { dt: '소나무 환산', dd: '0.4', unit: '그루' },
            { dt: '활용 API', dd: '14', unit: '종' },
          ].map((row, i) => (
            <div
              key={row.dt}
              className="flex flex-col gap-1 px-4 py-5 md:px-6 md:py-6"
              style={
                i > 0
                  ? { borderLeft: `1px solid ${P.hairline}` }
                  : undefined
              }
            >
              <dt
                className="text-[12px] font-medium"
                style={{ color: P.muted }}
              >
                {row.dt}
              </dt>
              <dd
                className="font-semibold tabular-nums"
                style={{
                  color: P.fg,
                  fontSize: '1.5rem',
                  lineHeight: '1.1',
                  letterSpacing: '-0.02em',
                }}
              >
                {row.dd}
                <span
                  className="ml-1 text-[13px] font-medium"
                  style={{ color: P.muted }}
                >
                  {row.unit}
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
// 시그니처 1 — 영수증 스택 3안 비교
// 모바일: 세로 스택, 1px hairline 구분선. 추천안에만 2px 좌측 스트립.
// ---------------------------------------------------------------------------
function CompareReceipt() {
  return (
    <section
      aria-labelledby="v01-compare"
      style={{ backgroundColor: P.bg }}
      className="px-5 py-12 md:px-12 md:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-baseline justify-between">
          <h2
            id="v01-compare"
            className="font-bold tracking-tight text-[18px] leading-[26px]"
            style={{ color: P.fg }}
          >
            이동수단별 배출량
          </h2>
          <span
            className="text-[12px] font-medium"
            style={{ color: P.muted }}
          >
            강원 코스 · 67.3km
          </span>
        </div>

        {/* 영수증 카드 — 모바일 스택, md+ 3-up 그리드 */}
        <ul
          className="flex flex-col overflow-hidden rounded-2xl md:grid md:grid-cols-3 md:gap-0"
          style={{
            backgroundColor: P.bg,
            border: `1px solid ${P.hairline}`,
          }}
          role="list"
        >
          {OPTIONS.map((opt, i) => {
            const isRec = opt.recommended;
            // 모바일: 위/아래 카드 사이 hairline / 데스크탑: 좌우 hairline
            const mobileDivider =
              i > 0 ? `1px solid ${P.hairline}` : undefined;
            return (
              <li
                key={opt.key}
                aria-label={`${opt.label} 코스 ${opt.kg}kg`}
                className="relative flex items-center justify-between gap-4 px-5 py-5 md:flex-col md:items-start md:py-7"
                style={{
                  borderTop: mobileDivider,
                  // 데스크탑 좌우 구분선은 같은 hairline로 대체 (mobile에서는 무시)
                }}
              >
                {/* 추천 좌측 2px 세로 스트립 */}
                {isRec ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 h-full"
                    style={{
                      width: '2px',
                      backgroundColor: P.primary,
                    }}
                  />
                ) : null}

                {/* 좌측 라벨 */}
                <div className="flex flex-col">
                  <span
                    className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"
                    style={{ color: P.fg }}
                  >
                    {opt.label}
                    {isRec ? (
                      <span
                        role="img"
                        aria-label="추천"
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                        style={{
                          backgroundColor: P.primary,
                          color: '#FFFFFF',
                        }}
                      >
                        ⭐ 추천
                      </span>
                    ) : null}
                  </span>
                  <span
                    className="mt-0.5 text-[13px] font-normal"
                    style={{ color: P.muted }}
                  >
                    {opt.sub}
                  </span>
                </div>

                {/* 우측 탭률러 숫자 — 소수점 위치 정렬 */}
                <div className="flex items-baseline gap-1">
                  <span
                    className="font-semibold tabular-nums"
                    style={{
                      color: isRec ? P.primary : P.fg,
                      fontSize: '2rem',
                      lineHeight: '1',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {opt.kg.toFixed(1)}
                  </span>
                  <span
                    className="text-[13px] font-medium tabular-nums"
                    style={{ color: P.muted }}
                  >
                    kg
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <p
          className="mt-4 text-[13px] font-normal tabular-nums"
          style={{ color: P.muted }}
        >
          자가용 14.1kg → 버스+자전거 4.6kg · 9.6kg 절감
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 시그니처 2 — 인증서 mini (플랫 화이트 카드, 그라데이션 없음)
// ---------------------------------------------------------------------------
function CertMini() {
  return (
    <section
      aria-labelledby="v01-cert"
      style={{ backgroundColor: P.surface }}
      className="px-5 py-12 md:px-12 md:py-20"
    >
      <div className="mx-auto max-w-md">
        <h2
          id="v01-cert"
          className="mb-6 font-bold tracking-tight text-[18px] leading-[26px]"
          style={{ color: P.fg }}
        >
          인증서
        </h2>

        <article
          aria-label="강원도 1박2일 고속버스 코스 인증서, 9.6kg 절감"
          className="rounded-2xl px-6 py-8 md:px-8 md:py-10"
          style={{
            backgroundColor: P.bg,
            border: `1px solid ${P.hairline}`,
          }}
        >
          {/* 거대 인증 번호 */}
          <div className="flex flex-col items-center text-center">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: P.muted }}
            >
              Cert No.
            </span>
            <span
              className="mt-1 font-semibold tabular-nums"
              style={{
                color: P.fg,
                fontSize: '2.25rem',
                lineHeight: '1.05',
                letterSpacing: '-0.02em',
              }}
            >
              0000-0001-0410
            </span>
          </div>

          {/* hairline 구분선 */}
          <div
            className="my-6 h-px w-full"
            style={{ backgroundColor: P.hairline }}
            aria-hidden="true"
          />

          {/* 코스명 + 수치 */}
          <div className="flex flex-col gap-3 text-left">
            <div>
              <div
                className="text-[12px] font-medium"
                style={{ color: P.muted }}
              >
                코스
              </div>
              <div
                className="mt-0.5 text-[15px] font-semibold tracking-tight"
                style={{ color: P.fg }}
              >
                강원도 1박2일 · 고속버스
              </div>
            </div>

            <dl className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <dt
                  className="text-[12px] font-medium"
                  style={{ color: P.muted }}
                >
                  절감
                </dt>
                <dd
                  className="font-semibold tabular-nums"
                  style={{
                    color: P.primary,
                    fontSize: '1.5rem',
                    lineHeight: '1.1',
                    letterSpacing: '-0.02em',
                  }}
                >
                  −9.6
                  <span
                    className="ml-1 text-[13px] font-medium"
                    style={{ color: P.muted }}
                  >
                    kg
                  </span>
                </dd>
              </div>
              <div>
                <dt
                  className="text-[12px] font-medium"
                  style={{ color: P.muted }}
                >
                  소나무
                </dt>
                <dd
                  className="font-semibold tabular-nums"
                  style={{
                    color: P.fg,
                    fontSize: '1.5rem',
                    lineHeight: '1.1',
                    letterSpacing: '-0.02em',
                  }}
                >
                  0.4
                  <span
                    className="ml-1 text-[13px] font-medium"
                    style={{ color: P.muted }}
                  >
                    그루
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* 발급일·해시 (작게) */}
          <div
            className="mt-6 flex items-center justify-between text-[11px] font-medium tabular-nums"
            style={{ color: P.muted }}
          >
            <span>발급 2026.06.16</span>
            <span>#a3f9c2…0410</span>
          </div>
        </article>

        {/* 공유 행 — 56px 풀폭 sticky 시트 풍 (정적 데모) */}
        <div className="mt-5">
          <button
            type="button"
            aria-label="카카오톡으로 공유"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold tracking-tight"
            style={{
              backgroundColor: P.primary,
              color: '#FFFFFF',
            }}
          >
            <MessageCircle aria-hidden="true" className="h-5 w-5" />
            카카오톡 공유
          </button>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-label="이미지 내려받기"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold tracking-tight"
              style={{
                backgroundColor: P.bg,
                color: P.fg,
                border: `1px solid ${P.hairline}`,
              }}
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              내려받기
            </button>
            <button
              type="button"
              aria-label="링크 복사"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold tracking-tight"
              style={{
                backgroundColor: P.bg,
                color: P.fg,
                border: `1px solid ${P.hairline}`,
              }}
            >
              <Link2 aria-hidden="true" className="h-4 w-4" />
              링크 복사
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 시그니처 3 — Carbon Scale (4-tier ribbon) + Before/After
// ---------------------------------------------------------------------------
function CarbonScale() {
  // 4 tiers: ≤2 / ≤6 / ≤12 / >12kg
  // optimized 4.6 → tier index 1 (≤6kg)
  const tiers = [
    { label: '≤ 2', range: '아주 좋음', active: false },
    { label: '≤ 6', range: '좋음', active: true },
    { label: '≤ 12', range: '보통', active: false },
    { label: '> 12', range: '높음', active: false },
  ];

  return (
    <section
      aria-labelledby="v01-scale"
      style={{ backgroundColor: P.bg }}
      className="px-5 py-12 md:px-12 md:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="v01-scale"
          className="mb-8 font-bold tracking-tight text-[18px] leading-[26px]"
          style={{ color: P.fg }}
        >
          탄소 등급
        </h2>

        {/* 4-tier ribbon */}
        <div
          role="img"
          aria-label="탄소 4등급 스케일, 현재 코스는 좋음 등급 (≤6kg)"
          className="grid grid-cols-4 overflow-hidden rounded-2xl"
          style={{ border: `1px solid ${P.hairline}` }}
        >
          {tiers.map((t, i) => (
            <div
              key={t.label}
              className="flex flex-col items-center justify-center px-2 py-5"
              style={{
                backgroundColor: t.active ? P.primary : P.bg,
                color: t.active ? '#FFFFFF' : P.fg,
                borderLeft: i > 0 ? `1px solid ${P.hairline}` : undefined,
              }}
            >
              <span
                className="font-semibold tabular-nums"
                style={{
                  fontSize: '1.25rem',
                  lineHeight: '1.1',
                  letterSpacing: '-0.02em',
                }}
              >
                {t.label}
              </span>
              <span
                className="mt-1 text-[11px] font-medium"
                style={{
                  color: t.active ? '#FFFFFF' : P.muted,
                  opacity: t.active ? 0.95 : 1,
                }}
              >
                {t.range}
              </span>
            </div>
          ))}
        </div>
        <p
          className="mt-3 text-[12px] font-medium tabular-nums"
          style={{ color: P.muted }}
        >
          단위: kg CO₂ · 강원 코스 기준 4.6 → 좋음
        </p>

        {/* Before / After */}
        <div
          className="mt-10 flex flex-col gap-2 rounded-2xl px-6 py-7 md:flex-row md:items-end md:justify-between md:px-10"
          style={{ backgroundColor: P.surface }}
        >
          {/* Before */}
          <div className="flex flex-col">
            <span
              className="text-[12px] font-medium"
              style={{ color: P.muted }}
            >
              자가용 기준
            </span>
            <span
              className="font-semibold tabular-nums"
              style={{
                color: P.muted,
                fontSize: '2rem',
                lineHeight: '1.05',
                letterSpacing: '-0.02em',
                textDecoration: 'line-through',
                textDecorationThickness: '2px',
              }}
            >
              14.1<span className="ml-1 text-[14px]">kg</span>
            </span>
          </div>

          {/* Arrow */}
          <span
            aria-hidden="true"
            className="text-[18px] font-semibold tabular-nums md:px-4"
            style={{ color: P.muted }}
          >
            →
          </span>

          {/* After — hero numeric */}
          <div className="flex flex-col md:items-end">
            <span
              className="text-[12px] font-semibold"
              style={{ color: P.primary }}
            >
              최적화 후
            </span>
            <span
              className="font-semibold tabular-nums"
              style={{
                color: P.primary,
                fontSize: '6rem',
                lineHeight: '0.95',
                letterSpacing: '-0.02em',
              }}
              aria-label="최적화 4.6 kg"
            >
              4.6
              <span
                className="ml-1 text-[1.5rem] font-semibold"
                style={{ color: P.primary }}
              >
                kg
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Footer — /v 카탈로그 복귀
// ---------------------------------------------------------------------------
function FooterBack() {
  return (
    <footer
      style={{
        backgroundColor: P.bg,
        borderTop: `1px solid ${P.hairline}`,
      }}
      className="px-5 py-8 md:px-12"
    >
      <div className="mx-auto max-w-5xl">
        <Link
          href="/v"
          aria-label="v 카탈로그로 돌아가기"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-tight"
          style={{ color: P.accent }}
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          /v 카탈로그로 돌아가기
        </Link>
        <p
          className="mt-3 text-[11px] font-medium tabular-nums"
          style={{ color: P.muted }}
        >
          v01 · toss-quiet-green · GreenTrip 디자인 변주
        </p>
      </div>
    </footer>
  );
}

export default function V01Page() {
  return (
    <main style={{ backgroundColor: P.bg, color: P.fg }}>
      <Hero />
      <div
        className="h-px w-full"
        style={{ backgroundColor: P.hairline }}
        aria-hidden="true"
      />
      <CompareReceipt />
      <CertMini />
      <CarbonScale />
      <FooterBack />
    </main>
  );
}
