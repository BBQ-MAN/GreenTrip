// 탄소 절감 인증서 페이지 (placeholder — Phase 2 W10~11)
// 참조: DEVELOPMENT_PLAN.md §7.5

export default function ReportPage({ params }: { params: { id: string } }) {
  return (
    <main className="container py-16">
      <h1 className="text-display-md">탄소 절감 인증서</h1>
      <p className="mt-4 text-muted-foreground">
        /report/{params.id} (TODO — Phase 2 W10~11)
      </p>
    </main>
  );
}
