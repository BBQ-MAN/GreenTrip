// 랜딩 페이지 (Week 4)
// Server Component (RSC). 인터랙션은 자식 컴포넌트(Header)에 위임.
// 참조: DEVELOPMENT_PLAN.md §7.1, _workspace/benchmark/04_signatures.md
//
// 구성:
//   1. Hero — 슬로건 "같은 여행지, 다른 이동방식" + CTA "코스 만들기"
//   2. 서비스 소개 — 3단계 stepper
//   3. 시그니처 미리보기 — CourseCompareCard 3안 mock (시그니처 1 데모)
//   4. 누적 절감 카운터 (placeholder)
import Link from 'next/link';
import { ArrowRight, Map, GitCompareArrows, Leaf, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCompareCard } from '@/components/course/CourseCompareCard';
import { BeforeAfterCompare } from '@/components/course/BeforeAfterCompare';
import type { CourseCompareResult } from '@/types/course';
import { PageContainer } from '@/components/layout/PageContainer';

// ---------------------------------------------------------------------------
// 시그니처 미리보기 — Mock CourseCompareResult (강원 코스 실측값 기반)
//   Week 3 검증: car 14,132g → transit 4,576g = 67% 절감
// ---------------------------------------------------------------------------
const MOCK_RESULT: CourseCompareResult = {
  car: {
    mode: 'car',
    category: 'car',
    waypoints: [],
    segments: [],
    totalKm: 67.3,
    totalCO2g: 14_132,
    durationMin: 67,
    estimatedCostKRW: 6_730,
  },
  transit: {
    mode: 'express_bus',
    category: 'transit',
    waypoints: [],
    segments: [],
    totalKm: 67.3,
    totalCO2g: 4_576,
    durationMin: 73,
    estimatedCostKRW: 4_038,
  },
  active: {
    mode: 'bicycle',
    category: 'active',
    waypoints: [],
    segments: [],
    totalKm: 8.4,
    totalCO2g: 0,
    durationMin: 34,
    estimatedCostKRW: 0,
  },
  recommended: 'transit',
};

function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b bg-gradient-to-b from-brand-surface/50 to-background"
    >
      <PageContainer as="div" className="py-12 md:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface px-3 py-1 text-caption font-semibold text-brand">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            2026 관광데이터 활용 공모전 출품작
          </span>

          <h1
            id="hero-title"
            className="mt-6 text-display-md text-foreground md:text-display-lg"
          >
            같은 여행지,{' '}
            <span className="text-brand">다른 이동방식</span>
          </h1>

          <p className="mt-6 text-body-lg text-muted-foreground md:text-body-lg">
            자가용·대중교통·자전거 — 3가지 이동수단별 탄소 배출과 시간·비용을
            한눈에 비교하고 가장 적합한 코스를 골라보세요.
            <br className="hidden md:block" />
            강원도 관광지 데이터 기반, 무료·비로그인.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/plan" aria-label="코스 만들기 페이지로 이동">
                코스 만들기
                <ArrowRight aria-hidden="true" className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/explore">테마 코스 둘러보기</Link>
            </Button>
          </div>

          {/* 누적 절감 카운터 (placeholder, Phase 4 본격) */}
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-caption text-muted-foreground">
            <Leaf aria-hidden="true" className="h-3.5 w-3.5 text-transport-eco" />
            누적 절감 CO₂{' '}
            <span className="numeric font-semibold text-foreground">
              집계 준비 중
            </span>
          </p>
        </div>
      </PageContainer>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      n: 1,
      Icon: Map,
      title: '여행지 선택',
      desc: '강원도 18개 시군구에서 가고 싶은 곳을 고르세요. 테마와 기간도 함께.',
    },
    {
      n: 2,
      Icon: GitCompareArrows,
      title: '코스 3안 비교',
      desc: '자가용·대중교통·자전거의 CO₂·시간·비용을 한 화면에서 동시에.',
    },
    {
      n: 3,
      Icon: Leaf,
      title: '저탄소 코스 선택',
      desc: '추천 코스를 따라가며 절감한 CO₂를 인증서로 받아 공유하세요.',
    },
  ];

  return (
    <section aria-labelledby="how-title" className="border-b bg-card/50">
      <PageContainer as="div" className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="how-title" className="text-display-md text-foreground">
            어떻게 작동하나요
          </h2>
          <p className="mt-3 text-body-md text-muted-foreground">
            세 단계면 충분합니다.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map(({ n, Icon, title, desc }) => (
            <li
              key={n}
              className="flex flex-col gap-3 rounded-lg border bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-surface text-brand"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="numeric text-numeric-md font-extrabold text-brand">
                  {n}
                </span>
              </div>
              <h3 className="text-heading-sm text-foreground">{title}</h3>
              <p className="text-body-sm text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}

function SignaturePreviewSection() {
  return (
    <section
      aria-labelledby="preview-title"
      className="border-b"
    >
      <PageContainer as="div" className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-transport-eco/10 px-3 py-1 text-caption font-semibold text-transport-eco">
            시그니처 미리보기
          </span>
          <h2
            id="preview-title"
            className="mt-3 text-display-md text-foreground"
          >
            이동수단 3안, 한 화면에 동시 비교
          </h2>
          <p className="mt-3 text-body-md text-muted-foreground">
            강원 코스 예시 — 자가용 대비 대중교통은{' '}
            <span className="font-semibold text-transport-eco">67% 절감</span>.
          </p>
        </div>

        {/* CourseCompareCard × 3 — 모바일 1열, md+ 3열 */}
        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          <CourseCompareCard
            option={MOCK_RESULT.car}
            baselineCO2g={MOCK_RESULT.car.totalCO2g}
            isRecommended={MOCK_RESULT.recommended === 'car'}
          />
          <CourseCompareCard
            option={MOCK_RESULT.transit}
            baselineCO2g={MOCK_RESULT.car.totalCO2g}
            isRecommended={MOCK_RESULT.recommended === 'transit'}
          />
          <CourseCompareCard
            option={MOCK_RESULT.active}
            baselineCO2g={MOCK_RESULT.car.totalCO2g}
            isRecommended={MOCK_RESULT.recommended === 'active'}
          />
        </div>

        {/* Before/After 강조 */}
        <div className="mt-8">
          <BeforeAfterCompare
            baselineG={MOCK_RESULT.car.totalCO2g}
            optimizedG={MOCK_RESULT.transit.totalCO2g}
            mode={MOCK_RESULT.transit.mode}
          />
        </div>

        <div className="mt-8 text-center">
          <Button asChild size="lg">
            <Link href="/plan">
              내 코스 만들어보기
              <ArrowRight aria-hidden="true" className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <SignaturePreviewSection />
    </>
  );
}
