// MyPageHeader — 사용자명/이미지 아바타 + 환영 메시지 + 로그아웃 CTA
// Server Component. SessionUser 그대로 props로 받는다.
import Image from 'next/image';
import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';
import type { SessionUser } from '@/lib/auth/session';
import { SignOutButton } from '@/components/auth/SignOutButton';

interface MyPageHeaderProps {
  user: SessionUser;
}

export function MyPageHeader({ user }: MyPageHeaderProps) {
  const displayName = user.name ?? user.email ?? '회원';
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4 md:p-6">
      <div className="flex min-w-0 items-center gap-3">
        {user.image ? (
          <Image
            src={user.image}
            alt={`${displayName} 프로필 이미지`}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full border bg-muted object-cover"
            unoptimized
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand"
          >
            <UserIcon className="h-6 w-6" />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-heading-sm font-extrabold text-foreground">
            {displayName} 님
          </p>
          <p className="truncate text-caption text-muted-foreground">
            그린 여행 기록을 한곳에 모았어요
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/plan"
          className="inline-flex items-center rounded-md bg-brand-surface px-3 py-2 text-body-sm font-semibold text-brand hover:bg-brand-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          새 코스 만들기
        </Link>
        <SignOutButton />
      </div>
    </header>
  );
}
