'use client';

// RouteOverlay — 3안 경로 Polyline 오버레이
// 참조: _workspace/00_input/week5_request.md, DEVELOPMENT_PLAN §7.3
//
// 색상 매핑 (TRANSPORT_COLORS, tokens.transport.* 와 일치):
//   car     → #F59E0B (transport.fast)    solid, weight 4
//   transit → #0E7490 (transport.balance) solid, weight 4
//   active  → #097A50 (transport.eco)     dash,  weight 4 (시각 구분)
// highlight=true: weight 6, opacity 1.0
// highlight=false: weight 4, opacity 0.6
//
// 부수 효과 컴포넌트 — DOM 렌더 없음 (return null).

import { useContext, useEffect } from 'react';
import { MapContext } from '@/components/map/KakaoMap';
import { TRANSPORT_COLORS, isValidLatLng } from '@/lib/map/kakao';
import type { TransportColorCategory } from '@/lib/map/kakao';

export interface RouteOverlayProps {
  waypoints: Array<{ lat: number; lng: number; title?: string }>;
  category: TransportColorCategory; // 'car' | 'transit' | 'active'
  highlight?: boolean;
}

export function RouteOverlay({
  waypoints,
  category,
  highlight = false,
}: RouteOverlayProps) {
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map || typeof window === 'undefined') return;
    if (!Array.isArray(waypoints) || waypoints.length < 2) return;

    const { kakao } = window;

    // 좌표 유효성 검사 — 잘못된 좌표는 제외 + 경고
    const validPoints = waypoints.filter((w) => {
      const ok = isValidLatLng(w.lat, w.lng);
      if (!ok) {
        // eslint-disable-next-line no-console
        console.warn('[RouteOverlay] 잘못된 좌표 제외:', w);
      }
      return ok;
    });
    if (validPoints.length < 2) return;

    const path = validPoints.map(
      (w) => new kakao.maps.LatLng(w.lat, w.lng)
    );

    const polyline = new kakao.maps.Polyline({
      map,
      path,
      strokeColor: TRANSPORT_COLORS[category],
      strokeWeight: highlight ? 6 : 4,
      strokeOpacity: highlight ? 1.0 : 0.6,
      strokeStyle: category === 'active' ? 'dash' : 'solid',
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, waypoints, category, highlight]);

  return null;
}
