'use client';

// useGeolocation — 현재 위치 (실패 시 강원 fallback)
// 참조: _workspace/00_input/week5_request.md
//
// 정책:
// - timeout 5s, maximumAge 5min (캐시 활용으로 즉시 반환 가능)
// - 미지원 / 거부 / 타임아웃 시 GANGWON_CENTER (춘천 시청) 로 fallback
// - isLoading은 초기 true, 결과(성공·실패 모두) 확정 시 false

import { useEffect, useState } from 'react';

export const GANGWON_CENTER = { lat: 37.8813, lng: 127.7298 } as const;

export interface UseGeolocationResult {
  coords: { lat: number; lng: number } | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      if (mounted) {
        setError('이 브라우저는 위치 정보를 지원하지 않습니다');
        setCoords({ ...GANGWON_CENTER });
        setIsLoading(false);
      }
      return () => {
        mounted = false;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted) return;
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        if (!mounted) return;
        setError(err.message || '위치 정보를 가져오지 못했습니다');
        setCoords({ ...GANGWON_CENTER });
        setIsLoading(false);
      },
      {
        timeout: 5_000,
        maximumAge: 5 * 60 * 1_000, // 5분
        enableHighAccuracy: false,
      }
    );

    return () => {
      mounted = false;
    };
  }, []);

  return { coords, error, isLoading };
}
