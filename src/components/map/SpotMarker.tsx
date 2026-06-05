'use client';

// SpotMarker — 관광지 마커 + 순서 라벨(CustomOverlay) + InfoWindow
// 참조: _workspace/00_input/week5_request.md, DEVELOPMENT_PLAN §7.4
//
// 동작:
//  - kakao.maps.Marker 생성
//  - order 지정 시 CustomOverlay로 순서 배지 (brand 컬러 #0B8C5C)
//  - 마커 클릭 시 InfoWindow 토글: 이미지 + 제목 + "상세보기" 링크 (/spot/{contentId})
//  - cleanup: marker, customOverlay, infoWindow 모두 setMap(null)/close()
//
// DOM 렌더 없음 (return null) — 부수 효과만.

import { useContext, useEffect } from 'react';
import { MapContext } from '@/components/map/KakaoMap';
import { isValidLatLng } from '@/lib/map/kakao';

export interface SpotMarkerProps {
  lat: number;
  lng: number;
  title: string;
  order?: number;
  imageUrl?: string;
  contentId?: string;
  contentTypeId?: number;
}

// 간단한 HTML escape — InfoWindow content는 innerHTML로 들어가므로 필수
function escapeHTML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function SpotMarker({
  lat,
  lng,
  title,
  order,
  imageUrl,
  contentId,
  contentTypeId: _contentTypeId,
}: SpotMarkerProps) {
  void _contentTypeId; // 현재 미사용 — 추후 카테고리별 아이콘 분기에 활용 예정
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map || typeof window === 'undefined') return;

    if (!isValidLatLng(lat, lng)) {
      // eslint-disable-next-line no-console
      console.warn('[SpotMarker] 잘못된 좌표로 마커 생성 생략:', {
        title,
        lat,
        lng,
      });
      return;
    }

    const { kakao } = window;
    const position = new kakao.maps.LatLng(lat, lng);

    const marker = new kakao.maps.Marker({
      map,
      position,
      title,
    });

    // 순서 배지 — CustomOverlay
    let customOverlay: { setMap: (m: unknown) => void } | null = null;
    if (typeof order === 'number' && Number.isFinite(order)) {
      const badge = document.createElement('div');
      badge.textContent = String(order);
      // brand 컬러 (#0B8C5C) 인라인 — Kakao CustomOverlay는 자체 DOM이라 Tailwind 클래스 적용 가능하나
      // SSR/HMR 안정성을 위해 핵심 스타일은 인라인 + tailwind class 보조
      Object.assign(badge.style, {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '22px',
        height: '22px',
        borderRadius: '9999px',
        backgroundColor: '#0B8C5C',
        color: '#FFFFFF',
        fontSize: '12px',
        fontWeight: '700',
        boxShadow: '0 1px 2px rgba(15,31,26,0.2)',
        transform: 'translate(-50%, -160%)',
      } satisfies Partial<CSSStyleDeclaration>);

      customOverlay = new kakao.maps.CustomOverlay({
        map,
        position,
        content: badge,
        yAnchor: 1,
        zIndex: 3,
      });
    }

    // InfoWindow
    const safeTitle = escapeHTML(title);
    const safeImage = imageUrl ? escapeHTML(imageUrl) : '';
    const safeHref = contentId
      ? `/spot/${encodeURIComponent(contentId)}`
      : '';

    const contentHTML = `
      <div style="padding:10px 12px;min-width:180px;max-width:240px;font-family:Pretendard,system-ui,sans-serif;">
        ${
          safeImage
            ? `<img src="${safeImage}" alt="" style="width:100%;height:96px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />`
            : ''
        }
        <div style="font-size:14px;font-weight:700;color:#0F1F1A;line-height:1.3;margin-bottom:6px;">
          ${safeTitle}
        </div>
        ${
          safeHref
            ? `<a href="${safeHref}" style="display:inline-block;font-size:12px;font-weight:600;color:#0B8C5C;text-decoration:none;">상세보기 →</a>`
            : ''
        }
      </div>
    `;

    const infoWindow = new kakao.maps.InfoWindow({
      content: contentHTML,
      removable: true,
    });

    const clickHandler = () => {
      infoWindow.open(map, marker);
    };
    kakao.maps.event.addListener(marker, 'click', clickHandler);

    return () => {
      kakao.maps.event.removeListener(marker, 'click', clickHandler);
      infoWindow.close();
      marker.setMap(null);
      if (customOverlay) {
        customOverlay.setMap(null);
      }
    };
  }, [map, lat, lng, title, order, imageUrl, contentId]);

  return null;
}
