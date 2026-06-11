// 축제·반려동물·접근성 필터
// 참조: DEVELOPMENT_PLAN.md §4.3 (접근성 점수) + §8 Phase 2 Week 6~7 (축제 연동) + Week 8~9 (반려동물)
//
// Week 3 본격 구현:
//   - calculateAccessibility (overview·infocenter 키워드 매칭, 보수적)
//   - filterByAccessibility (점수 임계값 필터)
// Week 6~7 본격 (v2.0):
//   - rangeOverlaps · durationToDateRange · isFestival
//   - mergeFestivals (FestivalItem → CourseWaypoint 변환 + 중복 제거 + 축제 우선 배치)
// Week 8~9 본격 (v2.1):
//   - PetFriendlySpot (SpotItem + isPetFriendly 메타) · isPetFriendly · isPetFriendlyChkValue
//   - excludeNonPetFriendly (동기 1차 chkpet 필터)
//   - filterPetFriendly (1차 chkpet + 2차 detailPetTour2 폴백, concurrency 제한)
//   - excludeNonPetFriendlyWaypoints (Map 기반 레거시 시그니처 유지)
import type { CourseWaypoint } from '@/types/course';
import type {
  AccessibilityScore,
} from '@/types/carbon';
import type {
  SpotDetailCommon,
  SpotDetailIntro,
  SpotItem,
  FestivalItem,
  PetInfo,
} from '@/types/tour';
import { callTourAPI } from '@/lib/tourapi/client';
import { spotToWaypoint, hasValidCoord } from './generator';
import { CONTENT_TYPE } from '@/lib/tourapi/constants';

/**
 * 축제 타입 별칭 — FestivalItem(`@/types/tour`)이 단일 진원지.
 * ui-builder가 본 파일에서 import할 수 있도록 re-export.
 */
export type FestivalSpot = FestivalItem;

/**
 * 부정어 패턴 — 긍정 키워드 직후 인접 윈도 내 등장 시 해당 매치를 점수에서 제외.
 * 2026-06-11 재감사 M1: "주차장 없음"·"주차 불가"·"장애인 화장실 없음" 류
 * 부정 표현이 긍정 점수를 만드는 위양성 수정 (보수적 — 의심스러우면 제외).
 */
const NEGATION_AFTER = /없|불가|금지|미설치|미운영|폐쇄/;

/** 키워드 매치 직후 부정어 탐색 윈도(문자 수). "장애인 화장실 없음"까지 커버. */
const NEGATION_WINDOW = 8;

/**
 * 부정문을 제외한 긍정 키워드 매치 수 카운트 (M1).
 *
 * 각 매치에 대해 매치 종료 직후 NEGATION_WINDOW(8자) 안에 부정어가 있으면
 * 해당 매치를 제외. 예: "주차장 없음" → 0건, "주차 가능" → 1건.
 * 순수 함수 — 입력 keyword는 g 플래그 없이 전달해도 안전 (내부에서 재구성).
 */
function countPositiveMatches(text: string, keyword: RegExp): number {
  const flags = keyword.flags.includes('g') ? keyword.flags : keyword.flags + 'g';
  const re = new RegExp(keyword.source, flags);
  let count = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const after = text.slice(
      m.index + m[0].length,
      m.index + m[0].length + NEGATION_WINDOW,
    );
    if (!NEGATION_AFTER.test(after)) count++;
    if (m[0].length === 0) re.lastIndex++; // zero-width 안전망
  }
  return count;
}

