// accessibility.test.ts — calculateAccessibility 부정문 위양성 회귀 방지
// 2026-06-11 재감사 M1: 부정 표현("없음"·"불가"·"불가능")이 긍정 점수를 만드는
// 결함 수정 검증. 재감사 실측 케이스 4건 + 긍정 대조군.
import { describe, it, expect } from 'vitest';
import { calculateAccessibility, filterByAccessibility } from '@/lib/course/filters';
import type { AccessibilityScore } from '@/types/carbon';
import type { CourseWaypoint } from '@/types/course';

describe('calculateAccessibility — 부정문 위양성 (재감사 M1 실측 케이스)', () => {
  it('overview "주차장 없음" → parking 50점 아님 (기본 20점)', () => {
    // 재감사 실측: 구구현은 50점 (주차 양호로 오판)
    const r = calculateAccessibility({ overview: '주차장 없음' });
    expect(r.parking).toBe(20);
  });

  it('overview "주차 불가" → parking 50점 아님 (기본 20점)', () => {
    // 재감사 실측: 구구현은 본문 분기에서 부정어 무시 → 50점
    const r = calculateAccessibility({ overview: '주차 불가' });
    expect(r.parking).toBe(20);
  });

  it('overview "장애인 화장실 없음" → wheelchair 0점', () => {
    // 재감사 실측: 구구현은 "장애인" 매치로 30점
    const r = calculateAccessibility({ overview: '장애인 화장실 없음' });
    expect(r.wheelchair).toBe(0);
  });

  it('parking 필드 "주차 불가능" → 10점 ("불가능"⊃"가능" 역전 60점 해소)', () => {
    // 재감사 실측(가장 심각): 구구현은 /유료|가능/ 선평가로 60점
    const r = calculateAccessibility({ parking: '주차 불가능' });
    expect(r.parking).toBe(10);
  });

  it('parking 필드 "주차 불가" / "주차장 없음" → 10점', () => {
    expect(calculateAccessibility({ parking: '주차 불가' }).parking).toBe(10);
    expect(calculateAccessibility({ parking: '주차장 없음' }).parking).toBe(10);
  });

  it('대중교통 부정문 "버스 없음" → 0점 (보수적 동일 원칙)', () => {
    const r = calculateAccessibility({ overview: '버스 없음' });
    expect(r.publicTransport).toBe(0);
  });

  it('반려동물 본문 부정문 "반려동물 출입 금지" → false', () => {
    const r = calculateAccessibility({ overview: '반려동물 출입 금지' });
    expect(r.petFriendly).toBe(false);
  });
});

describe('calculateAccessibility — 긍정 신호는 유지 (과잉 차단 방지)', () => {
  it('parking 필드 "무료" → 100, "가능" → 60', () => {
    expect(calculateAccessibility({ parking: '무료 주차' }).parking).toBe(100);
    expect(calculateAccessibility({ parking: '주차 가능' }).parking).toBe(60);
  });

  it('overview "무료 주차 운영" → 100, "주차장 완비" → 50', () => {
    expect(calculateAccessibility({ overview: '무료 주차 운영' }).parking).toBe(100);
    expect(calculateAccessibility({ overview: '주차장 완비' }).parking).toBe(50);
  });

  it('overview "장애인 화장실 완비, 엘리베이터 운영" → wheelchair 60', () => {
    const r = calculateAccessibility({
      overview: '장애인 화장실 완비, 엘리베이터 운영',
    });
    expect(r.wheelchair).toBe(60);
  });

  it('overview "버스 정류장 도보 5분" → publicTransport 50 (버스+정류장 2건)', () => {
    const r = calculateAccessibility({ overview: '버스 정류장 도보 5분' });
    expect(r.publicTransport).toBe(50);
  });

  it('chkpet "가능" → petFriendly true, "불가능" → false', () => {
    expect(calculateAccessibility({ chkpet: '가능' }).petFriendly).toBe(true);
    expect(calculateAccessibility({ chkpet: '불가능' }).petFriendly).toBe(false);
  });

  it('빈 입력 → 기본값 (publicTransport 0, parking 20, wheelchair 0, pet false)', () => {
    const r = calculateAccessibility({});
    expect(r.publicTransport).toBe(0);
    expect(r.parking).toBe(20);
    expect(r.wheelchair).toBe(0);
    expect(r.petFriendly).toBe(false);
  });
});

describe('filterByAccessibility — 기존 계약 유지', () => {
  const wp = (id: string): CourseWaypoint => ({
    contentId: id,
    title: id,
    lat: 37.5,
    lng: 127.0,
    contentType: 12,
  });
  const score = (pt: number, wc: number): AccessibilityScore => ({
    publicTransport: pt,
    parking: 0,
    wheelchair: wc,
    petFriendly: false,
  });

  it('빈 map이면 입력 그대로', () => {
    const spots = [wp('a'), wp('b')];
    expect(filterByAccessibility(spots, new Map(), 50)).toEqual(spots);
  });

  it('public+wheelchair 평균이 임계 미만이면 제외, 정보 없는 spot은 통과', () => {
    const map = new Map<string, AccessibilityScore>([
      ['a', score(100, 60)], // avg 80 → 통과
      ['b', score(25, 0)], // avg 12.5 → 제외
    ]);
    const out = filterByAccessibility([wp('a'), wp('b'), wp('c')], map, 50);
    expect(out.map((s) => s.contentId)).toEqual(['a', 'c']);
  });
});
