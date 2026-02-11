# shadcn-solid

SolidJS용 shadcn 컴포넌트를 프로젝트에 추가하는 CLI 도구입니다.

## 설치

```bash
npx shadcn-solid@latest init
```

## 사용법

### 프로젝트 초기화

```bash
npx shadcn-solid@latest init
```

대화형 프롬프트를 통해 프로젝트를 설정하고 `components.json` 파일을 생성합니다.

### 컴포넌트 추가

```bash
npx shadcn-solid@latest add button
```

여러 컴포넌트를 한 번에 추가할 수도 있습니다:

```bash
npx shadcn-solid@latest add button card dialog
```

### 사용 가능한 컴포넌트 목록 보기

```bash
npx shadcn-solid@latest list
```

## 옵션

### `init`

```bash
npx shadcn-solid@latest init [options]
```

옵션:
- `-y, --yes` - 확인 프롬프트를 건너뜁니다
- `-c, --cwd <cwd>` - 작업 디렉토리를 지정합니다

### `add`

```bash
npx shadcn-solid@latest add [components...] [options]
```

옵션:
- `-y, --yes` - 확인 프롬프트를 건너뜁니다
- `-o, --overwrite` - 기존 파일을 덮어씁니다
- `-c, --cwd <cwd>` - 작업 디렉토리를 지정합니다

## 개발

```bash
# 의존성 설치
bun install

# 빌드
bun run build

# 로컬 테스트
node dist/index.js init
```

## License

MIT
