// ReportCTA — 코스 상세 페이지의 "탄소 리포트 보기" 활성화 버튼
// Client Component (POST + router.push + transition).
// 참조: _workspace/00_input/week10_request.md §C-8
//
// 흐름:
//   1) 클릭 → POST /api/report/generate { courseId }
//   2) 성공 → router.push(`/report/{reportId}`) (영구 URL)
//   3) 실패 → alert (UX 단순, Phase 2 후반에 toast로 격상 예정)
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportCTAProps {
  courseId: string;
  /** 시각 강조 (default variant 외 다른 variant도 받게) */
  className?: string;
}

export function ReportCTA({ courseId, className }: ReportCTAProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handle = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/report/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as { reportId: string };
        if (!data.reportId) {
          throw new Error('reportId missing in response');
        }
        router.push(`/report/${data.reportId}`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[report/generate]', e);
        if (typeof window !== 'undefined') {
          window.alert(
            '인증서 발급에 실패했습니다. 잠시 후 다시 시도해 주세요.',
          );
        }
      }
    });
  };

  return (
    <Button
      onClick={handle}
      disabled={isPending}
      aria-busy={isPending}
      className={className}
    >
      <Sparkles aria-hidden="true" className="mr-1.5 h-4 w-4" />
      {isPending ? '인증서 발급 중…' : '탄소 리포트 보기'}
    </Button>
  );
}
