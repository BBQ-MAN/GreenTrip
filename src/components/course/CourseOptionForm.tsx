'use client';
// CourseOptionForm — 코스 생성 옵션 입력 폼
// shadcn/ui Form + react-hook-form + Zod (Route 측 Zod와 일관).
// /plan 페이지에서 사용. Submit 시 useCourseGenerator → /plan/result 이동.
//
// 참조: _workspace/00_input/week4_request.md §A-2·B-5
//      src/app/api/course/generate/route.ts (Zod 권위)
//      DEVELOPMENT_PLAN.md §7.2

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GANGWON, CONTENT_TYPE } from '@/lib/tourapi/constants';
import { useCourseGenerator } from '@/hooks/useCourseGenerator';
import type { GenerateCourseRequest } from '@/types/course';

// ---------------------------------------------------------------------------
// Zod (Route /api/course/generate 측과 권위 정합)
//   - duration: 한글 enum 3종 (DEVELOPMENT_PLAN §7.2 + types/course.ts)
//   - areaCode: 강원도 32 고정 (Phase 1)
//   - contentTypeIds: 다중 선택 → number[]
// ---------------------------------------------------------------------------
const FormSchema = z.object({
  areaCode: z.coerce.number().int().min(1).max(50),
  sigunguCode: z.coerce.number().int().min(1).max(50).optional(),
  duration: z.enum(['당일', '1박2일', '2박3일']),
  contentTypeIds: z.array(z.coerce.number().int()).min(1, '테마를 1개 이상 선택해 주세요'),
  includeFestival: z.boolean().default(false),
  includePet: z.boolean().default(false),
  accessibilityMin: z.union([z.literal(0), z.literal(50)]).default(0),
});

export type CourseFormValues = z.infer<typeof FormSchema>;

const SIGUNGU_OPTIONS = Object.entries(GANGWON.sigungu) as Array<[string, number]>;

// contentType 선택 옵션 (TourAPI 8종 중 코스 생성에 의미있는 5종)
const CONTENT_TYPE_OPTIONS = [
  { id: CONTENT_TYPE.관광지, label: '관광지' },
  { id: CONTENT_TYPE.문화시설, label: '문화시설' },
  { id: CONTENT_TYPE.레포츠, label: '레포츠' },
  { id: CONTENT_TYPE.음식점, label: '음식점' },
  { id: CONTENT_TYPE.쇼핑, label: '쇼핑' },
];

const DURATION_OPTIONS: GenerateCourseRequest['duration'][] = [
  '당일',
  '1박2일',
  '2박3일',
];

interface CourseOptionFormProps {
  /** 제출 후 콜백 (선택). 미지정 시 /plan/result 로 자동 라우팅 */
  onSubmitted?: () => void;
}

