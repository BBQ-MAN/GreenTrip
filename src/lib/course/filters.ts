// 축제·반려동물·접근성 필터
// 참조: DEVELOPMENT_PLAN.md §4.3 (접근성 점수) + §8 Phase 2 Week 6~7 (축제 연동)
//
// Week 3 본격 구현:
//   - calculateAccessibility (overview·infocenter 키워드 매칭, 보수적)
//   - filterByAccessibility (점수 임계값 필터)
// Week 6~7 본격 (v2.0):
//   - rangeOverlaps · durationToDateRange · isFestival
//   - mergeFestivals (FestivalItem → CourseWaypoint 변환 + 중복 제거 + 축제 우선 배치)
// Week 8~9 본격:
//   - excludeNonPetFriendly (시그니처만)
import type { CourseWaypoint } from '@/types/course';
import type {
  AccessibilityScore,
} from '@/types/carbon';
import type {
  SpotDetailCommon,
  SpotDetailIntro,
  FestivalItem,
  PetInfo,
} from '@/types/tour';
import { spotToWaypoint, hasValidCoord } from './generator';
import { CONTENT_TYPE } from '@/lib/tourapi/constants';

/**
 * 축제 타입 별칭 — FestivalItem(`@/types/tour`)이 단일 진원지.
 * ui-builder가 본 파일에서 import할 수 있도록 re-export.
 */
export type FestivalSpot = FestivalItem;

/**
 * detailCommon2 + detailIntro2 병합 객체에서 접근성 점수 산출.
 *
 * 보수적 채점 (DEVELOPMENT_PLAN §4.3):
 *   - overview·infocenter 텍스트만 사용 (정확한 키워드 매칭이 어려운 점 고려).
 *   - 키워드 1회 = 부분 점수, 다회 = 가산. 상한 100.
 *   - parking은 detailIntro의 parking 필드 우선 사용.
 *   - petFriendly는 detailIntro.chkpet ("가능"/"불가능") 우선, 없으면 키워드.
 *
 * 단위 테스트 가능: 순수 함수 (I/O 없음).
 */
export function calculateAccessibility(
  detail: Partial<SpotDetailCommon & SpotDetailIntro>,
): AccessibilityScore {
  const text = [
    detail.overview ?? '',
    detail.infocenter ?? '',
  ]
    .join(' ')
    .toLowerCase();

  // 대중교통 — 보수적 키워드. 매치 1건당 25점, 최대 100.
  const transitMatches = (text.match(/버스|지하철|ktx|역에서|정류장|터미널/g) ?? []).length;
  const publicTransport = Math.min(100, transitMatches * 25);

  // 주차 — detailIntro.parking 우선, 없으면 본문 키워드.
  let parking = 0;
  if (detail.parking && typeof detail.parking === 'string') {
    if (/무료|free/i.test(detail.parking)) parking = 100;
    else if (/유료|가능|available/i.test(detail.parking)) parking = 60;
    else if (/불가|없음/i.test(detail.parking)) parking = 10;
    else parking = 40;
  } else if (/무료\s*주차/.test(text)) {
    parking = 100;
  } else if (/주차장|주차/.test(text)) {
    parking = 50;
  } else {
    parking = 20;
  }

  // 휠체어/장애인 — 매치 1건당 30점, 최대 100.
  const wheelchairMatches = (text.match(/장애인|엘리베이터|경사로|무장애|배리어프리/g) ?? [])
    .length;
  const wheelchair = Math.min(100, wheelchairMatches * 30);

  // 반려동물 — detailIntro.chkpet 우선
  let petFriendly = false;
  if (detail.chkpet && typeof detail.chkpet === 'string') {
    petFriendly = /가능|허용|동반|ok|yes/i.test(detail.chkpet) && !/불가|금지/i.test(detail.chkpet);
  } else if (/반려동물|애견|펫.{0,3}프렌들리/.test(text)) {
    petFriendly = true;
  }

  return {
    publicTransport,
    parking,
    wheelchair,
    petFriendly,
  };
}

