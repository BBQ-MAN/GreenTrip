// 랜딩 페이지 (placeholder — Week 4 ui-builder가 교체)
// 참조: DEVELOPMENT_PLAN.md §7.1

export default function HomePage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-6 py-16">
      <div className="text-center">
        <h1 className="text-display-md text-brand">GreenTrip</h1>
        <p className="mt-4 text-body-lg text-muted-foreground">
          저탄소 여행 코스 플래너 — 같은 여행지, 다른 이동 방식
        </p>
        <p className="mt-8 text-body-sm text-muted-foreground">
          (Week 4 UI 구현 예정 · 현재는 Week 1 스캐폴드 상태)
        </p>
      </div>
    </main>
  );
}
