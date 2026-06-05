// CertificateCard — 인증서 카드 (시그니처 2 본격)
// Server Component (정적 표기, 인터랙션 없음).
// 참조: DEVELOPMENT_PLAN.md §7.5, _workspace/00_input/week10_request.md §C-2
//
// 디자인:
//   - 그라데이션 헤더 (cert.gradient1 → cert.gradient2)
//   - 흰색 본문 surface + numeric-hero
//   - 푸터: 발급일 + "GreenTrip × 한국관광공사"
//
// 사이즈:
//   - 'preview' (기본): /report/[id] 페이지용. 반응형 (모바일 375px+ 보장)
//   - 'full': 1:1 데모/테스트용 (1080×1080 비율 고정 X — 실제 og:image는 별도 route)
//
// og:image route(/api/og/cert/[id])와 *디자인 통일*. 같은 hex/wording/구조.
import { Sprout, Car as CarIcon, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CertificateCardProps {
  /** 코스 제목 (Course.title) */
  courseName: string;
  /** 사용자명 (미가입 시 생략) */
  userName?: string;
  /** 절감량 (kg, 소수점 1자리) */
  savedKg: number;
  /** 소나무 환산 (그루, 소수점 1자리) */
  treeEq: number;
  /** 자가용 회피 km (정수) */
  carKm: number;
  /** 이동수단 한글 라벨 (예: "고속버스") */
  transportLabel: string;
  /** 발급일 */
  issuedAt: Date;
  /** report id (aria-label에 노출) */
  reportId: string;
  /** 페이지용 미리보기 vs 1:1 full */
  size?: 'preview' | 'full';
  className?: string;
}

function formatIssuedAt(d: Date): string {
  // toLocaleDateString은 SSR/CSR 로케일이 다를 수 있어 수동 포맷.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function CertificateCard({
  courseName,
  userName,
  savedKg,
  treeEq,
  carKm,
  transportLabel,
  issuedAt,
  reportId,
  size = 'preview',
  className,
}: CertificateCardProps) {
  const issuedLabel = formatIssuedAt(issuedAt);
  const ariaSummary = `${courseName} 코스 ${transportLabel} 이동으로 CO₂ ${savedKg}kg 절감 인증서 (${issuedLabel} 발급)`;

  return (
    <article
      aria-label={ariaSummary}
      data-report-id={reportId}
      className={cn(
        'overflow-hidden rounded-2xl border border-cert-border bg-cert-surface shadow-lg',
        // size=full은 1:1 비율, preview는 자연 높이
        size === 'full' ? 'aspect-square w-full max-w-md' : 'w-full',
        className,
      )}
    >
      {/* 헤더: 그라데이션 + 타이틀 */}
      <header
        className={cn(
          'flex flex-col items-center justify-center bg-gradient-to-r from-cert-gradient1 to-cert-gradient2 text-white',
          size === 'full' ? 'py-7' : 'py-6 md:py-7',
        )}
      >
        <h1
          className={cn(
            'inline-flex items-center gap-2 font-extrabold tracking-tight',
            size === 'full' ? 'text-display-sm' : 'text-display-sm md:text-display-md',
          )}
        >
          <span aria-hidden="true">🌿</span>
          그린 여행 인증서
        </h1>
        <p className="mt-1 text-caption font-medium opacity-90 md:text-body-sm">
          GreenTrip Carbon Saving Certificate
        </p>
      </header>

      {/* 본문 */}
      <div className={cn('flex flex-col gap-5 px-6 py-7 md:gap-6 md:px-10 md:py-9')}>
        {/* 코스명 */}
        <div className="flex flex-col">
          <span className="text-caption font-medium text-muted-foreground">
            코스
          </span>
          {userName ? (
            <p className="mt-0.5 text-body-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{userName}</span>
              <span> 님의</span>
            </p>
          ) : null}
          <h2 className="mt-1 text-heading-md font-extrabold leading-tight tracking-tight text-foreground md:text-heading-lg">
            {courseName}
          </h2>
          <p className="mt-2 text-body-md font-semibold text-cert">
            {transportLabel}으로 이동
          </p>
        </div>

        {/* CO2 hero */}
        <div className="flex flex-col items-start">
          <div className="flex items-baseline gap-2 text-cert">
            <span className="numeric text-numeric-hero leading-none">
              {savedKg.toFixed(1)}
            </span>
            <span className="text-heading-md font-extrabold">kg</span>
            <span className="text-heading-sm font-bold text-foreground">
              CO₂ 절감
            </span>
          </div>
        </div>

        {/* 등가 환산 */}
        <dl className="flex flex-col gap-2 border-t border-cert-border pt-4 text-body-sm md:flex-row md:gap-6">
          <div className="flex items-center gap-2">
            <Sprout aria-hidden="true" className="h-4 w-4 text-cert" />
            <dt className="text-muted-foreground">소나무</dt>
            <dd className="numeric font-bold text-foreground">
              {treeEq.toFixed(1)}그루
            </dd>
            <span className="text-caption text-muted-foreground">× 1년</span>
          </div>
          <div className="flex items-center gap-2">
            <CarIcon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
            <dt className="text-muted-foreground">자가용</dt>
            <dd className="numeric font-bold text-foreground">{carKm}km</dd>
            <span className="text-caption text-muted-foreground">회피</span>
          </div>
        </dl>
      </div>

      {/* 푸터 */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-cert-border bg-muted/30 px-6 py-4 md:px-10">
        <p className="inline-flex items-center gap-1.5 text-caption text-muted-foreground">
          <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
          <span>{issuedLabel} 발급</span>
        </p>
        <p className="text-caption font-bold text-cert">
          GreenTrip × 한국관광공사
        </p>
      </footer>
    </article>
  );
}
