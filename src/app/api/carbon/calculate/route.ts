// POST /api/carbon/calculate — 코스 탄소 배출량 계산
// 참조: DEVELOPMENT_PLAN.md §4.1, _workspace/00_input/week3_request.md §D-2
//
// Request body (Zod):
//   { waypoints: [{lat, lng}], mode: TransportMode }
// Response:
//   { totalKm, totalCO2g, segments, formatted, treeEquivalent, mode }
// 400: Zod validation failed
// 500: 내부 오류
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { calculateRouteCarbon } from '@/lib/carbon/calculator';
import { formatCarbon, treeEquivalent } from '@/lib/carbon/formatter';

const TransportModeEnum = z.enum([
  'car',
  'express_bus',
  'city_bus',
  'train_ktx',
  'train_itx',
  'bicycle',
  'walking',
]);

const WaypointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const RequestSchema = z.object({
  waypoints: z.array(WaypointSchema).min(0).max(50),
  mode: TransportModeEnum,
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Request body is not valid JSON' },
      { status: 400 },
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      },
      { status: 400 },
    );
  }

  try {
    const { waypoints, mode } = parsed.data;
    const result = calculateRouteCarbon(waypoints, mode);
    return NextResponse.json({
      mode,
      totalKm: result.totalKm,
      totalCO2g: result.totalCO2g,
      segments: result.segments,
      formatted: formatCarbon(result.totalCO2g),
      treeEquivalent: treeEquivalent(result.totalCO2g),
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
