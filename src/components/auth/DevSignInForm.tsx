// DevSignInForm — 개발 환경 Credentials Provider용 로그인 폼.
// 참조: src/lib/auth/options.ts (id='dev' CredentialsProvider)
// NODE_ENV=development일 때만 /signin 페이지에 노출된다.
'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DevSignInFormProps {
  callbackUrl: string;
}

export function DevSignInForm({ callbackUrl }: DevSignInFormProps) {
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    setPending(true);
    try {
      // CredentialsProvider id='dev' (lib/auth/options.ts)
      const res = await signIn('dev', {
        name: name.trim(),
        callbackUrl,
        redirect: true,
      });
      // redirect:true이면 res는 보통 undefined.
      if (res?.error) {
        setError(res.error);
        setPending(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={handle}
      className="space-y-3 rounded-md border border-dashed bg-muted/30 p-4"
      aria-label="개발용 로그인"
    >
      <p className="text-caption text-muted-foreground">
        개발용 즉시 로그인 — 이름만으로 임시 계정이 생성됩니다.
      </p>
      <div className="space-y-1.5">
        <label htmlFor="dev-name" className="text-body-sm font-medium">
          이름
        </label>
        <Input
          id="dev-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          autoComplete="name"
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'dev-name-error' : undefined}
          disabled={pending}
        />
        {error ? (
          <p id="dev-name-error" role="alert" className="text-caption text-destructive">
            {error}
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending} className="w-full" aria-busy={pending}>
        {pending ? (
          <Loader2 aria-hidden="true" className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus aria-hidden="true" className="mr-1.5 h-4 w-4" />
        )}
        {pending ? '로그인 중…' : '개발용 로그인'}
      </Button>
    </form>
  );
}
