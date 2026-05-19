// 관광지 상세 페이지 (placeholder — Week 2)
// 참조: DEVELOPMENT_PLAN.md §7

export default function SpotDetailPage({ params }: { params: { contentId: string } }) {
  return (
    <main className="container py-16">
      <h1 className="text-display-md">관광지 상세</h1>
      <p className="mt-4 text-muted-foreground">
        /spot/{params.contentId} (TODO — Week 2)
      </p>
    </main>
  );
}
