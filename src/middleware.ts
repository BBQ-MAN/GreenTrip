/**
 * Edge Middleware — Rate Limit for /api/tour/*
 *
 * - IP 기준 30 req/min sliding window (rateLimit.ts)
 * - 인증/DB/OG API는 제외 (matcher)
 * - fail-open: Redis 미설정/오류 시 통과
 */
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

export const config = {
  matcher: ['/api/tour/:path*'],
};

export async function middleware(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for');
  const ip =
    (fwd ? fwd.split(',')[0].trim() : undefined) ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const { success, limit, remaining, reset } = await rateLimit(ip);

  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json(
      {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests — try again shortly.',
        limit,
        remaining: 0,
        resetMs: reset,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(reset),
        },
      },
    );
  }

  const res = NextResponse.next();
  res.headers.set('X-RateLimit-Limit', String(limit));
  res.headers.set('X-RateLimit-Remaining', String(remaining));
  res.headers.set('X-RateLimit-Reset', String(reset));
  return res;
}
