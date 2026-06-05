// ShareButtons — 인증서 공유 3종 (이미지 다운로드 / 카카오톡 / 링크 복사)
// Client Component (navigator.clipboard + Kakao Share SDK lazy load).
// 참조: _workspace/00_input/week10_request.md §C-4, STRATEGY.md 시그니처 2 (영구 URL + SNS 공유)
'use client';

import { useState, useTransition } from 'react';
import { Download, Share2, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shareToKakao } from '@/lib/kakao/share';

export interface ShareButtonsProps {
  /** report id — URL 조합용 */
  reportId: string;
  /** 코스 제목 — 카카오톡 메시지 description */
  courseName: string;
  /** 절감 kg (소수점 1자리) — 카카오톡 메시지 description */
  savedKg: number;
  /**
   * 사이트 origin — Server에서 추출해 prop으로 전달 (SSR 안전).
   * 예: 'https://greentrip.com', 'http://localhost:3000'
   */
  origin: string;
}

export function ShareButtons({
  reportId,
  courseName,
  savedKg,
  origin,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, startShareTransition] = useTransition();

  const reportUrl = `${origin}/report/${reportId}`;
  const ogUrl = `${origin}/api/og/cert/${reportId}`;

  const handleKakao = () => {
    startShareTransition(async () => {
      try {
        await shareToKakao({
          title: '🌿 그린 여행 인증서',
          description: `${courseName} 코스로 CO₂ ${savedKg.toFixed(1)}kg 절감했어요!`,
          imageUrl: ogUrl,
          webUrl: reportUrl,
        });
      } catch (e) {
        // Kakao 미설정 / SDK 로드 실패 시 폴백 — 링크 복사 안내
        // eslint-disable-next-line no-console
        console.warn('[kakao share]', e);
        if (typeof window !== 'undefined') {
          window.alert(
            '카카오톡 공유에 실패했습니다. 링크 복사를 이용해 주세요.',
          );
        }
      }
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 일부 브라우저(http context)는 clipboard 거부 → 폴백
      window.prompt('아래 링크를 복사하세요', reportUrl);
    }
  };

  return (
    <div
      role="group"
      aria-label="인증서 공유"
      className="flex flex-col gap-2 sm:flex-row sm:gap-3"
    >
      <Button
        asChild
        variant="outline"
        className="flex-1"
      >
        <a
          href={ogUrl}
          download={`greentrip-cert-${reportId}.png`}
          aria-label="인증서 이미지 다운로드"
        >
          <Download aria-hidden="true" className="mr-2 h-4 w-4" />
          이미지 다운로드
        </a>
      </Button>

      <Button
        onClick={handleKakao}
        disabled={sharing}
        aria-busy={sharing}
        className="flex-1 bg-cert hover:bg-cert/90 focus-visible:ring-cert"
      >
        <Share2 aria-hidden="true" className="mr-2 h-4 w-4" />
        {sharing ? '공유 중…' : '카카오톡 공유'}
      </Button>

      <Button
        onClick={handleCopy}
        variant="outline"
        className="flex-1"
        aria-live="polite"
      >
        {copied ? (
          <>
            <Check aria-hidden="true" className="mr-2 h-4 w-4 text-cert" />
            복사 완료!
          </>
        ) : (
          <>
            <LinkIcon aria-hidden="true" className="mr-2 h-4 w-4" />
            링크 복사
          </>
        )}
      </Button>
    </div>
  );
}
