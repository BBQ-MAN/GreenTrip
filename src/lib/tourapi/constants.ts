// TourAPI 상수 — Base URL, 공통 파라미터, 콘텐츠 타입 ID, 지역코드
// 참조: DEVELOPMENT_PLAN.md §3.1·§3.2·§3.3·§3.4
//
// ⚠ 2026-06-05 KorService1 → KorService2 일괄 마이그레이션 (v1.6)
//   - 출처(1차): 사용자 활용신청서 — 모든 endpoint `*2` 접미사로 변경
//   - Base URL: KorService2 단일. KorService1 잔존 0건 보장.
//   - 신청 대상 15개 endpoint 중 활성 13개 + 미사용(삭제예정) 2개
//   - 미사용: areaCode2, categoryCode2 (정식 대체: ldongCode2, lclsSystmCode2)

export const CONTENT_TYPE = {
  관광지: 12,
  문화시설: 14,
  축제공연행사: 15,
  여행코스: 25,
  레포츠: 28,
  숙박: 32,
  쇼핑: 38,
  음식점: 39,
} as const;

export const GANGWON = {
  areaCode: 32,
  sigungu: {
    춘천시: 1,
    원주시: 2,
    강릉시: 3,
    동해시: 4,
    태백시: 5,
    속초시: 6,
    삼척시: 7,
    홍천군: 8,
    횡성군: 9,
    영월군: 10,
    평창군: 11,
    정선군: 12,
    철원군: 13,
    화천군: 14,
    양구군: 15,
    인제군: 16,
    고성군: 17,
    양양군: 18,
  },
} as const;

/**
 * 한국관광공사 TourAPI Base URL (KorService2)
 *
 * 사용자 활용신청서(2026-06-05) 기준 — 15개 endpoint 모두 HTTP 200 활성 확인.
 * KorService1은 이미 deprecated. 본 프로젝트는 KorService2 단일 사용.
 */
export const TOUR_API_BASE = 'https://apis.data.go.kr/B551011/KorService2';

/**
 * 두루누비(코리아둘레길) Base URL — 별도 신청 필요 (사용자 활용신청서 미포함)
 * DEVELOPMENT_PLAN §3.2 API-14 (2026-05-28 추가)
 */
export const DURUNUBI_API_BASE = 'https://apis.data.go.kr/B551011/Durunubi';

/**
 * TourAPI 공통 쿼리 파라미터
 * - MobileApp=GreenTrip 고정: 운영계정 승인요건 (OpenAPI 자료 p9)
 * - _type=json: KorService2 JSON 응답 강제
 */
export const TOUR_API_COMMON_PARAMS = {
  MobileOS: 'ETC',
  MobileApp: 'GreenTrip',
  _type: 'json',
} as const;

/**
 * 활성 KorService2 endpoint 13종 (사용자 활용신청서 기준)
 * 호출 코드는 client.ts에서 이 식별자를 그대로 사용한다.
 *
 * ⚠ areaCode2·categoryCode2는 신청은 됐으나 "미사용 (삭제예정)" 명시 →
 *    호출 코드 추가 금지. 정식 대체: ldongCode2 / lclsSystmCode2.
 */
export const TOUR_API_ENDPOINTS = {
  // 위치/지역 기반
  locationBasedList2: 'locationBasedList2',
  areaBasedList2: 'areaBasedList2',
  areaBasedSyncList2: 'areaBasedSyncList2',
  // 검색
  searchKeyword2: 'searchKeyword2',
  searchFestival2: 'searchFestival2',
  searchStay2: 'searchStay2', // ⭐ 신규: 숙박 전용
  // 상세
  detailCommon2: 'detailCommon2',
  detailIntro2: 'detailIntro2',
  detailInfo2: 'detailInfo2', // ⭐ 신규: 반복정보
  detailImage2: 'detailImage2',
  detailPetTour2: 'detailPetTour2',
  // 코드 (정식 대체)
  ldongCode2: 'ldongCode2', // ⭐ 신규: areaCode 정식 대체 (법정동)
  lclsSystmCode2: 'lclsSystmCode2', // ⭐ 신규: categoryCode 정식 대체 (분류체계)
} as const;

export type TourAPIEndpoint = (typeof TOUR_API_ENDPOINTS)[keyof typeof TOUR_API_ENDPOINTS];

/**
 * 미사용(삭제예정) endpoint — 호출 금지 목록.
 * QA가 grep으로 호출 0건을 검증한다 (greentrip-qa SKILL §E).
 */
export const TOUR_API_DEPRECATED = ['areaCode2', 'categoryCode2'] as const;
