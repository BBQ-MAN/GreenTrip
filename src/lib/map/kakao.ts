// Kakao Maps SDK 동적 로딩 유틸
// 참조: DEVELOPMENT_PLAN §7.3, §7.4, kakao-maps-integration SKILL.md
//
// 원칙:
// 1. SSR 가드 (typeof window === 'undefined') — Node 환경에서 즉시 reject
// 2. SDK 1회만 로드 — Promise 캐시 공유 (여러 컴포넌트 동시 마운트 안전)
// 3. autoload=false + window.kakao.maps.load(cb) 두 단계로 안전 초기화
// 4. libraries=services,clusterer (Geocoder·MarkerClusterer 사용 대비)
// 5. 실패 시 sdkPromise=null 로 reset → 재시도 허용

// kakao 전역은 SDK가 동적으로 주입하므로 타입 정의가 없음 → any로 우회
// 컴포넌트 단에서는 window.kakao.maps.* 호출만 하므로 런타임은 안전
declare global {
  interface Window {
    kakao: any;
  }
}

let sdkPromise: Promise<void> | null = null;

/**
 * Kakao Maps SDK를 1회 로드한다.
 *
 * - 이미 로드되어 있으면 즉시 resolve
 * - 로딩 중이면 동일한 Promise를 공유
 * - 실패 시 캐시를 비워 다음 호출에서 재시도 가능
 */
export function loadKakaoSDK(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Kakao SDK는 클라이언트에서만 로드할 수 있습니다'));
  }
  if (window.kakao?.maps) {
    return Promise.resolve();
  }
  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise<void>((resolve, reject) => {
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!key) {
      const err = new Error(
        'NEXT_PUBLIC_KAKAO_MAP_KEY 환경변수가 설정되지 않았습니다'
      );
      sdkPromise = null;
      reject(err);
      return;
    }

    // 이미 동일 script가 head에 있는지 확인 (HMR/StrictMode 중복 방지)
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-sdk="true"]'
    );

    const handleLoaded = () => {
      try {
        window.kakao.maps.load(() => resolve());
      } catch (e) {
        sdkPromise = null;
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    };

    if (existing) {
      // 이미 추가된 스크립트가 있다면 onload만 다시 연결
      if (window.kakao?.maps) {
        handleLoaded();
        return;
      }
      existing.addEventListener('load', handleLoaded, { once: true });
      existing.addEventListener(
        'error',
        () => {
          sdkPromise = null;
          reject(new Error('Kakao SDK 스크립트 로드 실패'));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services,clusterer`;
    script.async = true;
    script.defer = true;
    script.dataset.kakaoSdk = 'true';
    script.onload = handleLoaded;
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Kakao SDK 스크립트 로드 실패'));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}

/**
 * 3안 이동수단 카테고리별 hex 컬러 상수.
 *
 * Kakao Polyline은 strokeColor에 hex 문자열을 직접 요구하므로
 * Tailwind 클래스(transport-eco 등)를 적용할 수 없다.
 * tokens.ts (transport.{fast|balance|eco}.light) 와 1:1 동기화 — 변경 시 함께 수정.
 *
 * - car     → transport.fast   (#F59E0B)
 * - transit → transport.balance(#0E7490)
 * - active  → transport.eco    (#0B8C5C)
 */
export const TRANSPORT_COLORS = {
  car: '#F59E0B',
  transit: '#0E7490',
  active: '#0B8C5C',
} as const;

export type TransportColorCategory = keyof typeof TRANSPORT_COLORS;

/**
 * 좌표 유효성 검사.
 * lat: -90~90, lng: -180~180, 둘 다 finite.
 */
export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * 테스트/HMR 용 — 캐시된 Promise 초기화.
 * 일반 런타임에서는 호출하지 말 것.
 */
export function __resetKakaoSDKCache(): void {
  sdkPromise = null;
}
