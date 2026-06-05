// 사용자/사이트 누적 탄소 절감량 집계 — Prisma 의존
// 참조: DEVELOPMENT_PLAN.md §7.5 인증서, STRATEGY.md 시그니처 2 (비로그인 100% 깔때기)
//
// 목적: 마이페이지·랜딩 푸터에서 누적 절감 KPI를 표시.
//   - aggregateUserSavings(userId) — 로그인 사용자 본인 누적
//   - aggregateUserSavings() — 익명(userId=null) 코스 전체 누적 (비로그인 깔때기)
//   - aggregateSiteSavings() — 사이트 전체 누적 + 인증서 발급 수
//
// 사용 위치:
//   - async Server Component 전용 (RSC). Route Handler에서도 호출 가능.
//   - Client Component에서 직접 호출 금지 — Prisma 의존.
//
// 단위:
//   - g: 정수 (DB Float 합산이지만 표시 시 정수)
//   - kg: 소숫점 1자리
//   - 소나무 그루: gramsToTreeEq 위임 (1자리)
import { prisma } from '@/lib/db';
import { gramsToTreeEq } from './equivalents';

export interface UserSavings {
  /** 누적 절감량 (g) */
  totalSavedG: number;
  /** 누적 절감량 (kg, 소숫점 1자리) */
  totalSavedKg: number;
  /** 소나무 환산 (그루, 소숫점 1자리) */
  treeEq: number;
  /** 집계 대상 코스 수 */
  courseCount: number;
}

/**
 * 사용자 누적 절감량 집계.
 *
 * @param userId 사용자 ID. 지정 시 본인 코스만 집계.
 *               미지정 시 익명 코스(userId=null) 전체 집계
 *               — 비로그인 100% 깔때기 KPI에 사용.
 */
export async function aggregateUserSavings(userId?: string): Promise<UserSavings> {
  const where = userId ? { userId } : { userId: null };
  const agg = await prisma.course.aggregate({
    where,
    _sum: { savedCarbonG: true },
    _count: { _all: true },
  });
  const totalSavedG = Math.round(agg._sum.savedCarbonG ?? 0);
  return {
    totalSavedG,
    totalSavedKg: Math.round((totalSavedG / 1000) * 10) / 10,
    treeEq: gramsToTreeEq(totalSavedG),
    courseCount: agg._count._all,
  };
}

export interface SiteSavings {
  /** 사이트 전체 누적 절감량 (g) */
  totalSavedG: number;
  /** 사이트 전체 누적 절감량 (kg, 소숫점 1자리) */
  totalSavedKg: number;
  /** 전체 코스 수 */
  courseCount: number;
  /** 전체 인증서 발급 수 — 사용자 활성 지표 */
  reportCount: number;
}

/**
 * 사이트 전체 누적 집계.
 * 인증서 발급 수는 별도 카운트 — 코스 생성 ≠ 인증서 발급 (재발급 always-new).
 *
 * 랜딩 페이지 푸터 / SavingsHistory 컴포넌트에서 표시.
 */
export async function aggregateSiteSavings(): Promise<SiteSavings> {
  const [courseAgg, reportCount] = await Promise.all([
    prisma.course.aggregate({
      _sum: { savedCarbonG: true },
      _count: { _all: true },
    }),
    prisma.carbonReport.count(),
  ]);
  const totalSavedG = Math.round(courseAgg._sum.savedCarbonG ?? 0);
  return {
    totalSavedG,
    totalSavedKg: Math.round((totalSavedG / 1000) * 10) / 10,
    courseCount: courseAgg._count._all,
    reportCount,
  };
}
