// TourAPI 모듈 진입점 (re-export) — Route Handler·테스트 import 용이성
//
// 외부 도메인 타입(SpotItem 등)은 `src/types/tour.ts`에서 import.
// 본 index는 client/cache/sync/constants의 함수·상수만 재출력.
export {
  callTourAPI,
  callDurunubiAPI,
  TourAPIError,
} from './client';

export {
  TOUR_CACHE_TTL,
  tourCacheKey,
  getCached,
  setCached,
  delCached,
  incrStat,
} from './cache';

export { syncRecentChanges } from './sync';

export {
  TOUR_API_BASE,
  DURUNUBI_API_BASE,
  TOUR_API_COMMON_PARAMS,
  TOUR_API_ENDPOINTS,
  TOUR_API_DEPRECATED,
  CONTENT_TYPE,
  GANGWON,
} from './constants';

export type { TourAPIEndpoint } from './constants';
