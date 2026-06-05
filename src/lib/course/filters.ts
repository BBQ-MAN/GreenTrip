// 축제·반려동물·접근성 필터
// 참조: DEVELOPMENT_PLAN.md §4.3 (접근성 점수)
//
// Week 3 본격 구현:
//   - calculateAccessibility (overview·infocenter 키워드 매칭, 보수적)
//   - filterByAccessibility (점수 임계값 필터)
// Week 6~7 본격:
//   - mergeFestivals (시그니처만)
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
 * 축제 병합 — Week 6~7 본격 구현. 시그니처만 제공.
 *
 * daterange 내 진행 중인 축제를 spots 사이에 삽입.
 * 우선 시점은 좌표 근접도 기반 (가장 가까운 spot 다음 위치).
 */
export function mergeFestivals(
  spots: CourseWaypoint[],
  festivals: FestivalItem[],
  daterange: { start: string; end: string },
): CourseWaypoint[] {
  // TODO Week 6~7: daterange 필터링 + 좌표 기반 삽입
  void festivals;
  void daterange;
  return spots;
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
