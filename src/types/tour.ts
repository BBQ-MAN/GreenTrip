// TourAPI (KorService2) 응답 타입 — 중앙 진원지
// 참조: DEVELOPMENT_PLAN.md §3 (활성 13종 + 미사용 2종)
//
// ⚠ 2026-06-05 v1.6: KorService1 → KorService2 마이그레이션
//   - 출처(1차): 사용자 활용신청서 (15개 endpoint HTTP 200 실측 확인)
//   - 응답 shape 정규화: client.ts가 외부에는 항상 TourAPIResponse<T>로 반환
//   - 빈 응답(items='') / 단일객체(item:T) / 배열(item:T[]) 모두 처리

// =============================================================================
// 1. KorService2 원시 응답 (raw) — unwrap 전 형태
// =============================================================================

/**
 * KorService2 정상 응답의 원시 형태.
 * client.ts 내부에서만 사용하고, 외부로는 항상 TourAPIResponse<T>로 반환.
 *
 * 주의:
 * - resultCode='0000' 이면서 items='' (빈 문자열)인 케이스 존재 → 빈 배열로 해석
 * - items.item이 단일 객체 또는 배열 둘 다 가능 → 배열로 정규화
 */
export interface TourAPIRawResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: { item: T | T[] } | '';
      totalCount: number;
      pageNo: number;
      numOfRows: number;
    };
  };
}

/**
 * KorService2 에러 응답 (파라미터 누락 등).
 * 예: {"responseTime":"...","resultCode":"11","resultMsg":"NO_MANDATORY..."}
 * 정상 응답과 구조가 다르므로 별도 타입.
 */
export interface TourAPIErrorResponse {
  responseTime?: string;
  resultCode: string; // '11' = NO_MANDATORY_REQUEST_PARAMETERS_ERROR 등
  resultMsg: string;
}

// =============================================================================
// 2. 정규화된 외부 응답 shape — Route Handler·훅이 사용하는 일관 형태
// =============================================================================

/**
 * TourAPI Route 표준 응답.
 * client.ts의 callTourAPI 가 raw 응답을 unwrap하여 이 형태로 반환.
 * useTourAPI 훅의 제네릭 T도 이 shape을 기대.
 */
export interface TourAPIResponse<T> {
  items: T[]; // 항상 배열 (빈 응답이면 [])
  totalCount: number;
  pageNo: number;
  numOfRows: number;
}

/**
 * 에러 응답 (Route Handler가 클라이언트에 반환)
 */
export interface TourAPIError {
  error: string;
  message?: string;
  resultCode?: string;
}

// =============================================================================
// 3. 도메인 아이템 타입 — KorService2 응답 필드명 원본 유지
// =============================================================================

/**
 * 관광지·문화시설 등 contentTypeId 12,14,28,32,38,39 의 공통 응답 아이템
 * (areaBasedList2, locationBasedList2, searchKeyword2 등)
 *
 * 필드명은 KorService2 원본 그대로 (mapx/mapy/firstimage 등 lowercase).
 * 도메인 변환(lng/lat 등)은 Waypoint 모델 매핑 시점에서만 수행.
 */
export interface SpotItem {
  contentid: string;
  contenttypeid: number;
  title: string;
  addr1: string;
  addr2?: string;
  areacode: number;
  sigungucode?: number;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  // KorService2 분류체계 (lclsSystmCode2 정합)
  lclsSystm1?: string;
  lclsSystm2?: string;
  lclsSystm3?: string;
  // 법정동 (ldongCode2 정합)
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  mapx: number; // longitude (lng)
  mapy: number; // latitude  (lat)
  mlevel?: number;
  firstimage?: string;
  firstimage2?: string;
  tel?: string;
  zipcode?: string;
  createdtime?: string;
  modifiedtime?: string;
  dist?: number; // locationBasedList2 의 경우 거리(m)
}

/**
 * 축제·행사 (searchFestival2, contentTypeId=15)
 */
export interface FestivalItem extends SpotItem {
  eventstartdate: string; // YYYYMMDD
  eventenddate: string; // YYYYMMDD
}

/**
 * 숙박 (searchStay2, contentTypeId=32)
 * areaBasedList2(contentTypeId=32)와 필드는 동일하나 숙박 전용 검색 최적화.
 */
