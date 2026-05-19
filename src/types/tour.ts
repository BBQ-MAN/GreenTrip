// TourAPI (KorService1) 응답 타입 — 중앙 진원지
// 참조: DEVELOPMENT_PLAN.md §3 (API 10종)

/**
 * 관광지·문화시설 등 contentTypeId 12,14,28,32,38,39 의 공통 응답 아이템
 * (areaBasedList1, locationBasedList1, searchKeyword1 등)
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
  mapx: number; // longitude (lng)
  mapy: number; // latitude  (lat)
  mlevel?: number;
  firstimage?: string;
  firstimage2?: string;
  tel?: string;
  zipcode?: string;
  createdtime?: string;
  modifiedtime?: string;
  dist?: number; // locationBasedList1 의 경우 거리(m)
}

/**
 * 축제·행사 (searchFestival1, contentTypeId=15)
 */
export interface FestivalItem extends SpotItem {
  eventstartdate: string; // YYYYMMDD
  eventenddate: string; // YYYYMMDD
}

/**
 * 반려동물 동반여행 정보 (detailPetTour1)
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
 * 공통정보 (detailCommon1) — 제목/주소/개요/대표 이미지
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
 * 소개정보 (detailIntro1) — 운영시간·휴무·요금·접근성
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
 * 이미지정보 (detailImage1)
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
 * 지역코드 (areaCode1)
 */
export interface AreaCodeItem {
  code: string;
  name: string;
  rnum?: number;
}

/**
 * 서비스 분류코드 (categoryCode1)
 */
export interface CategoryCodeItem {
  code: string;
  name: string;
  rnum?: number;
}

/**
 * TourAPI 표준 응답 래퍼
 * 실제 응답: response.body.items.item + numOfRows/pageNo/totalCount
 * 정규화 후 클라이언트에 전달하는 형태
 */
export interface TourAPIResponse<T> {
  items: T[];
  totalCount: number;
  pageNo: number;
  numOfRows: number;
}

/**
 * 에러 응답
 */
export interface TourAPIError {
  error: string;
  message?: string;
  resultCode?: string;
}
