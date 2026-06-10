// AccessibilityScoreCard — 접근성 점수 4축 시각화 (감사 P2-8)
// Server Component 호환 (순수 렌더, 인터랙션 없음).
//
// 입력 토글(CourseOptionForm "무장애 접근성 우선")만 있고 출력 가시화가 없던
// 결함(audit_uiux_20260610 §2.3 / P2-8)을 해소. AccessibilityScore(4축)를
// 컴팩트 카드로 표시 — CarbonGauge / 배지 패턴과 동일한 디자인 시스템 안에서 구현.
//
// 데이터 출처:
//   - calculateAccessibility(detailCommon2 + detailIntro2) 결과 (src/lib/course/filters.ts).
//   - 새 API 라우트 없이 spot 상세 페이지(RSC)가 이미 보유한 detail로 클라이언트 산출.
//
// WCAG AA (색만으로 정보 전달 금지):
//   - 각 축: 아이콘 + 한글 라벨 + 수치(0~100 또는 가능/정보없음) 3중 인코딩.
//   - 진행 막대는 보조. 색 등급(녹/앰버/중립)은 AA 보정 토큰만 사용
//     (carbon-low-fg #065F46, carbon-mid-fg #92400E, muted-foreground).
//   - role="img" + aria-label 로 전체 요약을 SR에 1줄 제공.
import { Bus, ParkingSquare, Accessibility, PawPrint } from 'lucide-react';
import type { AccessibilityScore } from '@/types/carbon';
import { cn } from '@/lib/utils';

interface AccessibilityScoreCardProps {
  score: AccessibilityScore;
  className?: string;
}

type Tier = 'good' | 'fair' | 'unknown';

/** 0~100 점수 → 등급. 키워드 미발견(낮은 점수)은 "정보 없음"으로 중립 처리 (불충분 ≠ 불가). */
function scoreTier(value: number): Tier {
  if (value >= 66) return 'good';
  if (value >= 33) return 'fair';
  return 'unknown';
}

const TIER_TEXT: Record<Tier, string> = {
  good: '우수',
  fair: '보통',
  unknown: '정보 적음',
};

// AA 보정 토큰만 사용 — 색은 보조, 텍스트/수치가 1차 정보.
const TIER_FG: Record<Tier, string> = {
  good: 'text-carbon-low-fg',
  fair: 'text-carbon-mid-fg',
  unknown: 'text-muted-foreground',
};

const TIER_BAR: Record<Tier, string> = {
  good: 'bg-transport-eco',
  fair: 'bg-festival', // #F59E0B — 면적 배경 전용 토큰 (전경 텍스트 아님)
  unknown: 'bg-muted-foreground/40',
};

function ScoreRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const tier = scoreTier(value);
  return (
    <li className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-body-sm font-medium text-foreground">{label}</span>
          <span className={cn('text-caption font-semibold', TIER_FG[tier])}>
            {TIER_TEXT[tier]} · {value}점
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full', TIER_BAR[tier])}
            style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
          />
        </div>
      </div>
    </li>
  );
}

export function AccessibilityScoreCard({
  score,
  className,
}: AccessibilityScoreCardProps) {
  const { publicTransport, parking, wheelchair, petFriendly } = score;

  const summary =
    `접근성 점수 — 대중교통 ${publicTransport}점, 주차 ${parking}점, ` +
    `휠체어 ${wheelchair}점, 반려동물 동반 ${petFriendly ? '가능' : '정보 없음'}.`;

  return (
    <section
      className={cn(
        'space-y-4 rounded-lg border bg-card p-5 md:p-6',
        className,
      )}
      aria-labelledby="accessibility-score-heading"
    >
      <div className="space-y-1">
        <h2
          id="accessibility-score-heading"
          className="text-heading-md text-foreground"
        >
          접근성 점수
        </h2>
        <p className="text-caption text-muted-foreground">
          관광공사 안내 정보에서 추출한 추정 점수입니다. 정확한 정보는 시설에
          확인하세요.
        </p>
      </div>

      <ul className="space-y-3" role="img" aria-label={summary}>
        <ScoreRow
          icon={<Bus aria-hidden="true" className="h-4 w-4" />}
          label="대중교통"
          value={publicTransport}
        />
        <ScoreRow
          icon={<ParkingSquare aria-hidden="true" className="h-4 w-4" />}
          label="주차"
          value={parking}
        />
        <ScoreRow
          icon={<Accessibility aria-hidden="true" className="h-4 w-4" />}
          label="휠체어"
          value={wheelchair}
        />

        {/* 반려동물 — boolean 축. 색+아이콘+텍스트 3중. */}
        <li className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand"
          >
            <PawPrint aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
            <span className="text-body-sm font-medium text-foreground">
              반려동물 동반
            </span>
            <span
              className={cn(
                'text-caption font-semibold',
                petFriendly ? 'text-pet-fg' : 'text-muted-foreground',
              )}
            >
              {petFriendly ? '가능' : '정보 없음'}
            </span>
          </div>
        </li>
      </ul>
    </section>
  );
}
