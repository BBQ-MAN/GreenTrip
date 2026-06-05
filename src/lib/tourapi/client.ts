// TourAPI (KorService2) HTTP 클라이언트 — Week 2 본격 구현
//
// 설계 원칙 (`.claude/skills/tourapi-integration/SKILL.md` + tourapi_migration_v1.6 §5.3):
// 1. 서버 측 전용 — `TOUR_API_KEY`는 process.env에서만 접근, 클라이언트 번들에 노출 금지
// 2. 공통 파라미터 자동 주입 — MobileApp=GreenTrip 고정 (운영계정 승인요건)
// 3. `listYN` 파라미터 차단 — KorService2는 INVALID_REQUEST_PARAMETER_ERROR 반환
// 4. KorService2 응답 unwrap — `response.body.items.item`이 단일/배열/'' 모두 처리하여 항상 T[]
// 5. 에러 응답 표준화 — TourAPIError throw, Route Handler에서 catch → 503/400 JSON
// 6. Single-flight — 동일 쿼리 in-flight Promise 공유 (Rate Limit 방어, 1,000건/일/endpoint)
// 7. 미사용 2종(areaCode2·categoryCode2)은 TourAPIEndpoint 타입에 미포함되어 컴파일 타임 차단
//
// 참조: `_workspace/tourapi_migration_v1.6.md` §5.3, DEVELOPMENT_PLAN.md §3
import { TOUR_API_BASE, TOUR_API_COMMON_PARAMS, DURUNUBI_API_BASE } from './constants';
import type { TourAPIEndpoint } from './constants';
import type {
  TourAPIRawResponse,
  TourAPIResponse,
  TourAPIErrorResponse,
} from '@/types/tour';

/**
 * TourAPI 호출 시 발생하는 도메인 에러.
 *
 * - `code`: KorService2 resultCode 또는 HTTP_xxx (네트워크 오류)
 * - `msg`: KorService2 resultMsg (예: NO_MANDATORY_REQUEST_PARAMETERS_ERROR)
 * - `endpoint`: 호출 대상 endpoint (디버깅용)
 */
export class TourAPIError extends Error {
  constructor(
    public readonly code: string,
    public readonly msg: string,
    public readonly endpoint: string,
  ) {
    super(`TourAPI ${endpoint} error: ${code} - ${msg}`);
    this.name = 'TourAPIError';
  }
}

/**
 * Single-flight 캐시 — 동일 endpoint+params 조합의 in-flight Promise 공유.
 * 동시에 같은 요청이 들어와도 외부 API 호출은 1회만 수행.
 */
const inflight = new Map<string, Promise<unknown>>();

/**
 * 정렬된 params로 single-flight 키 생성.
 * undefined/빈 문자열은 제외, key 알파벳 순 정렬로 결정적 키 보장.
 */
function buildInflightKey(
  endpoint: string,
  params: Record<string, string | number | undefined>,
): string {
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  return `${endpoint}:${JSON.stringify(sorted)}`;
}

/**
 * KorService2 응답 body의 items 필드를 항상 T[] 배열로 정규화.
 *
 * 처리 케이스:
 * - `items === ''` (빈 문자열, KorService2의 totalCount=0 응답) → []
 * - `items.item`이 단일 객체 → [item]
 * - `items.item`이 배열 → 그대로
 * - 기타 → []
 */
function unwrapItems<T>(rawItems: TourAPIRawResponse<T>['response']['body']['items']): T[] {
  if (rawItems === '' || rawItems === null || rawItems === undefined) return [];
  const inner = (rawItems as { item?: T | T[] }).item;
  if (inner === undefined || inner === null) return [];
  return Array.isArray(inner) ? inner : [inner];
}

/**
 * Base URL과 endpoint 식별자, 정렬된 params로 최종 fetch URL 조립.
 * serviceKey는 별도 set으로 안전하게 주입 (인코딩 자동 처리).
 */
