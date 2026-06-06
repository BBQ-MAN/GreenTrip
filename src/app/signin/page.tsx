// /signin — NextAuth 커스텀 로그인 페이지 (lib/auth/options.ts pages.signIn)
// 'use client'. providers 동적 조회 + signIn() 호출.
//
// 시그니처 2 깔때기 유지: 로그인 강요 아님 — "로그인 없이 시작" CTA가 핵심.
'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProviders, signIn } from 'next-auth/react';
import { Leaf, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DevSignInForm } from '@/components/auth/DevSignInForm';

// next-auth getProviders 반환 타입 (라이브러리 export 제한 → 로컬 정의)
type ProviderInfo = {
  id: string;
  name: string;
  type: string;
};
type ProvidersMap = Record<string, ProviderInfo>;

function SignInBody() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/mypage';
  const errorCode = params.get('error');

  const [providers, setProviders] = useState<ProvidersMap | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    getProviders()
      .then((res) => {
        if (alive) setProviders((res as ProvidersMap | null) ?? {});
      })
      .catch(() => {
        if (alive) setLoadFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const hasKakao = Boolean(providers?.kakao);
  const hasDev = Boolean(providers?.dev);
  const noneAvailable =
    providers !== null && !hasKakao && !hasDev && !loadFailed;

  return (
    <main className="container mx-auto max-w-md px-4 py-12">
      <header className="space-y-2 text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface text-brand"
        >
          <Leaf className="h-5 w-5" />
        </span>
        <h1 className="text-display-sm font-extrabold tracking-tight text-foreground">
          로그인
        </h1>
        <p className="text-body-md text-muted-foreground">
          로그인하면 인증서와 코스가 영구 보관됩니다.
        </p>
      </header>

      {errorCode ? (
        <p
          role="alert"
          className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-body-sm text-destructive"
        >
          로그인에 실패했습니다 ({errorCode}). 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}

      <div className="mt-8 space-y-3">
        {/* Kakao OAuth — clientId/Secret이 설정된 경우에만 노출 */}
        {hasKakao ? (
          <Button
            type="button"
            onClick={() => signIn('kakao', { callbackUrl })}
            aria-label="카카오 계정으로 로그인"
            className="w-full bg-[#FEE500] text-black hover:bg-[#FDD835]"
          >
            <MessageCircle aria-hidden="true" className="mr-1.5 h-4 w-4" />
            카카오로 시작하기
          </Button>
        ) : null}

        {/* 개발용 Credentials Provider */}
        {hasDev ? <DevSignInForm callbackUrl={callbackUrl} /> : null}

        {/* providers 로드 실패 또는 둘 다 비활성 */}
        {loadFailed ? (
          <p
            role="status"
            className="rounded-md border bg-muted/40 px-4 py-3 text-center text-body-sm text-muted-foreground"
          >
            로그인 제공자를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}
        {noneAvailable ? (
          <p
            role="status"
            className="rounded-md border bg-muted/40 px-4 py-3 text-center text-body-sm text-muted-foreground"
          >
            현재 사용 가능한 로그인 수단이 없습니다. 로그인 없이도 코스 생성과
            인증서 발급이 가능합니다.
          </p>
        ) : null}

        {providers === null && !loadFailed ? (
          <p
            role="status"
            aria-live="polite"
            className="text-center text-body-sm text-muted-foreground"
          >
            로그인 수단 불러오는 중…
          </p>
        ) : null}
      </div>

      {/* 시그니처 2 깔때기 — 비로그인도 시작 가능 */}
      <p className="mt-8 text-center text-caption text-muted-foreground">
        로그인 없이도 코스 생성과 인증서 발급이 가능합니다.{' '}
        <Link
          href="/plan"
          className="font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          로그인 없이 시작
        </Link>
      </p>
    </main>
  );
}

export default function SignInPage() {
  // useSearchParams는 Suspense 경계 필요 (App Router 권장 패턴)
  return (
    <Suspense
      fallback={
        <main className="container mx-auto max-w-md px-4 py-12 text-center text-body-sm text-muted-foreground">
          로딩 중…
        </main>
      }
    >
      <SignInBody />
    </Suspense>
  );
}
