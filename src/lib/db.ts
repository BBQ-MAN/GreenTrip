// Prisma Client (lazy singleton)
//
// Next.js 핫리로드 환경에서 클라이언트 다중 생성을 방지하면서,
// Vercel 빌드 시 page data collection 단계에서 환경변수가 없는 상태로
// 모듈이 import될 때 `new PrismaClient()` 평가를 미룬다.
//
// 사용처는 그대로 `prisma.course.findUnique(...)` 호출 가능 — Proxy가
// 첫 접근 시점에 실제 클라이언트를 생성한다.

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = createClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
}

// Proxy: 메서드 접근 시점에 비로소 실제 PrismaClient 생성 → 빌드 시 import는 안전.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
