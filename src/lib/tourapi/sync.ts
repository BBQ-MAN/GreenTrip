// TourAPI 동기화 헬퍼 — Phase 3 W14 (Vercel Cron 트리거 본격 운영)
//
// 목적: `areaBasedSyncList2`로 modifiedTime 이후 변경/추가/삭제된 contentId 수집.
// Phase 3 MVP:
//   - 변경 contentId 목록 + 카운트 반환 (route handler가 incrStat + JSON 응답)
//   - DB upsert는 Phase 4+ 별도 Spot 캐시 테이블 도입 시점에 추가
// 트리거: `vercel.json` cron `0 3 * * *` (KST 12:00) → /api/tour/sync
import { callTourAPI } from './client';
import type { SpotItem } from '@/types/tour';

/**
 * 변경 발생한 contentId 목록을 가져온다.
 *
 * 주의: KorService2 `areaBasedSyncList2`는 `modifiedTime` 파라미터를
 *       INVALID_REQUEST_PARAMETER_ERROR로 거부함 (Week 2 실측 확인).
 *       정확한 파라미터명은 W14 본격 구현 시 KorService2 API 문서 재확인 후 확정.
 *       현재는 modifiedTime 인자를 받아도 호출에서 제외하고 전체 동기화 목록을 반환.
 *
 * @param modifiedTime - 향후 호환용 (현재 미사용, 경고만 출력).
 * @param areaCode - 지역코드 필터 (강원=32). 기본 강원 한정.
 * @returns 변경 건수와 raw items (Week 14에서 DB 반영용).
 */
export async function syncRecentChanges(
  modifiedTime?: string,
  areaCode: number = 32,
): Promise<{ changed: number; items: SpotItem[]; totalCount: number }> {
  const params: Record<string, string | number> = {
    areaCode,
    numOfRows: 100,
    pageNo: 1,
    arrange: 'C', // 수정일순
  };
  if (modifiedTime) {
    // TODO W14: KorService2 정확한 파라미터명 확인 후 활성화
    // 현재는 KorService2가 modifiedTime 거부하므로 호출에서 제외
    // (전체 동기화 목록 반환 후 클라이언트에서 modifiedtime 필드로 필터링 가능)
  }

  const res = await callTourAPI<SpotItem>('areaBasedSyncList2', params);

  // TODO Week 14: items를 Spot 테이블 upsert + SyncLog 기록
  return {
    changed: res.items.length,
    items: res.items,
    totalCount: res.totalCount,
  };
}
