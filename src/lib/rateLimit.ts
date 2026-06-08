/**
 * Rate Limit — Upstash Ratelimit 단일 진원지.
 *
 * 정책: IP 기준 sliding window 30 req / 60s (TourAPI Route Handler 대상).
 * 환경변수 미설정/Redis 오류 시 **fail-open** — UX 우선 (MVP 데모용).
 *
 * 사용처: `src/middleware.ts` 의 /api/tour/* matcher.
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const DEFAULT_LIMIT = 30;
const DEFAULT_WINDOW = '60 s' as const;

let cached: Ratelimit | null | undefined;

function getRatelimit(): Ratelimit | null {
  if (cached !== undefined) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cached = null;
    return null;
  }

  try {
    cached = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(DEFAULT_LIMIT, DEFAULT_WINDOW),
      analytics: false,
      prefix: 'greentrip:rl',
    });
    return cached;
  } catch {
    cached = null;
    return null;
  }
}

/** fail-open: Redis 미설정/오류 시 통과 */
export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  const rl = getRatelimit();
  if (!rl) {
    return { success: true, limit: DEFAULT_LIMIT, remaining: DEFAULT_LIMIT, reset: Date.now() + 60_000 };
  }
  try {
    const r = await rl.limit(identifier);
    return { success: r.success, limit: r.limit, remaining: r.remaining, reset: r.reset };
  } catch {
    return { success: true, limit: DEFAULT_LIMIT, remaining: DEFAULT_LIMIT, reset: Date.now() + 60_000 };
  }
}
