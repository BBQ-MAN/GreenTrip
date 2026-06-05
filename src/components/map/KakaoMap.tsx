'use client';

// KakaoMap — 지도 컨테이너 + MapContext provider
// 참조: _workspace/00_input/week5_request.md (props 합의)
//
// 사용:
//   <KakaoMap center={{ lat, lng }} level={7} className="h-[400px]">
//     <RouteOverlay waypoints={...} category="transit" />
//     <SpotMarker lat={...} lng={...} title="..." order={1} />
//   </KakaoMap>
//
// 상위 페이지에서는 next/dynamic + ssr:false 로 import 권장:
//   const KakaoMap = dynamic(() => import('@/components/map/KakaoMap').then(m => m.KakaoMap), { ssr: false });

import * as React from 'react';
import { createContext, useEffect, useRef } from 'react';
import { useKakaoMap } from '@/hooks/useKakaoMap';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { __resetKakaoSDKCache } from '@/lib/map/kakao';
import { cn } from '@/lib/utils';

// kakao 전역 타입이 없으므로 any. 자식 컴포넌트는 useContext(MapContext).map 으로 접근.
export const MapContext = createContext<{ map: any | null }>({ map: null });

export interface KakaoMapProps {
  /** 초기 중심 좌표 */
  center: { lat: number; lng: number };
  /** 1(가장 가까움) ~ 14(가장 멈), default 7 */
  level?: number;
  /** 컨테이너 스타일 — 미지정 시 w-full h-[400px] */
  className?: string;
  /** MapContext 소비자 (RouteOverlay/SpotMarker) */
  children?: React.ReactNode;
  /** 지도 인스턴스 준비 콜백 (옵션) */
  onReady?: (map: any) => void;
  /** 접근성 라벨 (기본 "지도") */
  ariaLabel?: string;
}

export function KakaoMap({
  center,
  level = 7,
  className,
  children,
  onReady,
  ariaLabel = '지도',
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [retryKey, setRetryKey] = React.useState(0);
  const { map, isLoading, error } = useKakaoMap(containerRef, {
    center,
    level,
    retryKey,
  });

  const handleRetry = React.useCallback(() => {
    __resetKakaoSDKCache();
    setRetryKey((k) => k + 1);
  }, []);

  // onReady 콜백 — map 인스턴스 변경 시 1회 호출
  useEffect(() => {
    if (map && onReady) {
      onReady(map);
    }
  }, [map, onReady]);

  // center/level prop 변경 시 패닝/줌만 갱신 (재초기화 X)
  useEffect(() => {
    if (!map || typeof window === 'undefined') return;
    const { kakao } = window;
    map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
  }, [map, center.lat, center.lng]);

  useEffect(() => {
    if (!map) return;
    map.setLevel(level);
  }, [map, level]);

  const containerClass = cn(
    'relative w-full h-[400px] rounded-lg overflow-hidden bg-muted',
    className
  );

  return (
    <div className={containerClass}>
      {/* 실제 지도가 그려질 컨테이너 — 항상 mount 상태로 유지해야 ref가 유효 */}
      <div
        ref={containerRef}
        role="application"
        aria-label={ariaLabel}
        className="absolute inset-0"
      />

      {isLoading && !error && (
        <div className="absolute inset-0 z-10">
          <LoadingSkeleton
            variant="image"
            className="h-full w-full rounded-none"
            ariaLabel="지도를 불러오는 중"
          />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-muted/90 p-4 text-center"
        >
          <p className="text-body-sm text-muted-foreground">
            지도를 불러오지 못했습니다
          </p>
          <p className="text-caption text-muted-foreground">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetry}
          >
            다시 시도
          </Button>
        </div>
      )}

      {map && (
        <MapContext.Provider value={{ map }}>{children}</MapContext.Provider>
      )}
    </div>
  );
}
