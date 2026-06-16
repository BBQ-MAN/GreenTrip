// /v/v09 — "에온 슬로우 에세이" (aeon-slow-serif-essay)
// 단일 60ch 세리프 칼럼. 데이터는 본문 메타로. NYT Cooking / Aeon / Kinfolk / MUBI Notebook 톤.
// Server Component. 색은 전부 inline style. tailwind는 spacing/layout/typography sizing만.
import Link from 'next/link';
import { Download, Link2, MessageCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'V09 · 에온 슬로우 에세이 — GreenTrip',
  description:
    '에온 슬로우 에세이(aeon-slow-serif-essay) 변형. 따뜻한 종이 위 디스플레이 세리프 드롭캡과 단일 60ch 칼럼, 데이터는 조용한 본문 메타로.',
};

// ---------------------------------------------------------------------------
// 팔레트 — 변형 사양(JSON) 그대로
// ---------------------------------------------------------------------------
const C = {
  bg: '#FBF8F2',
  fg: '#1F1B16',
  primary: '#3E5C3A',
  accent: '#8E2A12',
  muted: '#7A6E5C',
  surface: '#F2EDE2',
} as const;

// 본문 폭: 60ch 매거진 칼럼. 60ch는 ≈ 640px 근방.
const COLUMN_MAX = '38rem'; // 약 608px — 60ch 근접, 모바일 375px 이하에선 패딩으로 양보

