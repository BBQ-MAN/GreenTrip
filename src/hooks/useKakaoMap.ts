'use client';

// useKakaoMap — Kakao Map 인스턴스 훅
// 참조: _workspace/00_input/week5_request.md (합의된 시그니처)
//
// 원칙:
// 1. mounted 가드 — race condition 방지 (비동기 SDK 로드 도중 언마운트 시 setState 누락)
// 2. 1회 초기화 — 컨테이너가 준비된 시점에 단일 Map 인스턴스 생성
// 3. center/level은 마운트 시점 값만 사용 — 이후 변경은 KakaoMap 컴포넌트가 setCenter로 위임
// 4. cleanup — 카카오 Map 인스턴스는 명시적 destroy API가 없음(컨테이너 DOM 제거로 GC).
//    훅은 mounted 플래그만 끄고, 마커/오버레이 cleanup은 자식 컴포넌트 책임.

import { useEffect, useRef, useState, type RefObject } from 'react';
import { loadKakaoSDK } from '@/lib/map/kakao';

export interface UseKakaoMapOptions {
  center: { lat: number; lng: number };
  level?: number;
  /** 값이 변경되면 SDK 로드/지도 초기화를 다시 시도 (재시도 트리거) */
  retryKey?: number;
}

export interface UseKakaoMapResult {
  // 카카오 Map 인스턴스 — SDK 타입 정의가 없어 any로 노출
  map: any | null;
  isLoading: boolean;
  error: string | null;
}

export function useKakaoMap(
  containerRef: RefObject<HTMLDivElement>,
  options: UseKakaoMapOptions
): UseKakaoMapResult {
  const [map, setMap] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 최신 옵션을 ref에 보관 — initial 시점에만 읽으므로 effect deps 제외해도 안전
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const { retryKey } = options;

  // center/level은 initial only — 이후 변경 시 KakaoMap이 map.setCenter/setLevel을 호출.
  // retryKey 변경 시에만 재실행 (재시도 트리거).
  useEffect(() => {
    setMap(null);
    setError(null);
    setIsLoading(true);
    let mounted = true;

    loadKakaoSDK()
      .then(() => {
        if (!mounted) return;
        const container = containerRef.current;
        if (!container) {
          setError('지도 컨테이너를 찾을 수 없습니다');
          setIsLoading(false);
          return;
        }
        try {
          const { kakao } = window;
          const opts = optionsRef.current;
          const instance = new kakao.maps.Map(container, {
            center: new kakao.maps.LatLng(opts.center.lat, opts.center.lng),
            level: opts.level ?? 7,
          });
          if (!mounted) return;
          setMap(instance);
          setIsLoading(false);
        } catch (e) {
          if (!mounted) return;
          setError(e instanceof Error ? e.message : '지도 초기화 실패');
          setIsLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : String(e));
        setIsLoading(false);
      });

    return () => {
      mounted = false;
      // Kakao Map 인스턴스는 명시적 destroy가 없다.
      // 컨테이너 DOM이 unmount되면 GC 대상 — 자식 마커/오버레이 cleanup이 누수를 막는다.
    };
  }, [containerRef, retryKey]);

  return { map, isLoading, error };
}
