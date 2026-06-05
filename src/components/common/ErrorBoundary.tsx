'use client';
// ErrorBoundary — React 클래스 컴포넌트 기반 Error Boundary
// 참조: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
//
// Next.js 14는 app router의 error.tsx도 있으나, 컴포넌트 단위 fallback이
// 필요한 경우(갤러리·차트 등) 이 컴포넌트로 격리.
import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** fallback 커스터마이즈 (선택) — 미지정 시 기본 UI */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** 에러 로깅 콜백 */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, info);
    } else if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <section
        role="alert"
        aria-live="assertive"
        className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center"
      >
        <div
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-heading-sm text-foreground">
            데이터를 불러오지 못했어요
          </h2>
          <p className="text-body-sm text-muted-foreground">
            잠시 후 다시 시도해 주세요.
          </p>
          {process.env.NODE_ENV !== 'production' ? (
            <p className="mt-2 text-caption text-muted-foreground">
              {error.message}
            </p>
          ) : null}
        </div>
        <Button onClick={this.reset} variant="outline" size="sm">
          다시 시도
        </Button>
      </section>
    );
  }
}
