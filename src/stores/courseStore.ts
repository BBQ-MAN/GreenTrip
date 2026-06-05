// courseStore — Zustand store for course generation state
// /plan 폼 결과를 /plan/result 페이지로 전달 (URL query 짧게 유지).
// 새로고침 대응을 위해 sessionStorage persist.
//
// 참조: _workspace/00_input/week4_request.md §C-2
//      DEVELOPMENT_PLAN.md §7.2~7.3

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CourseCompareResult,
  GenerateCourseRequest,
} from '@/types/course';

interface CourseStore {
  /** 최근 생성된 3안 결과 (/plan/result 페이지 입력) */
  lastResult: CourseCompareResult | null;
  /** 최근 제출된 요청 페이로드 (재시도·요약 표시용) */
  lastRequest: GenerateCourseRequest | null;
  /** 결과 저장 (POST /api/course/generate 응답 직후) */
  setResult: (
    request: GenerateCourseRequest,
    result: CourseCompareResult,
  ) => void;
  /** 결과 초기화 (수동 리셋용) */
  clearResult: () => void;
}

/**
 * Zustand 스토어 — sessionStorage 영구화.
 * - sessionStorage: 탭 닫으면 사라짐 (개인정보 최소화). MVP 단계 적합.
 * - 새로고침/뒤로가기엔 보존.
 */
export const useCourseStore = create<CourseStore>()(
  persist(
    (set) => ({
      lastResult: null,
      lastRequest: null,
      setResult: (request, result) =>
        set({ lastRequest: request, lastResult: result }),
      clearResult: () => set({ lastRequest: null, lastResult: null }),
    }),
    {
      name: 'greentrip:course',
      // SSR에서 안전: sessionStorage는 클라이언트에서만 접근.
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => sessionStorage)
          : undefined,
      // CourseOption 내 segments/waypoints는 직렬화 가능 (POJO)
      partialize: (state) => ({
        lastResult: state.lastResult,
        lastRequest: state.lastRequest,
      }),
    },
  ),
);
