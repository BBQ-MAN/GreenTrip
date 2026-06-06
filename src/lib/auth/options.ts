// NextAuth v4 — 인증 설정 (단일 진원지)
//
// - strategy: JWT (PrismaAdapter 없음, User만 수동 upsert)
// - providers: Kakao OAuth (환경변수 있을 때만) + Credentials (개발 환경만)
// - User 모델은 NextAuth 호환(id/email/name/image/provider) — Account/Session 모델 미사용
//
// 사용처:
//   - src/app/api/auth/[...nextauth]/route.ts  (Route Handler 등록)
//   - src/lib/auth/session.ts                  (getServerSession에 주입)
// 절대 다른 파일에서 authOptions를 재정의/복제하지 않는다.

import type { NextAuthOptions } from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    // Kakao OAuth — 환경변수가 모두 준비된 경우에만 활성화
    // (빌드 시 환경변수 미설정이어도 next build가 통과하도록 조건부 spread)
    ...(process.env.KAKAO_REST_API_KEY && process.env.KAKAO_CLIENT_SECRET
      ? [
          KakaoProvider({
            clientId: process.env.KAKAO_REST_API_KEY,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
          }),
        ]
      : []),
    // 개발용 Credentials Provider — NODE_ENV=development에서만 노출
    // dev-{name}@dev.local 패턴으로 매번 동일 이메일을 발급해 동일 User 재사용
    ...(process.env.NODE_ENV === 'development'
      ? [
          CredentialsProvider({
            id: 'dev',
            name: 'Dev Login (개발용)',
            credentials: {
              name: { label: '이름', type: 'text', placeholder: '홍길동' },
            },
            async authorize(creds) {
              if (!creds?.name) return null;
              const email = `dev-${creds.name}@dev.local`;
              return { id: email, name: creds.name, email, image: null };
            },
          }),
        ]
      : []),
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    // 로그인 직후: Prisma User upsert (PrismaAdapter 없이 수동 동기화)
    // DB 실패가 전체 로그인을 막지 않도록 try/catch 감싸고, 이메일 없으면 거부.
    async signIn({ user, account }) {
      if (!user.email) return false;
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? null,
            image: user.image ?? null,
            provider: account?.provider ?? null,
          },
          create: {
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
            provider: account?.provider ?? null,
          },
        });
        return true;
      } catch (e) {
        console.error('signIn upsert failed', e);
        return false;
      }
    },
    // JWT 발급/갱신 시: DB User.id를 token에 보존 → session으로 전파
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      if (email) {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (dbUser) {
          token.userId = dbUser.id;
          token.email = dbUser.email ?? undefined;
        }
      }
      return token;
    },
    // Client/Server 모두 사용하는 session 객체에 user.id 부착
    async session({ session, token }) {
      if (token.userId && session.user) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
