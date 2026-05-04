---
name: kakao-maps-integration
description: Kakao Maps JavaScript SDK 통합 스킬. SDK 동적 로딩, 지도 인스턴스 훅, 관광지 마커, 경로 오버레이(3안 색상 구분), 지오로케이션. map-integrator 에이전트가 Week 5 지도 통합 및 지도 관련 수정 요청 시 사용.
---

# Kakao Maps Integration — 지도 SDK

## 언제 사용하는가

- Week 5 카카오맵 통합
- 마커/경로 스타일 변경
- 지오로케이션 요청
- SDK 로딩/성능 이슈

## SDK 로딩 (src/lib/map/kakao.ts)

**SSR 안전, 1회 로드, Promise 공유:**

```typescript
declare global { interface Window { kakao: any } }

let sdkPromise: Promise<void> | null = null;

export function loadKakaoSDK(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject('SSR');
  if (window.kakao?.maps) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!key) return reject('NEXT_PUBLIC_KAKAO_MAP_KEY missing');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services,clusterer`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => { sdkPromise = null; reject('SDK load failed'); };
    document.head.appendChild(script);
  });
  return sdkPromise;
}
```

## useKakaoMap 훅 (src/hooks/useKakaoMap.ts)

```typescript
'use client';
import { useEffect, useRef, useState } from 'react';
import { loadKakaoSDK } from '@/lib/map/kakao';

export function useKakaoMap(
  containerRef: React.RefObject<HTMLDivElement>,
  options: { center: { lat: number; lng: number }; level?: number }
) {
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    loadKakaoSDK().then(() => {
      if (!mounted || !containerRef.current) return;
      const { kakao } = window;
      const instance = new kakao.maps.Map(containerRef.current, {
        center: new kakao.maps.LatLng(options.center.lat, options.center.lng),
        level: options.level ?? 7,
      });
      setMap(instance);
    }).catch(console.error);
    return () => { mounted = false; };
  }, []);

  return map;
}
```

## KakaoMap 컴포넌트

```typescript
'use client';
export function KakaoMap({
  center, level = 7, className, children
}: KakaoMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const map = useKakaoMap(ref, { center, level });
  return (
    <div ref={ref} className={className ?? 'w-full h-[400px]'}>
      {map && <MapContext.Provider value={{ map }}>{children}</MapContext.Provider>}
    </div>
  );
}
```

**Context로 자식(`SpotMarker`, `RouteOverlay`)에 map 인스턴스 전달 → 자식이 `setMap(null)` cleanup 처리.**

## SpotMarker

```typescript
'use client';
export function SpotMarker({ lat, lng, title, order, imageUrl }: Props) {
  const { map } = useContext(MapContext);
  useEffect(() => {
    if (!map) return;
    const { kakao } = window;
    const position = new kakao.maps.LatLng(lat, lng);
    const marker = new kakao.maps.Marker({ map, position, title });
    // order 라벨은 CustomOverlay로
    const label = new kakao.maps.CustomOverlay({ map, position, content: `<div class="...">${order}</div>` });
    return () => { marker.setMap(null); label.setMap(null); };
  }, [map, lat, lng]);
  return null;
}
```

## RouteOverlay (3안 비교용)

```typescript
// 색상:
// car: #6B7280 (gray-500)
// transit: #10B981 (green-500)
// active (bicycle/walking): #3B82F6 (blue-500)

const ROUTE_COLOR = {
  car: '#6B7280', transit: '#10B981', active: '#3B82F6',
} as const;

export function RouteOverlay({ waypoints, mode, highlight }: Props) {
  const { map } = useContext(MapContext);
  useEffect(() => {
    if (!map || waypoints.length < 2) return;
    const { kakao } = window;
    const path = waypoints.map(w => new kakao.maps.LatLng(w.lat, w.lng));
    const polyline = new kakao.maps.Polyline({
      map, path,
      strokeWeight: highlight ? 6 : 4,
      strokeColor: ROUTE_COLOR[mode],
      strokeOpacity: highlight ? 1 : 0.6,
      strokeStyle: mode === 'active' ? 'dash' : 'solid',
    });
    return () => polyline.setMap(null);
  }, [map, waypoints, mode, highlight]);
  return null;
}
```

## useGeolocation (src/hooks/useGeolocation.ts)

```typescript
// 실패 fallback: 강원도 중심 좌표 (춘천 시청 37.8813, 127.7298)
export const GANGWON_CENTER = { lat: 37.8813, lng: 127.7298 };

export function useGeolocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('geolocation unsupported');
      setCoords(GANGWON_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => { setError(err.message); setCoords(GANGWON_CENTER); },
      { timeout: 5000, maximumAge: 300000 }
    );
  }, []);
  return { coords, error };
}
```

## 상위 페이지에서 동적 import (SSR 비활성)

```tsx
// src/app/plan/result/page.tsx
import dynamic from 'next/dynamic';
const KakaoMap = dynamic(
  () => import('@/components/map/KakaoMap').then(m => m.KakaoMap),
  { ssr: false, loading: () => <div className="h-[400px] bg-gray-100 animate-pulse" /> }
);
```

## 작업 원칙

1. **모든 지도 컴포넌트는 Client Component** — `'use client'` 선언
2. **SDK는 1회만 로드** — Promise 캐시
3. **cleanup 엄수** — 마커·오버레이·InfoWindow 모두 unmount 시 `setMap(null)`
4. **API Key 분리** — `NEXT_PUBLIC_KAKAO_MAP_KEY`(SDK), `KAKAO_REST_API_KEY`(서버 측 길찾기)
5. **좌표 유효성 검사** — lat -90~90, lng -180~180 밖 필터링

## 참고 자료

- Kakao Maps SDK 공식 문서
- DEVELOPMENT_PLAN.md 7.3 코스 비교 페이지 (3안 경로 오버레이)
- DEVELOPMENT_PLAN.md 7.4 코스 상세 페이지 (전체 경로 + 마커)
