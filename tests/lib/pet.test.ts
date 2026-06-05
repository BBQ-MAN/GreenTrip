// pet.test.ts — Week 8~9 반려동물 동반 필터 검증
// 대상: src/lib/course/filters.ts 의
//   - isPetFriendlyChkValue (chkpet 값 정규화)
//   - isPetFriendly (타입 가드)
//   - excludeNonPetFriendly (동기 1차 chkpet 필터)
//   - filterPetFriendly (1차 + detailPetTour2 2차 폴백, mock 사용)
//   - excludeNonPetFriendlyWaypoints (레거시 Map 기반)
//
// 원칙: 순수 함수 단위 우선. 비동기 filterPetFriendly는 callTourAPI를 vi.mock으로 대체.
// 검증된 응답 shape (2026-06-05 detailPetTour2 실측):
//   { acmpyTypeCd: "전구역 동반가능", acmpyPsblCpam: "전 견종 동반 가능", ... }
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SpotItem, PetInfo } from '@/types/tour';
import type { CourseWaypoint } from '@/types/course';

// callTourAPI mock — filterPetFriendly에서 detailPetTour2 호출 시뮬레이션
vi.mock('@/lib/tourapi/client', () => ({
  callTourAPI: vi.fn(),
  TourAPIError: class extends Error {
    constructor(
      public code: string,
      public msg: string,
      public endpoint: string,
    ) {
      super(`${endpoint}: ${code} - ${msg}`);
    }
  },
}));

import { callTourAPI } from '@/lib/tourapi/client';
import {
  isPetFriendlyChkValue,
  isPetFriendly,
  excludeNonPetFriendly,
  filterPetFriendly,
  excludeNonPetFriendlyWaypoints,
  type PetFriendlySpot,
} from '@/lib/course/filters';

function spot(contentid: string, extras: Partial<SpotItem> = {}): SpotItem {
  return {
    contentid,
    contenttypeid: 12,
    title: `Spot-${contentid}`,
    addr1: '강원특별자치도',
    areacode: 32,
    mapx: 128.0 + Number(contentid) * 0.001,
    mapy: 37.8 + Number(contentid) * 0.001,
    ...extras,
  };
}

function waypoint(contentId: string, extras: Partial<CourseWaypoint> = {}): CourseWaypoint {
  return {
    contentId,
    title: `WP-${contentId}`,
    lat: 37.5,
    lng: 127.0,
    contentType: 12,
    ...extras,
  };
}

// =============================================================================
// isPetFriendlyChkValue — 값 화이트리스트 검증
// =============================================================================
describe('isPetFriendlyChkValue', () => {
  it('"가능" → true', () => {
    expect(isPetFriendlyChkValue('가능')).toBe(true);
  });

  it('"동반가능" → true', () => {
    expect(isPetFriendlyChkValue('동반가능')).toBe(true);
  });

  it('"Y" 대문자 → true', () => {
    expect(isPetFriendlyChkValue('Y')).toBe(true);
  });

  it('"y" 소문자 → true', () => {
    expect(isPetFriendlyChkValue('y')).toBe(true);
  });

  it('앞뒤 공백 trim 후 일치 → true', () => {
    expect(isPetFriendlyChkValue('  가능  ')).toBe(true);
    expect(isPetFriendlyChkValue('\tY\n')).toBe(true);
  });

  it('"불가능" → false', () => {
    expect(isPetFriendlyChkValue('불가능')).toBe(false);
  });

  it('"N"/"n" → false', () => {
    expect(isPetFriendlyChkValue('N')).toBe(false);
    expect(isPetFriendlyChkValue('n')).toBe(false);
  });

  it('빈 문자열 → false', () => {
    expect(isPetFriendlyChkValue('')).toBe(false);
    expect(isPetFriendlyChkValue('   ')).toBe(false);
  });

  it('undefined·null·숫자·boolean → false', () => {
    expect(isPetFriendlyChkValue(undefined)).toBe(false);
    expect(isPetFriendlyChkValue(null)).toBe(false);
    expect(isPetFriendlyChkValue(1)).toBe(false);
    expect(isPetFriendlyChkValue(true)).toBe(false);
  });

  it('모호한 값("일부", "조건부")은 보수적으로 false', () => {
    expect(isPetFriendlyChkValue('일부 가능')).toBe(false);
    expect(isPetFriendlyChkValue('조건부')).toBe(false);
    expect(isPetFriendlyChkValue('YES')).toBe(false); // 대소문자 정확 일치
  });
});

