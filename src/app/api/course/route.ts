// POST /api/course — 사용자가 선택한 단일 코스를 DB에 영구 저장
// 참조: _workspace/00_input/week5_request.md §F, DEVELOPMENT_PLAN.md §7.4 + §6
//
// 입력:
//   { option: CourseOption, baselineCO2g, region, areaCode, duration?,
//     includeFestival?, includePet?, title? }
// 동작:
//   1) Zod 검증 → 400
//   2) title 자동 생성 ("{region} {duration ?? ''} {modeLabel} 코스")
//   3) Prisma 트랜잭션: Course + Waypoint 중첩 생성 (cascade)
//      - Course.transportMode  = option.mode
//      - Course.totalCarbonG   = option.totalCO2g
//      - Course.baselineCarbonG= baselineCO2g
//      - Course.savedCarbonG   = max(0, baseline - actual)
//      - waypoints.order       = index
//      - distToNext/carbonToNext = segments[i].km / co2g (마지막 wp는 null)
//      - userId: null (Phase 2 W12에서 NextAuth 연동 예정)
// 응답: { id: createdCourse.id }
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { MODE_LABEL } from '@/components/course/TransportBadge';
import type { TransportMode } from '@/types/course';

export const dynamic = 'force-dynamic';

const TransportModeSchema = z.enum([
  'car',
  'express_bus',
  'city_bus',
  'train_ktx',
  'train_itx',
  'bicycle',
  'walking',
]);

const CourseCategorySchema = z.enum(['car', 'transit', 'active']);

const WaypointSchema = z.object({
  contentId: z.string().min(1),
  title: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
  contentType: z.number().int(),
  stayMinutes: z.number().int().optional(),
});

const SegmentSchema = z.object({
  fromIndex: z.number().int().min(0),
  toIndex: z.number().int().min(0),
  km: z.number().min(0),
  co2g: z.number().min(0),
  mode: z.string(),
});

const CourseOptionSchema = z.object({
  mode: TransportModeSchema,
  category: CourseCategorySchema,
  waypoints: z.array(WaypointSchema).min(2),
  segments: z.array(SegmentSchema),
  totalKm: z.number().min(0),
  totalCO2g: z.number().min(0),
  durationMin: z.number().min(0),
  estimatedCostKRW: z.number().min(0),
});

const SaveSchema = z.object({
  option: CourseOptionSchema,
  baselineCO2g: z.number().min(0),
  region: z.string().min(1),
  areaCode: z.number().int().min(1).max(50),
  duration: z.enum(['당일', '1박2일', '2박3일']).optional(),
  includeFestival: z.boolean().optional(),
  includePet: z.boolean().optional(),
  title: z.string().min(1).optional(),
});

function buildTitle(
  region: string,
  duration: string | undefined,
  mode: TransportMode,
): string {
  const label = MODE_LABEL[mode];
  const parts = [region];
  if (duration) parts.push(duration);
  parts.push(`${label} 코스`);
  return parts.join(' ');
}

export async function POST(req: NextRequest) {
  // 1. JSON 파싱
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Request body is not valid JSON' },
      { status: 400 },
    );
  }

  // 2. Zod 검증
  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; '),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const { option, baselineCO2g, region, areaCode, duration } = data;

  // 3. title 자동 생성 (사용자 입력 우선)
  const title = data.title ?? buildTitle(region, duration, option.mode);

  // 4. 절감량 계산 (음수 방지)
  const savedCarbonG = Math.max(0, baselineCO2g - option.totalCO2g);

  // 5. 로그인 사용자라면 userId 자동 채움 (비로그인은 null 유지 — 시그니처 2 깔때기).
  //    getCurrentUser는 RSC/Route Handler 안에서만 안전하게 호출 가능.
  const sessionUser = await getCurrentUser();
  const userId = sessionUser?.id ?? null;

  // 6. Prisma 트랜잭션 — Course + Waypoint cascade insert
  try {
    const created = await prisma.course.create({
      data: {
        userId, // 로그인 시 user.id, 비로그인 시 null
        title,
        region,
        areaCode,
        transportMode: option.mode,
        totalDistanceKm: option.totalKm,
        totalCarbonG: option.totalCO2g,
        baselineCarbonG: baselineCO2g,
        savedCarbonG,
        duration: duration ?? null,
        includeFestival: data.includeFestival ?? false,
        includePet: data.includePet ?? false,
        isPublic: false,
        waypoints: {
          create: option.waypoints.map((wp, index) => {
            // index → segment 매핑 (segments[i]: fromIndex=i, toIndex=i+1)
            const seg = option.segments.find((s) => s.fromIndex === index);
            return {
              order: index,
              contentId: wp.contentId,
              title: wp.title,
              address: wp.address ?? null,
              lat: wp.lat,
              lng: wp.lng,
              imageUrl: wp.imageUrl ?? null,
              contentType: wp.contentType,
              stayMinutes: wp.stayMinutes ?? 60,
              distToNext: seg?.km ?? null,
              carbonToNext: seg?.co2g ?? null,
            };
          }),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: e instanceof Error ? e.message : 'Unknown DB error',
      },
      { status: 500 },
    );
  }
}