function buildRequestUrl(
  base: string,
  endpoint: string,
  serviceKey: string,
  sortedParams: [string, string | number][],
): URL {
  const url = new URL(`${base}/${endpoint}`);
  url.searchParams.set('serviceKey', serviceKey);
  // 공통 파라미터 자동 주입 (MobileApp=GreenTrip 등)
  Object.entries(TOUR_API_COMMON_PARAMS).forEach(([k, v]) => {
    url.searchParams.set(k, String(v));
  });
  sortedParams.forEach(([k, v]) => {
    url.searchParams.set(k, String(v));
  });
  return url;
}

/**
 * KorService2 응답에서 string으로 반환되지만 의미상 number인 도메인 필드들.
 * - 좌표·거리·지도 레벨·분류 ID 등 산술/비교 연산에 쓰이는 필드만 포함.
 * - `contentid`·`cat1~3`·`lclsSystm*`·`lDong*Cd`·`*time` 등은 식별자/코드/날짜이므로 string 유지.
 *
 * v1.6 QA(Week 2)에서 발견: types/tour.ts는 number 선언이지만 KorService2 실측 string →
 * SpotDetail의 `typeof === 'number'` 가드 영구 false → GPS·거리 표시 영구 미작동.
 * 본 변환 레이어가 단일 진원지에서 정규화하여 타입 약속(types/tour.ts)을 지킨다.
 */
const NUMERIC_FIELDS = new Set([
  'mapx',
  'mapy',
  'mlevel',
  'dist',
  'contenttypeid',
  'areacode',
  'sigungucode',
]);

/**
 * KorService2 응답 item 1개의 수치 필드(string)를 number로 정규화.
 * 빈 문자열·NaN이 되는 값은 그대로 유지 (downstream에서 falsy 검사 가능).
 */
function coerceNumericFields<T>(item: T): T {
  if (typeof item !== 'object' || item === null) return item;
  const obj = item as Record<string, unknown>;
  const result: Record<string, unknown> = { ...obj };
  let changed = false;
  for (const key of NUMERIC_FIELDS) {
    const v = obj[key];
    if (typeof v === 'string' && v !== '') {
      const n = Number(v);
      if (!Number.isNaN(n)) {
        result[key] = n;
        changed = true;
      }
    }
  }
  return changed ? (result as T) : item;
}

/**
 * KorService2 raw 응답을 파싱하여 에러 검출 + items 배열 정규화.
 * 정상이면 TourAPIResponse<T>를 반환, 에러면 TourAPIError throw.
 */
function parseRawResponse<T>(
  endpoint: string,
  data: unknown,
): TourAPIResponse<T> {
  // 에러 응답 (response 래퍼 없이 top-level resultCode/responseTime)
  if (
    typeof data === 'object' &&
    data !== null &&
    !('response' in (data as Record<string, unknown>)) &&
    'resultCode' in (data as Record<string, unknown>)
  ) {
    const err = data as TourAPIErrorResponse;
    throw new TourAPIError(err.resultCode, err.resultMsg, endpoint);
  }

  // 정상 구조 확인
  if (
    typeof data !== 'object' ||
    data === null ||
    !('response' in (data as Record<string, unknown>))
  ) {
    throw new TourAPIError('PARSE_ERROR', 'Unexpected response shape', endpoint);
  }

  const wrapped = data as TourAPIRawResponse<T>;
  const header = wrapped.response?.header;
  if (!header) {
    throw new TourAPIError('PARSE_ERROR', 'Missing response.header', endpoint);
  }

  if (header.resultCode !== '0000') {
    throw new TourAPIError(header.resultCode, header.resultMsg, endpoint);
  }

  const body = wrapped.response.body;
  const rawItems = unwrapItems<T>(body?.items);
  // v1.6 QA Week 2 fix: KorService2가 mapx/mapy/dist/contenttypeid/areacode/sigungucode를
  // string으로 반환하는 문제를 client.ts 단일 진원지에서 정규화.
  const items = rawItems.map(coerceNumericFields);

  return {
    items,
    totalCount: Number(body?.totalCount) || 0,
    pageNo: Number(body?.pageNo) || 1,
    numOfRows: Number(body?.numOfRows) || items.length,
  };
}

