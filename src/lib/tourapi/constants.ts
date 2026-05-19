// TourAPI 상수 — 콘텐츠 타입 ID, 지역코드 등
// 참조: DEVELOPMENT_PLAN.md §3.3, §3.4

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

export const TOUR_API_BASE = 'https://apis.data.go.kr/B551011/KorService1';

export const TOUR_API_COMMON_PARAMS = {
  MobileOS: 'ETC',
  MobileApp: 'GreenTrip',
  _type: 'json',
} as const;
