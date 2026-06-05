// TourAPI Redis 캐시 래퍼 — Week 2 본격 구현
//
// 설계 (`.claude/skills/tourapi-integration/SKILL.md` §캐시 전략):
// - 키 규약: `tour:{endpoint}:{sha1(sorted JSON params)}`
// - TTL 분기: endpoint별 최적값 (DEVELOPMENT_PLAN §3.2)
// - Stale fallback: 네트워크 실패 시 만료된 캐시 반환 → Route Handler가 `X-Cache: STALE` 헤더
// - Upstash Redis REST (Vercel Edge 호환)
import { Redis } from '@upstash/redis';
import { createHash } from 'node:crypto';

/**
 * Upstash Redis 클라이언트 (lazy singleton).
 *
 * Vercel 빌드 시 page data collection 단계에서 모듈을 import할 때
 * `Redis.fromEnv()`를 즉시 호출하면 환경변수가 없는 환경에서 throw → 빌드 실패.
 * lazy 초기화로 실제 호출 시점(런타임)까지 미룬다.
 */
let _redis: Redis | undefined;
function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

/**
 * endpoint별 캐시 TTL (초). v1.6 KorService2 기준.
 *
 * 분기 근거:
 * - 코드성(법정동·분류체계): 24h — 거의 정적
 * - 위치/지역 리스트: 1h — 신규 추가 반영
 * - 키워드 검색: 30m — 사용자 검색 다양성
 * - 축제·숙박·상세·반려동물: 6h — 업데이트 주기
 * - 반복정보·이미지: 24h — 정적
 * - 동기화: 캐시 안 함 (cron 트리거)
 */
export const TOUR_CACHE_TTL = {
  // 코드 (정적)
  ldongCode2: 86400,
  lclsSystmCode2: 86400,
  // 위치/지역
  locationBasedList2: 3600,
  areaBasedList2: 3600,
  // 검색
  searchKeyword2: 1800,
  searchFestival2: 21600,
  searchStay2: 21600,
  // 상세
  detailCommon2: 21600,
  detailIntro2: 21600,
  detailInfo2: 86400,
  detailImage2: 86400,
  detailPetTour2: 21600,
  // 동기화 (캐시 안 함)
  areaBasedSyncList2: 0,
  // 정적 area (sigungu 상수 반환)
  static: 86400,
} as const;

export type TourCacheKey = keyof typeof TOUR_CACHE_TTL;

/**
 * 캐시 키 생성: `tour:{endpoint}:{sha1(sorted params JSON)}`.
 *
 * - params를 키 알파벳순 정렬 → 동일 쿼리는 동일 키
 * - undefined/빈문자열 제거
 * - sha1 hex (40자) → Redis 키 길이 절약 + 충돌 확률 무시 가능
 */
export function tourCacheKey(
  endpoint: string,
  params: Record<string, string | number | undefined>,
): string {
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  const serialized = JSON.stringify(sorted);
  const hash = createHash('sha1').update(serialized).digest('hex');
  return `tour:${endpoint}:${hash}`;
}

/**
 * 캐시 조회. 미존재 또는 파싱 실패 시 null.
 *
 * Upstash Redis SDK는 set 시점에 JSON.stringify된 값을 자동 parse하여 반환.
 * 타입 안정성을 위해 제네릭으로 단언.
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const value = await getRedis().get<T>(key);
    return value ?? null;
  } catch {
    return null;
  }
}

/**
 * 캐시 저장. TTL=0이면 저장하지 않음 (동기화 등).
 *
 * Upstash SDK는 객체를 자동으로 JSON 직렬화.
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttlSec: number,
): Promise<void> {
  if (ttlSec <= 0) return;
  try {
    await getRedis().set(key, value, { ex: ttlSec });
  } catch {
    // 캐시 실패는 정상 흐름을 막지 않음 (외부 API 응답은 이미 받음)
  }
}

/**
 * 캐시 삭제 (sync 시 무효화 등).
 */
export async function delCached(key: string): Promise<void> {
  try {
    await getRedis().del(key);
  } catch {
    // 무시
  }
}

/**
 * 호출 통계 누적 (P0-11 대시보드 시드).
 * 키: `tour:stats:{endpoint}:{YYYY-MM-DD}` — INCR.
 * Week 15 대시보드에서 일별 endpoint 사용 현황 시각화.
 */
export async function incrStat(endpoint: string): Promise<void> {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const key = `tour:stats:${endpoint}:${date}`;
  try {
    const r = getRedis();
    await r.incr(key);
    // 30일 후 자동 만료 (대시보드는 최근 30일만 표시)
    await r.expire(key, 86400 * 30);
  } catch {
    // 무시
  }
}
