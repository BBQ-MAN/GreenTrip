---
name: nextjs-architect
description: GreenTrip Next.js 14 프로젝트 구조 설계 스킬. Prisma 스키마, 환경변수, 타입 중앙 관리, shadcn/ui 초기 세팅, 디렉토리 스캐폴드를 수행. architect 에이전트가 Week 1 및 구조 변경 요청 시 사용.
---

# Next.js Architect — 프로젝트 기반 구축

## 언제 사용하는가

- Week 1 초기 세팅 (Next.js + Tailwind + shadcn/ui + Prisma)
- 새 Prisma 모델 추가/수정
- 타입 정의 중앙화 (src/types/)
- 환경변수 추가
- 디렉토리 구조 변경

## 작업 원칙

1. **DEVELOPMENT_PLAN.md 5장 디렉토리 구조 엄수** — 임의 확장 금지
2. **타입 단일 진원지** — 같은 개념의 타입을 여러 곳에 중복 정의하지 않는다
3. **서버/클라이언트 환경변수 구분** — `NEXT_PUBLIC_` 접두사는 필수 클라이언트 값에만
4. **Prisma 관계 무결성** — `onDelete: Cascade` 등 명시

## 초기 세팅 체크리스트 (Week 1)

### 1. 프로젝트 생성
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

### 2. 필수 의존성
```bash
npm install @prisma/client zustand recharts
npm install -D prisma @types/node
```

### 3. shadcn/ui 초기화
```bash
npx shadcn@latest init
npx shadcn@latest add button card form input select dialog
```

### 4. Prisma 스키마 배치
`prisma/schema.prisma` — DEVELOPMENT_PLAN.md 6장의 모델 5개 (User, Course, Waypoint, CarbonReport, ThemeCourse)를 그대로 옮긴다. 필드명·타입·관계는 변경하지 않는다.

### 5. 환경변수 템플릿
`.env.example` — DEVELOPMENT_PLAN.md 9장의 키 목록을 그대로 복사. `.env.local`은 .gitignore에 포함 확인.

### 6. 타입 중앙 배치 (src/types/)
- `tour.ts` — TourAPI 응답 래퍼 타입 (`TourAPIResponse<T>`, `SpotItem`, `FestivalItem`, `PetItem` 등)
- `course.ts` — `Course`, `Waypoint`, `TransportMode`, `CourseCompareResult`
- `carbon.ts` — `CarbonFactor`, `CarbonCalculation`, `AccessibilityScore`
- `index.ts` — re-export

### 7. next.config.ts
```ts
const config = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'tong.visitkorea.or.kr' },
      { protocol: 'https', hostname: 'tong.visitkorea.or.kr' },
    ],
  },
};
```
TourAPI 이미지 도메인을 `remotePatterns`에 등록 (next/image 사용 조건).

## 증분 변경 시

1. 기존 파일을 먼저 Read
2. 기존 타입·스키마와 충돌하지 않는지 확인
3. Prisma 스키마 변경 시 마이그레이션 필요성 명시 (실제 migrate는 리더에게 요청)
4. 변경된 타입 파일 경로를 `_workspace/{week}_architect_summary.md`에 기록 → 다른 에이전트가 읽도록

## 출력 예시

`_workspace/week1_architect_summary.md`:
```markdown
# Week 1 Architect Summary

## 생성된 파일
- package.json, tsconfig.json, next.config.ts, tailwind.config.ts
- prisma/schema.prisma (5 models)
- .env.example
- src/types/{tour,course,carbon,index}.ts
- src/lib/{db,utils}.ts
- src/app/layout.tsx, globals.css

## 타입 정의 (다른 팀원이 참조)
- SpotItem, TourAPIResponse<T> — src/types/tour.ts
- Course, Waypoint, TransportMode — src/types/course.ts
- CarbonCalculation — src/types/carbon.ts

## 다음 Week 선행 조건
- DATABASE_URL 환경변수 설정 후 `npx prisma migrate dev --name init` 필요
- TOUR_API_KEY 환경변수 설정
```

## 참고 자료

- DEVELOPMENT_PLAN.md 5장 (디렉토리 구조)
- DEVELOPMENT_PLAN.md 6장 (Prisma 스키마)
- DEVELOPMENT_PLAN.md 9장 (환경변수)
