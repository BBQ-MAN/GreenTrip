// 탄소 도메인 타입
// 참조: DEVELOPMENT_PLAN.md §4.1 (CARBON_FACTOR), §4.3 (접근성)

import type { TransportMode } from './course';

/**
 * 이동수단별 CO₂ 배출 계수 (g/km, 1인 기준)
 * 실제 값은 src/lib/carbon/factors.ts 에서 정의
 */
export interface CarbonFactor {
  mode: TransportMode;
  gPerKm: number;
}

/**
 * 코스 전체 탄소 계산 결과
 */
export interface CarbonCalculation {
  mode: TransportMode;
  totalKm: number;
  totalCO2g: number;
  segments: Array<{
    km: number;
    co2g: number;
  }>;
}

/**
 * 절감량 비교 (자가용 baseline 대비)
 */
export interface CarbonSaving {
  baselineCO2g: number; // 자가용 기준
  actualCO2g: number; // 선택한 이동수단 기준
  savedCO2g: number; // baseline - actual
  savedRatio: number; // 0~1
  savedTreeEq: number; // 나무 환산 (1그루 ≈ 22 kg CO₂/년)
}

/**
 * 접근성 점수 — detailCommon2 / detailIntro2 파싱 결과 (v1.6 KorService2)
 */
export interface AccessibilityScore {
  publicTransport: number; // 0~100: 대중교통 접근성
  parking: number; // 0~100: 주차 편의성
  wheelchair: number; // 0~100: 휠체어 접근성
  petFriendly: boolean; // 반려동물 동반 가능 여부
}

/**
 * Carbon Scale 4단계 — 디자인 토큰 carbon.{low,mid,high,severe} 와 매칭
 */
export type CarbonScale = 'low' | 'mid' | 'high' | 'severe';
