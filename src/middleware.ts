/**
 * Edge Middleware — Rate Limit (재감사 H-4 강화판)
 *
 * 대상: /api/tour/* (TourAPI 쿼터 보호) + /api/course/* (코스 생성 POST가 내부에서
 *       TourAPI 호출 + 2-opt O(n²) 연산) + /api/report/* (익명 DB 쓰기) + /api/carbon/*
 * 정책: IP 기준 30 req/min sliding window (Redis) / 20 req/min 인메모리 폴백.
 *
 * IP 추출 (스푸핑 방어):
 *   1) req.ip — Vercel이 검증한 클라이언트 IP (가장 신뢰)
 *   2) x-real-ip — Vercel/신뢰 프록시가 세팅
 *   3) x-forwarded-for 첫 토큰 — 최후 폴백 (셀프호스팅 dev 환경용; 위조 가능하므로 우선하지 않음)
 */
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

export const config = {
  matcher: [
    '/api/tour/:path*',
    '/api/course/:path*',
    '/api/report/:path*',
    '/api/carbon/:path*',
  ],
};

/** 신뢰 가능 소스 우선의 클라이언트 IP 추출 */
function getClientIp(req: NextRequest): string {
  // Vercel 런타임이 채워주는 검증된 IP (Edge에서 제공)
  if (req.ip) return req.ip;

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0]?.trim();
    if (first) return first;
  }

  return 'unknown';
}

export async function middleware(req: NextRequest) {
  const ip = getClientIp(req);

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
