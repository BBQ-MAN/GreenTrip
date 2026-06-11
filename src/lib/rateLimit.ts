/**
 * Rate Limit — Upstash Ratelimit 단일 진원지 + 인메모리 폴백 (재감사 H-4).
 *
 * 정책:
 *   - Redis 정상: IP 기준 sliding window 30 req / 60s.
 *   - Redis 미설정/오류: **인메모리 폴백 리미터** (프로세스/isolate 단위,
 *     보수적 한도 20 req / 60s 고정 윈도우). 과거 fail-open은
 *     보호 대상이 외부 유료 쿼터(TourAPI 일 1,000건)라 악용 가능 → 폐기.
 *   - Redis 부재는 기동 시 1회 경고 로그 (운영 환경변수 누락 조기 탐지).
 *
 * 사용처: `src/middleware.ts` 의 /api/tour/*, /api/course/*, /api/report/*, /api/carbon/* matcher.
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

// 인메모리 폴백 — Edge isolate 단위라 분산 환경에선 isolate별로 카운트되지만,
// fail-open(무제한)보다 항상 엄격하다. 보수적 한도 20 req / 60s.
const MEMORY_LIMIT = 20;
const MEMORY_WINDOW_MS = 60_000;
const MEMORY_MAX_KEYS = 10_000; // 메모리 폭주 방지 상한
const memoryHits = new Map<string, { count: number; resetAt: number }>();

let warnedNoRedis = false;
let cached: Ratelimit | null | undefined;

function warnOnce(reason: string): void {
  if (warnedNoRedis) return;
  warnedNoRedis = true;
  // eslint-disable-next-line no-console
  console.warn(
    `[rateLimit] ${reason} — 인메모리 폴백 리미터(${MEMORY_LIMIT} req/${MEMORY_WINDOW_MS / 1000}s)로 동작합니다. ` +
      'UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN 설정을 확인하세요.',
  );
}

function getRatelimit(): Ratelimit | null {
  if (cached !== undefined) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    warnOnce('Upstash Redis 환경변수 미설정');
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
  } catch (e) {
    warnOnce(`Upstash Ratelimit 초기화 실패 (${e instanceof Error ? e.message : String(e)})`);
    cached = null;
    return null;
  }
}

/** 인메모리 고정 윈도우 리미터 — Redis 부재/오류 시 폴백 */
function memoryRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();

  // 키 폭주 방지: 상한 초과 시 만료 엔트리 정리, 그래도 초과면 전체 리셋
  if (memoryHits.size >= MEMORY_MAX_KEYS) {
    for (const [k, v] of memoryHits) {
      if (v.resetAt <= now) memoryHits.delete(k);
    }
    if (memoryHits.size >= MEMORY_MAX_KEYS) memoryHits.clear();
  }

  const entry = memoryHits.get(identifier);
  if (!entry || entry.resetAt <= now) {
    memoryHits.set(identifier, { count: 1, resetAt: now + MEMORY_WINDOW_MS });
    return {
      success: true,
      limit: MEMORY_LIMIT,
      remaining: MEMORY_LIMIT - 1,
      reset: now + MEMORY_WINDOW_MS,
    };
  }

  entry.count += 1;
  return {
    success: entry.count <= MEMORY_LIMIT,
    limit: MEMORY_LIMIT,
    remaining: Math.max(0, MEMORY_LIMIT - entry.count),
    reset: entry.resetAt,
  };
}

/**
 * Rate limit 판정. Redis 미설정/오류 시 인메모리 폴백 (fail-open 아님).
 */
export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  const rl = getRatelimit();
  if (!rl) {
    return memoryRateLimit(identifier);
  }
  try {
    const r = await rl.limit(identifier);
    return { success: r.success, limit: r.limit, remaining: r.remaining, reset: r.reset };
  } catch (e) {
    warnOnce(`Upstash Redis 호출 오류 (${e instanceof Error ? e.message : String(e)})`);
    return memoryRateLimit(identifier);
  }
}