/**
 * detailCommon2 + detailIntro2 병합 객체에서 접근성 점수 산출.
 *
 * 보수적 채점 (DEVELOPMENT_PLAN §4.3):
 *   - overview·infocenter 텍스트만 사용 (정확한 키워드 매칭이 어려운 점 고려).
 *   - 키워드 1회 = 부분 점수, 다회 = 가산. 상한 100.
 *   - 키워드 직후 인접 부정어("없음"·"불가" 등)가 있으면 매치 제외 (M1, 보수적).
 *   - parking은 detailIntro의 parking 필드 우선 사용 — 부정 표현("불가능"이
 *     /가능/에 부분 매치되는 역전 방지를 위해) 검사를 긍정 검사보다 먼저 수행.
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

  // 대중교통 — 보수적 키워드. 부정문 제외 매치 1건당 25점, 최대 100.
  const transitMatches = countPositiveMatches(
    text,
    /버스|지하철|ktx|역에서|정류장|터미널/,
  );
  const publicTransport = Math.min(100, transitMatches * 25);

  // 주차 — detailIntro.parking 우선, 없으면 본문 키워드.
  let parking = 0;
  if (detail.parking && typeof detail.parking === 'string') {
    // M1: 부정 검사를 최우선 — "불가능"⊃"가능" 부분 매치 역전(60점) 방지
    if (/불가|없음|금지/i.test(detail.parking)) parking = 10;
    else if (/무료|free/i.test(detail.parking)) parking = 100;
    else if (/유료|가능|available/i.test(detail.parking)) parking = 60;
    else parking = 40;
  } else if (countPositiveMatches(text, /무료\s*주차/) > 0) {
    parking = 100;
  } else if (countPositiveMatches(text, /주차장|주차/) > 0) {
    parking = 50;
  } else {
    parking = 20;
  }

  // 휠체어/장애인 — 부정문 제외 매치 1건당 30점, 최대 100.
  const wheelchairMatches = countPositiveMatches(
    text,
    /장애인|엘리베이터|경사로|무장애|배리어프리/,
  );
  const wheelchair = Math.min(100, wheelchairMatches * 30);

  // 반려동물 — detailIntro.chkpet 우선. 본문 키워드도 부정문("출입 금지" 등) 제외.
  let petFriendly = false;
  if (detail.chkpet && typeof detail.chkpet === 'string') {
    petFriendly = /가능|허용|동반|ok|yes/i.test(detail.chkpet) && !/불가|금지/i.test(detail.chkpet);
  } else if (countPositiveMatches(text, /반려동물|애견|펫.{0,3}프렌들리/) > 0) {
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

// =============================================================================
// Week 8~9: 반려동물 동반 필터 (input 명세 §A-1 본격 구현)
//
// 도메인 차이 (vs Week 6~7 축제):
//   - 축제는 contentTypeId=15로 spot 자체 식별 → mergeFestivals (합치기)
//   - 반려동물은 detailPetTour2 별도 호출 필요 → filterPetFriendly (걸러내기)
//
// 검증된 가정 (2026-06-05 실측):
//   - areaBasedList2 응답에 chkpet 미포함 → 1차 필터(excludeNonPetFriendly)는 forward-compatible
//     인슈어런스이며, 현재 KorService2 본 응답에선 통과 0건이 정상.
//   - detailPetTour2는 전국 9,985건 (pageable) → 2차 폴백이 실제 필터링 주체.
//   - detailPetTour2 응답 shape = TourAPIResponse<PetInfo> (items 배열).
// =============================================================================

/**
 * pet-friendly 메타가 부착된 SpotItem.
 *
 * isPetFriendly 식별자 부착으로 다운스트림(generator·UI)이 type predicate로
 * 안전하게 분기 가능. petInfo는 2차 detailPetTour2 폴백에서 채워질 수 있음(선택).
 */
export type PetFriendlySpot = SpotItem & {
  isPetFriendly: true;
  petInfo?: PetInfo;
};

/**
 * chkpet 문자열 값을 "동반 가능" 여부로 정규화.
 *
 * 통과 (true):  "가능", "동반가능", "Y", "y" (공백 트림 후 정확 일치)
 * 차단 (false): 빈 문자열, "불가능", "N", "n", undefined, 비문자열
 *
 * 명시적 화이트리스트 — 모호한 값("일부", "조건부")은 차단(보수적).
 * 순수 함수, I/O 없음.
 */
export function isPetFriendlyChkValue(v: unknown): boolean {
  if (typeof v !== 'string') return false;
  const t = v.trim();
  return t === '가능' || t === '동반가능' || t === 'Y' || t === 'y';
}

/**
 * 타입 가드: SpotItem 또는 PetFriendlySpot 중 후자만 통과.
 *
 * Server/Client 양측 안전: 'in' 연산자 + boolean 타입 확인으로 prototype 오염 방어.
 */
export function isPetFriendly(
  spot: SpotItem | PetFriendlySpot,
): spot is PetFriendlySpot {
  return (
    'isPetFriendly' in spot &&
    (spot as PetFriendlySpot).isPetFriendly === true
  );
}

/**
 * 동기 1차 필터 — chkpet 필드만으로 분류.
 *
 * areaBasedList2 응답에 chkpet이 실재할 경우(향후 KorService2 응답 확장 시) 1차 필터로 활용.
 * 현재 KorService2 v1.6 응답에서는 chkpet 미포함이므로 항상 빈 배열 반환 (정상).
 *
 * 순수 함수. I/O 없음. 단위 테스트 가능.
 */
export function excludeNonPetFriendly(spots: SpotItem[]): PetFriendlySpot[] {
  return spots
    .filter((s) => isPetFriendlyChkValue(s.chkpet))
    .map((s) => ({ ...s, isPetFriendly: true as const }));
}

