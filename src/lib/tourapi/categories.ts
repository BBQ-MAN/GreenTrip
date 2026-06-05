// TourAPI 분류체계 코드 → 한글 매핑
// 참조: KorService2 매뉴얼 + lclsSystmCode2 응답 부트스트랩
//
// 매핑 범위:
//   1) CONTENT_TYPE_LABEL — contentTypeId(12,14,15,25,28,32,38,39) → 한글
//      (SpotCard.tsx에 동일 상수 존재 — 본 파일에서 단일 진원지화)
//   2) CAT1_LABELS — 대분류 코드 (A01=자연, A02=인문 등)
//   3) CAT2_LABELS — 중분류 (자주 등장하는 코드만, fallback은 호출측에서 코드 그대로)
//   4) CAT3_LABELS — 소분류 (자주 등장하는 코드만)
//   5) LCLSSYSTM_LABELS — KorService2 신규 분류체계 (lclsSystm1/2/3 공용, prefix 기반)
//
// fallback 원칙: 매핑이 없으면 코드 그대로 표시 (정확성 > 부분 매핑 위험)

/**
 * 콘텐츠 타입 ID → 한글 라벨.
 * DEVELOPMENT_PLAN §3.3 CONTENT_TYPE 상수와 1:1.
 */
export const CONTENT_TYPE_LABEL: Record<number, string> = {
  12: '관광지',
  14: '문화시설',
  15: '축제·행사',
  25: '여행코스',
  28: '레포츠',
  32: '숙박',
  38: '쇼핑',
  39: '음식점',
};

/**
 * 대분류 (cat1) 코드 → 한글.
 * 출처: KorService2 분류체계 매뉴얼 (legacy cat1).
 */
export const CAT1_LABELS: Record<string, string> = {
  A01: '자연',
  A02: '인문(문화/예술/역사)',
  A03: '레포츠',
  A04: '쇼핑',
  A05: '음식',
  B02: '숙박',
  C01: '추천코스',
};

/**
 * 중분류 (cat2) 코드 → 한글.
 * 자주 등장하는 코드만 매핑. 누락 시 호출측에서 코드 그대로 fallback.
 */
export const CAT2_LABELS: Record<string, string> = {
  // A01 자연
  A0101: '자연관광지',
  A0102: '관광자원',
  // A02 인문
  A0201: '역사관광지',
  A0202: '휴양관광지',
  A0203: '체험관광지',
  A0204: '산업관광지',
  A0205: '건축/조형물',
  A0206: '문화시설',
  A0207: '축제',
  A0208: '공연/행사',
  // A03 레포츠
  A0301: '레포츠소개',
  A0302: '육상 레포츠',
  A0303: '수상 레포츠',
  A0304: '항공 레포츠',
  A0305: '복합 레포츠',
  // A04 쇼핑
  A0401: '쇼핑',
  // A05 음식
  A0502: '음식점',
  // B02 숙박
  B0201: '숙박시설',
  // C01 추천코스
  C0112: '가족코스',
  C0113: '나홀로코스',
  C0114: '힐링코스',
  C0115: '도보코스',
  C0116: '캠핑코스',
  C0117: '맛코스',
};

/**
 * 소분류 (cat3) 코드 → 한글.
 * 자주 등장하는 코드만 매핑. 누락 시 코드 fallback.
 */
