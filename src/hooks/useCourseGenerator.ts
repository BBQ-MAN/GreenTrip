'use client';
// useCourseGenerator — POST /api/course/generate 호출 훅
// SWR Mutation 대신 단순 fetch + useState (응답이 1회성·POST 캐시 불필요).
// 참조: _workspace/00_input/week4_request.md §C-1
//      src/app/api/course/generate/route.ts
import { useCallback, useState } from 'react';
import type {
  CourseCompareResult,
  GenerateCourseRequest,
} from '@/types/course';
import { useCourseStore } from '@/stores/courseStore';

interface CourseGeneratorError {
  error: string;
  message: string;
  status: number;
}

interface UseCourseGeneratorReturn {
  generate: (req: GenerateCourseRequest) => Promise<CourseCompareResult | null>;
  isLoading: boolean;
  error: CourseGeneratorError | null;
  reset: () => void;
}

/**
 * /api/course/generate 호출 래퍼.
 * - 성공 시 Zustand store(useCourseStore.setResult)에 자동 저장 → /plan/result 에서 즉시 사용.
 * - 에러 응답({ error, message })은 CourseGeneratorError 로 정규화.
 * - 네트워크 에러도 동일 shape으로 통일.
 */
export function useCourseGenerator(): UseCourseGeneratorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CourseGeneratorError | null>(null);
  const setResult = useCourseStore((s) => s.setResult);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const generate = useCallback(
    async (req: GenerateCourseRequest): Promise<CourseCompareResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/course/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(req),
        });

        if (!res.ok) {
          let body: { error?: string; message?: string } = {};
          try {
            body = await res.json();
          } catch {
            /* empty body */
          }
          const err: CourseGeneratorError = {
            error: body.error ?? `HTTP_${res.status}`,
            message: body.message ?? `요청 처리 중 오류 (${res.status})`,
            status: res.status,
          };
          setError(err);
          return null;
        }

        const data = (await res.json()) as CourseCompareResult;
        setResult(req, data);
        return data;
      } catch (e) {
        const err: CourseGeneratorError = {
          error: 'NETWORK_ERROR',
          message:
            e instanceof Error
              ? e.message
              : '네트워크 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
          status: 0,
        };
        setError(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setResult],
  );

  return { generate, isLoading, error, reset };
}

export type { CourseGeneratorError };
