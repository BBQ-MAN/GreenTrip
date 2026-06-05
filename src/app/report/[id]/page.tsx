// /report/[id] — 탄소 절감 인증서 페이지 (시그니처 2 본격)
// 참조: DEVELOPMENT_PLAN.md §7.5, _workspace/00_input/week10_request.md §C-6
//       STRATEGY.md 시그니처 2 (비로그인 100% 깔때기 + 영구 URL + SNS 공유)
//
// 구성 (모바일 퍼스트):
//   [헤더]    뒤로가기 + h1 "탄소 절감 인증서"
//   [본문]    <CertificateCard />
//             <CarbonChart /> (구간별 vs 자가용 baseline)
//             <ShareButtons /> (다운로드·카카오톡·링크 복사)
//   [푸터]    <SavingsHistory /> + /plan CTA
//
// generateMetadata: og:image = `/api/og/cert/[id]` (절대 URL은 metadataBase가 변환).
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';

import { prisma } from '@/lib/db';
import { gramsToTreeEq, gramsToCarKm } from '@/lib/carbon/equivalents';
import { CARBON_FACTOR } from '@/lib/carbon/factors';
import { MODE_LABEL } from '@/components/course/TransportBadge';
import type { TransportMode } from '@/types/course';

import { CertificateCard } from '@/components/report/CertificateCard';
import { CarbonChart, type CarbonChartDatum } from '@/components/report/CarbonChart';
import { ShareButtons } from '@/components/report/ShareButtons';
import { SavingsHistory } from '@/components/report/SavingsHistory';

export const dynamic = 'force-dynamic';

interface ReportPageProps {
  params: { id: string };
}

async function fetchReport(id: string) {
  return prisma.carbonReport.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          waypoints: { orderBy: { order: 'asc' } },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: ReportPageProps): Promise<Metadata> {
  const report = await fetchReport(params.id);
  if (!report) {
    return { title: '인증서를 찾을 수 없습니다 — GreenTrip' };
  }
  const savedKg = (report.savedCarbonG / 1000).toFixed(1);
  const title = `🌿 ${report.course.title} — CO₂ ${savedKg}kg 절감 | GreenTrip`;
  const description = `GreenTrip으로 만든 저탄소 여행 코스 인증서. ${report.course.title}로 CO₂ ${savedKg}kg을 절감했어요.`;
  const ogImage = `/api/og/cert/${params.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const report = await fetchReport(params.id);
  if (!report) notFound();

  const { course } = report;

  // 표시용 수치
  const savedKg = Math.round((report.savedCarbonG / 1000) * 10) / 10;
  const treeEq = gramsToTreeEq(report.savedCarbonG);
  const carKm = gramsToCarKm(report.savedCarbonG);

  const transportMode = course.transportMode as TransportMode;
  const transportLabel = MODE_LABEL[transportMode] ?? transportMode;

  // origin 추출 — Client(ShareButtons)에서 절대 URL 조립용
  const h = headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('host') ?? 'localhost:3000';
  const origin = `${proto}://${host}`;

  // CarbonChart 데이터: 마지막 waypoint(carbonToNext=null) 제외, baseline=거리 × CARBON_FACTOR.car
  const chartData: CarbonChartDatum[] = course.waypoints
    .filter((wp) => wp.carbonToNext !== null && wp.distToNext !== null)
    .map((wp, i) => ({
      name: `구간 ${i + 1}`,
      actual: Math.round(wp.carbonToNext ?? 0),
      baseline: Math.round((wp.distToNext ?? 0) * CARBON_FACTOR.car),
    }));

  return (
    <main className="container mx-auto max-w-2xl space-y-6 px-4 py-6 md:py-10">
      {/* 헤더 */}
      <header className="flex items-center gap-3">
        <Link
          href={`/course/${course.id}`}
          aria-label="코스 상세로 돌아가기"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card hover:bg-muted"
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" />
        </Link>
        <h1 className="text-heading-md text-foreground md:text-heading-lg">
          탄소 절감 인증서
        </h1>
      </header>

      {/* 인증서 카드 */}
      <CertificateCard
        courseName={course.title}
        savedKg={savedKg}
        treeEq={treeEq}
        carKm={carKm}
        transportLabel={transportLabel}
        issuedAt={report.createdAt}
        reportId={report.id}
        size="preview"
      />

      {/* 공유 액션 (인증서 바로 아래 노출 — 시그니처 2 영구 URL + SNS 공유) */}
      <ShareButtons
        reportId={report.id}
        courseName={course.title}
        savedKg={savedKg}
        origin={origin}
      />

      {/* 구간별 차트 */}
      {chartData.length > 0 ? (
        <section
          aria-labelledby="report-chart-title"
          className="space-y-3 rounded-lg border bg-card p-4 md:p-6"
        >
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="report-chart-title"
              className="text-heading-sm text-foreground md:text-heading-md"
            >
              구간별 탄소 배출
            </h2>
            <p className="text-caption text-muted-foreground">
              자가용 기준 대비 비교
            </p>
          </header>
          <CarbonChart
            data={chartData}
            ariaSummary={`총 ${chartData.length}개 구간에 대해 ${transportLabel} 이동 시 실제 배출량과 자가용 기준 배출량을 비교한 막대 차트.`}
          />
        </section>
      ) : null}

      {/* 누적 히스토리 */}
      <SavingsHistory />

      {/* 다음 단계 CTA */}
      <div className="flex justify-center pb-6">
        <Link
          href="/plan"
          className="text-body-md font-semibold text-brand hover:underline"
        >
          다른 코스 만들기 →
        </Link>
      </div>
    </main>
  );
}