/**
 * KorService2 endpoint 호출 핵심 함수.
 *
 * @param endpoint - 활성 13종 중 하나 (TourAPIEndpoint). 미사용 2종은 타입 차단.
 * @param params - 쿼리 파라미터. listYN는 자동 제거됨 (KorService2 호환).
 * @returns 정규화된 `{ items: T[], totalCount, pageNo, numOfRows }`.
 * @throws TourAPIError - 키 누락, HTTP 오류, resultCode≠'0000' 등.
 *
 * 예시:
 *   const res = await callTourAPI<SpotItem>('areaBasedList2', {
 *     areaCode: 32, numOfRows: 10, pageNo: 1, arrange: 'A',
 *   });
 */
export async function callTourAPI<T>(
  endpoint: TourAPIEndpoint,
  params: Record<string, string | number | undefined> = {},
): Promise<TourAPIResponse<T>> {
  const serviceKey = process.env.TOUR_API_KEY;
  if (!serviceKey) {
    throw new TourAPIError('NO_KEY', 'TOUR_API_KEY missing', endpoint);
  }

  // KorService2 호환: listYN 차단 (v1.6에서 INVALID_REQUEST_PARAMETER_ERROR 확인)
  const cleanParams = { ...params };
  if ('listYN' in cleanParams) delete cleanParams.listYN;

  const sorted = Object.entries(cleanParams)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b)) as [string, string | number][];

  const reqKey = buildInflightKey(endpoint, cleanParams);

  // Single-flight: 동일 요청이 in-flight 중이면 기존 Promise 공유
  const existing = inflight.get(reqKey);
  if (existing) {
    return existing as Promise<TourAPIResponse<T>>;
  }

  const promise = (async (): Promise<TourAPIResponse<T>> => {
    const url = buildRequestUrl(TOUR_API_BASE, endpoint, serviceKey, sorted);

    let res: Response;
    try {
      res = await fetch(url, { cache: 'no-store' });
    } catch (e) {
      throw new TourAPIError(
        'NETWORK_ERROR',
        e instanceof Error ? e.message : String(e),
        endpoint,
      );
    }

    if (!res.ok) {
      throw new TourAPIError(`HTTP_${res.status}`, res.statusText, endpoint);
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch (e) {
      // KorService2가 간혹 XML 에러 응답을 반환할 수 있음 → 본문 일부 로깅
      const text = await res.text().catch(() => '');
      throw new TourAPIError(
        'PARSE_ERROR',
        `Invalid JSON: ${text.slice(0, 200)}`,
        endpoint,
      );
    }

    return parseRawResponse<T>(endpoint, data);
  })();

  inflight.set(reqKey, promise);
  // finally: 성공/실패 무관 inflight 해제 (다음 요청은 새 fetch)
  promise.finally(() => {
    inflight.delete(reqKey);
  });

  return promise;
}

/**
 * 두루누비(코리아둘레길) API 호출. KorService2와 Base URL이 다름.
 * 사용자 활용신청서 미포함 → 별도 신청 후 활성화.
 *
 * 오퍼레이션: `courseList` (코스 목록), `routeList` (구간 + GPX 트랙)
 */
export async function callDurunubiAPI<T>(
  operation: 'courseList' | 'routeList',
  params: Record<string, string | number | undefined> = {},
): Promise<TourAPIResponse<T>> {
  const serviceKey = process.env.TOUR_API_KEY;
  if (!serviceKey) {
    throw new TourAPIError('NO_KEY', 'TOUR_API_KEY missing', operation);
  }

  const cleanParams = { ...params };
  if ('listYN' in cleanParams) delete cleanParams.listYN;

  const sorted = Object.entries(cleanParams)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b)) as [string, string | number][];

  const url = buildRequestUrl(DURUNUBI_API_BASE, operation, serviceKey, sorted);

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new TourAPIError(`HTTP_${res.status}`, res.statusText, operation);
  }

  const data = (await res.json()) as unknown;
  return parseRawResponse<T>(operation, data);
}
