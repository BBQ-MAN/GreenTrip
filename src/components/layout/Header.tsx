'use client';
// Header — 글로벌 상단 네비게이션 (모바일 햄버거 + 데스크탑 가로 메뉴)
// 디자인 토큰: brand·brand-surface. 모바일 퍼스트.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Leaf, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
}

const NAV: NavItem[] = [
  { href: '/plan', label: '코스 만들기' },
  { href: '/explore', label: '탐색' },
  { href: '/mypage', label: '내 기록' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75"
      role="banner"
    >
      <div className="container flex h-14 items-center justify-between gap-4 md:h-16">
        {/* 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="GreenTrip 홈"
          onClick={() => setOpen(false)}
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-surface text-brand"
          >
            <Leaf className="h-4 w-4" />
          </span>
          <span className="text-heading-sm font-extrabold text-foreground">
            GreenTrip
          </span>
        </Link>

        {/* 데스크탑 메뉴 */}
        <nav
          aria-label="주 메뉴"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-md px-3 py-2 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'bg-brand-surface text-brand'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 모바일 햄버거 */}
        <button
          type="button"
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* 모바일 드롭 메뉴 */}
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="주 메뉴 (모바일)"
          className="border-t bg-background md:hidden"
        >
          <ul className="container flex flex-col gap-1 py-3">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block rounded-md px-3 py-2.5 text-body-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      active
                        ? 'bg-brand-surface text-brand'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