/**
 * 접근성 임계 점수(public+wheelchair 평균) 미만 spot 제외.
 *
 * Week 3 본격 구현 — 단순 점수 임계 필터. 호출측에서 spot별 사전 detail 조회 필요.
 * accessibilityMap이 비어있으면 입력 그대로 반환 (필터 미적용).
 */
export function filterByAccessibility(
  spots: CourseWaypoint[],
  accessibilityMap: Map<string, AccessibilityScore>,
  minScore: number,
): CourseWaypoint[] {
  if (accessibilityMap.size === 0 || minScore <= 0) return spots;
  return spots.filter((s) => {
    const score = accessibilityMap.get(s.contentId);
    if (!score) return true; // 모르는 spot은 통과 (보수적)
    const avg = (score.publicTransport + score.wheelchair) / 2;
    return avg >= minScore;
  });
}

/**
 * 날짜 범위 (YYYYMMDD 8자리). KorService2 eventStartDate/eventEndDate와 단위 일치.
 */
export interface DateRange {
  start: string; // YYYYMMDD
  end: string; // YYYYMMDD
}

/**
 * YYYYMMDD 8자리 문자열 검증. 빈 문자열·자릿수 부족·비숫자는 false.
 */
function isYyyymmdd(s: string | undefined | null): s is string {
  return typeof s === 'string' && /^\d{8}$/.test(s);
}

/**
 * 두 날짜 범위가 겹치는지 (양 끝 포함, [start, end] 닫힌 구간).
 *
 *   겹침 = a.start <= b.end && a.end >= b.start
 *
 * 두 값 모두 YYYYMMDD 8자리이므로 문자열 사전순 비교 = 수치 비교 (zero-pad 보장).
 * 유효성 검증을 통과하지 못한 입력(빈 문자열·잘못된 길이)은 false 반환.
 */
export function rangeOverlaps(a: DateRange, b: DateRange): boolean {
  if (!isYyyymmdd(a.start) || !isYyyymmdd(a.end)) return false;
  if (!isYyyymmdd(b.start) || !isYyyymmdd(b.end)) return false;
  // 자체적으로 start > end인 비정상 입력은 false (closed interval 의미 손실 방지)
  if (a.start > a.end || b.start > b.end) return false;
  return a.start <= b.end && a.end >= b.start;
}

/**
 * YYYYMMDD 문자열 → UTC Date (시각 00:00 고정). KST 가정이지만 일 단위 산술만 하므로 UTC OK.
 */
function parseYyyymmdd(s: string): Date {
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6));
  const d = Number(s.slice(6, 8));
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Date → YYYYMMDD UTC 문자열.
 */
