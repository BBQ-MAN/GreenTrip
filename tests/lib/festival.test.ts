// festival.test.ts — Week 6~7 축제 통합 알고리즘 검증
// 대상: src/lib/course/filters.ts 의 rangeOverlaps · durationToDateRange · isFestival · mergeFestivals
//
// 원칙: 순수 함수 단위. I/O 없음.
//   - 날짜 단위 = YYYYMMDD 8자리 (KorService2 컨벤션)
//   - 축제 contenttypeid = 15 (CONTENT_TYPE.축제공연행사)
//   - durationToDateRange는 KST 오늘 기준이므로 startDate 명시 분기로 결정성 확보.
import { describe, it, expect } from 'vitest';
import {
  rangeOverlaps,
  durationToDateRange,
  isFestival,
  mergeFestivals,
  type DateRange,
  type FestivalSpot,
} from '@/lib/course/filters';
import type { CourseWaypoint } from '@/types/course';
import type { FestivalItem } from '@/types/tour';

function wp(contentId: string, lat = 37.5, lng = 127.0, contentType = 12): CourseWaypoint {
  return { contentId, title: contentId, lat, lng, contentType };
}

function fest(
  contentid: string,
  start: string,
  end: string,
  extras: Partial<FestivalItem> = {},
): FestivalItem {
  return {
    contentid,
    contenttypeid: 15,
    title: `축제-${contentid}`,
    addr1: '강원',
    areacode: 32,
    mapx: 128.0,
    mapy: 37.8,
    eventstartdate: start,
    eventenddate: end,
    ...extras,
  };
}

// =============================================================================
// rangeOverlaps
// =============================================================================
describe('rangeOverlaps', () => {
  const base: DateRange = { start: '20260605', end: '20260606' };

  it('완전 분리(이전) → false', () => {
    expect(rangeOverlaps({ start: '20260601', end: '20260603' }, base)).toBe(false);
  });

  it('완전 분리(이후) → false', () => {
    expect(rangeOverlaps({ start: '20260608', end: '20260610' }, base)).toBe(false);
  });

  it('정확히 같은 범위 → true', () => {
    expect(rangeOverlaps({ start: '20260605', end: '20260606' }, base)).toBe(true);
  });

  it('1일만 겹침 (시작이 끝과 같음) → true (닫힌 구간)', () => {
    expect(rangeOverlaps({ start: '20260606', end: '20260610' }, base)).toBe(true);
    expect(rangeOverlaps({ start: '20260601', end: '20260605' }, base)).toBe(true);
  });

  it('포함 관계 (b가 a 안) → true', () => {
    expect(rangeOverlaps({ start: '20260101', end: '20261231' }, base)).toBe(true);
  });

  it('비정상 입력(빈 문자열) → false', () => {
    expect(rangeOverlaps({ start: '', end: '20260606' }, base)).toBe(false);
  });

  it('비정상 입력(7자리) → false', () => {
    expect(rangeOverlaps({ start: '2026060', end: '20260606' }, base)).toBe(false);
  });

  it('start > end 비정상 → false', () => {
    expect(rangeOverlaps({ start: '20260610', end: '20260601' }, base)).toBe(false);
  });
});

// =============================================================================
// durationToDateRange
// =============================================================================
describe('durationToDateRange', () => {
  const today = '20260605';

  it('당일 → start === end', () => {
    const r = durationToDateRange('당일', today);
    expect(r.start).toBe('20260605');
    expect(r.end).toBe('20260605');
  });

  it('1박2일 → end = start + 1일', () => {
    const r = durationToDateRange('1박2일', today);
    expect(r.start).toBe('20260605');
    expect(r.end).toBe('20260606');
  });

  it('2박3일 → end = start + 2일', () => {
    const r = durationToDateRange('2박3일', today);
    expect(r.start).toBe('20260605');
    expect(r.end).toBe('20260607');
  });

  it('월말 경계 통과 (1박2일 6/30 → 7/1)', () => {
    const r = durationToDateRange('1박2일', '20260630');
    expect(r.end).toBe('20260701');
  });

  it('연말 경계 통과 (2박3일 12/30 → 1/1)', () => {
    const r = durationToDateRange('2박3일', '20261230');
    expect(r.end).toBe('20270101');
  });

  it('윤년 2월 경계 (2박3일 2/28 2024 → 3/1 2024)', () => {
    // 2024는 윤년 → 2/28+2 = 3/1
    const r = durationToDateRange('2박3일', '20240228');
    expect(r.end).toBe('20240301');
  });

  it('startDate 미지정 시 today 사용 (정상 YYYYMMDD 8자리 반환)', () => {
    const r = durationToDateRange('당일');
    expect(r.start).toMatch(/^\d{8}$/);
    expect(r.end).toBe(r.start);
  });

  it('잘못된 startDate(빈 문자열)은 today fallback', () => {
    const r = durationToDateRange('당일', '');
    expect(r.start).toMatch(/^\d{8}$/);
  });
});

