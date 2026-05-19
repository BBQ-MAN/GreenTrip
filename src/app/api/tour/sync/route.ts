// API Route: TourAPI 동기화목록 (lastModified) — 데이터 최신성 확인
// greentrip_proposal.md OpenAPI 10종 중 동기화 항목
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ todo: 'Week 2 또는 Phase 2 구현 예정 (동기화)' }, { status: 501 });
}
