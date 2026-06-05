// /report/[id] 인증서 404 — EmptyState + /plan CTA
// 참조: _workspace/00_input/week10_request.md §C-7
import { FileQuestion } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

export default function ReportNotFound() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-12 md:py-16">
      <EmptyState
        title="인증서를 찾을 수 없습니다"
        description="삭제되었거나 잘못된 링크일 수 있어요. 새 코스로 인증서를 발급해 보세요."
        icon={<FileQuestion className="h-6 w-6" aria-hidden="true" />}
        ctaLabel="코스 만들러 가기"
        ctaHref="/plan"
      />
    </main>
  );
}
