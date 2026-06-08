// /signin layout — Client 컴포넌트인 page.tsx 옆에서 메타데이터를 export.
// (page.tsx는 'use client'이므로 metadata export 불가 → layout으로 분리)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인',
  description:
    'GreenTrip 로그인 — 카카오 또는 이메일로 시작. 로그인 없이도 코스 생성과 인증서 발급이 가능합니다.',
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
