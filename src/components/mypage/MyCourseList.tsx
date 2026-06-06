// MyCourseList — 본인이 저장한 코스 목록
// Server Component. Prisma Course[] (최신 10건) 그리드.
// 빈 상태: /plan CTA.
import Link from 'next/link';
import { Map, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import type { Course } from '@prisma/client';
import { MODE_LABEL } from '@/components/course/TransportBadge';
import type { TransportMode } from '@/types/course';

interface MyCourseListProps {
  courses: Course[];
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function MyCourseList({ courses }: MyCourseListProps) {
  return (
    <section aria-labelledby="my-courses-title" className="space-y-3">
      <header className="flex items-center justify-between gap-2">
        <h2
          id="my-courses-title"
          className="inline-flex items-center gap-1.5 text-heading-sm font-extrabold text-foreground"
        >
          <Map aria-hidden="true" className="h-5 w-5 text-brand" />내 코스
          <span className="text-body-sm font-medium text-muted-foreground">
            ({courses.length}건)
          </span>
        </h2>
      </header>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
          <p className="text-body-md text-muted-foreground">
            아직 저장된 코스가 없습니다.
          </p>
          <Link
            href="/plan"
            className="mt-3 inline-flex items-center gap-1 rounded-md bg-brand px-4 py-2 text-body-sm font-semibold text-white hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Sparkles aria-hidden="true" className="h-4 w-4" />첫 코스 만들기
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {courses.map((course) => {
            const savedKg =
              Math.round((course.savedCarbonG / 1000) * 10) / 10;
            const transportLabel =
              MODE_LABEL[course.transportMode as TransportMode] ??
              course.transportMode;
            return (
              <li key={course.id}>
                <Link
                  href={`/course/${course.id}`}
                  className="group flex items-center justify-between gap-3 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`${course.title} — ${transportLabel}, ${savedKg}kg 절감`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-body-md font-bold text-foreground">
                      {course.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted-foreground">
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                        {course.region}
                      </span>
                      <span>·</span>
                      <span>{transportLabel}</span>
                      {course.duration ? (
                        <>
                          <span>·</span>
                          <span>{course.duration}</span>
                        </>
                      ) : null}
                      <span>·</span>
                      <span>{formatDate(new Date(course.createdAt))}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="text-caption text-muted-foreground">절감</p>
                      <p className="numeric text-body-md font-extrabold text-cert">
                        {savedKg.toFixed(1)}
                        <span className="ml-0.5 text-caption font-bold">
                          kg
                        </span>
                      </p>
                    </div>
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    />
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
