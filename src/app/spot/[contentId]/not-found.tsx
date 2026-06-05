// /spot/[contentId] 전용 not-found
// 참조: Next.js App Router not-found.tsx 컨벤션
import { EmptyState } from '@/components/common/EmptyState';

export default function SpotNotFound() {
  return (
    <main className="container max-w-3xl py-12 md:py-16">
      <EmptyState
        title="관광지 정보를 찾을 수 없어요"
        description="유효하지 않은 contentId이거나 한국관광공사 API에 데이터가 등록되지 않았습니다. 다른 관광지를 탐색해 보세요."
        ctaLabel="강원도 관광지 탐색"
        ctaHref="/explore"
      />
    </main>
  );
}
