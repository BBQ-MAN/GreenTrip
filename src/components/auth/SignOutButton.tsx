// SignOutButton — 마이페이지 헤더의 로그아웃 버튼 (Client)
// next-auth/react signOut() 사용. callbackUrl='/'.
'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      aria-label="로그아웃"
      className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-body-sm font-medium text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      로그아웃
    </button>
  );
}
