// NextAuth 타입 확장 — session.user.id, jwt.userId
// tsconfig.json의 include `**/*.ts`로 자동 picked up.

import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & { id?: string };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
  }
}
