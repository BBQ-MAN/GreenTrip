// Kakao Share SDK 동적 로딩 + sendDefault wrapper
// 참조: _workspace/00_input/week10_request.md §B-4, src/lib/map/kakao.ts (Maps 패턴)
//       https://developers.kakao.com/docs/latest/ko/message/js-link
//
// Kakao Maps SDK 와 *별도 스크립트*. 통합 SDK 파일 (kakao.min.js)을 head에 주입.
// - Maps SDK는 `//dapi.kakao.com/v2/maps/sdk.js?appkey=...&autoload=false&libraries=...`
// - Share SDK는 `https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js`
//   → window.Kakao.init(appKey) 후 window.Kakao.Share.sendDefault({...})
//
// 키 공유: Maps의 JavaScript Key (NEXT_PUBLIC_KAKAO_MAP_KEY)를 그대로 사용.
//         (Kakao 개발자 콘솔에서 한 앱의 JavaScript Key 1개로 Maps + Share + Login 모두 처리)
//
// 원칙:
//   1) SSR 가드 — typeof window === 'undefined' 시 즉시 reject
//   2) 1회만 로드 — Promise 캐시 공유 + script[data-kakao-sdk] 중복 가드
//   3) 실패 시 캐시 비워 재시도 허용
//   4) Kakao.init은 isInitialized() 가드로 다회 호출 방지

declare global {
  interface Window {
    // Kakao 전역 — SDK가 동적 주입. types는 sdk가 any로 노출.
    Kakao?: any;
  }
}

let kakaoSharePromise: Promise<any> | null = null;

/**
 * Kakao Share SDK를 1회 로드한다.
 *
 * - 이미 로드되어 init도 완료된 상태면 즉시 resolve(window.Kakao)
 * - 로딩 중이면 동일 Promise 공유
 * - 실패 시 캐시 비워 재시도 허용
 */
export async function loadKakaoShareSDK(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Kakao Share SDK는 클라이언트에서만 로드할 수 있습니다');
  }
  // 이미 로드 + init 완료
  if (window.Kakao?.Share && window.Kakao.isInitialized?.()) {
    return window.Kakao;
  }
  if (kakaoSharePromise) return kakaoSharePromise;

  kakaoSharePromise = new Promise((resolve, reject) => {
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!key) {
      kakaoSharePromise = null;
      reject(
        new Error(
          'NEXT_PUBLIC_KAKAO_MAP_KEY 환경변수가 설정되지 않았습니다',
        ),
      );
      return;
    }

    const initIfNeeded = () => {
      try {
        if (!window.Kakao) {
          throw new Error('window.Kakao not present after script load');
        }
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(key);
        }
        resolve(window.Kakao);
      } catch (e) {
        kakaoSharePromise = null;
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    };

    // 중복 스크립트 가드 (HMR/StrictMode)
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-sdk="share"]',
    );
    if (existing) {
      if (window.Kakao) {
        initIfNeeded();
        return;
      }
      existing.addEventListener('load', initIfNeeded, { once: true });
      existing.addEventListener(
        'error',
        () => {
          kakaoSharePromise = null;
          reject(new Error('Kakao Share SDK 스크립트 로드 실패'));
        },
        { once: true },
      );
      return;
    }

    const s = document.createElement('script');
    s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
    // integrity hash — 공식 SDK release notes 기준 (2.7.4).
    s.integrity =
      'sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka';
    s.crossOrigin = 'anonymous';
    s.async = true;
    s.defer = true;
    s.dataset.kakaoSdk = 'share';
    s.onload = initIfNeeded;
    s.onerror = () => {
      kakaoSharePromise = null;
      reject(new Error('Kakao Share SDK 스크립트 로드 실패'));
    };
    document.head.appendChild(s);
  });

  return kakaoSharePromise;
}

export interface ShareLinkParams {
  /** 메시지 카드 제목 (보통 "🌿 그린 여행 인증서") */
  title: string;
  /** 부가 설명 (코스명 + 절감량 한줄) */
  description: string;
  /** og 이미지 절대 URL (https://greentrip.com/api/og/cert/{id}) */
  imageUrl: string;
  /** 클릭 시 이동할 영구 URL (https://greentrip.com/report/{id}) */
  webUrl: string;
  /** 모바일 전용 분기 (생략 시 webUrl 재사용) */
  mobileWebUrl?: string;
}

/**
 * 카카오톡 공유 (feed 템플릿, default).
 *
 * 호출 전 `loadKakaoShareSDK()`로 SDK가 준비되어야 한다.
 * 호출자(ShareButtons)가 try/catch로 감싸 alert 폴백을 제공.
 */
export async function shareToKakao(params: ShareLinkParams): Promise<void> {
  const kakao = await loadKakaoShareSDK();
  kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: params.title,
      description: params.description,
      imageUrl: params.imageUrl,
      link: {
        webUrl: params.webUrl,
        mobileWebUrl: params.mobileWebUrl ?? params.webUrl,
      },
    },
    buttons: [
      {
        title: '인증서 보기',
        link: {
          webUrl: params.webUrl,
          mobileWebUrl: params.mobileWebUrl ?? params.webUrl,
        },
      },
    ],
  });
}

/**
 * 테스트/HMR 용 — 캐시 초기화.
 */
export function __resetKakaoShareCache(): void {
  kakaoSharePromise = null;
}
