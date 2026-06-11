import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  // skipWaiting === reloadOnOnline + cacheOnFrontEndNav defaults; expose via workboxOptions
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      // TourAPI Route Handler 응답: 6h NetworkFirst (서버 캐시 + SWR 위에 한 겹 더)
      {
        urlPattern: /^https?:\/\/[^/]+\/api\/tour\/.+/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'tour-api',
          expiration: { maxEntries: 200, maxAgeSeconds: 21600 },
          networkTimeoutSeconds: 5,
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // next/image 변환 캐시: 30d CacheFirst
      {
        urlPattern: /\/_next\/image\?.+/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-image',
          expiration: { maxEntries: 200, maxAgeSeconds: 2_592_000 },
        },
      },
      // TourAPI 원본 이미지 (tong.visitkorea.or.kr): 30d
      {
        urlPattern: /^https?:\/\/tong\.visitkorea\.or\.kr\/.+/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'tour-img',
          expiration: { maxEntries: 300, maxAgeSeconds: 2_592_000 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // TourAPI 이미지 호스트 (한국관광공사)
      { protocol: 'http', hostname: 'tong.visitkorea.or.kr' },
      { protocol: 'https', hostname: 'tong.visitkorea.or.kr' },
      // Kakao CDN (프로필·OAuth 이미지)
      { protocol: 'https', hostname: 'k.kakaocdn.net' },
      { protocol: 'https', hostname: 't1.kakaocdn.net' },
      { protocol: 'https', hostname: 'img1.kakaocdn.net' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // 기본 보안 헤더 (재감사 H-2·L-3)
  // - Referrer-Policy: 외부 리소스 요청 시 URL(쿼리 포함) Referer 누출 차단
  // - CSP는 Kakao Maps SDK·인라인 스크립트 영향 검증 후 별도 도입 (의도적 보류)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=()' },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
