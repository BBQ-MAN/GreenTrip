import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'GreenTrip — 저탄소 여행 코스 플래너',
    template: '%s | GreenTrip',
  },
  description:
    '이동수단별 탄소 배출량을 비교하고, 저탄소 최적 관광 코스를 자동 설계하는 지속가능 여행 플래너. 한국관광공사 TourAPI 기반 강원도 특화.',
  keywords: ['저탄소', '여행', '탄소발자국', '관광', '강원도', 'GreenTrip', '그린트립'],
  authors: [{ name: 'Massgraphy' }],
  openGraph: {
    title: 'GreenTrip — 저탄소 여행 코스 플래너',
    description: '같은 여행지, 다른 이동 방식 — 탄소 배출을 가시화하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAF7' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0F0D' },
  ],
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
      </body>
    </html>
  );
}
