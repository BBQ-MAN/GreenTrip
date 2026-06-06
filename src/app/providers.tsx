// Root Providers — SessionProvider 등 Client 전역 컨텍스트 래퍼.
// Server Component인 layout.tsx에서 직접 SessionProvider를 사용할 수 없으므로
// 별도 'use client' 경계 컴포넌트로 분리.
//
// 참조: _workspace/00_input/week12_request.md §D-7
'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  // refetchOnWindowFocus=false — 마이페이지 자동 재페치 부하 방지 (JWT 유효기간 내 충분).
  return (
    <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
  );
}