/**
 * 동시성 제한 풀 (외부 의존성 없는 p-limit 무의존 대체).
 *
 * - items의 인덱스를 atomic하게 분배하여 N개 worker가 병렬 진행.
 * - 결과는 입력 순서 보존 (results[my] = await fn(items[my])).
 * - concurrency가 items 길이보다 크면 worker 수를 items 길이로 클램프.
 */
async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];
  const results: R[] = new Array(items.length);
  let idx = 0;
  async function worker(): Promise<void> {
    while (idx < items.length) {
      const my = idx++;
      results[my] = await fn(items[my]);
    }
  }
  const workerCount = Math.min(Math.max(1, concurrency), items.length);
  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
}

/**
 * 비동기 2차 필터 — detailPetTour2 폴백 호출.
 *
 * 단계:
 *   1) excludeNonPetFriendly로 1차 chkpet 통과자 추출
 *   2) 1차 미통과 spot 중 head(maxFallback) 만 detailPetTour2 병렬 호출 (concurrency 제한)
 *   3) 응답에 PetInfo (acmpyTypeCd 또는 petInfo 보유) 있으면 통과 처리
 *
 * 비용 관리:
 *   - concurrency 기본 5 (Single-flight + Redis 캐시는 callTourAPI/Route Handler가 처리)
 *   - maxFallback 기본 20 (전체 풀 50개 중 20개만 폴백 호출)
 *   - 호출 실패는 silently swallow (개별 spot 누락만 발생, 전체 풀 보존)
 *
 * 결정성 보장:
 *   - 입력 순서 보존 (1차 통과자 → 2차 통과자)
 *   - 동일 contentid 중복은 1차 통과 우선 (Set으로 차단)
 */
export async function filterPetFriendly(
  spots: SpotItem[],
  options?: { concurrency?: number; maxFallback?: number },
): Promise<PetFriendlySpot[]> {
  const concurrency = options?.concurrency ?? 5;
  const maxFallback = options?.maxFallback ?? 20;

  // 1차 — chkpet 통과자
  const passed = excludeNonPetFriendly(spots);
  const passedIds = new Set(passed.map((s) => s.contentid));

  // 2차 폴백 후보 — 1차 미통과 + maxFallback 상한
  const candidates = spots
    .filter((s) => !passedIds.has(s.contentid))
    .slice(0, maxFallback);

  if (candidates.length === 0) return passed;

  const fallbackResults = await runWithConcurrency(
    candidates,
    concurrency,
    async (s): Promise<PetFriendlySpot | null> => {
      try {
        const res = await callTourAPI<PetInfo>('detailPetTour2', {
          contentId: s.contentid,
        });
        const item = res.items[0];
        // 동반 정보 1건 이상 + 의미 있는 필드 보유 시 통과
        if (
          item &&
          ((typeof item.acmpyTypeCd === 'string' && item.acmpyTypeCd.length > 0) ||
            (typeof item.petInfo === 'string' && item.petInfo.length > 0) ||
            (typeof item.acmpyPsblCpam === 'string' &&
              item.acmpyPsblCpam.length > 0))
        ) {
          return {
            ...s,
            isPetFriendly: true as const,
            petInfo: item,
          };
        }
      } catch {
        // detailPetTour2 호출 실패는 개별 spot 누락으로만 처리 (전체 실패 X)
      }
      return null;
    },
  );

  const fallbackPassed = fallbackResults.filter(
    (x): x is PetFriendlySpot => x !== null,
  );

  return [...passed, ...fallbackPassed];
}

/**
 * 레거시 시그니처 유지 — Map<contentId, PetInfo> 기반 CourseWaypoint 필터.
 *
 * filterByAccessibility와 동일 패턴 (이미 조회된 detail map 기반 in-memory 필터).
 * 새 코드는 filterPetFriendly(SpotItem[])을 사용 권장.
 */
export function excludeNonPetFriendlyWaypoints(
  spots: CourseWaypoint[],
  petInfoMap: Map<string, PetInfo>,
): CourseWaypoint[] {
  if (petInfoMap.size === 0) return spots;
  return spots.filter((s) => {
    const info = petInfoMap.get(s.contentId);
    if (!info) return true; // 정보 없으면 보수적으로 유지
    // acmpyPsblCpam에 "불가" 명시 시 차단
    if (typeof info.acmpyPsblCpam === 'string' && /불가|금지|x/i.test(info.acmpyPsblCpam)) {
      return false;
    }
    return true;
  });
}
