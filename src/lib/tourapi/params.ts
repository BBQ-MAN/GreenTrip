// TourAPI 쿼리 파라미터 클램프 유틸 — 쿼터 소진(DoS)·캐시 회피 방어 (재감사 H-3)
//
// 배경 (_workspace/reaudit_api_security_20260611.md §H-3):
//   numOfRows·pageNo·radius가 상한 없이 TourAPI에 전달되면
//   ① 폭주값/페이지 변주로 캐시 키가 매번 달라져 100% 캐시 미스
//   ② 매 요청이 실제 TourAPI 호출 → 일일 1,000건/endpoint 쿼터 소진.
//
// 정책: 초과 값은 400 거절이 아니라 **클램프** (UX 보존 — 정상 사용자는 영향 없음).
//   - numOfRows: 1 ~ 50 (목록), 코드 조회(ldongCode2·lclsSystmCode2)만 1 ~ 100
//   - pageNo:    1 ~ 50
//   - radius:    1 ~ 20000 (m, TourAPI locationBasedList2 허용 범위)
//
// 모든 /api/tour/* Route Handler는 raw searchParams 대신 이 유틸을 통과시킨다.

/** 클램프 상한 기본값 — 모든 라우트에서 단일 진원지로 사용 */
export const TOUR_PARAM_LIMITS = {
  numOfRowsMax: 50,
  /** 코드 목록(ldongCode2·lclsSystmCode2)은 전체 코드 반환이 필요 → 완화 상한 */
  numOfRowsMaxCode: 100,
  pageNoMax: 50,
  radiusMax: 20000,
} as const;

/**
 * 정수 파라미터 클램프 공통 구현.
 * - null/빈 문자열/숫자 아님 → 기본값
 * - 범위 밖 → min/max로 클램프
 * - 반환은 TourAPI 전달용 string
 */
export function clampIntParam(
  raw: string | null | undefined,
  opts: { def: number; min?: number; max: number },
): string {
  const { def, min = 1, max } = opts;
  if (raw === null || raw === undefined || raw.trim() === '') return String(def);
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return String(def);
  return String(Math.min(max, Math.max(min, n)));
}

/** numOfRows 클램프 — 기본 20, 상한 50 (코드 조회는 maxOverride=100 사용) */
export function clampNumOfRows(
  raw: string | null | undefined,
  def = 20,
  max: number = TOUR_PARAM_LIMITS.numOfRowsMax,
): string {
  return clampIntParam(raw, { def, max });
}

/** pageNo 클램프 — 기본 1, 상한 50 (페이지 변주를 통한 캐시 회피 차단) */
export function clampPageNo(
  raw: string | null | undefined,
  def = 1,
  max: number = TOUR_PARAM_LIMITS.pageNoMax,
): string {
  return clampIntParam(raw, { def, max });
}

/** radius 클램프 — 기본 5000m, TourAPI 허용 범위 1~20000m */
export function clampRadius(
  raw: string | null | undefined,
  def = 5000,
  max: number = TOUR_PARAM_LIMITS.radiusMax,
): string {
  return clampIntParam(raw, { def, max });
}
