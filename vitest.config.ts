// Vitest 설정 — Next.js 14 + TS path alias 호환
// 참조: _workspace/00_input/week3_request.md §E
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globals: false,
    // Prisma 등 native module 로딩 회피 — 도메인 순수 함수 테스트만 실행.
    pool: 'forks',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
