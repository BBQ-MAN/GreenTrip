// lodging.test.ts — Week 12~13 숙박 도메인 분류·필터 검증
//
// 대상: src/lib/course/lodging.ts 의
//   - annotateLodging (StayItem → LodgingItem 메타 부착)
//   - applyLodgingFilters (eco/pet/barrier AND 필터)
//
// 정책 검증 포커스:
//   - cat3 === 'B02011600' (한옥체험관) → ecoSources에 'hanok-cat3' 포함, isEcoCertified=true
//   - raw goodstay/hanok/benikia/barrierfree 필드 (forward-compat) 동작
//   - chkpet="가능" → isPetFriendly=true
//   - 다중 필터 AND 결합
//   - 순수 함수 — I/O 없음
import { describe, it, expect } from 'vitest';
import type { StayItem } from '@/types/tour';
import {
  annotateLodging,
  applyLodgingFilters,
  STAY_CAT3,
  type LodgingItem,
} from '@/lib/course/lodging';

// StayItem(=SpotItem) + forward-compat raw 필드 (KorService2 응답 미포함이지만
// 분류 로직 테스트에서는 future-shape으로 가짜 부착).
type StayWithRaw = StayItem & {
  goodstay?: string;
  hanok?: string;
  benikia?: string;
  barrierfree?: string;
};

function stay(contentid: string, extras: Partial<StayWithRaw> = {}): StayWithRaw {
  return {
    contentid,
    contenttypeid: 32,
    title: `Lodging-${contentid}`,
    addr1: '강원특별자치도',
    areacode: 32,
    mapx: 128.0 + Number(contentid) * 0.001,
    mapy: 37.8 + Number(contentid) * 0.001,
    cat1: 'B02',
    cat2: 'B0201',
    cat3: 'B02010700', // 펜션 기본
    ...extras,
  };
}

describe('annotateLodging', () => {
  it('기본 펜션(B02010700)은 모든 boolean false', () => {
    const r = annotateLodging(stay('1'));
    expect(r.isEcoCertified).toBe(false);
    expect(r.isPetFriendly).toBe(false);
    expect(r.isBarrierFree).toBe(false);
    expect(r.ecoSources).toEqual([]);
  });

  it('한옥체험관(cat3=B02011600) → hanok-cat3 출처 + isEcoCertified=true', () => {
    const r = annotateLodging(stay('2', { cat3: STAY_CAT3.한옥체험관 }));
    expect(r.isEcoCertified).toBe(true);
    expect(r.ecoSources).toContain('hanok-cat3');
    expect(r.ecoSources).toHaveLength(1);
  });

  it('STAY_CAT3.한옥체험관 상수가 B02011600 와 일치', () => {
    // 정책 안정성 확인 — 상수 변경 시 즉시 감지
    expect(STAY_CAT3.한옥체험관).toBe('B02011600');
  });

  it('raw goodstay="1" → goodstay-raw 출처 (forward-compat)', () => {
    const r = annotateLodging(stay('3', { goodstay: '1' }));
    expect(r.isEcoCertified).toBe(true);
    expect(r.ecoSources).toEqual(['goodstay-raw']);
  });

  it('raw hanok="1" → hanok-raw 출처 (forward-compat)', () => {
    const r = annotateLodging(stay('4', { hanok: '1' }));
    expect(r.isEcoCertified).toBe(true);
    expect(r.ecoSources).toEqual(['hanok-raw']);
  });

  it('raw benikia="1" → benikia-raw 출처 (forward-compat)', () => {
    const r = annotateLodging(stay('5', { benikia: '1' }));
    expect(r.isEcoCertified).toBe(true);
    expect(r.ecoSources).toEqual(['benikia-raw']);
  });

  it('cat3=한옥체험관 + hanok="1" 동시 → 양쪽 출처 OR 결합', () => {
    const r = annotateLodging(
      stay('6', { cat3: STAY_CAT3.한옥체험관, hanok: '1' }),
    );
    expect(r.isEcoCertified).toBe(true);
    expect(r.ecoSources).toContain('hanok-raw');
    expect(r.ecoSources).toContain('hanok-cat3');
    expect(r.ecoSources).toHaveLength(2);
  });

  it('raw goodstay="0" 또는 빈 문자열은 분류 안 함', () => {
    const r0 = annotateLodging(stay('7', { goodstay: '0' }));
    const r1 = annotateLodging(stay('8', { goodstay: '' }));
    expect(r0.isEcoCertified).toBe(false);
    expect(r1.isEcoCertified).toBe(false);
  });

  it('chkpet="가능" → isPetFriendly=true', () => {
    const r = annotateLodging(stay('9', { chkpet: '가능' }));
    expect(r.isPetFriendly).toBe(true);
  });

  it('chkpet="불가능" 또는 미설정 → isPetFriendly=false', () => {
    expect(annotateLodging(stay('10', { chkpet: '불가능' })).isPetFriendly).toBe(false);
    expect(annotateLodging(stay('11')).isPetFriendly).toBe(false);
  });

  it('raw barrierfree="1" → isBarrierFree=true (forward-compat)', () => {
    const r = annotateLodging(stay('12', { barrierfree: '1' }));
    expect(r.isBarrierFree).toBe(true);
  });

  it('raw barrierfree=undefined → isBarrierFree=false', () => {
    const r = annotateLodging(stay('13'));
    expect(r.isBarrierFree).toBe(false);
  });

  it('메타 부착 시 원본 필드(title, mapx, cat3 등) 모두 보존', () => {
    const raw = stay('14', { cat3: STAY_CAT3.한옥체험관, chkpet: '가능' });
    const r = annotateLodging(raw);
    expect(r.contentid).toBe(raw.contentid);
    expect(r.title).toBe(raw.title);
    expect(r.mapx).toBe(raw.mapx);
    expect(r.cat3).toBe(raw.cat3);
    expect(r.chkpet).toBe(raw.chkpet);
  });
});

