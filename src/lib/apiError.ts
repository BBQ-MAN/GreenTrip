// API Route 에러 응답 표준화 헬퍼 — 내부 정보 노출 차단 (재감사 M-3)
//
// 배경 (_workspace/reaudit_api_security_20260611.md §M-3):
//   500/503 응답 본문에 `e.message`(Prisma 컬럼·제약명, Redis 연결 단서,
//   TourAPI resultMsg)를 그대로 반환하면 공격자에게 정찰 정보를 제공한다.
//
// 정책:
//   - 클라이언트에는 일반 메시지만 반환 (에러 코드는 유지 — 프론트 분기용)
//   - 상세(원본 메시지)는 서버 로그(console.error)로만 — Vercel 로그에서 확인
//
// 사용처: src/app/api/** 의 모든 catch 블록.
import { NextResponse } from 'next/server';
import { TourAPIError } from '@/lib/tourapi/client';

/** 일반 사용자 노출용 표준 메시지 */
export const GENERIC_MESSAGES = {
  internal: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  tour: '관광 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  redis: '통계 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
} as const;

/** 서버 사이드 로깅 — 원본 메시지는 여기에만 남긴다 */
export function logRouteError(scope: string, e: unknown): void {
  // eslint-disable-next-line no-console
  console.error(
    `[api:${scope}]`,
    e instanceof Error ? `${e.name}: ${e.message}` : String(e),
  );
}

/** 500 INTERNAL_ERROR — 원본 e.message는 로그로만 */
export function internalErrorResponse(scope: string, e: unknown): NextResponse {
  logRouteError(scope, e);
  return NextResponse.json(
    { error: 'INTERNAL_ERROR', message: GENERIC_MESSAGES.internal },
    { status: 500 },
  );
}

/**
 * 503 TOUR_API_ERROR — TourAPIError.code(resultCode)는 유지하되
 * resultMsg 원문은 응답에서 제거 (로그로만).
 */
export function tourErrorResponse(scope: string, e: unknown): NextResponse {
  logRouteError(scope, e);
  const err = e instanceof TourAPIError ? e : null;
  return NextResponse.json(
    // resultCode: useTourAPI 훅의 TourAPIClientError.resultCode 호환 필드 (refix QA Low-1)
    {
      error: err?.code ?? 'TOUR_API_ERROR',
      resultCode: err?.code,
      message: GENERIC_MESSAGES.tour,
    },
    { status: 503 },
  );
}
