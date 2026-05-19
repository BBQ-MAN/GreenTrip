// 코스 상세 페이지 (placeholder — Week 5)
// 참조: DEVELOPMENT_PLAN.md §7.4

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="container py-16">
      <h1 className="text-display-md">코스 상세</h1>
      <p className="mt-4 text-muted-foreground">
        /course/{params.id} (TODO — Week 5)
      </p>
    </main>
  );
}
