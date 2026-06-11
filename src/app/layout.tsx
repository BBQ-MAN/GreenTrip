import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Providers } from './providers';
import './globals.css';

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://green-trip-eight.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GreenTrip — 저탄소 여행 코스 플래너',
    template: '%s | GreenTrip',
  },
  description:
    '이동수단별 탄소 배출량을 비교하고, 저탄소 최적 관광 코스를 자동 설계하는 지속가능 여행 플래너. 한국관광공사 TourAPI 기반 강원도 특화.',
  keywords: ['저탄소', '여행', '탄소발자국', '관광', '강원도', 'GreenTrip', '그린트립'],
  authors: [{ name: 'Massgraphy' }],
  manifest: '/manifest.json',
  applicationName: 'GreenTrip',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GreenTrip',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    // iOS는 apple-touch-icon에서 SVG를 렌더하지 않으므로 PNG 사용.
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    title: 'GreenTrip — 저탄소 여행 코스 플래너',
    description: '같은 여행지, 다른 이동 방식 — 탄소 배출을 가시화하세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'GreenTrip',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GreenTrip — 저탄소 여행 코스 플래너',
    description: '같은 여행지, 다른 이동 방식 — 탄소 배출을 가시화하세요.',
  },
};

export const viewport: Viewport = {
  // 다크모드는 현재 미지원 (토큰만 정의, 활성 경로 없음 — reaudit N-2).
  // 다크 theme-color 메타를 두면 OS 다크에서 브라우저 크롬만 어두워지고 본문은
  // 라이트로 남아 상단 seam이 생기므로 라이트 단일 값으로 고정.
  // 다크모드 활성화(next-themes 도입) 시 media 분기 복원할 것.
  themeColor: '#F8FAF7',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
          >
            본문 바로가기
          </a>
          <Header />
          <div id="main-content" className="flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
