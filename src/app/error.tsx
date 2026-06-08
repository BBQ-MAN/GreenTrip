// /error — 글로벌 에러 boundary (App Router 컨벤션)
// 'use client' 필수 — error/reset prop 수신 + reset() 재호출.
//
// digest는 서버 콘솔/Sentry에서 동일 에러를 추적할 때 사용.
// MVP 한정 — 사용자에는 친절한 메시지 + 재시도 + 홈 버튼만 제공.
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 운영 환경에서는 Sentry 등으로 추가 전송 가능 (architect가 통합 시).
    // 현재는 콘솔만 (next.js 자체가 dev에서 overlay로 표시).
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <PageContainer className="flex flex-col items-center text-center">
      <span
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive"
      >
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="mt-6 text-display-sm font-extrabold tracking-tight text-foreground md:text-display-md">
        문제가 발생했어요
      </h1>
      <p className="mt-3 max-w-md text-body-md text-muted-foreground">
        일시적인 오류로 페이지를 표시하지 못했습니다. 잠시 후 다시 시도해
        주세요.
      </p>
      {error.digest ? (
        <p className="mt-2 text-caption text-muted-foreground">
          오류 코드:{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 numeric">
            {error.digest}
          </code>
        </p>
      ) : null}

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={() => reset()}
          size="lg"
          className="w-full sm:w-auto"
          aria-label="페이지 다시 시도"
        >
          <RotateCw aria-hidden="true" className="mr-1 h-4 w-4" />
          다시 시도
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