// =============================================================================
// isFestival 타입 가드
// =============================================================================
describe('isFestival', () => {
  it('contenttypeid=15 + eventstartdate 있으면 true', () => {
    const f = fest('100', '20260605', '20260610');
    expect(isFestival(f)).toBe(true);
  });

  it('contenttypeid=12면 false', () => {
    const f = { contenttypeid: 12, eventstartdate: '20260605' };
    expect(isFestival(f)).toBe(false);
  });

  it('contenttypeid=15여도 eventstartdate 없으면 false', () => {
    const f = { contenttypeid: 15 };
    expect(isFestival(f)).toBe(false);
  });

  it('eventstartdate가 빈 문자열이면 false', () => {
    const f = { contenttypeid: 15, eventstartdate: '' };
    expect(isFestival(f)).toBe(false);
  });
});

// =============================================================================
// mergeFestivals
// =============================================================================
describe('mergeFestivals', () => {
  const range: DateRange = { start: '20260605', end: '20260607' };
  const spotA = wp('S1', 37.881, 127.730);
  const spotB = wp('S2', 37.752, 128.876);

  it('겹치지 않는 축제는 제외', () => {
    const festivals: FestivalItem[] = [
      fest('F1', '20260601', '20260603'), // 종료 전
      fest('F2', '20260608', '20260610'), // 시작 후
    ];
    const result = mergeFestivals([spotA, spotB], festivals, range);
    expect(result).toHaveLength(2); // 축제 0건
    expect(result.map((s) => s.contentId)).toEqual(['S1', 'S2']);
  });

  it('겹치는 축제만 통합 + 축제 우선 배치', () => {
    const festivals: FestivalItem[] = [
      fest('F1', '20260606', '20260610'), // overlap
      fest('F2', '20260601', '20260603'), // no overlap
      fest('F3', '20260607', '20260609'), // overlap
    ];
    const result = mergeFestivals([spotA, spotB], festivals, range);
    // 축제 2개(F1, F3)가 앞에, 기존 spots는 뒤에
    expect(result.map((s) => s.contentId)).toEqual(['F1', 'F3', 'S1', 'S2']);
  });

  it('contentid 중복 시 기존 spot 우선 (축제 측 버림)', () => {
    const dup = wp('F1', 37.5, 127.5); // 같은 contentid의 기존 spot
    const festivals: FestivalItem[] = [
      fest('F1', '20260605', '20260606'), // overlap이지만 spots에 이미 있음
    ];
    const result = mergeFestivals([dup, spotA], festivals, range);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.contentId)).toEqual(['F1', 'S1']);
    // 기존 spot의 좌표가 보존되었는지 확인 (축제로 덮어쓰지 않음)
    expect(result[0].lat).toBe(37.5);
    expect(result[0].lng).toBe(127.5);
  });

  it('축제 contentType 매핑 — 결과 항목은 contentType=15', () => {
    const festivals: FestivalItem[] = [fest('F1', '20260605', '20260606')];
    const result = mergeFestivals([], festivals, range);
    expect(result[0].contentType).toBe(15);
  });

  it('축제 자체 중복(contentid 동일) 제거', () => {
    const festivals: FestivalItem[] = [
      fest('F1', '20260605', '20260606'),
      fest('F1', '20260605', '20260606'), // 동일 ID 중복
    ];
    const result = mergeFestivals([], festivals, range);
    expect(result).toHaveLength(1);
  });

  it('좌표 무효 축제 제외 (mapx=0/mapy=0)', () => {
    const festivals: FestivalItem[] = [
      fest('F1', '20260605', '20260606', { mapx: 0, mapy: 0 }),
      fest('F2', '20260605', '20260606'),
    ];
    const result = mergeFestivals([], festivals, range);
    expect(result.map((s) => s.contentId)).toEqual(['F2']);
  });

  it('eventstartdate가 비정상 형식이면 자동 탈락', () => {
    const festivals: FestivalItem[] = [
      fest('F1', '2026', '20260606'), // 잘못된 형식
      fest('F2', '20260605', '20260606'),
    ];
    const result = mergeFestivals([], festivals, range);
    expect(result.map((s) => s.contentId)).toEqual(['F2']);
  });

  it('빈 축제 배열 → 기존 spots 그대로', () => {
    const result = mergeFestivals([spotA, spotB], [], range);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.contentId)).toEqual(['S1', 'S2']);
  });

  it('FestivalSpot 타입 별칭은 FestivalItem과 호환', () => {
    // 타입 레벨 호환성 컴파일 타임 보장 — 런타임 검증.
    const f: FestivalSpot = fest('F1', '20260605', '20260606');
    expect(f.contenttypeid).toBe(15);
  });
});
