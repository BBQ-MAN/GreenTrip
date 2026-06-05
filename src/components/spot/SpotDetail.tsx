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
import type { SpotDetailCommon, SpotDetailIntro, PetInfo } from '@/types/tour';
import { CONTENT_TYPE_LABEL, categoryLabel } from '@/lib/tourapi/categories';
import { CONTENT_TYPE } from '@/lib/tourapi/constants';
import { FestivalBadge } from '@/components/course/FestivalBadge';
import { PetBadge } from '@/components/spot/PetBadge';
import { isPetFriendlyChkValue } from '@/lib/course/filters';

interface SpotDetailProps {
  /**
   * detailCommon2 + detailIntro2 + (선택) detailPetTour2 병합 객체.
   * petInfo 필드는 KorService2 detailPetTour2 응답 (Week 8~9 부착).
   */
  spot: SpotDetailCommon & SpotDetailIntro & { petInfo?: PetInfo };
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

/**
 * YYYYMMDD → "yyyy.mm.dd" 변환. 형식 불일치 시 원본 그대로 반환.
 */
function formatYmd(yyyymmdd?: string): string | null {
  if (!yyyymmdd || typeof yyyymmdd !== 'string') return null;
  const s = yyyymmdd.trim();
  if (!/^\d{8}$/.test(s)) return s;
  return `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`;
}

export function SpotDetail({ spot }: SpotDetailProps) {
  const overview = sanitizeOverview(spot.overview);
  const fullAddress = [spot.addr1, spot.addr2].filter(Boolean).join(' ').trim();
  const typeLabel = CONTENT_TYPE_LABEL[spot.contenttypeid] ?? '기타';
  const homepageUrl = extractHomepageUrl(spot.homepage);

  // 축제 식별 (Week 6~7) — contentTypeId=15 또는 eventStart/End 보유 시
  const eventStart = typeof spot.eventstartdate === 'string' ? spot.eventstartdate : undefined;
  const eventEnd = typeof spot.eventenddate === 'string' ? spot.eventenddate : undefined;
  const isFestival =
    spot.contenttypeid === CONTENT_TYPE.축제공연행사 || Boolean(eventStart);
  const eventPlace = typeof spot.eventplace === 'string' ? spot.eventplace : undefined;
  const sponsor1 = typeof spot.sponsor1 === 'string' ? spot.sponsor1 : undefined;
  const usetimeFestival =
    typeof spot.usetimefestival === 'string' ? spot.usetimefestival : undefined;
  const playtime = typeof spot.playtime === 'string' ? spot.playtime : undefined;

  // 반려동물 식별 (Week 8~9) — chkpet="가능"/Y 또는 petInfo 객체 보유 시.
  // 헤더 뱃지는 두 신호 중 하나라도 있으면 노출. 본문 Section은 petInfo 객체가 있어야 노출.
  const pet = spot.petInfo;
  const hasPetInfo = Boolean(pet && Object.keys(pet).length > 1);
  const isPetFriendly = isPetFriendlyChkValue(spot.chkpet) || hasPetInfo;

  const hasOperatingInfo = Boolean(
    spot.usetime || spot.restdate || spot.parking || spot.opendate
  );
  const hasAccessibility = Boolean(
    spot.chkbabycarriage || spot.chkpet || spot.chkcreditcard
  );
  // 분류 라벨 dedupe (Week 3 QA Medium #2 fix):
  //   prefix 매칭으로 lclsSystm2(HS01)와 lclsSystm3(HS010100)가 동일 라벨 "역사유적"이 되는 케이스 회피.
  //   같은 라벨은 1번만 표시하고, 결합된 원본 코드는 title 속성에 보존.
  const categoryEntries: Array<{ label: string; codes: string[] }> = (() => {
    const codes = [spot.cat1, spot.cat2, spot.cat3, spot.lclsSystm1, spot.lclsSystm2, spot.lclsSystm3]
      .filter((c): c is string => Boolean(c));
    const byLabel = new Map<string, string[]>();
    for (const code of codes) {
      const label = categoryLabel(code);
      if (!label) continue;
      const arr = byLabel.get(label);
      if (arr) arr.push(code);
      else byLabel.set(label, [code]);
    }
    return Array.from(byLabel.entries()).map(([label, codes]) => ({ label, codes }));
  })();
  const hasCategory = categoryEntries.length > 0;
  const hasGps = typeof spot.mapx === 'number' && typeof spot.mapy === 'number';

  // Kakao 지도 외부 링크 (Week 5에서 사이트 내 지도로 교체)
  const kakaoMapHref = hasGps
    ? `https://map.kakao.com/link/map/${encodeURIComponent(spot.title)},${spot.mapy},${spot.mapx}`
    : null;

  return (
    <article className="space-y-6">
      {/* 헤더 */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-brand-surface px-3 py-1 text-caption text-brand">
            {typeLabel}
          </span>
          {/* 축제 시각 강조 — 타입 뱃지 옆에 병렬 배치 */}
          {isFestival ? (
            <FestivalBadge
              eventStartDate={eventStart}
              eventEndDate={eventEnd}
              size="md"
            />
          ) : null}
          {/* 반려동물 동반 시각 강조 — 축제 뱃지 옆에 병렬 배치 */}
          {isPetFriendly ? (
            <PetBadge petInfo={pet?.petInfo} size="md" />
          ) : null}
        </div>
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

      {/* 행사 정보 (contentTypeId=15 또는 eventstartdate 보유 시) */}
      {isFestival ? (
        <Section title="🎉 행사 정보">
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {eventStart || eventEnd ? (
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="행사 기간"
                value={
                  <span className="numeric">
                    {formatYmd(eventStart) ?? '미정'}
                    {' ~ '}
                    {formatYmd(eventEnd) ?? '미정'}
                  </span>
                }
              />
            ) : null}
            {eventPlace ? (
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="행사 장소"
                value={<span className="whitespace-pre-line">{eventPlace}</span>}
              />
            ) : null}
            {usetimeFestival ? (
              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label="이용 요금"
                value={
                  <span className="whitespace-pre-line">
                    {sanitizeOverview(usetimeFestival)}
                  </span>
                }
              />
            ) : null}
            {playtime ? (
              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label="공연 시간"
                value={
                  <span className="whitespace-pre-line">
                    {sanitizeOverview(playtime)}
                  </span>
                }
              />
            ) : null}
            {sponsor1 ? (
              <InfoRow
                icon={<Tag className="h-4 w-4" />}
                label="주최"
                value={sponsor1}
              />
            ) : null}
          </dl>
        </Section>
      ) : null}

      {/* 반려동물 정보 (Week 8~9, detailPetTour2 응답 보유 시) */}
      {hasPetInfo && pet ? (
        <Section title="🐾 반려동물 정보">
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pet.acmpyTypeCd ? (
              <InfoRow
                icon={<PawPrint className="h-4 w-4" />}
                label="동반 유형"
                value={<span className="whitespace-pre-line">{pet.acmpyTypeCd}</span>}
              />
            ) : null}
            {pet.acmpyPsblCpam ? (
              <InfoRow
                icon={<PawPrint className="h-4 w-4" />}
                label="동반 가능 동물"
                value={<span className="whitespace-pre-line">{pet.acmpyPsblCpam}</span>}
              />
            ) : null}
            {pet.acmpyNeedMtr ? (
              <InfoRow
                icon={<PawPrint className="h-4 w-4" />}
                label="필요 사항"
                value={<span className="whitespace-pre-line">{pet.acmpyNeedMtr}</span>}
              />
            ) : null}
            {pet.relaAcdntRiskMtr ? (
              <InfoRow
                icon={<PawPrint className="h-4 w-4" />}
                label="사고 위험 사항"
                value={<span className="whitespace-pre-line">{pet.relaAcdntRiskMtr}</span>}
              />
            ) : null}
            {pet.etcAcmpyInfo ? (
              <InfoRow
                icon={<PawPrint className="h-4 w-4" />}
                label="기타 동반 정보"
                value={<span className="whitespace-pre-line">{pet.etcAcmpyInfo}</span>}
              />
            ) : null}
            {pet.relaPosesFclty ? (
              <InfoRow
                icon={<PawPrint className="h-4 w-4" />}
                label="관련 시설"
                value={<span className="whitespace-pre-line">{pet.relaPosesFclty}</span>}
              />
            ) : null}
            {pet.relaFrnshPrdlst ? (
              <InfoRow
                icon={<PawPrint className="h-4 w-4" />}
                label="비치 물품"
                value={<span className="whitespace-pre-line">{pet.relaFrnshPrdlst}</span>}
              />
            ) : null}
            {pet.relaPurcPrdlst ? (
              <InfoRow
                icon={<PawPrint className="h-4 w-4" />}
                label="구매 가능 물품"
                value={<span className="whitespace-pre-line">{pet.relaPurcPrdlst}</span>}
              />
            ) : null}
            {pet.relaRntlPrdlst ? (
              <InfoRow
                icon={<PawPrint className="h-4 w-4" />}
                label="대여 가능 물품"
                value={<span className="whitespace-pre-line">{pet.relaRntlPrdlst}</span>}
              />
            ) : null}
            {pet.petInfo ? (
              <InfoRow
                icon={<PawPrint className="h-4 w-4" />}
                label="요약"
                value={<span className="whitespace-pre-line">{pet.petInfo}</span>}
              />
            ) : null}
          </dl>
        </Section>
      ) : null}

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

      {/* 분류 — Week 3: categoryLabel(code) 한글 매핑 + Medium #2 fix dedupe (같은 라벨 1번만, 원본 코드는 title에 결합) */}
      {hasCategory ? (
        <Section title="분류">
          <div className="flex flex-wrap gap-2">
            {categoryEntries.map(({ label, codes }) => {
                const codesJoined = codes.join(' / ');
                const showTitle = label !== codesJoined;
                return (
                  <span
                    key={codesJoined}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-caption text-muted-foreground"
                    title={showTitle ? codesJoined : undefined}
                  >
                    <Tag aria-hidden="true" className="h-3 w-3" />
                    {label}
                  </span>
                );
              })}
          </div>
        </Section>
      ) : null}
    </article>
  );
}