function formatYyyymmdd(d: Date): string {
  const y = d.getUTCFullYear().toString().padStart(4, '0');
  const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = d.getUTCDate().toString().padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * YYYYMMDD에 dayDelta 만큼 더한 YYYYMMDD 반환 (UTC 산술, 윤년·월말 안전).
 */
function addDays(yyyymmdd: string, dayDelta: number): string {
  const dt = parseYyyymmdd(yyyymmdd);
  dt.setUTCDate(dt.getUTCDate() + dayDelta);
  return formatYyyymmdd(dt);
}

/**
 * KST 오늘 날짜 YYYYMMDD. 명시적 호출 시점 일관성을 위해 분리.
 * (테스트 가능성을 위해 startDate를 받지 않는 분기에서만 사용)
 */
function todayKst(): string {
  // KST = UTC+9. Date.now()는 epoch ms. +9h 보정 후 YYYY-MM-DD 추출.
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = now.getUTCFullYear().toString().padStart(4, '0');
  const m = (now.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = now.getUTCDate().toString().padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * duration 키워드 → YYYYMMDD DateRange.
 *
 *   당일   : start ~ start         (1일)
 *   1박2일 : start ~ start+1       (2일)
 *   2박3일 : start ~ start+2       (3일)
 *
 * @param duration 사용자 선택 기간 (Zod enum과 1:1)
 * @param startDate YYYYMMDD 시작일 (미지정 시 KST 오늘)
 */
export function durationToDateRange(
  duration: '당일' | '1박2일' | '2박3일',
  startDate?: string,
): DateRange {
  const start = startDate && isYyyymmdd(startDate) ? startDate : todayKst();
  const delta = duration === '당일' ? 0 : duration === '1박2일' ? 1 : 2;
  return { start, end: addDays(start, delta) };
}

/**
 * 축제 타입 가드 — contenttypeid가 15(축제공연행사) 이면서 eventstartdate 보유.
 *
 * SpotItem이 들어와도 안전 (eventstartdate 부재 시 false).
 */
export function isFestival(
  spot: { contenttypeid?: number; eventstartdate?: string } | FestivalItem,
): spot is FestivalItem {
  return (
    spot.contenttypeid === CONTENT_TYPE.축제공연행사 &&
    typeof (spot as FestivalItem).eventstartdate === 'string' &&
    (spot as FestivalItem).eventstartdate.length > 0
  );
}

/**
 * 축제 병합 — Week 6~7 본격 구현 (DEVELOPMENT_PLAN §8 매트릭스).
 *
 * 정책 (input 명세 §A-1):
 *   1. dateRange와 행사 기간이 겹치는 축제만 채택 (rangeOverlaps, 닫힌 구간).
 *   2. 중복 제거 — 이미 spots에 같은 contentid가 있으면 기존 spot 우선 (축제 측은 버림).
 *   3. 결과는 [신규 축제..., 기존 spots...] — 축제 우선 배치 (호출측 NN 시작점 선정 시 의미)
 *   4. 좌표 무효 축제(mapx/mapy 누락·범위 밖)는 제외 (CourseWaypoint 변환 후 hasValidCoord).
 *   5. eventstartdate/eventenddate가 YYYYMMDD가 아니면 rangeOverlaps에서 자동 탈락.
 *
 * 순수 함수 — I/O 없음.
 */
export function mergeFestivals(
  spots: CourseWaypoint[],
  festivals: FestivalItem[],
  dateRange: DateRange,
): CourseWaypoint[] {
  // 1. dateRange와 겹치는 축제만
  const overlapping = festivals.filter((f) =>
    rangeOverlaps(
      { start: f.eventstartdate, end: f.eventenddate },
      dateRange,
    ),
  );

  // 2. contentid 중복 제거 — 기존 spots에 있는 contentid는 건너뜀
  const existingIds = new Set(spots.map((s) => s.contentId));
  const novelFestivals: CourseWaypoint[] = [];
  const seenNovel = new Set<string>();
  for (const f of overlapping) {
    if (existingIds.has(f.contentid)) continue;
    if (seenNovel.has(f.contentid)) continue; // festivals 자체 중복
    const wp = spotToWaypoint(f);
    if (!hasValidCoord(wp)) continue; // 좌표 무효 제외
    seenNovel.add(f.contentid);
    novelFestivals.push(wp);
  }

  // 3. 축제 우선 배치
  return [...novelFestivals, ...spots];
}

/**
 * 반려동물 불가 spot 제거 — Week 8~9 본격 구현. 시그니처만 제공.
 *
 * petInfoMap은 detailPetTour2 응답을 contentId로 키 매핑.
 * acmpyPsblCpam에 동반 불가 정보가 있으면 제외.
 */
export function excludeNonPetFriendly(
  spots: CourseWaypoint[],
  petInfoMap: Map<string, PetInfo>,
): CourseWaypoint[] {
  // TODO Week 8~9: petInfoMap[contentId] 검사 후 제외
  void petInfoMap;
  return spots;
}