// =============================================================================
// excludeNonPetFriendly — 동기 1차 chkpet 필터
// =============================================================================
describe('excludeNonPetFriendly', () => {
  it('chkpet="가능"만 통과', () => {
    const result = excludeNonPetFriendly([
      spot('1', { chkpet: '가능' }),
      spot('2', { chkpet: '불가능' }),
      spot('3', { chkpet: 'Y' }),
      spot('4'), // chkpet 없음
    ]);
    expect(result.map((s) => s.contentid)).toEqual(['1', '3']);
  });

  it('빈 입력 → 빈 배열', () => {
    expect(excludeNonPetFriendly([])).toEqual([]);
  });

  it('통과 spot은 isPetFriendly=true 메타 부착 (PetFriendlySpot)', () => {
    const result = excludeNonPetFriendly([spot('1', { chkpet: '가능' })]);
    expect(result).toHaveLength(1);
    expect(result[0].isPetFriendly).toBe(true);
    expect(result[0].contentid).toBe('1');
    expect(result[0].title).toBe('Spot-1');
  });

  it('chkpet 미포함 spot 전체 (현재 KorService2 areaBasedList2 응답 상태) → 0건', () => {
    const result = excludeNonPetFriendly([spot('1'), spot('2'), spot('3')]);
    expect(result).toEqual([]);
  });

  it('원본 SpotItem 필드는 모두 보존', () => {
    const original = spot('1', {
      chkpet: '가능',
      addr1: '강원도 평창',
      firstimage: 'https://example.com/img.jpg',
    });
    const result = excludeNonPetFriendly([original]);
    expect(result[0].addr1).toBe('강원도 평창');
    expect(result[0].firstimage).toBe('https://example.com/img.jpg');
  });
});

// =============================================================================
// isPetFriendly — 타입 가드
// =============================================================================
describe('isPetFriendly', () => {
  it('isPetFriendly=true인 spot → true', () => {
    const s: PetFriendlySpot = { ...spot('1'), isPetFriendly: true };
    expect(isPetFriendly(s)).toBe(true);
  });

  it('일반 SpotItem → false (isPetFriendly 키 없음)', () => {
    expect(isPetFriendly(spot('1'))).toBe(false);
  });

  it('SpotItem에 isPetFriendly=false가 강제 부착되어도 false (type predicate)', () => {
    // 일반 SpotItem에는 이 키가 없지만 런타임 안전성 검증
    const fake = { ...spot('1'), isPetFriendly: false } as unknown as SpotItem;
    expect(isPetFriendly(fake)).toBe(false);
  });
});

