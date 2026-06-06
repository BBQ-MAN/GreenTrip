'use client';
// Header — 글로벌 상단 네비게이션 (모바일 햄버거 + 데스크탑 가로 메뉴)
// 디자인 토큰: brand·brand-surface. 모바일 퍼스트.
//
// Phase 2 W12 (2026-06-05):
//   - useSession()으로 로그인 상태 분기
//   - 비로그인 → "로그인" 링크 (→ /signin)
//   - 로그인 → 이름 표시 + "로그아웃" 버튼 (signOut)
//   - SessionProvider는 app/providers.tsx에서 root 주입
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Leaf, LogIn, LogOut, Menu, User as UserIcon, X } from 'lucide-react';
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
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated' && Boolean(session?.user);
  const displayName = session?.user?.name ?? '';
  const signInHref = `/signin?callbackUrl=${encodeURIComponent(pathname || '/')}`;

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

          {/* 데스크탑 인증 영역 — 로딩 중에는 자리 차지 안 함 (hydration mismatch 회피) */}
          {status !== 'loading' ? (
            <div
              className="ml-2 flex items-center gap-2 border-l pl-3"
              aria-label="계정"
            >
              {isAuthed ? (
                <>
                  <span
                    className="inline-flex max-w-[8rem] items-center gap-1.5 truncate text-body-sm font-medium text-foreground"
                    title={displayName}
                  >
                    <UserIcon
                      aria-hidden="true"
                      className="h-4 w-4 text-brand"
                    />
                    {displayName || '회원'}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-body-sm font-medium text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="로그아웃"
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href={signInHref}
                  className="inline-flex items-center gap-1 rounded-md bg-brand-surface px-3 py-1.5 text-body-sm font-semibold text-brand hover:bg-brand-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <LogIn aria-hidden="true" className="h-4 w-4" />
                  로그인
                </Link>
              )}
            </div>
          ) : null}
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

            {/* 모바일 인증 영역 — 메뉴 항목과 동일 줄간격 */}
            {status !== 'loading' ? (
              <li className="mt-1 border-t pt-2">
                {isAuthed ? (
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <span
                      className="inline-flex min-w-0 items-center gap-1.5 truncate text-body-md font-medium text-foreground"
                      title={displayName}
                    >
                      <UserIcon
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-brand"
                      />
                      {displayName || '회원'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-body-sm font-medium text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label="로그아웃"
                    >
                      <LogOut aria-hidden="true" className="h-4 w-4" />
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <Link
                    href={signInHref}
                    onClick={() => setOpen(false)}
                    className="block rounded-md bg-brand-surface px-3 py-2.5 text-body-md font-semibold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <LogIn aria-hidden="true" className="h-4 w-4" />
                      로그인
                    </span>
                  </Link>
                )}
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
