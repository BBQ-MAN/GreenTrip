// /mypage — 로그인 사용자 마이페이지 (시그니처 2 강화 트랙)
// async Server Component.
// 흐름:
//   1. getCurrentUser() — 비로그인 → /signin?callbackUrl=/mypage redirect
//   2. aggregateUserSavings(user.id) — 본인 누적 절감
//   3. Course/CarbonReport 본인 최근 10건
//   4. 4 섹션 합성 (헤더·hero·인증서·코스)
// 참조: _workspace/00_input/week12_request.md §D-1, DEVELOPMENT_PLAN §7.8
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/session';
import { aggregateUserSavings } from '@/lib/carbon/aggregator';
import { prisma } from '@/lib/db';
import { MyPageHeader } from '@/components/mypage/MyPageHeader';
import { MySavingsCard } from '@/components/mypage/MySavingsCard';
import { MyCertificateList } from '@/components/mypage/MyCertificateList';
import { MyCourseList } from '@/components/mypage/MyCourseList';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '마이페이지',
  description: '내가 발급한 탄소 인증서와 저장한 코스 — GreenTrip',
};

export default async function MyPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/signin?callbackUrl=/mypage');
  }

  const [savings, courses, reports] = await Promise.all([
    aggregateUserSavings(user.id),
    prisma.course.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.carbonReport.findMany({
      where: { userId: user.id },
      include: { course: { select: { title: true, region: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return (
    <main className="container mx-auto max-w-3xl space-y-6 px-4 py-6 md:py-8">
      <MyPageHeader user={user} />
      <MySavingsCard savings={savings} />
      <MyCertificateList reports={reports} />
      <MyCourseList courses={courses} />
    </main>
  );
}