export const CAT3_LABELS: Record<string, string> = {
  // 자연관광지 하위
  A01010100: '국립공원',
  A01010200: '도립공원',
  A01010300: '군립공원',
  A01010400: '산',
  A01010500: '자연생태관광지',
  A01010600: '자연휴양림',
  A01010700: '수목원',
  A01010800: '폭포',
  A01010900: '계곡',
  A01011000: '약수터',
  A01011100: '해안절경',
  A01011200: '해수욕장',
  A01011300: '섬',
  A01011400: '항구/포구',
  A01011500: '등대',
  A01011600: '호수',
  A01011700: '강',
  A01011800: '동굴',
  // 역사관광지 하위
  A02010100: '고궁',
  A02010200: '성',
  A02010300: '문',
  A02010400: '고택',
  A02010500: '생가',
  A02010600: '민속마을',
  A02010700: '유적지/사적지',
  A02010800: '사찰',
  A02010900: '종교성지',
  A02011000: '안보관광',
  // 휴양관광지
  A02020200: '관광단지',
  A02020300: '온천/욕장/스파',
  A02020400: '이색찜질방',
  A02020500: '헬스투어',
  A02020600: '테마공원',
  A02020700: '공원',
  A02020800: '유람선/잠수함관광',
  // 체험
  A02030100: '농.산.어촌 체험',
  A02030200: '전통체험',
  A02030300: '산사체험',
  A02030400: '이색체험',
  A02030600: '이색거리',
  // 음식점
  A05020100: '한식',
  A05020200: '서양식',
  A05020300: '일식',
  A05020400: '중식',
  A05020700: '이색음식점',
  A05020900: '카페/전통찻집',
  A05021000: '클럽',
};

/**
 * KorService2 신규 분류체계 (lclsSystm1/2/3) — prefix 기반 매핑.
 *
 * lclsSystmCode2 응답을 추후 동적으로 부트스트랩할 수 있도록 prefix 우선 매핑.
 * 정확한 코드 매핑이 모호한 경우 prefix(첫 2~3자)로 부분 매칭.
 *
 * 자주 등장하는 prefix만 매핑. 누락 시 호출측에서 코드 fallback.
 */
export const LCLSSYSTM_LABELS: Record<string, string> = {
  // 자연 계열 prefix
  NA: '자연',
  NA01: '자연관광지',
  NA0101: '산악',
  NA0102: '해변',
  NA0103: '계곡/하천',
  NA0104: '도서/섬',
  // 역사 계열
  HS: '역사',
  HS01: '역사유적',
  HS02: '문화재',
  // 체험 계열
  EX: '체험',
  EX01: '농어촌체험',
  EX02: '전통문화체험',
  // 레포츠
  LE: '레포츠',
  LE01: '육상레포츠',
  LE02: '수상레포츠',
  LE03: '항공레포츠',
  // 쇼핑
  SH: '쇼핑',
  // 음식
  FD: '음식',
  // 숙박
  AC: '숙박',
};

/**
 * 카테고리 코드 → 한글 라벨 변환 유틸.
 *
 * 우선순위:
 *   1) CAT3_LABELS (소분류, 가장 구체적)
 *   2) CAT2_LABELS (중분류)
 *   3) CAT1_LABELS (대분류)
 *   4) LCLSSYSTM_LABELS (KorService2 신규 — 완전 일치 후 prefix 매칭)
 *   5) fallback: 원본 코드
 *
 * @param code 코드 (cat1/2/3 또는 lclsSystm1/2/3)
 * @returns 한글 라벨 또는 원본 코드
 */
export function categoryLabel(code: string | null | undefined): string {
  if (!code) return '';
  const c = code.trim();
  if (!c) return '';

  // 1) 정확 매칭 (cat3 → cat2 → cat1)
  if (CAT3_LABELS[c]) return CAT3_LABELS[c];
  if (CAT2_LABELS[c]) return CAT2_LABELS[c];
  if (CAT1_LABELS[c]) return CAT1_LABELS[c];

  // 2) lclsSystm 정확 매칭
  if (LCLSSYSTM_LABELS[c]) return LCLSSYSTM_LABELS[c];

  // 3) lclsSystm prefix 매칭 (긴 prefix 우선)
  const prefixes = Object.keys(LCLSSYSTM_LABELS).sort((a, b) => b.length - a.length);
  for (const p of prefixes) {
    if (c.startsWith(p)) return LCLSSYSTM_LABELS[p];
  }

  // 4) fallback: 원본 코드
  return c;
}
