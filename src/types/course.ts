// 코스 도메인 타입 — Prisma 모델을 도메인 진원지로 재사용
// 참조: DEVELOPMENT_PLAN.md §4 (알고리즘), §6 (스키마)

import type { Course as PrismaCourse, Waypoint as PrismaWaypoint } from '@prisma/client';

/**
 * 이동수단 7종 — CARBON_FACTOR (DEVELOPMENT_PLAN §4.1) 키와 1:1 매칭
 */
export type TransportMode =
  | 'car' // 자가용
  | 'express_bus' // 고속/시외버스
  | 'city_bus' // 시내버스
  | 'train_ktx' // KTX
  | 'train_itx' // ITX/일반열차
  | 'bicycle' // 자전거
  | 'walking'; // 도보

/**
 * 코스 3안 카테고리 — UI/UX 표현용 (transport 컬러 시그니처와 매칭)
 */
export type CourseCategory = 'car' | 'transit' | 'active';

/**
 * Prisma Course/Waypoint 재export — 단일 진원지
 */
export type Course = PrismaCourse;
export type Waypoint = PrismaWaypoint;

/**
 * 코스 생성/시뮬레이션 시 사용하는 Waypoint (DB 저장 전)
 */
export interface CourseWaypoint {
  contentId: string;
  title: string;
  lat: number;
  lng: number;
  address?: string;
  imageUrl?: string;
  contentType: number;
  stayMinutes?: number;
}

/**
 * 이동수단별 코스 1안 (자가용/대중교통/자전거+도보 등)
 */
export interface CourseOption {
  mode: TransportMode;
  category: CourseCategory;
  waypoints: CourseWaypoint[];
  segments: CourseSegment[]; // waypoint 간 구간 정보
  totalKm: number;
  totalCO2g: number;
  durationMin: number;
  estimatedCostKRW: number;
}

/**
 * 구간 정보 (waypoint i → i+1)
 */
export interface CourseSegment {
  fromIndex: number;
  toIndex: number;
  km: number;
  co2g: number;
  mode: TransportMode;
}

/**
 * 코스 3안 비교 결과 (/plan/result 페이지에서 사용)
 */
export interface CourseCompareResult {
  car: CourseOption;
  transit: CourseOption;
  active: CourseOption | null; // 10km 반경 초과 시 null
  recommended: CourseCategory;
}

/**
 * 코스 생성 요청 페이로드 (/api/course/generate)
 */
export interface GenerateCourseRequest {
  areaCode: number;
  sigunguCode?: number;
  themes?: string[]; // cat1/cat2/cat3 codes
  duration: '당일' | '1박2일' | '2박3일';
  includeFestival?: boolean;
  includePet?: boolean;
  startLat?: number;
  startLng?: number;
  maxSpots?: number;
}