export type StayItem = SpotItem;

/**
 * 반려동물 동반여행 정보 (detailPetTour2)
 */
export interface PetInfo {
  contentid: string;
  petInfo?: string;
  acmpyTypeCd?: string; // 동반 가능 동물 유형 코드
  acmpyPsblCpam?: string; // 동반 가능 동물 (구체)
  acmpyNeedMtr?: string; // 동반 시 필요 사항
  relaAcdntRiskMtr?: string; // 관련 사고 위험 사항
}

/**
 * 공통정보 (detailCommon2) — 제목/주소/개요/대표 이미지
 */
export interface SpotDetailCommon {
  contentid: string;
  contenttypeid: number;
  title: string;
  addr1?: string;
  addr2?: string;
  areacode?: number;
  sigungucode?: number;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  firstimage?: string;
  firstimage2?: string;
  mapx?: number;
  mapy?: number;
  mlevel?: number;
  overview?: string;
  homepage?: string;
  tel?: string;
  telname?: string;
}

/**
 * 소개정보 (detailIntro2) — 운영시간·휴무·요금·접근성
 * contentTypeId 별로 필드가 다르므로 union/optional 로 처리
 */
export interface SpotDetailIntro {
  contentid: string;
  contenttypeid: number;
  // 관광지 (12)
  infocenter?: string;
  opendate?: string;
  restdate?: string;
  expguide?: string;
  expagerange?: string;
  accomcount?: string;
  useseason?: string;
  usetime?: string;
  parking?: string;
  chkbabycarriage?: string;
  chkpet?: string;
  chkcreditcard?: string;
  // 행사 (15)
  sponsor1?: string;
  sponsor1tel?: string;
  eventstartdate?: string;
  eventenddate?: string;
  playtime?: string;
  eventplace?: string;
  usetimefestival?: string;
  // 그 외 contentType (14/28/32/38/39) 는 후속 주차에서 확장
  [key: string]: unknown;
}

/**
 * 반복정보 (detailInfo2) — ⭐ KorService2 신규 (DEVELOPMENT_PLAN에 없던 endpoint)
 * 관광지의 부대시설·코스 구간·객실 정보 등 contentType별 가변 필드.
 */
export interface SpotDetailInfo {
  contentid: string;
  contenttypeid: number;
  serialnum?: string;
  // 관광지/문화시설: 부대시설·정보
  infoname?: string;
  infotext?: string;
  // 여행코스(25): 코스 구간
  subnum?: string;
  subname?: string;
  subdetailoverview?: string;
  subdetailimg?: string;
  subdetailalt?: string;
  // 숙박(32): 객실 정보
  roomcode?: string;
  roomtitle?: string;
  roomsize1?: string;
  roomcount?: string;
  roombasecount?: string;
  roommaxcount?: string;
  [key: string]: unknown;
}

/**
 * 이미지정보 (detailImage2)
 */
export interface SpotImage {
  contentid: string;
  originimgurl: string;
  imgname?: string;
  smallimageurl?: string;
  cpyrhtDivCd?: string; // 저작권 구분
  serialnum?: string;
}

/**
 * 법정동코드 (ldongCode2) — ⭐ 신규: areaCode2 정식 대체
 * 행정안전부 법정동 체계로 시·군·구·읍·면·동까지 정확 식별 가능.
 */
export interface LdongCodeItem {
  code: string;
  name: string;
  rnum?: number;
}

/**
 * 분류체계 코드 (lclsSystmCode2) — ⭐ 신규: categoryCode2 정식 대체
 * 한국관광공사 신규 분류체계 (lclsSystm1/2/3).
 */
export interface LclsSystmCodeItem {
  code: string;
  name: string;
  rnum?: number;
}

// =============================================================================
// 4. 레거시 별칭 (점진적 마이그레이션 — Week 2 client 구현 시 제거 가능)
// =============================================================================

/** @deprecated v1.6: areaCode2는 "미사용 (삭제예정)". LdongCodeItem 사용. */
export type AreaCodeItem = LdongCodeItem;

/** @deprecated v1.6: categoryCode2는 "미사용 (삭제예정)". LclsSystmCodeItem 사용. */
export type CategoryCodeItem = LclsSystmCodeItem;
