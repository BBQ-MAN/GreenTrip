// /admin/stats — TourAPI 호출 통계 대시보드 (Phase 3 W15, 심사 대응)
//
// 재감사 H-2 (2026-06-11): `?token=` 쿼리 인증 구조 제거.
//   - 토큰이 URL에 실리면 서버/프록시 액세스 로그·브라우저 히스토리·Referer·녹화물에 평문 잔존.
//   - 인증은 AdminStatsClient가 Authorization: Bearer 헤더로 /api/admin/stats에 직접 전달.
//   - 토큰 보관은 sessionStorage(탭 단위, URL·로그 비잔존). 검증 주체는 서버(API) 단일.
//
// 이 파일은 metadata(noindex) + 클라이언트 합성만 담당하는 Server Shell.
import type { Metadata } from 'next';
import { AdminStatsClient } from './AdminStatsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin · TourAPI 통계',
  description: 'TourAPI 14종 endpoint 호출 통계 (관리자 전용)',
  robots: { index: false, follow: false },
};

export default function AdminStatsPage() {
  return <AdminStatsClient />;
}
