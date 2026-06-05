// /plan/result — 코스 3안 비교 결과 (Week 4)
// Server Component wrapper. 실제 렌더는 Zustand store 의존 Client(PlanResultClient).
// 참조: DEVELOPMENT_PLAN.md §7.3, 시그니처 1·3 메인 발현 페이지
import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { PlanResultClient } from './PlanResultClient';

export const metadata: Metadata = {
  title: '코스 비교 결과',
  description:
    '자가용·대중교통·자전거의 CO₂·시간·비용을 동시에 비교한 결과입니다.',
};

export default function PlanResultPage() {
  return (
    <PageContainer className="py-6 md:py-10">
      <PlanResultClient />
    </PageContainer>
  );
}