// =============================================================================
// filterPetFriendly — 1차 + 2차 폴백 mock 시나리오
// =============================================================================
describe('filterPetFriendly', () => {
  const mockedCall = vi.mocked(callTourAPI);

  beforeEach(() => {
    mockedCall.mockReset();
  });

  it('1차 통과자만으로 충분하면 detailPetTour2 호출 0회 (chkpet 통과 + maxFallback=0)', async () => {
    const result = await filterPetFriendly(
      [
        spot('1', { chkpet: '가능' }),
        spot('2', { chkpet: '불가능' }),
      ],
      { maxFallback: 0 },
    );
    expect(result).toHaveLength(1);
    expect(result[0].contentid).toBe('1');
    expect(mockedCall).not.toHaveBeenCalled();
  });

  it('2차 폴백 — detailPetTour2가 PetInfo 반환하면 통과', async () => {
    mockedCall.mockImplementation(async (endpoint, params) => {
      expect(endpoint).toBe('detailPetTour2');
      // contentId='1' → 통과, '2' → 빈 응답
      if (params?.contentId === '1') {
        return {
          items: [
            {
              contentid: '1',
              acmpyTypeCd: '전구역 동반가능',
              acmpyPsblCpam: '전 견종 동반 가능',
              acmpyNeedMtr: '목줄 착용',
            } as PetInfo,
          ],
          totalCount: 1,
          pageNo: 1,
          numOfRows: 1,
        };
      }
      return { items: [], totalCount: 0, pageNo: 1, numOfRows: 0 };
    });

    const result = await filterPetFriendly([spot('1'), spot('2')]);
    expect(result.map((s) => s.contentid)).toEqual(['1']);
    expect(result[0].petInfo?.acmpyTypeCd).toBe('전구역 동반가능');
    expect(mockedCall).toHaveBeenCalledTimes(2);
  });

  it('1차 통과자는 2차 호출에서 제외 (중복 방지)', async () => {
    mockedCall.mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNo: 1,
      numOfRows: 0,
    });

    const result = await filterPetFriendly([
      spot('1', { chkpet: '가능' }), // 1차 통과
      spot('2'), // 2차 후보
    ]);

    expect(result.map((s) => s.contentid)).toEqual(['1']);
    // contentId=2만 호출됐는지
    expect(mockedCall).toHaveBeenCalledTimes(1);
    expect(mockedCall).toHaveBeenCalledWith('detailPetTour2', { contentId: '2' });
  });

  it('maxFallback 상한으로 폴백 호출 제한', async () => {
    mockedCall.mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNo: 1,
      numOfRows: 0,
    });

    const spots = Array.from({ length: 30 }, (_, i) => spot(String(i + 1)));
    await filterPetFriendly(spots, { maxFallback: 5 });
    expect(mockedCall).toHaveBeenCalledTimes(5);
  });

  it('detailPetTour2 호출 실패는 swallow (전체 풀 보존)', async () => {
    mockedCall.mockImplementation(async (_endpoint, params) => {
      if (params?.contentId === '1') {
        throw new Error('Network error');
      }
      return {
        items: [
          {
            contentid: String(params?.contentId),
            acmpyTypeCd: '전구역 동반가능',
          } as PetInfo,
        ],
        totalCount: 1,
        pageNo: 1,
        numOfRows: 1,
      };
    });

    const result = await filterPetFriendly([spot('1'), spot('2')]);
    // 1은 에러로 누락, 2는 통과
    expect(result.map((s) => s.contentid)).toEqual(['2']);
  });

  it('빈 입력 → 빈 배열, 호출 0회', async () => {
    const result = await filterPetFriendly([]);
    expect(result).toEqual([]);
    expect(mockedCall).not.toHaveBeenCalled();
  });

  it('응답이 의미 없는 빈 PetInfo면 통과 X', async () => {
    mockedCall.mockResolvedValue({
      items: [{ contentid: '1' } as PetInfo], // acmpyTypeCd·petInfo·acmpyPsblCpam 전부 없음
      totalCount: 1,
      pageNo: 1,
      numOfRows: 1,
    });

    const result = await filterPetFriendly([spot('1')]);
    expect(result).toEqual([]);
  });

  it('concurrency 제한 — items=10·concurrency=2일 때 worker 2개로 동작 (총 호출 횟수만 검증)', async () => {
    mockedCall.mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNo: 1,
      numOfRows: 0,
    });
    const spots = Array.from({ length: 10 }, (_, i) => spot(String(i + 1)));
    await filterPetFriendly(spots, { concurrency: 2, maxFallback: 10 });
    expect(mockedCall).toHaveBeenCalledTimes(10);
  });
});

// =============================================================================
// excludeNonPetFriendlyWaypoints — 레거시 Map 기반
// =============================================================================
describe('excludeNonPetFriendlyWaypoints', () => {
  it('petInfoMap 비어있으면 입력 그대로', () => {
    const spots = [waypoint('1'), waypoint('2')];
    expect(excludeNonPetFriendlyWaypoints(spots, new Map())).toEqual(spots);
  });

  it('Map에 정보 없는 spot은 보수적으로 유지', () => {
    const spots = [waypoint('1'), waypoint('2')];
    const map = new Map<string, PetInfo>([
      ['3', { contentid: '3', acmpyPsblCpam: '전 견종' }],
    ]);
    const result = excludeNonPetFriendlyWaypoints(spots, map);
    expect(result).toHaveLength(2);
  });

  it('acmpyPsblCpam에 "불가" 명시되면 제거', () => {
    const spots = [waypoint('1'), waypoint('2')];
    const map = new Map<string, PetInfo>([
      ['1', { contentid: '1', acmpyPsblCpam: '동반 불가' }],
      ['2', { contentid: '2', acmpyPsblCpam: '전 견종 가능' }],
    ]);
    const result = excludeNonPetFriendlyWaypoints(spots, map);
    expect(result.map((s) => s.contentId)).toEqual(['2']);
  });
});
