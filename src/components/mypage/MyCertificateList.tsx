// MyCertificateList — 본인 발급한 탄소 인증서 목록
// Server Component. CarbonReport + course(title/region) JOIN 결과를 그리드로 표시.
// 빈 상태: /plan CTA.
import Link from 'next/link';
import { Award, ArrowRight, FileText, Sparkles } from 'lucide-react';
import type { CarbonReport } from '@prisma/client';

// Prisma include로 코스 title/region까지 받은 shape
type ReportWithCourse = CarbonReport & {
  course: { title: string; region: string } | null;
};

interface MyCertificateListProps {
  reports: ReportWithCourse[];
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function MyCertificateList({ reports }: MyCertificateListProps) {
  return (
    <section aria-labelledby="my-certificates-title" className="space-y-3">
      <header className="flex items-center justify-between gap-2">
        <h2
          id="my-certificates-title"
          className="inline-flex items-center gap-1.5 text-heading-sm font-extrabold text-foreground"
        >
          <Award aria-hidden="true" className="h-5 w-5 text-cert" />
          내 인증서
          <span className="text-body-sm font-medium text-muted-foreground">
            ({reports.length}건)
          </span>
        </h2>
      </header>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
          <p className="text-body-md text-muted-foreground">
            아직 발급된 인증서가 없습니다.
          </p>
          <Link
            href="/plan"
            className="mt-3 inline-flex items-center gap-1 rounded-md bg-brand px-4 py-2 text-body-sm font-semibold text-white hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Sparkles aria-hidden="true" className="h-4 w-4" />첫 코스 만들기
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {reports.map((report) => {
            const savedKg = Math.round((report.savedCarbonG / 1000) * 10) / 10;
            const title = report.course?.title ?? '코스 정보 없음';
            const region = report.course?.region ?? '';
            return (
              <li key={report.id}>
                <Link
                  href={`/report/${report.id}`}
                  className="group block rounded-lg border bg-card p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`${title} 인증서 — ${savedKg}kg CO₂ 절감 (${formatDate(new Date(report.createdAt))} 발급)`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-body-md font-bold text-foreground">
                        {title}
                      </p>
                      {region ? (
                        <p className="mt-0.5 text-caption text-muted-foreground">
                          {region}
                        </p>
                      ) : null}
                    </div>
                    <FileText
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-cert"
                    />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-caption text-muted-foreground">
                        절감량
                      </p>
                      <p className="numeric text-heading-md font-extrabold text-cert">
                        {savedKg.toFixed(1)}
                        <span className="ml-0.5 text-body-md font-bold">
                          kg
                        </span>
                      </p>
                    </div>
                    <p className="inline-flex items-center gap-0.5 text-caption text-muted-foreground group-hover:text-foreground">
                      {formatDate(new Date(report.createdAt))}
                      <ArrowRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      />
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
