// 숙박 도메인 분류·필터 — Phase 2 Week 12~13 본격 구현
//
// 책임 분리:
//   - src/types/tour.ts: KorService2 실측 raw 필드(SpotItem/StayItem)만 유지.
//   - src/lib/course/filters.ts: 일반 필터(접근성·축제·반려동물). chkpet 정규화.
//   - src/lib/course/lodging.ts: 숙박 도메인 메타 타입·분류 정책·필터 (이 파일).
//
// 친환경 분류 정책 (KorService2 v1.6 실측 후 결정 — 2026-06-05):
//   - searchStay2 응답에 goodstay/hanok/benikia/barrierfree/chkpet 모두 미포함
//     (강원 areaCode=32, 461건 표본 중 0/20 확인).
//   - cat3 코드 'B02011600'(한옥체험관)을 hanok 친환경 분류 결정적 기준으로 채택.
//   - raw goodstay/hanok/benikia/barrierfree 필드는 forward-compat (KorService2
//     응답 확장 또는 다른 지역에서 발견될 시 자동 활용).
//
// 보수적·결정적 분류:
//   - 텍스트 키워드 매칭 X (false-positive 위험).
//   - cat3 코드 + raw 필드 OR 결합만으로 분류 (결정적).
import type { StayItem } from '@/types/tour';
import { isPetFriendlyChkValue } from './filters';

/**
 * 숙박 카테고리 그룹 — cat3 매핑.
 *
 * 강원 카테고리 분포 (areaCode=32, 461건 표본):
 *   - B02010700 (펜션): 23
 *   - B02010900 (게스트하우스): 17
 *   - B02010100 (관광호텔): 7
 *   - B02011600 (한옥체험관): 0~1 (강원 표본 외 다른 지역에서 발견)
 *   - B02010500 (가족호텔, benikia 후보): 1
 *   - B02011100 (휴양콘도미니엄): 1
 *
 * 친환경 분류는 STAY_CAT3.한옥체험관 만 사용 (보수적·결정적).
 */
export const STAY_CAT3 = {
  관광호텔: 'B02010100',
  수상관광호텔: 'B02010200',
  전통호텔: 'B02010300',
  가족호텔: 'B02010500',
  호스텔: 'B02010600',
  펜션: 'B02010700',
  모텔: 'B02010800',
  게스트하우스: 'B02010900',
  홈스테이: 'B02011000',
  서비스드레지던스: 'B02011100',
  민박: 'B02011200',
  한옥체험관: 'B02011600',
} as const;

/**
 * GreenTrip 도메인 — 친환경/펫/접근성 메타가 부착된 숙박 아이템.
 *
 * 단일 진원지 (LodgingItem) — Route Handler가 정규화 후 반환, UI/훅에서 import.
 *
 * 메타 정의 (KorService2 v1.6 정책, 보수적):
 *   - isEcoCertified: 다음 중 1개 이상
 *       (a) raw goodstay === '1' (forward-compat)
 *       (b) raw hanok === '1' (forward-compat)
 *       (c) raw benikia === '1' (forward-compat)
 *       (d) cat3 === 'B02011600' (한옥체험관) — 결정적 카테고리 분류
 *   - isPetFriendly: isPetFriendlyChkValue(chkpet) — 현재 KorService2 응답에서 0건 정상.
 *   - isBarrierFree: raw barrierfree === '1' — 현재 0건 정상 (forward-compat).
 *   - ecoSources: 부착된 인증/분류 출처 배열 (디버깅·UI 표시용).
 */
export interface LodgingItem extends StayItem {
  isEcoCertified: boolean;
  isPetFriendly: boolean;
  isBarrierFree: boolean;
  ecoSources: string[];
}

/**
 * raw StayItem에서 KorService1 시절 boolean 필드(goodstay/hanok/benikia/barrierfree)를
 * 안전하게 읽기 위한 lookup. StayItem 타입에 선언하지 않고(KorService2 실측 0건),
 * Record 캐스팅으로 future-compatible 접근.
 *
 * 값이 string '1' 일 때만 true. 빈 문자열·undefined·'0' 등은 false.
 */
function readRawFlag(raw: StayItem, key: string): boolean {
  const v = (raw as unknown as Record<string, unknown>)[key];
  return v === '1';
}

/**
 * StayItem(raw) → LodgingItem(메타 부착) 변환.
 *
 * 분류 우선순위 (보수적·결정적):
 *   1. raw goodstay/hanok/benikia === '1' (KorService2 응답 확장 시 자동 활용)
 *   2. cat3 === STAY_CAT3.한옥체험관 → hanok (현재 KorService2의 유일한 결정적 hanok 신호)
 *
 * ecoSources 예시:
 *   - ['hanok-cat3']           — cat3 기반 한옥
 *   - ['goodstay-raw']         — raw 필드 기반 우수숙박 (forward-compat)
 *   - ['hanok-raw','hanok-cat3'] — 양쪽 매치 (OR)
 *
 * 순수 함수. I/O 없음.
 */
export function annotateLodging(raw: StayItem): LodgingItem {
  const sources: string[] = [];

  // raw KorService1 시절 필드 (forward-compatible — 현재 KorService2 응답에서 모두 0건)
  if (readRawFlag(raw, 'goodstay')) sources.push('goodstay-raw');
  if (readRawFlag(raw, 'hanok')) sources.push('hanok-raw');
  if (readRawFlag(raw, 'benikia')) sources.push('benikia-raw');

  // cat3 기반 한옥체험관 — KorService2에서 hanok 친환경 분류의 유일한 결정적 신호
  if (raw.cat3 === STAY_CAT3.한옥체험관) sources.push('hanok-cat3');

  const isEcoCertified = sources.length > 0;
  const isPetFriendly = isPetFriendlyChkValue(raw.chkpet);
  const isBarrierFree = readRawFlag(raw, 'barrierfree');

  return {
    ...raw,
    isEcoCertified,
    isPetFriendly,
    isBarrierFree,
    ecoSources: sources,
  };
}

/**
 * 필터 옵션 적용 — 다중 옵션은 AND 결합.
 *
 * 어떤 옵션도 활성 아니면 입력 그대로 반환 (early exit, 동일 참조).
 *
 * 순수 함수. I/O 없음.
 */
export function applyLodgingFilters(
  items: LodgingItem[],
  options: { eco: boolean; pet: boolean; barrier: boolean },
): LodgingItem[] {
  if (!options.eco && !options.pet && !options.barrier) return items;
  return items.filter((i) => {
    if (options.eco && !i.isEcoCertified) return false;
    if (options.pet && !i.isPetFriendly) return false;
    if (options.barrier && !i.isBarrierFree) return false;
    return true;
  });
}
