// SpotDetail — 관광지 상세 정보 본문
// Server Component (정적 렌더만, 인터랙션 없음)
// detailCommon2 + detailIntro2 병합 객체를 받아 섹션별 정보 표시.
import Link from 'next/link';
import {
  Clock,
  MapPin,
  Phone,
  Globe,
  Calendar,
  ParkingSquare,
  Baby,
  PawPrint,
  CreditCard,
  Tag,
  Navigation,
} from 'lucide-react';
import type { SpotDetailCommon, SpotDetailIntro } from '@/types/tour';
import { CONTENT_TYPE_LABEL } from './SpotCard';

interface SpotDetailProps {
  spot: SpotDetailCommon & SpotDetailIntro;
}

/**
 * TourAPI overview 텍스트 안전 정리.
 * KorService2 overview는 일부 HTML 태그(<br>, <p>)가 포함됨.
 * DOMPurify 의존성을 피하기 위해 서버에서 화이트리스트 기반으로 정리.
 *  - <br>, <br/>, <br /> → 줄바꿈
 *  - 그 외 모든 태그 제거
 *  - HTML entity는 텍스트로 표시 (사용자가 신뢰 가능한 공공 API)
 */
function sanitizeOverview(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * KorService2 homepage 필드에서 안전한 http(s) URL 1건 추출.
 * v1.6 QA Week 2 fix: 기존 dangerouslySetInnerHTML + 정규식이 `javascript:` URL을 차단하지 못함 →
 * URL 스킴 화이트리스트(http/https만) + dangerouslySetInnerHTML 완전 제거.
 *
 * 입력 패턴 (KorService2 실측):
 *   - `<a href="https://...">https://...</a>` (대다수)
 *   - `https://...` (plain text)
 *   - 빈 문자열
 *   - HTML entity 인코딩 (`&amp;` 등)
 */
function extractHomepageUrl(html?: string): string | null {
  if (!html) return null;
  // `<a href="...">` 우선, 없으면 본문 자체
  const hrefMatch = /href\s*=\s*["']([^"']+)["']/i.exec(html);
  const raw = (hrefMatch?.[1] ?? html.replace(/<[^>]+>/g, '')).trim();
  // HTML entity 디코딩 (& → &)
  const decoded = raw
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
  // 화이트리스트: http(s) 스킴만 허용. javascript:·data:·file: 등 차단.
  if (!/^https?:\/\//i.test(decoded)) return null;
  return decoded;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        aria-hidden="true"
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand"
      >
        {icon}
      </div>
      <div className="flex-1 space-y-0.5">
        <dt className="text-caption text-muted-foreground">{label}</dt>
        <dd className="text-body-md text-foreground">{value}</dd>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border bg-card p-5 md:p-6">
      <h2 className="text-heading-md text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function SpotDetail({ spot }: SpotDetailProps) {
  const overview = sanitizeOverview(spot.overview);
  const fullAddress = [spot.addr1, spot.addr2].filter(Boolean).join(' ').trim();
  const typeLabel = CONTENT_TYPE_LABEL[spot.contenttypeid] ?? '기타';
  const homepageUrl = extractHomepageUrl(spot.homepage);

  const hasOperatingInfo = Boolean(
    spot.usetime || spot.restdate || spot.parking || spot.opendate
  );
  const hasAccessibility = Boolean(
    spot.chkbabycarriage || spot.chkpet || spot.chkcreditcard
  );
  const hasCategory = Boolean(
    spot.cat1 || spot.cat2 || spot.cat3 || spot.lclsSystm1
  );
  const hasGps = typeof spot.mapx === 'number' && typeof spot.mapy === 'number';

  // Kakao 지도 외부 링크 (Week 5에서 사이트 내 지도로 교체)
  const kakaoMapHref = hasGps
    ? `https://map.kakao.com/link/map/${encodeURIComponent(spot.title)},${spot.mapy},${spot.mapx}`
    : null;

  return (
    <article className="space-y-6">
      {/* 헤더 */}
      <header className="space-y-3">
        <span className="inline-flex items-center rounded-full bg-brand-surface px-3 py-1 text-caption text-brand">
          {typeLabel}
        </span>
        <h1 className="text-display-md text-foreground md:text-display-lg">
          {spot.title}
        </h1>
        {fullAddress ? (
          <p className="flex items-start gap-1.5 text-body-lg text-muted-foreground">
            <MapPin aria-hidden="true" className="mt-1 h-5 w-5 shrink-0" />
            <span>{fullAddress}</span>
          </p>
        ) : null}
      </header>

      {/* 개요 */}
      {overview ? (
        <Section title="소개">
          <p className="whitespace-pre-line text-body-md text-foreground">
            {overview}
          </p>
        </Section>
      ) : null}

      {/* 기본정보 */}
      <Section title="기본 정보">
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {spot.tel ? (
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label={spot.telname ?? '전화'}
              value={
                <a
                  href={`tel:${spot.tel.replace(/[^0-9+]/g, '')}`}
                  className="text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {spot.tel}
                </a>
              }
            />
          ) : null}
          {homepageUrl ? (
            <InfoRow
              icon={<Globe className="h-4 w-4" />}
              label="홈페이지"
              value={
                <a
                  href={homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {homepageUrl}
                </a>
              }
            />
          ) : null}
          {hasGps ? (
            <InfoRow
              icon={<Navigation className="h-4 w-4" />}
              label="GPS 좌표"
              value={
                <span className="font-mono text-body-sm">
                  {spot.mapy?.toFixed(5)}, {spot.mapx?.toFixed(5)}
                </span>
              }
            />
          ) : null}
        </dl>

        {kakaoMapHref ? (
          <div className="pt-2">
            <Link
              href={kakaoMapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-body-sm text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="카카오맵에서 위치 보기 (새 창)"
            >
              <MapPin aria-hidden="true" className="h-4 w-4" />
              지도에서 보기 (Week 5에 사이트 내 지도로 통합 예정)
            </Link>
          </div>
        ) : null}
      </Section>

      {/* 운영 정보 (detailIntro) */}
      {hasOperatingInfo ? (
        <Section title="운영 정보">
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {spot.usetime ? (
              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label="이용시간"
                value={
                  <span className="whitespace-pre-line">
                    {sanitizeOverview(spot.usetime)}
                  </span>
                }
              />
            ) : null}
            {spot.restdate ? (
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="휴무일"
                value={
                  <span className="whitespace-pre-line">
                    {sanitizeOverview(spot.restdate)}
                  </span>
                }
              />
            ) : null}
            {spot.parking ? (
              <InfoRow
                icon={<ParkingSquare className="h-4 w-4" />}
                label="주차"
                value={
                  <span className="whitespace-pre-line">
                    {sanitizeOverview(spot.parking)}
                  </span>
                }
              />
            ) : null}
            {spot.opendate ? (
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="개장일"
                value={spot.opendate}
              />
            ) : null}
          </dl>
        </Section>
      ) : null}

      {/* 접근성 / 편의 */}
      {hasAccessibility ? (
        <Section title="편의·접근성">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {spot.chkbabycarriage ? (
              <InfoRow
                icon={<Baby className="h-4 w-4" />}
                label="유모차 대여"
                value={spot.chkbabycarriage}
              />
            ) : null}
            {spot.chkpet ? (
              <InfoRow
                icon={<PawPrint className="h-4 w-4" />}
                label="반려동물 동반"
                value={spot.chkpet}
              />
            ) : null}
            {spot.chkcreditcard ? (
              <InfoRow
                icon={<CreditCard className="h-4 w-4" />}
                label="신용카드"
                value={spot.chkcreditcard}
              />
            ) : null}
          </dl>
        </Section>
      ) : null}

      {/* 분류 (Week 3에서 lclsSystmCode2 매핑으로 한글 라벨화 예정) */}
      {hasCategory ? (
        <Section title="분류">
          <div className="flex flex-wrap gap-2">
            {[spot.cat1, spot.cat2, spot.cat3, spot.lclsSystm1, spot.lclsSystm2, spot.lclsSystm3]
              .filter((c): c is string => Boolean(c))
              .map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-caption text-muted-foreground"
                >
                  <Tag aria-hidden="true" className="h-3 w-3" />
                  {code}
                </span>
              ))}
          </div>
          <p className="text-caption text-muted-foreground">
            * 분류 코드는 Week 3에 한글 라벨로 매핑 예정 (lclsSystmCode2)
          </p>
        </Section>
      ) : null}
    </article>
  );
}
