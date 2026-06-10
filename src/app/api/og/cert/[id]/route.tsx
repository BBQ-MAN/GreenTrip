// GET /api/og/cert/[id] — 인증서 OG 이미지 (1200×630)
// 참조: _workspace/00_input/week10_request.md §B-2, DEVELOPMENT_PLAN.md §7.5
//
// Next.js 14 `next/og` ImageResponse 사용.
// - **runtime: edge** — Windows dev + Vercel Node 양쪽에서 안정적.
//   (Node runtime은 Next 14 Windows에서 `import.meta.url → fileURLToPath` 변환 시
//   `.\file:\D:\...` 경로로 깨지는 알려진 버그가 있음. Edge variant는 fetch + new URL을
//   사용하여 안전.)
// - Edge runtime이므로 Prisma 직접 사용 불가 → 내부 `/api/report/[id]` fetch.
// - className 불가. 모든 스타일은 inline `style={{}}`. flex / absolute만 지원.
// - 폰트는 satori 기본 (noto-sans v27 latin) — 한글은 system fallback로 렌더되나
//   subpixel 렌더링이 일관됨. 필요 시 Pretendard 외부 fetch로 격상 가능 (Week 12+).
//
// 디자인 (시그니처 2 본격):
//   [헤더] 720×140  cert.gradient1→gradient2 그라데이션, "🌿 그린 여행 인증서"
//   [본문] 720×390  흰색 surface, 코스명·이동수단 라인·CO2 hero·소나무 환산
//   [푸터] 720×100  발급일·"GreenTrip × 한국관광공사"

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const MODE_LABEL_OG: Record<string, string> = {
  car: '자가용',
  express_bus: '고속버스',
  city_bus: '시내버스',
  train_ktx: 'KTX',
  train_itx: 'ITX',
  bicycle: '자전거',
  walking: '도보',
};

const TRANSPORT_EMOJI: Record<string, string> = {
  car: '🚗',
  express_bus: '🚌',
  city_bus: '🚌',
  train_ktx: '🚄',
  train_itx: '🚆',
  bicycle: '🚲',
  walking: '🚶',
};

interface ReportApiResponse {
  report: {
    id: string;
    savedCarbonG: number;
    savedTreeEq: number;
    createdAt: string;
    course: {
      title: string;
      transportMode: string;
    };
  };
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  // Edge runtime이므로 Prisma 사용 불가 → 내부 API fetch.
  // origin 추출 (Edge에서 headers().host 미동작 → req.url 파싱)
  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;
  const reportRes = await fetch(`${origin}/api/report/${params.id}`, {
    cache: 'no-store',
  });
  if (!reportRes.ok) {
    return new Response('Not Found', { status: 404 });
  }
  const { report } = (await reportRes.json()) as ReportApiResponse;

  const savedKg = (report.savedCarbonG / 1000).toFixed(1);
  const treeEq = report.savedTreeEq.toFixed(1);
  const transportLabel =
    MODE_LABEL_OG[report.course.transportMode] ?? report.course.transportMode;
  const transportEmoji = TRANSPORT_EMOJI[report.course.transportMode] ?? '🌿';
  const issuedAt = new Date(report.createdAt);
  const issuedLabel = `${issuedAt.getFullYear()}.${String(issuedAt.getMonth() + 1).padStart(2, '0')}.${String(issuedAt.getDate()).padStart(2, '0')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F3F4F2',
          padding: '40px',
        }}
      >
        {/* 외곽 카드 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(15,31,26,0.10)',
            border: '1px solid #D1FAE5',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* 헤더 (cert.gradient1 → cert.gradient2) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '140px',
              backgroundImage:
                'linear-gradient(90deg, #097A50 0%, #0E7490 100%)',
              color: '#FFFFFF',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '48px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              🌿 그린 여행 인증서
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '18px',
                fontWeight: 500,
                marginTop: '6px',
                opacity: 0.9,
              }}
            >
              GreenTrip Carbon Saving Certificate
            </div>
          </div>

          {/* 본문 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              padding: '48px 64px',
              justifyContent: 'space-between',
            }}
          >
            {/* 코스명 + 이동수단 라인 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: '20px',
                  color: '#6B7280',
                  fontWeight: 500,
                }}
              >
                코스
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '40px',
                  fontWeight: 800,
                  color: '#0F1F1A',
                  marginTop: '4px',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                {report.course.title}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '12px',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#0E7490',
                }}
              >
                {transportEmoji} {transportLabel}으로 이동
              </div>
            </div>

            {/* CO2 hero + 소나무 환산 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  color: '#097A50',
                }}
              >
                <span
                  style={{
                    fontSize: '120px',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}
                >
                  {savedKg}
                </span>
                <span
                  style={{
                    fontSize: '44px',
                    fontWeight: 800,
                    marginLeft: '8px',
                  }}
                >
                  kg
                </span>
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#0F1F1A',
                    marginLeft: '16px',
                  }}
                >
                  CO₂ 절감
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  marginTop: '8px',
                  fontSize: '22px',
                  fontWeight: 500,
                  color: '#4B5563',
                }}
              >
                = 소나무 {treeEq}그루 × 1년 흡수량
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 64px',
              borderTop: '1px solid #ECFDF5',
              backgroundColor: '#F8FAF7',
              color: '#6B7280',
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex' }}>{issuedLabel} 발급</div>
            <div
              style={{
                display: 'flex',
                fontWeight: 700,
                color: '#097A50',
              }}
            >
              GreenTrip × 한국관광공사
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
