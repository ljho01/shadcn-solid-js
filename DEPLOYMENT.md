# shadcn-solid-js 배포 가이드

이 문서는 shadcn/ui 스타일로 배포하기 위한 설정과 작업 내용을 설명합니다.

## 배포 아키텍처

shadcn-solid-js는 shadcn/ui와 동일한 방식으로 배포됩니다:

1. **CLI 패키지** (`packages/cli`) - npm에 배포
2. **레지스트리** - 문서 사이트에서 JSON API로 서빙
3. **문서 사이트** - Vercel/Netlify 등에 배포

## 구성 요소

### 1. CLI 패키지 (`packages/cli`)

사용자가 `npx shadcn-solid@latest add button` 명령어로 컴포넌트를 설치할 수 있게 해주는 CLI 도구입니다.

**주요 파일:**
- `src/index.ts` - CLI 진입점
- `src/commands/init.ts` - 프로젝트 초기화
- `src/commands/add.ts` - 컴포넌트 추가
- `src/commands/list.ts` - 컴포넌트 목록

**빌드:**
```bash
cd packages/cli
bun run build
```

### 2. 레지스트리 빌더 (`scripts/build-registry.ts`)

`packages/shadcn/*`의 모든 컴포넌트를 읽어서 JSON 형식으로 변환합니다.

**실행:**
```bash
bun run build:registry
```

**출력:**
- `apps/docs/public/r/*.json` - 각 컴포넌트의 메타데이터
- `apps/docs/public/r/index.json` - 컴포넌트 목록

**JSON 구조:**
```json
{
  "name": "button",
  "type": "registry:ui",
  "files": [
    {
      "path": "button.tsx",
      "content": "...",
      "type": "registry:ui",
      "target": "components/ui/button.tsx"
    }
  ],
  "dependencies": ["class-variance-authority@^0.7.1"],
  "registryDependencies": []
}
```

### 3. 문서 사이트 (`apps/docs`)

TanStack Start 기반 문서 사이트입니다. `public/r/` 디렉토리의 파일들이 자동으로 `/r/` 경로로 서빙됩니다.

**레지스트리 엔드포인트:**
- `https://your-domain.com/r/button.json` - Button 컴포넌트 정보
- `https://your-domain.com/r/index.json` - 컴포넌트 목록

## 배포 절차

### 1. 레지스트리 빌드

컴포넌트를 추가하거나 수정한 후:

```bash
bun run build:registry
```

### 2. 문서 사이트 배포

```bash
cd apps/docs
bun run build
```

Vercel/Netlify 등에 배포:
- Build Command: `bun run build`
- Output Directory: `.output/public`
- Node Version: 20.x

### 3. CLI 패키지 배포

```bash
cd packages/cli
bun run build

# 버전 업데이트
npm version patch  # 또는 minor, major

# npm에 배포
npm publish
```

## 환경 변수

### 로컬 개발

CLI가 로컬 레지스트리를 사용하도록:

```bash
export REGISTRY_URL=http://localhost:3000/r
```

### 프로덕션

기본값은 프로덕션 URL을 사용합니다:

```typescript
const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:3000/r"
```

배포 시 `packages/cli/src/utils/registry.ts`에서 기본 URL을 업데이트하세요:

```typescript
const REGISTRY_URL = process.env.REGISTRY_URL || "https://shadcn-solid.com/r"
```

## 테스트

### 로컬 테스트

1. 문서 사이트 시작 (레지스트리 서빙):
```bash
cd apps/docs
bun run dev
```

2. CLI 빌드:
```bash
cd packages/cli
bun run build
```

3. 테스트 프로젝트에서 실행:
```bash
mkdir test-project
cd test-project
REGISTRY_URL=http://localhost:3000/r node /path/to/packages/cli/dist/index.js init --yes
REGISTRY_URL=http://localhost:3000/r node /path/to/packages/cli/dist/index.js add button --yes
```

### 프로덕션 테스트

```bash
npx shadcn-solid@latest init
npx shadcn-solid@latest add button
```

## 체크리스트

배포 전 확인사항:

- [ ] 레지스트리가 최신 상태인지 확인 (`bun run build:registry`)
- [ ] CLI가 빌드되었는지 확인 (`cd packages/cli && bun run build`)
- [ ] 로컬에서 CLI 테스트 완료
- [ ] 문서 사이트 빌드 확인
- [ ] CLI package.json의 버전 업데이트
- [ ] CHANGELOG 업데이트
- [ ] Git 태그 생성

## 주의사항

1. **Import 경로 변환**: 레지스트리 빌더는 `@shadcn-solid/utils`를 `~/lib/utils`로 자동 변환합니다.

2. **의존성 관리**: 
   - `@radix-solid/*` 패키지는 npm 의존성으로 추가됩니다
   - `@shadcn-solid/*` 패키지는 `registryDependencies`로 처리됩니다

3. **파일 경로**: 레지스트리의 `target` 필드는 사용자 프로젝트의 루트 기준 상대 경로입니다.

## 참고 자료

- [shadcn/ui 원본 레포](https://github.com/shadcn-ui/ui)
- [SolidJS 문서](https://www.solidjs.com/)
- [TanStack Start](https://tanstack.com/start)