describe('applyLodgingFilters', () => {
  function items(): LodgingItem[] {
    return [
      annotateLodging(stay('1')), // 기본 (모두 false)
      annotateLodging(stay('2', { cat3: STAY_CAT3.한옥체험관 })), // eco only
      annotateLodging(stay('3', { chkpet: '가능' })), // pet only
      annotateLodging(stay('4', { barrierfree: '1' })), // barrier only
      annotateLodging(
        stay('5', {
          cat3: STAY_CAT3.한옥체험관,
          chkpet: '가능',
          barrierfree: '1',
        }),
      ), // all three
    ];
  }

  it('옵션 모두 false → 입력 그대로 반환 (early exit)', () => {
    const list = items();
    const r = applyLodgingFilters(list, { eco: false, pet: false, barrier: false });
    expect(r).toBe(list); // 동일 참조 반환
    expect(r).toHaveLength(5);
  });

  it('eco=true → isEcoCertified만 통과 (2, 5)', () => {
    const r = applyLodgingFilters(items(), { eco: true, pet: false, barrier: false });
    expect(r.map((x) => x.contentid)).toEqual(['2', '5']);
  });

  it('pet=true → isPetFriendly만 통과 (3, 5)', () => {
    const r = applyLodgingFilters(items(), { eco: false, pet: true, barrier: false });
    expect(r.map((x) => x.contentid)).toEqual(['3', '5']);
  });

  it('barrier=true → isBarrierFree만 통과 (4, 5)', () => {
    const r = applyLodgingFilters(items(), { eco: false, pet: false, barrier: true });
    expect(r.map((x) => x.contentid)).toEqual(['4', '5']);
  });

  it('eco + pet AND 결합 → 둘 다 충족 (5)', () => {
    const r = applyLodgingFilters(items(), { eco: true, pet: true, barrier: false });
    expect(r.map((x) => x.contentid)).toEqual(['5']);
  });

  it('eco + pet + barrier 셋 다 → 한 건(5)만', () => {
    const r = applyLodgingFilters(items(), { eco: true, pet: true, barrier: true });
    expect(r.map((x) => x.contentid)).toEqual(['5']);
  });

  it('빈 입력은 빈 배열 반환', () => {
    expect(applyLodgingFilters([], { eco: true, pet: true, barrier: true })).toEqual([]);
    expect(applyLodgingFilters([], { eco: false, pet: false, barrier: false })).toEqual([]);
  });
});
