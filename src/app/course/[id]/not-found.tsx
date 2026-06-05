// /course/[id] not-found
// 참조: Next.js App Router not-found.tsx 컨벤션, /spot/[contentId]/not-found.tsx 패턴
import { EmptyState } from '@/components/common/EmptyState';

export default function CourseNotFound() {
  return (
    <main className="container max-w-3xl py-12 md:py-16">
      <EmptyState
        title="코스를 찾을 수 없어요"
        description="유효하지 않은 코스 ID이거나 이미 삭제된 코스입니다. 새 코스를 만들어 보세요."
        ctaLabel="다른 코스 만들기"
        ctaHref="/plan"
      />
    </main>
  );
}
