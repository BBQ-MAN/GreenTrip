// Footer — 크레딧 + 정책 링크
// Server Component (정적)
import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="mt-16 border-t bg-card"
    >
      <div className="container flex flex-col gap-4 py-8 text-body-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Leaf aria-hidden="true" className="h-4 w-4 text-brand" />
          <span>
            <span className="font-semibold text-foreground">GreenTrip</span>{' '}
            · 한국관광공사 TourAPI 기반
          </span>
        </div>

        <nav aria-label="푸터 메뉴">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            <li>
              <Link
                href="/"
                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                홈
              </Link>
            </li>
            <li>
              <Link
                href="/plan"
                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                코스 만들기
              </Link>
            </li>
            <li>
              <Link
                href="/explore"
                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                탐색
              </Link>
            </li>
            <li>
              <a
                href="https://www.data.go.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                공공데이터포털
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t">
        <p className="container py-4 text-caption text-muted-foreground">
          © 2026 GreenTrip · 2026 관광데이터 활용 공모전 출품작 · 강원관광재단 협업 진행 중
        </p>
      </div>
    </footer>
  );
}
