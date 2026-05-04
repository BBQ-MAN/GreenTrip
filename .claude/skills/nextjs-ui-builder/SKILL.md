---
name: nextjs-ui-builder
description: GreenTrip 프론트엔드 빌더 스킬. Next.js App Router 페이지, shadcn/ui + Tailwind 컴포넌트, Recharts 차트, SWR 훅, PWA 기본을 구현. ui-builder 에이전트가 Week 4~5, Week 10~13 UI 작업 및 컴포넌트 수정 요청 시 사용.
---

# Next.js UI Builder — 프론트엔드 구현

## 언제 사용하는가

- Week 4~5 플래닝/결과/코스 상세 UI
- Week 10~11 리포트/인증서
- Week 12~13 마이페이지·탐색·인증
- Week 14 PWA 설정
- 개별 컴포넌트·페이지 수정 요청

## 페이지 맵 (DEVELOPMENT_PLAN.md 7장)

| 경로 | 역할 | 주요 컴포넌트 |
|------|------|-------------|
| `/` | 랜딩 | Hero, 서비스 소개, ThemeCourse 카드 |
| `/plan` | 코스 설정 | CourseOptionForm, ToggleOption |
| `/plan/result` | 3안 비교 | CourseCompareCard×3, CarbonGauge, KakaoMap |
| `/course/[id]` | 코스 상세 | TimelineView, KakaoMap, SpotCard |
| `/spot/[contentId]` | 관광지 상세 | SpotDetail, SpotGallery |
| `/report/[id]` | 탄소 리포트·인증서 | CertificateCard, CarbonReport, Recharts |
| `/explore` | 테마 코스 탐색 | ThemeCourseCard 그리드 |
| `/mypage` | 여행 기록·누적 절감 | 통계, 코스 리스트 |

## Server/Client 분리 원칙

- **데이터 페칭**은 Server Component (RSC) — async 함수로 직접 fetch
- **인터랙션**은 `'use client'` — 폼, 토글, 지도 조작, Zustand store 접근
- 한 페이지에 둘 다 필요하면 Client 부분만 자식 컴포넌트로 분리

```tsx
// src/app/plan/page.tsx (Server)
import { PlanForm } from '@/components/course/PlanForm'; // Client
export default async function PlanPage() {
  const areas = await fetchAreas(); // Server에서
  return <PlanForm initialAreas={areas} />;
}
```

## 반응형 원칙 (모바일 퍼스트)

```tsx
<div className="flex flex-col gap-4 md:flex-row md:gap-6 lg:gap-8">
  {/* 기본: 세로 스택 / md: 가로 / lg: 더 넓은 간격 */}
</div>
```

- 기본: mobile (< 768px)
- `md:`: tablet (768px~)
- `lg:`: desktop (1024px~)

## 핵심 컴포넌트 가이드

### CourseCompareCard
- 3개 카드를 grid (mobile: 1열, md: 3열)
- 추천안에 `⭐ 추천` 뱃지
- 카드 내: 이동수단 이모지/아이콘 + CO₂(kg) + 시간 + 비용 + CarbonGauge + 절감량
- 선택 시 `onSelect(option)` 콜백

### CarbonGauge
- Progress bar (Tailwind `bg-gradient-to-r from-green-500 via-yellow-400 to-red-500`)
- 현재값 + 기준값(자가용) 표시
- 절감률 % 텍스트

### TransportBadge
- `{ mode: TransportMode }` prop
- 아이콘 + 라벨 + 색상 변형

### TimelineView
- 방문 순서별 카드 세로 리스트
- 카드 사이에 "다음 지점까지: X km, Y g CO₂" 연결선
- 축제/반려동물 뱃지 조건부 표시

### CertificateCard
- 공유용 고정 비율 카드 (1080×1080 또는 1080×1920)
- `@vercel/og` 또는 `html-to-image`로 이미지 생성
- 사용자명, 코스명, 절감량, 나무 환산, 날짜, 로고

## 훅 가이드

```typescript
// src/hooks/useTourAPI.ts — SWR 래퍼
export function useLocationSpots(mapX: number, mapY: number, radius: number) {
  return useSWR<{ items: SpotItem[]; totalCount: number }>(
    `/api/tour/location?mapX=${mapX}&mapY=${mapY}&radius=${radius}`,
    fetchJson
  );
}

// src/hooks/useCourseGenerator.ts
export function useCourseGenerator() {
  return useSWRMutation('/api/course/generate', postJson);
}
```

**훅의 제네릭 T는 반드시 Route의 반환 shape과 일치.** qa-reviewer가 교차 검증.

## 탄소 시각화 색상 규약

- 초록 (≤ 1kg): `text-green-600`, `bg-green-100`
- 노랑 (1~5kg): `text-yellow-600`, `bg-yellow-100`
- 주황 (5~10kg): `text-orange-600`, `bg-orange-100`
- 빨강 (> 10kg): `text-red-600`, `bg-red-100`

## 접근성 체크리스트

- [ ] 모든 `<img>`에 `alt` (TourAPI 이미지는 관광지 title)
- [ ] 아이콘 버튼에 `aria-label`
- [ ] Form 라벨은 `<label htmlFor>` 또는 shadcn/ui Form 사용
- [ ] 색상만으로 정보 전달 금지 (아이콘 + 텍스트 병기)
- [ ] 키보드 탐색 가능 (Tab, Enter)
- [ ] `prefers-reduced-motion` 존중

## 로딩·빈 상태

- 로딩: `LoadingSkeleton` 컴포넌트 (실제 레이아웃 기반 skeleton)
- 빈 결과: `EmptyState` — 아이콘 + 메시지 + 대체 제안 CTA
- 에러: `ErrorBoundary` + 재시도 버튼

## PWA (Week 14)

```bash
npm install next-pwa
```

- `public/manifest.json` — name, short_name, icons(192/512), theme_color: "#10B981" (green-500)
- `next.config.ts`에 next-pwa 래핑
- 서비스워커: TourAPI 응답 캐시 (1일), 이미지 캐시 (7일), 페이지 정적 리소스 (빌드별)

## 참고 자료

- DEVELOPMENT_PLAN.md 7장 (페이지 명세)
- DEVELOPMENT_PLAN.md 10.4 핵심 규칙
