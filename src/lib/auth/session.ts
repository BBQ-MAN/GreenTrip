// Server-only 세션 헬퍼 — RSC, Route Handler에서 현재 로그인 사용자를 조회.
// Client Component는 next-auth/react의 useSession()을 사용한다.

import { getServerSession } from 'next-auth';
import { authOptions } from './options';

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * 현재 로그인 사용자(SessionUser) 반환. 로그인 안 됨 또는 userId 미존재 시 null.
 *
 * 사용처:
 *   - app/mypage 등 RSC에서 비로그인 redirect 판단
 *   - POST /api/course, POST /api/report/generate에서 userId 자동 채움
 *
 * 주의: Client에서는 절대 직접 import하지 말 것 (Node-only `next-auth` 의존성).
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const u = session.user as SessionUser & { id?: string };
  if (!u.id) return null;
  return {
    id: u.id,
    name: u.name ?? null,
    email: u.email ?? null,
    image: u.image ?? null,
  };
}
