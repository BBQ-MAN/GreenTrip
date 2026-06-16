import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'GreenTrip 디자인 변형 카탈로그',
  description: '10개 디자인 변형 비교 인덱스',
};

type Variant = {
  id: string;
  name_ko: string;
  name_en: string;
  one_line_pitch: string;
  inspiration: string;
  palette: {
    bg: string;
    fg: string;
    primary: string;
    accent: string;
    muted: string;
    surface: string;
  };
  typography: {
    display_class: string;
    body_class: string;
    hero_size_rem: number;
    numeric_class: string;
  };
  hero_pattern: string;
  compare_pattern: string;
  cert_pattern: string;
  differentiation_from_main: string;
};

const VARIANTS: Variant[] = [
  {
    id: 'v01',
    name_ko: '토스 그린',
    name_en: 'toss-quiet-green',
    one_line_pitch:
      '98% 화이트 캔버스 위에 거대한 탭률러 숫자 하나로 모든 것을 말하는 토스풍 정렬',
    inspiration: "Toss TDS, Pretendard, Vercel Dashboard 'Number-Is-Hero'",
    palette: {
      bg: '#FFFFFF',
      fg: '#202632',
      primary: '#097A50',
      accent: '#0064FF',
      muted: '#8B8C95',
      surface: '#F2F4F6',
    },
    typography: {
      display_class: 'font-bold tracking-tight tabular-nums',
      body_class: 'font-normal text-[16px] leading-[24px]',
      hero_size_rem: 6,
      numeric_class: 'tabular-nums tracking-[-0.02em] font-semibold',
    },
    hero_pattern:
      "왼쪽 정렬, 5% 표면적만 차지하는 한 줄 동사형 헤드라인 ('서울에서 속초까지, 68% 줄였어요'). 그 아래 '67.6%'가 단일 시각 앵커로 96px Pretendard SemiBold, 탭률러 넘, -2% tracking. 단위 'kg CO₂'는 16px Regular 60% 불투명도로 베이스라인 정렬. 우측 60% 여백. 모바일은 풀폭 영수증 카드로 스택.",
    compare_pattern:
      '세로 영수증 스타일 카드 3개를 모바일에서 스택. 각 카드는 좌측 라벨(KTX/버스+자전거/도보+자전거) 우측 탭률러 숫자만. 카드 사이 1px hairline 구분선. 추천안에만 #097A50 좌측 2px 세로 스트립. 데스크탑은 3-up 그리드, 소수점 위치가 세로로 완벽히 정렬되도록 tabular-nums.',
    cert_pattern:
      '플랫 화이트 카드, 1px #E5E7EB 보더, 그라데이션 없음. 중앙 상단에 거대한 인증 번호(#202632, 탭률러), 하단에 작은 발급일·해시. 카카오 공유는 하단 56px 풀폭 sticky 시트 버튼 #097A50.',
    differentiation_from_main:
      "현재 카드-로우 3안 비교가 영수증 스택으로 바뀌고, 그라데이션 인증서가 1px hairline 플랫으로 평탄화된다. 색상이 표면의 5% 미만으로 떨어져 즉시 '핀테크 정렬'로 읽힌다.",
  },
  {
    id: 'v02',
    name_ko: '구글 플라이트 인라인',
    name_en: 'google-flights-inline-leaf',
    one_line_pitch:
      '가격·시간·CO₂가 같은 행에 동등한 컬럼으로 서는 OTA 비교 표면',
    inspiration: 'Google Flights, Booking.com',
    palette: {
      bg: '#F8FAFC',
      fg: '#202124',
      primary: '#1E8E3E',
      accent: '#1A73E8',
      muted: '#5F6368',
      surface: '#FFFFFF',
    },
    typography: {
      display_class: 'font-semibold tracking-tight',
      body_class: 'font-normal text-[14px] leading-[20px]',
      hero_size_rem: 5,
      numeric_class: 'font-medium tabular-nums',
    },
    hero_pattern:
      "상단 중앙에 가로형 플래너 위젯(출발·도착·기간·동반자) 한 줄, Booking 스타일 #1A73E8 트러스트 블루 얇은 보더. 위젯 위 단일 동사형 카피 'Compare by CO₂'. 위젯 아래 즉시 결과 행 3개. 모바일은 위젯이 풀폭, 결과 행은 풀폭 단일 컬럼.",
    compare_pattern:
      "결과 행은 단일 가로 라인: [아이콘][교통수단][소요시간][요금][초록 leaf 배지 67.6%][CTA →]. CO₂ leaf 배지가 가격과 같은 행, 같은 사이즈 weight로 동등한 컬럼. 추천안은 좌측 4px #1E8E3E 라인. 정렬 토글 '시간순 / 비용순 / CO₂순'을 결과 상단에 탭으로.",
    cert_pattern:
      "Google Flights 결제 영수증 톤. 상단 #1E8E3E 얇은 헤더 바, 본문은 라벨-값 2컬럼 표. 'lower emissions' leaf 마크가 좌측, 우측에 PDF / 카카오 / URL 복사 3개 미니 아이콘 버튼.",
    differentiation_from_main:
      "현재의 분리된 3안 카드가 동일 행 비교 테이블로 압축되어, 사용자가 '항공권 비교하듯' CO₂를 가격의 동등한 컬럼으로 인지한다. 인증서는 결제 영수증으로 재해석.",
  },
  {
    id: 'v03',
    name_ko: '파타고니아 저널',
    name_en: 'patagonia-field-journal',
    one_line_pitch:
      '크림 캔버스에 풀블리드 강원 풍경 다큐와 손글씨 라우트 라인, 데이터는 영양정보 라벨처럼 인쇄됨',
    inspiration: 'Patagonia Footprint Chronicles, Oatly, Treedom',
    palette: {
      bg: '#F4EFE6',
      fg: '#1B1B1B',
      primary: '#3B5A3A',
      accent: '#C84B25',
      muted: '#7A6A56',
      surface: '#EAE3D2',
    },
    typography: {
      display_class: 'font-medium tracking-tight',
      body_class: 'font-normal text-[17px] leading-[28px]',
      hero_size_rem: 5,
      numeric_class: 'font-mono tracking-tight',
    },
    hero_pattern:
      "풀블리드 강원 산악 다큐 사진(가로 16:10), 위에 손그림 SVG 라우트 라인이 오버레이. 라인 끝에 타자기 모노스페이스 핀: '~12.4 kg CO₂e'. 헤드라인은 사진 아래 매거진 칼럼 폭(640px)으로 떨어져, sentence-case 단편. 흰색 배경 0%, 모든 표면이 #F4EFE6 크림.",
    compare_pattern:
      "Before/After 다이어드(diptych) 매거진 스프레드. 왼쪽 '기존 자가용' 풍경 사진 + 모노 라벨 '12.4 kg', 오른쪽 '저탄소 코스' 동일 풍경 + 모노 라벨 '4.0 kg'. 차트 프레임 없음. 사진 자체가 비교. 3안은 하단에 세로 magazine sidebar로 작게 인덱스.",
    cert_pattern:
      "Oatly 영양정보 라벨 스타일. 크림 카드 #EAE3D2, 검정 mono 'CARBON RECEIPT' 헤더, 항목별 kg CO₂e 줄단위 인쇄(서울-속초 KTX 2.1kg / 도보 0.0kg / ...). 우측 하단 '서명·날짜'. 공유는 라벨 아래 줄line.",
    differentiation_from_main:
      "흰 배경이 크림으로 전환되고, 차트 카드가 풀블리드 다큐 사진과 영양정보 라벨로 대체된다. 즉시 '엔터프라이즈 대시보드'에서 '롱폼 매거진'으로 분기.",
  },
  {
    id: 'v04',
    name_ko: '스트라이프 렛저',
    name_en: 'stripe-fintech-ledger',
    one_line_pitch:
      'Sohne 세리프-아닌 얇은 디스플레이와 탭률러 정렬로 CO₂를 재무제표처럼 조판',
    inspiration: 'Stripe Annual Update 2025, Vercel Dashboard, Linear Insights',
    palette: {
      bg: '#F6F9FC',
      fg: '#0A2540',
      primary: '#097A50',
      accent: '#635BFF',
      muted: '#425466',
      surface: '#FFFFFF',
    },
    typography: {
      display_class: 'font-light tracking-[-0.02em] tabular-nums',
      body_class: 'font-normal text-[16px] leading-[24px]',
      hero_size_rem: 7,
      numeric_class: 'font-light tabular-nums tracking-[-0.02em]',
    },
    hero_pattern:
      "상단 작은 11px UPPERCASE +0.06em tracking 라벨 'TRIP CARBON SAVED'. 그 아래 거대한 thin display '67.6%' (112px, weight 300, -0.02em). 그 아래 인라인 델타 화살표 + 미니 sparkline(12 trips). 우측 상단 #635BFF 6px dot 추천 마커. 1px hairline 보더만, shadow 0.",
    compare_pattern:
      "3-up 카드 그리드, 모두 #FFFFFF 카드 1px #E3E8EE hairline 보더. 각 카드 anatomy 고정: 11px UPPERCASE 라벨 → 거대한 thin 숫자 (모든 소수점이 세로로 정렬, tabular-nums) → 델타 + 인라인 4-bar sparkline 같은 행 → 12px muted 'vs 자가용 기준'. 추천안만 좌측 1px #097A50 액센트 보더.",
    cert_pattern:
      '재무제표 헤더 스타일. 거대한 thin 인증번호(96px, weight 300, #0A2540), 그 아래 라벨/값 2컬럼 표(15행). 우측 상단 사각 #635BFF 1×1cm QR 코드. 시그너처 라인은 1px hairline + mono 캡션.',
    differentiation_from_main:
      "현재 SemiBold 사인 sans → weight 300 thin display로 점프. 그라데이션 인증서 → 1px hairline 재무제표. 액센트가 그린→퍼플로 분기되어 '핀테크 신뢰감'이 즉시 읽힌다.",
  },
  {
    id: 'v05',
    name_ko: '랩드 9:16',
    name_en: 'spotify-wrapped-dark',
    one_line_pitch:
      '다크 캔버스에 한 화면을 가득 채우는 거대 숫자와 휴먼 리프레이밍, 9:16 공유 카드 데크',
    inspiration: 'Spotify Wrapped 2025, Strava Year in Sport, Doconomy',
    palette: {
      bg: '#0E1A14',
      fg: '#F2F7F2',
      primary: '#7CD992',
      accent: '#FFD93D',
      muted: '#6B7568',
      surface: '#1A2A20',
    },
    typography: {
      display_class: 'font-black tracking-[-0.03em]',
      body_class: 'font-normal text-[16px] leading-[24px]',
      hero_size_rem: 9,
      numeric_class: 'font-black tracking-[-0.03em]',
    },
    hero_pattern:
      "다크 #0E1A14 배경, 거대한 #7CD992 숫자 '67.6%'가 viewport 60% 차지(144px font-black). 바로 아래 휴먼 리프레이밍 한 문장: '= 나무 47그루가 한 달간 흡수하는 양'. 9:16 모바일 비율 카드 프레임. 우측 하단 GreenTrip 워드마크.",
    compare_pattern:
      "스냅스크롤 캐러셀. 각 슬라이드 = 9:16 풀스크린 카드, 각 옵션마다 다른 도미넌트 컬러 블록: 슬라이드1 amber #FFD93D bg + 'KTX · 12.4kg', 슬라이드2 teal bg + '버스+자전거 · 4.1kg', 슬라이드3 green #7CD992 bg + '도보+자전거 · 0.8kg'. 각 카드 한 슬라이드당 한 숫자 + 한 문장.",
    cert_pattern:
      '9:16 공유 카드 그 자체가 인증서. 상단 60% 거대 숫자 + 워드마크, 하단 33% 리프레이밍 문장 + 발급일·해시·QR. 한 번 탭 → 카카오톡 공유 시트. 카카오 미리보기에 9:16 그대로 노출되도록 og:image 1080×1920 사전 렌더.',
    differentiation_from_main:
      '유일한 다크 모드 카드. 현재 라이트 그린 → 딥 포레스트 + 일렉트릭 라임. 카드-로우 3안 → 풀스크린 스냅 캐러셀. 인증서가 시각적으로 공유 카드 그 자체.',
  },
  {
    id: 'v06',
    name_ko: '당근 따뜻',
    name_en: 'daangn-warm-civic',
    one_line_pitch:
      'Korean 이웃 존댓말 카피와 따뜻한 동네 사진, 매너온도 스타일 탄소 절감 칩',
    inspiration: 'Daangn Seed Design, Kakao Bank, Naver Map V6',
    palette: {
      bg: '#FFF8F2',
      fg: '#212124',
      primary: '#097A50',
      accent: '#FF7E36',
      muted: '#6B7280',
      surface: '#FFFFFF',
    },
    typography: {
      display_class: 'font-semibold tracking-tight',
      body_class: 'font-normal text-[16px] leading-[26px]',
      hero_size_rem: 5,
      numeric_class: 'font-bold tabular-nums',
    },
    hero_pattern:
      "16:10 풀블리드 강원 마을 풍경 사진(따뜻한 골든 아워), 하단 좌측에 60% 검정 스크림 오버레이 위 '오늘은 어디로 가볼까요?' 친근 sentence-case 헤드라인. 우측 상단에 매너온도 스타일 칩: '🌱 탄소 절감 4.2kg' #097A50 pill. 모바일 64px 하단 5탭 네비.",
    compare_pattern:
      "Naver Map V6 thumb-zone 패턴. 풀폭 1-up 카드 3개 세로 스택, 각 카드 좌측 4:6 사진 / 우측 정보. 정보에는 친근 카피 ('자전거로 즐기는 동해'), 매너온도 스타일 mini-chip 탄소·시간·거리. 추천안 좌측 8px #097A50 라운드 라인 + '이웃 추천' 작은 배지.",
    cert_pattern:
      "마치 당근 거래 후기 카드처럼. 라운드 24px 화이트 카드, 상단에 친근 일러스트 잎(🌿 SVG), 가운데 '강원 이웃 인증' 카피, 하단에 큰 칩 두 개: '🌱 4.2kg 절감' #097A50 / '⏱ 6시간' #FF7E36 보조. 공유 영역은 카카오 친구 추천 톤.",
    differentiation_from_main:
      "흰 배경 → 따뜻한 크림 톤. 분석적 카드 → 사진 4:6 + 친근 이웃 카피. 액센트가 #FF7E36 캐롯 오렌지로 분기되어 '시민·로컬·이웃' 톤이 즉시 읽힌다.",
  },
  {
    id: 'v07',
    name_ko: '퍼딩 데이터 에세이',
    name_en: 'pudding-pinned-chart-essay',
    one_line_pitch:
      '스크롤 잠금 차트가 본문이 되고 글이 차트를 주석하는 데이터 저널리즘 에세이',
    inspiration: 'The Pudding, Pitchfork, Aeon',
    palette: {
      bg: '#F4F1EA',
      fg: '#1B1B1B',
      primary: '#097A50',
      accent: '#FF5A36',
      muted: '#6B6557',
      surface: '#EAE5D6',
    },
    typography: {
      display_class: 'font-bold tracking-tight',
      body_class: 'font-normal text-[19px] leading-[32px]',
      hero_size_rem: 7,
      numeric_class: 'font-mono tracking-tight',
    },
    hero_pattern:
      "Pitchfork 점수 스타일. 좌측 2/5 컬럼에 거대한 wedge-serif (또는 묵직 sans Bold) '67.6%' 120px, 베이스라인 블리드. 우측 3/5 컬럼에 italic 한 줄 헤드라인 'Korea's cleanest 1-day route, by the numbers.' + 그 아래 mono caps 메타데이터 스트립. 카드 그리드 0개.",
    compare_pattern:
      'Pudding 스크롤 잠금. 3-bar 차트(amber/teal/green)가 sticky로 viewport 중앙에 고정, 사용자가 스크롤하면 좌측 본문 단락이 1) KTX 막대만 강조, 2) 버스+자전거 막대로 포커스 전환, 3) 도보+자전거 막대 라이즈 + Δ 67.6% 라벨 등장. 각 단계 250ms 트랜지션.',
    cert_pattern:
      "MUBI 크레딧 스트립 + 드롭캡. 단일 640px 칼럼, 'Verified Low-Carbon Trip' 헤드라인 아래 드롭캡 오프닝 paragraph. 본문 아래 mono caps 크레딧 스트립: 'ROUTE · DATE · CO₂ SAVED · HASH'. 우측 하단 작은 QR + 카카오 텍스트 링크.",
    differentiation_from_main:
      "차트가 카드 안의 보조 → 페이지 본문 그 자체. 비교가 정적 3-up → 스크롤 동기화 단계별 narration. 즉시 '뉴욕타임스 인터랙티브'로 읽힌다.",
  },
  {
    id: 'v08',
    name_ko: '무신사 에디토리얼',
    name_en: 'musinsa-editorial-catalog',
    one_line_pitch:
      '블랙-온-화이트 패션 매거진 그리드, 3안은 룩북 상품 카드, 색은 비교 코드만 허용',
    inspiration: 'Musinsa, A24 Films, Pretendard',
    palette: {
      bg: '#FFFFFF',
      fg: '#0A0A0B',
      primary: '#097A50',
      accent: '#DC2626',
      muted: '#71717A',
      surface: '#F1F1F1',
    },
    typography: {
      display_class: 'font-black tracking-[-0.03em] uppercase',
      body_class: 'font-normal text-[15px] leading-[24px]',
      hero_size_rem: 7,
      numeric_class: 'font-black tabular-nums tracking-[-0.02em]',
    },
    hero_pattern:
      "100vh 풀블리드 강원 흑백 + 약간 톤 다운 사진(고대비). 좌하단에 Pretendard Black 72px '저탄소 한국, 컬렉션 No. 04' 에디토리얼 헤드라인, Korean + Latin caps 혼용 -3% tracking. 차트나 카드 없음. 사진과 헤드라인뿐.",
    compare_pattern:
      "Musinsa 룩북 상품 카드 3-up 하드 그리드, 8px gutter. 각 카드 anatomy: 상단 4:5 사진 (KTX/자전거/도보 풍경) → 하단 정보: 11px UPPERCASE 라벨 'KTX' → 거대 40px Black 숫자 '12.4kg' → 마지막 줄 1px 하단 컬러 스트립 (#D97706 / #0E7490 / #097A50). 추천안은 상단 우측 작은 #DC2626 '추천' 인장 도장.",
    cert_pattern:
      "A24 룩북 커버. 풀폭 화이트 카드, 상단 사진 4:5 비율, 그 아래 거대한 Pretendard Black 'LOW-CARBON CERTIFIED' 캡션. 우측 하단 빨간 잉크 스탬프 #DC2626 (도장 형태, 회전 -8deg). mono 캡션 줄에 라우트 · 날짜 · 해시.",
    differentiation_from_main:
      "soft 그린 톤 → 하드 블랙 잉크 + 단일 빨강 도장. 카드의 둥근 모서리 → 0px radius 하드 에지. 즉시 '패션 매거진 catalog'로 읽힌다.",
  },
  {
    id: 'v09',
    name_ko: '에온 슬로우 에세이',
    name_en: 'aeon-slow-serif-essay',
    one_line_pitch:
      '따뜻한 종이 위 디스플레이 세리프 드롭캡과 단일 60ch 칼럼, 데이터는 조용한 본문 메타로',
    inspiration: 'Aeon, NYT Cooking, Kinfolk, MUBI Notebook',
    palette: {
      bg: '#FBF8F2',
      fg: '#1F1B16',
      primary: '#3E5C3A',
      accent: '#8E2A12',
      muted: '#7A6E5C',
      surface: '#F2EDE2',
    },
    typography: {
      display_class: 'font-serif font-normal tracking-tight',
      body_class: 'font-serif text-[19px] leading-[32px]',
      hero_size_rem: 4,
      numeric_class: 'font-serif tabular-nums',
    },
    hero_pattern:
      "640px 중앙 단일 칼럼. 상단 11px UPPERCASE +0.06em mono caps eyebrow '에세이 · 저탄소 여행'. 그 아래 디스플레이 세리프(Source Serif 4) 64px 'A Quieter Way to Travel Korea.' 단편 헤드라인. 그 아래 작은 grounded 16:9 이미지(풀블리드 아님). 드롭캡 'O' 80px 세리프로 본문 오프너 시작. 차트 0.",
    compare_pattern:
      "본문 흐름 속 인용 박스. 세 단락이 각각 한 교통수단을 다루고, 각 단락 끝에 NYT Cooking 스타일 quiet 메타 데이터 라인: '12.4 kg CO₂ · 2h 30m · 318 km'으로 세리프 italic 작게. 중앙에 한 번 pull-quote: '— 67.6% 줄였습니다' 디스플레이 세리프 32px italic, 좌우에 16px 세리프 inverted commas.",
    cert_pattern:
      "MUBI 크레딧 스트립. 단일 칼럼, 디스플레이 세리프 'Certified Quietly' 48px italic, 그 아래 mono caps 메타 스트립 'ROUTE · DATE · CO₂ · HASH'. 하단 작은 wood-cut 스타일 leaf 일러스트 1점. 공유는 텍스트 링크 'copy link · share to kakao'로 조용.",
    differentiation_from_main:
      "유일한 serif-headline-first 카드. sans + 카드 그리드 → serif + 단일 60ch 매거진 칼럼. 즉시 '롱폼 에세이'로 읽혀, '엔터프라이즈 대시보드 톤'에서 가장 멀다.",
  },
  {
    id: 'v10',
    name_ko: '오틀리 일러스트 지노',
    name_en: 'oatly-illustration-zine',
    one_line_pitch:
      '손그림 일러스트와 타자기 메모로 가득한 zine, 사진 0 차트 0 오직 SVG와 손글씨',
    inspiration: 'Oatly, Treedom, Kakao Bank',
    palette: {
      bg: '#F4ECDC',
      fg: '#1B1B1B',
      primary: '#005A3C',
      accent: '#E9531D',
      muted: '#7A6A56',
      surface: '#EADFC8',
    },
    typography: {
      display_class: 'font-black tracking-tight',
      body_class: 'font-mono text-[15px] leading-[24px]',
      hero_size_rem: 8,
      numeric_class: 'font-mono font-bold',
    },
    hero_pattern:
      "사진 0건, 차트 0건. 오로지 손그림 SVG. 거대한 핸드레터드 wordmark 'GREENTRIP'이 화면 폭의 80% 차지. 그 아래 타자기 mono로 'a low-carbon zine for Korean trips, since 2026'. 한 쪽 모서리에 손그림 잎 일러스트 (불규칙 stroke), 다른 쪽에 손그림 자전거 SVG. 모든 요소가 약간 회전(-2°~+3°)되어 '인쇄 zine' 느낌.",
    compare_pattern:
      "콜라주 zine 페이지. 각 교통수단이 손그림 SVG 캐릭터로: ① KTX = 손그림 기차 + 옆에 mono '12.4 kg CO₂e' 타자기 라벨 / ② 자전거 = 손그림 자전거 + '4.1 kg' / ③ 워크 = 손그림 발자국 + '0.8 kg'. 각 그룹이 약간 회전된 종이 한 장처럼 겹쳐 배치. 추천안 위에 손글씨 'pick this one →' 핸드드로잉 화살표 #E9531D.",
    cert_pattern:
      "Oatly 패키지 라벨 그 자체. 크림 #EADFC8 직사각 카드, 외곽에 손그림 점선 보더, 상단에 손그림 트로피 일러스트, 가운데 mono 'CARBON RECEIPT — 67.6%' 타자기 인쇄. 'signed by GreenTrip, on 2026-06-16' 손글씨 서명. 공유는 카드 하단 손그림 카카오톡 말풍선 아이콘 + mono URL.",
    differentiation_from_main:
      "유일한 illustration-first 카드 (사진·차트·UI 카드 모두 0). soft eco-green → 크림 + 딥 그린 + rust orange. 모든 정렬·회전이 의도적으로 어긋나, '핀테크 정렬'의 정반대 극을 찍는다.",
  },
];

function Swatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block h-5 w-5 rounded border border-black/10"
      style={{ backgroundColor: hex }}
      title={hex}
      aria-label={`color ${hex}`}
    />
  );
}

export default function VariantCatalogPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-zinc-200 pb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          GreenTrip / Design Variants
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          디자인 변형 비교 카탈로그
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-600">
          총 <span className="font-semibold text-zinc-900">{VARIANTS.length}개</span>{' '}
          디자인 변형을 한 화면에서 비교하세요. 각 카드는 변형의 팔레트·영감·메인 대비
          차별점을 요약하며, 카드를 클릭하면 해당 변형의 라이브 프리뷰(
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">/v/v0N</code>
          )로 이동합니다. 상위 메인 디자인은 건드리지 않은 채, 각 변형은 자체 페이지에서
          독립적으로 렌더링됩니다.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {VARIANTS.map((v) => (
          <li key={v.id} className="h-full">
            <Link
              href={`/v/${v.id}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                // top accent stripe in variant's primary color
                boxShadow: `inset 0 4px 0 0 ${v.palette.primary}`,
              }}
            >
              <div className="flex flex-col gap-3 p-5 pt-6">
                {/* palette swatches */}
                <div className="flex items-center gap-1.5">
                  <Swatch hex={v.palette.bg} />
                  <Swatch hex={v.palette.primary} />
                  <Swatch hex={v.palette.accent} />
                  <Swatch hex={v.palette.fg} />
                </div>

                {/* id label */}
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                    {v.id}
                  </span>
                  <span
                    className="text-[10px] font-medium uppercase tracking-widest"
                    style={{ color: v.palette.primary }}
                  >
                    view →
                  </span>
                </div>

                {/* names */}
                <div>
                  <h2 className="text-xl font-bold leading-tight tracking-tight text-zinc-900">
                    {v.name_ko}
                  </h2>
                  <p className="mt-1 font-mono text-xs text-zinc-500">{v.name_en}</p>
                </div>

                {/* pitch */}
                <p className="text-[15px] leading-relaxed text-zinc-700">
                  {v.one_line_pitch}
                </p>

                {/* inspiration */}
                <p className="text-xs italic leading-relaxed text-zinc-500">
                  영감: {v.inspiration}
                </p>

                {/* differentiation */}
                <div className="mt-auto border-t border-zinc-100 pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    메인 대비 차별점
                  </p>
                  <p className="mt-1.5 text-[13px] leading-snug text-zinc-600">
                    {v.differentiation_from_main}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <footer className="mt-12 border-t border-zinc-200 pt-6 text-xs text-zinc-500">
        <p>
          각 변형은 메인 사이트와 격리되어 있으며, 공유 Tailwind 설정·디자인 토큰을
          변경하지 않습니다. 각 변형 페이지는{' '}
          <code className="rounded bg-zinc-100 px-1 py-0.5">src/app/v/v0N/page.tsx</code>{' '}
          에 자체 컴포넌트로 구현됩니다.
        </p>
      </footer>
    </main>
  );
}
