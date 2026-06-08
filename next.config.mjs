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
};

export default withPWA(nextConfig);