export function CourseOptionForm({ onSubmitted }: CourseOptionFormProps) {
  const router = useRouter();
  const { generate, isLoading, error } = useCourseGenerator();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      areaCode: GANGWON.areaCode, // 32 (강원도)
      sigunguCode: undefined,
      duration: '당일',
      contentTypeIds: [CONTENT_TYPE.관광지],
      includeFestival: false,
      includePet: false,
      accessibilityMin: 0,
    },
  });

  async function onSubmit(values: CourseFormValues) {
    setSubmitError(null);
    const payload: GenerateCourseRequest = {
      areaCode: values.areaCode,
      sigunguCode: values.sigunguCode,
      contentTypeIds: values.contentTypeIds,
      duration: values.duration,
      includeFestival: values.includeFestival,
      includePet: values.includePet,
      accessibilityMin: values.accessibilityMin,
      maxSpots:
        values.duration === '당일'
          ? 5
          : values.duration === '1박2일'
            ? 8
            : 12,
    };

    const result = await generate(payload);
    if (result) {
      if (onSubmitted) {
        onSubmitted();
      } else {
        router.push('/plan/result');
      }
    } else {
      // useCourseGenerator의 error 객체에서 메시지 노출
      setSubmitError(error?.message ?? '코스 생성에 실패했어요.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: 지역 */}
        <fieldset className="space-y-4 rounded-lg border bg-card p-5 md:p-6">
          <legend className="px-2 text-heading-sm text-foreground">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-caption font-bold text-white">
              1
            </span>
            지역 선택
          </legend>

          <FormField
            control={form.control}
            name="areaCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>지역</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  defaultValue={String(field.value)}
                  disabled
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="강원도" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={String(GANGWON.areaCode)}>
                      강원도
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Phase 1은 강원도 특화. Phase 2에서 전국 확장 예정.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sigunguCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시군구 (선택)</FormLabel>
                <Select
                  onValueChange={(v) =>
                    field.onChange(v === 'all' ? undefined : Number(v))
                  }
                  defaultValue={field.value ? String(field.value) : 'all'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {SIGUNGU_OPTIONS.map(([name, code]) => (
                      <SelectItem key={code} value={String(code)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        {/* Step 2: 기간 + 테마 */}
        <fieldset className="space-y-4 rounded-lg border bg-card p-5 md:p-6">
          <legend className="px-2 text-heading-sm text-foreground">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-caption font-bold text-white">
              2
            </span>
            기간 · 테마
          </legend>

          {/* 기간 — 세그먼트 컨트롤 */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>기간</FormLabel>
                <FormControl>
                  <div
                    role="radiogroup"
                    aria-label="여행 기간"
                    className="grid grid-cols-3 gap-2"
                  >
                    {DURATION_OPTIONS.map((opt) => {
                      const active = field.value === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => field.onChange(opt)}
                          className={`rounded-md border px-4 py-3 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            active
                              ? 'border-brand bg-brand text-white'
                              : 'border-input bg-background text-foreground hover:bg-muted'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 테마 (contentTypeIds) — 다중 선택 칩 */}
          <Controller
            control={form.control}
            name="contentTypeIds"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>테마 (1개 이상)</FormLabel>
                <FormControl>
                  <div
                    role="group"
                    aria-label="테마 선택"
                    className="flex flex-wrap gap-2"
                  >
                    {CONTENT_TYPE_OPTIONS.map((opt) => {
                      const selected = field.value?.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            const next = selected
                              ? field.value.filter((v: number) => v !== opt.id)
                              : [...(field.value ?? []), opt.id];
                            field.onChange(next);
                          }}
                          className={`rounded-full border px-4 py-2 text-body-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            selected
                              ? 'border-brand bg-brand-surface text-brand'
                              : 'border-input bg-background text-foreground hover:bg-muted'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                {fieldState.error ? (
                  <p className="text-sm font-medium text-destructive">
                    {fieldState.error.message}
                  </p>
                ) : null}
              </FormItem>
            )}
          />
        </fieldset>

        {/* Step 3: 옵션 토글 */}
        <fieldset className="space-y-4 rounded-lg border bg-card p-5 md:p-6">
          <legend className="px-2 text-heading-sm text-foreground">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-caption font-bold text-white">
              3
            </span>
            옵션
          </legend>

          <Controller
            control={form.control}
            name="includeFestival"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-input bg-background p-4 hover:bg-muted">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-0.5 h-5 w-5 accent-brand"
                  aria-label="축제·행사 포함"
                />
                <div className="flex-1">
                  <p className="text-body-md font-medium text-foreground">
                    축제·행사 포함
                  </p>
                  <p className="text-caption text-muted-foreground">
                    📅 축제·행사 자동 삽입 (오늘 ~ 여행 기간 내)
                  </p>
                </div>
              </label>
            )}
          />

          <Controller
            control={form.control}
            name="includePet"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-input bg-background p-4 hover:bg-muted">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-0.5 h-5 w-5 accent-brand"
                  aria-label="반려동물 동반 가능 우선"
                />
                <div className="flex-1">
                  <p className="text-body-md font-medium text-foreground">
                    반려동물 동반 가능 우선
                  </p>
                  <p className="text-caption text-muted-foreground">
                    detailPetTour2 응답이 있는 관광지를 가중치 부여합니다.
                  </p>
                </div>
              </label>
            )}
          />

          <Controller
            control={form.control}
            name="accessibilityMin"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-input bg-background p-4 hover:bg-muted">
                <input
                  type="checkbox"
                  checked={field.value === 50}
                  onChange={(e) => field.onChange(e.target.checked ? 50 : 0)}
                  className="mt-0.5 h-5 w-5 accent-brand"
                  aria-label="무장애 접근성 우선"
                />
                <div className="flex-1">
                  <p className="text-body-md font-medium text-foreground">
                    무장애 접근성 우선
                  </p>
                  <p className="text-caption text-muted-foreground">
                    유모차·휠체어 이용 가능 시설을 우선 추천합니다.
                  </p>
                </div>
              </label>
            )}
          />
        </fieldset>

        {/* 에러 영역 */}
        {submitError ? (
          <p
            role="alert"
            aria-live="polite"
            className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-body-sm text-destructive"
          >
            {submitError}
          </p>
        ) : null}

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
              코스 생성 중…
            </>
          ) : (
            '코스 만들기'
          )}
        </Button>
      </form>
    </Form>
  );
}