export default function V09Page() {
  return (
    <main
      style={{ backgroundColor: C.bg, color: C.fg }}
      className="min-h-screen"
    >
      {/* ───────────────────────────────────────────────────────────────────
          HERO — 단일 칼럼, mono caps eyebrow + 64px 세리프 헤드라인
         ──────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="v09-hero"
        className="px-6 pt-16 pb-12 md:pt-24 md:pb-16"
      >
        <div style={{ maxWidth: COLUMN_MAX }} className="mx-auto">
          {/* eyebrow */}
          <p
            className="mb-8 font-mono uppercase"
            style={{
              color: C.muted,
              fontSize: '11px',
              letterSpacing: '0.06em',
            }}
          >
            에세이 · 저탄소 여행 · No. 09
          </p>

          {/* hero title — display serif */}
          <h1
            id="v09-hero"
            className="font-serif font-normal tracking-tight"
            style={{
              color: C.fg,
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            A Quieter Way to&nbsp;Travel&nbsp;Korea.
          </h1>

          <p
            className="mt-6 font-serif italic"
            style={{
              color: C.muted,
              fontSize: '20px',
              lineHeight: '32px',
            }}
          >
            이동수단 하나가, 무엇을 바꾸는가에 관하여.
          </p>

          {/* grounded 16:9 — 풀블리드 아닌 작은 placeholder. CSS 그라데이션으로 종이 위 풍경. */}
          <figure className="mt-10" aria-hidden="true">
            <div
              className="overflow-hidden rounded-[2px]"
              style={{
                aspectRatio: '16 / 9',
                backgroundColor: C.surface,
                backgroundImage: `linear-gradient(180deg, ${C.surface} 0%, ${C.surface} 55%, ${C.primary}22 100%), radial-gradient(circle at 70% 30%, ${C.accent}33 0%, transparent 45%)`,
                boxShadow: `inset 0 0 0 1px ${C.fg}10`,
              }}
            />
            <figcaption
              className="mt-3 font-serif italic"
              style={{ color: C.muted, fontSize: '13px', lineHeight: '20px' }}
            >
              사진 — 강원, 2026년 5월. 고속버스 차창 너머의 아침.
            </figcaption>
          </figure>

          {/* KPI strip — quiet meta row, mono caps */}
          <dl
            className="mt-10 grid grid-cols-3 gap-4 border-y py-5"
            style={{ borderColor: `${C.fg}1F` }}
          >
            {[
              { k: '절감', v: '9,556 g' },
              { k: '나무', v: '0.4 그루' },
              { k: 'API', v: '14 종' },
            ].map((row) => (
              <div key={row.k}>
                <dt
                  className="font-mono uppercase"
                  style={{
                    color: C.muted,
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                  }}
                >
                  {row.k}
                </dt>
                <dd
                  className="mt-1 font-serif tabular-nums"
                  style={{
                    color: C.fg,
                    fontSize: '22px',
                    lineHeight: '28px',
                  }}
                >
                  {row.v}
                </dd>
              </div>
            ))}
          </dl>

          {/* essay opener — drop cap */}
          <p
            className="mt-10 font-serif"
            style={{
              color: C.fg,
              fontSize: '19px',
              lineHeight: '32px',
            }}
          >
            <span
              aria-hidden="true"
              className="font-serif"
              style={{
                float: 'left',
                fontSize: '80px',
                lineHeight: '64px',
                paddingRight: '12px',
                paddingTop: '6px',
                color: C.accent,
                fontWeight: 400,
                letterSpacing: '-0.04em',
              }}
            >
              O
            </span>
            ne morning in May, on a slow bus winding up the eastern coast,
            나는 한 가지 단순한 사실을 깨달았다 — 같은 여행지에 가닿더라도, 우리가
            선택한 이동수단 하나가 풍경의 호흡과 우리가 남기는 흔적을 거의 전부
            바꿔놓는다는 것을. 강원의 한 코스, 67.3km. 자가용으로는 한 시간이
            조금 넘는다. 고속버스로는 십 분 남짓 더 길고, 자전거와 도보로는
            대부분을 걷는다. 거리란 같은 숫자지만, 거기 담긴 시간의 결은 셋이
            서로 다르다.
          </p>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          시그니처 1 — 3안 비교: 본문 흐름 속 세 단락 + quiet meta line
         ──────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="v09-compare"
        className="px-6 pb-12 md:pb-16"
      >
        <div style={{ maxWidth: COLUMN_MAX }} className="mx-auto">
          <h2
            id="v09-compare"
            className="font-mono uppercase"
            style={{
              color: C.muted,
              fontSize: '11px',
              letterSpacing: '0.08em',
            }}
          >
            I. 세 가지 길
          </h2>

          {/* 단락 1 — 자가용 */}
          <article className="mt-6">
            <p
              className="font-serif"
              style={{ color: C.fg, fontSize: '19px', lineHeight: '32px' }}
            >
              <span
                className="font-serif italic"
                style={{ color: C.accent }}
              >
                자가용.
              </span>{' '}
              가장 익숙한 선택. 문 앞에서 출발해 문 앞으로 닿는다. 차창은 아주
              많은 것을 보여주지만, 어떤 풍경은 너무 빨라 보이지 않는다. 도로는
              일직선이고, 우리는 그 일직선을 빠르게 가로지른다. 가장 짧은 시간
              안에 가장 많은 탄소를 함께 데려가는 길이다.
            </p>
            <p
              className="mt-3 font-serif italic tabular-nums"
              style={{
                color: C.muted,
                fontSize: '14px',
                lineHeight: '22px',
                borderLeft: `2px solid ${C.accent}`,
                paddingLeft: '12px',
              }}
            >
              14.1 kg CO₂ · 1h 07m · 67.3 km · ₩6,730
            </p>
          </article>

          {/* 단락 2 — 대중교통 (추천) */}
          <article className="mt-10">
            <p
              className="font-serif"
              style={{ color: C.fg, fontSize: '19px', lineHeight: '32px' }}
            >
              <span
                className="font-serif italic"
                style={{ color: C.primary }}
              >
                대중교통.
              </span>{' '}
              조금 더 오래 걸리지만, 그 ‘조금 더’ 안에 다른 종류의 시간이
              들어찬다. 책 한 챕터, 차 한 잔, 창밖으로 흘러가는 동해의 첫 빛.
              자가용 대비{' '}
              <span
                className="font-serif italic"
                style={{ color: C.primary }}
              >
                약 67.6%
              </span>
              의 탄소를 덜어내고도, 우리는 같은 곳에 닿는다. 이 페이지가 ⭐
              표시로 조용히 권하는 길.
            </p>
            <p
              className="mt-3 font-serif italic tabular-nums"
              style={{
                color: C.muted,
                fontSize: '14px',
                lineHeight: '22px',
                borderLeft: `2px solid ${C.primary}`,
                paddingLeft: '12px',
              }}
            >
              ⭐ 4.6 kg CO₂ · 1h 13m · 67.3 km · ₩4,038
            </p>
          </article>

          {/* 단락 3 — 자전거+도보 */}
          <article className="mt-10">
            <p
              className="font-serif"
              style={{ color: C.fg, fontSize: '19px', lineHeight: '32px' }}
            >
              <span
                className="font-serif italic"
                style={{ color: C.primary }}
              >
                자전거와 도보.
              </span>{' '}
              가장 느린 길은 종종 가장 가까운 길이다. 8.4km 남짓을 두 다리와
              두 바퀴로. 우리가 데려가는 탄소는 거의 0에 가깝고, 대신 우리는
              아주 많은 것을 더 가져온다 — 바람의 방향, 흙의 냄새, 사람들의 인사.
            </p>
            <p
              className="mt-3 font-serif italic tabular-nums"
              style={{
                color: C.muted,
                fontSize: '14px',
                lineHeight: '22px',
                borderLeft: `2px solid ${C.primary}`,
                paddingLeft: '12px',
              }}
            >
              0.2 kg CO₂ · 34m · 8.4 km · 무료
            </p>
          </article>

          {/* pull quote — 한 번, 중앙 */}
          <blockquote
            className="my-14 text-center"
            role="note"
            aria-label="강조 인용"
          >
            <p
              className="font-serif italic"
              style={{
                color: C.fg,
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontSize: '16px',
                  color: C.accent,
                  verticalAlign: '0.4em',
                  marginRight: '6px',
                }}
              >
                ‟
              </span>
              67.6% 줄였습니다
              <span
                aria-hidden="true"
                style={{
                  fontSize: '16px',
                  color: C.accent,
                  verticalAlign: '0.4em',
                  marginLeft: '6px',
                }}
              >
                ”
              </span>
            </p>
            <cite
              className="mt-3 block font-mono uppercase not-italic"
              style={{
                color: C.muted,
                fontSize: '10px',
                letterSpacing: '0.1em',
              }}
            >
              — 한 여행자의 메모, 강원, 5월
            </cite>
          </blockquote>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          시그니처 3 — Carbon Scale + Before/After (II. 척도)
          섹션 순서를 매거진 흐름에 맞춰 인증서보다 먼저 — 데이터를 본문 안에 둠
         ──────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="v09-scale"
        className="px-6 pb-12 md:pb-16"
        style={{
          borderTop: `1px solid ${C.fg}1F`,
          borderBottom: `1px solid ${C.fg}1F`,
          backgroundColor: C.bg,
        }}
      >
        <div style={{ maxWidth: COLUMN_MAX }} className="mx-auto py-12 md:py-16">
          <h2
            id="v09-scale"
            className="font-mono uppercase"
            style={{
              color: C.muted,
              fontSize: '11px',
              letterSpacing: '0.08em',
            }}
          >
            II. 척도 — 어디쯤 도착했는가
          </h2>

          {/* Before / After 본문 메타 */}
          <p
            className="mt-6 font-serif"
            style={{ color: C.fg, fontSize: '19px', lineHeight: '32px' }}
          >
            이 코스는 자가용 기준 출발선에서{' '}
            <span
              className="font-serif tabular-nums"
              style={{
                color: C.muted,
                textDecoration: 'line-through',
                textDecorationColor: `${C.accent}80`,
              }}
            >
              14.1&nbsp;kg
            </span>
            을 짊어지고 출발했다. 우리는 그것을 내려놓는 대신 골라 든다 — 같은
            거리, 다른 무게. 도착선에서 우리가 들고 있는 무게는 다음과 같다.
          </p>

          {/* 거대한 hero numeric — 변형의 hero_size_rem 4 */}
          <p
            className="mt-10 font-serif tabular-nums"
            style={{
              color: C.primary,
              fontSize: 'clamp(3rem, 12vw, 4rem)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
            aria-label="최적화 후 4.6kg"
          >
            4.6&nbsp;kg
          </p>
          <p
            className="mt-2 font-mono uppercase"
            style={{
              color: C.muted,
              fontSize: '11px',
              letterSpacing: '0.08em',
            }}
          >
            after / optimized
          </p>

          {/* 4-tier ribbon */}
          <div className="mt-10" aria-label="탄소 배출 4단계 척도">
            <div
              className="grid grid-cols-4 overflow-hidden rounded-[2px]"
              style={{
                border: `1px solid ${C.fg}1F`,
              }}
            >
              {[
                {
                  label: '≤ 2',
                  tone: C.primary,
                  active: false,
                },
                {
                  label: '≤ 6',
                  tone: C.primary,
                  active: true, // 4.6kg 는 여기
                },
                {
                  label: '≤ 12',
                  tone: C.muted,
                  active: false,
                },
                {
                  label: '> 12',
                  tone: C.accent,
                  active: false,
                },
              ].map((tier, i) => (
                <div
                  key={tier.label}
                  className="px-3 py-4 text-center"
                  style={{
                    backgroundColor: tier.active ? tier.tone : 'transparent',
                    color: tier.active ? C.bg : tier.tone,
                    borderLeft:
                      i === 0 ? 'none' : `1px solid ${C.fg}1F`,
                  }}
                >
                  <div
                    className="font-serif tabular-nums"
                    style={{
                      fontSize: '18px',
                      lineHeight: '24px',
                    }}
                  >
                    {tier.label}
                  </div>
                  <div
                    className="mt-1 font-mono uppercase"
                    style={{
                      fontSize: '9px',
                      letterSpacing: '0.08em',
                      opacity: tier.active ? 0.85 : 0.7,
                    }}
                  >
                    kg
                  </div>
                </div>
              ))}
            </div>
            <p
              className="mt-3 font-serif italic"
              style={{
                color: C.muted,
                fontSize: '14px',
                lineHeight: '22px',
              }}
            >
              — 이 여행은 두 번째 칸에 도착했다. 더 멀리도, 덜 멀리도 갈 수 있다.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          시그니처 2 — 인증서: MUBI 크레딧 스트립
         ──────────────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="v09-cert"
        className="px-6 py-16 md:py-20"
      >
        <div style={{ maxWidth: COLUMN_MAX }} className="mx-auto">
          <h2
            id="v09-cert"
            className="font-mono uppercase text-center"
            style={{
              color: C.muted,
              fontSize: '11px',
              letterSpacing: '0.08em',
            }}
          >
            III. 인증
          </h2>

          {/* 단일 칼럼 cert */}
          <div
            className="mt-6 px-2 py-12 text-center md:py-16"
            style={{
              borderTop: `1px solid ${C.fg}33`,
              borderBottom: `1px solid ${C.fg}33`,
              backgroundColor: C.bg,
            }}
          >
            <p
              className="font-serif italic"
              style={{
                color: C.fg,
                fontSize: 'clamp(2rem, 7vw, 3rem)',
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}
            >
              Certified&nbsp;Quietly
            </p>

            {/* wood-cut leaf — inline SVG */}
            <div
              className="mx-auto mt-6 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 48 C 18 28, 30 14, 48 8 C 44 24, 32 38, 8 48 Z"
                  stroke={C.primary}
                  strokeWidth="1.4"
                  fill={`${C.primary}14`}
                  strokeLinejoin="round"
                />
                <path
                  d="M8 48 C 20 38, 30 26, 44 14"
                  stroke={C.primary}
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <path
                  d="M14 42 L 24 38 M 20 36 L 28 30 M 26 30 L 34 24"
                  stroke={C.primary}
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  opacity="0.75"
                />
              </svg>
            </div>

            <p
              className="mx-auto mt-6 font-serif"
              style={{
                color: C.fg,
                fontSize: '17px',
                lineHeight: '28px',
                maxWidth: '30rem',
              }}
            >
              강원도 1박2일 고속버스 코스. 자가용 대비{' '}
              <span
                className="font-serif tabular-nums italic"
                style={{ color: C.primary }}
              >
                −9.6 kg
              </span>
              {', 약 '}
              <span
                className="font-serif tabular-nums italic"
                style={{ color: C.primary }}
              >
                0.4그루
              </span>
              의 나무에 해당하는 무게를 내려놓았습니다.
            </p>

            {/* mono caps 메타 스트립 */}
            <dl
              className="mt-10 flex flex-wrap items-baseline justify-center gap-x-6 gap-y-3 font-mono uppercase"
              style={{
                fontSize: '10px',
                letterSpacing: '0.12em',
                color: C.muted,
              }}
            >
              {[
                { k: 'ROUTE', v: 'GW-EXP-01' },
                { k: 'DATE', v: '2026 · 06 · 16' },
                { k: 'CO₂', v: '−9.6 kg' },
                { k: 'HASH', v: 'a3f · 9c7 · 4b1' },
              ].map((m) => (
                <div key={m.k} className="flex items-baseline gap-2">
                  <dt style={{ color: `${C.muted}AA` }}>{m.k}</dt>
                  <dd
                    className="tabular-nums"
                    style={{ color: C.fg, letterSpacing: '0.06em' }}
                  >
                    {m.v}
                  </dd>
                </div>
              ))}
            </dl>

            {/* share row — quiet text links */}
            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono uppercase"
              style={{ fontSize: '11px', letterSpacing: '0.08em' }}
            >
              <button
                type="button"
                role="button"
                aria-label="인증서 PDF 내려받기"
                className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                style={{ color: C.fg, textDecorationColor: `${C.fg}66` }}
              >
                <Download aria-hidden="true" className="h-3.5 w-3.5" />
                download
              </button>
              <span aria-hidden="true" style={{ color: `${C.muted}88` }}>
                ·
              </span>
              <button
                type="button"
                role="button"
                aria-label="카카오톡으로 공유"
                className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                style={{ color: C.fg }}
              >
                <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
                share to kakao
              </button>
              <span aria-hidden="true" style={{ color: `${C.muted}88` }}>
                ·
              </span>
              <button
                type="button"
                role="button"
                aria-label="링크 복사"
                className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                style={{ color: C.fg }}
              >
                <Link2 aria-hidden="true" className="h-3.5 w-3.5" />
                copy link
              </button>
            </div>
          </div>

          {/* coda */}
          <p
            className="mt-12 text-center font-serif italic"
            style={{
              color: C.muted,
              fontSize: '15px',
              lineHeight: '26px',
            }}
          >
            — 다음 페이지로, 또 다른 길로.
          </p>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          FOOTER — /v 카탈로그로
         ──────────────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-10"
        style={{
          borderTop: `1px solid ${C.fg}1F`,
          backgroundColor: C.surface,
        }}
      >
        <div
          style={{ maxWidth: COLUMN_MAX }}
          className="mx-auto flex flex-wrap items-baseline justify-between gap-3"
        >
          <Link
            href="/v"
            aria-label="변형 카탈로그로 돌아가기"
            className="font-mono uppercase underline-offset-4 hover:underline"
            style={{
              color: C.fg,
              fontSize: '11px',
              letterSpacing: '0.08em',
            }}
          >
            ← /v 카탈로그로 돌아가기
          </Link>
          <span
            className="font-mono uppercase"
            style={{
              color: C.muted,
              fontSize: '10px',
              letterSpacing: '0.1em',
            }}
          >
            V09 · aeon-slow-serif-essay
          </span>
        </div>
      </footer>
    </main>
  );
}
