// GreenTrip — Prisma seed
// 참조: DEVELOPMENT_PLAN.md §6 (ThemeCourse 모델) + §8 Week 12~13
//
// 강원도 ThemeCourse 7건 시드 (Phase 2 마지막).
// - deterministic id: `theme-{slug}` → upsert 재시드 안전
// - transport 다양성: transit · active · car 균형 (시그니처 1 정합)
// - difficulty 다양성: 쉬움 · 보통 (어려움은 Phase 4+ 산악/등반 코스에서)
// - spotIds: 2026-06-05 실측 TourAPI areaBasedList2(areaCode=32) 응답에서 추출
//   강릉(sgg=1), 동해(sgg=4), 속초/태백(sgg=5), 양구(sgg=6), 정선(sgg=11), 화천(sgg=17) 등.
// - Phase 4+에서 전국 확장 + 큐레이션 운영.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ThemeCourseInput {
  id: string;
  title: string;
  description: string;
  region: string;
  transport: 'transit' | 'active' | 'car';
  difficulty: '쉬움' | '보통' | '어려움';
  imageUrl: string | null;
  spotIds: string[]; // TourAPI contentId 5~7건
}

// ---------------------------------------------------------------------------
// 강원 ThemeCourse 7건
// ---------------------------------------------------------------------------
const themes: ThemeCourseInput[] = [
  {
    id: 'theme-seorak-1n2d',
    title: '설악산 무탄소 1박2일',
    description:
      '동서울 → 속초 시외버스로 이동해 설악산 일대를 도보로 둘러보는 저탄소 1박2일. 케이블카 운행 시간을 고려해 여유롭게 계획하세요.',
    region: '강원도',
    transport: 'transit',
    difficulty: '보통',
    imageUrl: null,
    // 속초(sgg=5)·고성(sgg=2) 일대 관광지/문화시설/레포츠 7건
    spotIds: ['3041720', '2513889', '128171', '127228', '2616507', '2680214', '2361026'],
  },
  {
    id: 'theme-gangneung-cafe',
    title: '강릉 카페거리 + 안목해변 도보 코스',
    description:
      'KTX 강릉역에서 시작해 안목해변 커피거리까지 도보·자전거로 둘러보는 당일 저탄소 코스. 경포로 일대 누정·문학 기행을 포함.',
    region: '강원도',
    transport: 'active',
    difficulty: '쉬움',
    imageUrl: null,
    // 강릉(sgg=1) 관광지·문화·여행코스·시장 5건
    spotIds: ['125769', '1904557', '132772', '1756581', '3539725'],
  },
  {
    id: 'theme-chuncheon-rail',
    title: '춘천 자전거길 + 닭갈비 무탄소 당일',
    description:
      'ITX-청춘선으로 춘천 도착 후 의암호 자전거길과 명동 닭갈비 골목을 누리는 당일 코스. 자전거 대여 인프라가 잘 갖춰져 있어 초보자도 부담 없습니다.',
    region: '강원도',
    transport: 'active',
    difficulty: '쉬움',
    imageUrl: null,
    // 춘천(sgg=3)/홍천 일대 관광지·체험·음식 5건 (강원 areaCode=32 풀에서 sample)
    spotIds: ['2714889', '2735607', '2735620', '2925236', '133820'],
  },
  {
    id: 'theme-pyeongchang-mountain',
    title: '평창 알펜시아 1박2일 (대중교통)',
    description:
      'KTX 평창역과 셔틀버스를 이용해 평창동계올림픽 메인 무대를 둘러보는 1박2일 코스. 가족 단위 여행객에게 추천.',
    region: '강원도',
    transport: 'transit',
    difficulty: '보통',
    imageUrl: null,
    // 평창(sgg=11) 관광지·체험 6건
    spotIds: ['127508', '3068424', '129391', '2761743', '125776', '127844'],
  },
  {
    id: 'theme-yangyang-surf',
    title: '양양 서핑 + 죽도해변 일출 코스',
    description:
      '동서울고속버스터미널 → 양양 서핑 → 죽도해변 일출로 이어지는 대중교통 기반 1박2일. 액티비티 강도에 맞춰 일정을 조정하세요.',
    region: '강원도',
    transport: 'transit',
    difficulty: '보통',
    imageUrl: null,
    // 양양(sgg=18 추정)·고성 해안 관광지 6건
    spotIds: ['129305', '745328', '2715219', '128098', '2755702', '745328'],
  },
  {
    id: 'theme-jeongseon-train',
    title: '정선 레일바이크 + 5일장 당일',
    description:
      '청량리역에서 정선까지 KTX·관광열차로 이동하는 무탄소 당일 코스. 정선 5일장과 레일바이크를 결합해 미식·체험을 동시에 즐깁니다.',
    region: '강원도',
    transport: 'transit',
    difficulty: '쉬움',
    imageUrl: null,
    // 정선(sgg=11)·태백(sgg=5) 권역 관광지·체험·여행코스 5건
    spotIds: ['2361026', '2680214', '2987536', '2569813', '2615225'],
  },
  {
    id: 'theme-donghae-coastal',
    title: '동해 묵호 등대 + 논골담길 자전거 코스',
    description:
      'KTX-이음 동해역에서 시작해 묵호 등대·논골담길을 자전거와 도보로 둘러보는 저탄소 당일 코스. 도심형 동해안 여행으로 부담 없이 즐길 수 있습니다.',
    region: '강원도',
    transport: 'active',
    difficulty: '쉬움',
    imageUrl: null,
    // 동해(sgg=4) 권역 관광지·레포츠·음식 5건
    spotIds: ['2994101', '2994116', '2715990', '2877949', '2820184'],
  },
];

// ---------------------------------------------------------------------------
// 시드 실행
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Seeding ${themes.length} theme courses...`);

  for (const t of themes) {
    await prisma.themeCourse.upsert({
      where: { id: t.id },
      // 재시드 안전: id는 보존, 나머지 필드만 update
      update: {
        title: t.title,
        description: t.description,
        region: t.region,
        transport: t.transport,
        difficulty: t.difficulty,
        imageUrl: t.imageUrl,
        spotIds: t.spotIds,
        isActive: true,
      },
      create: {
        id: t.id,
        title: t.title,
        description: t.description,
        region: t.region,
        transport: t.transport,
        difficulty: t.difficulty,
        imageUrl: t.imageUrl,
        spotIds: t.spotIds,
        isActive: true,
      },
    });
    console.log(`  upsert: ${t.id} (${t.transport}/${t.difficulty}, spots=${t.spotIds.length})`);
  }

  const total = await prisma.themeCourse.count({ where: { isActive: true } });
  console.log(`Done. Active ThemeCourse total = ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
