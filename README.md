# IBK-Dashboard

은행/금융 데이터 및 업무 대시보드

## 요구 사항

- Node.js **22.17.0** (`.nvmrc`와 동일)
- npm

nvm을 쓰는 경우:

```bash
nvm use
```

Windows에서 nvm-windows를 쓰는 경우:

```bash
nvm use 22.17.0
```

nvm이 없다면 [Node.js 22](https://nodejs.org/)를 설치하면 됩니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 을 엽니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 (포트 5173, `--host`) |
| `npm run build` | 프로덕션 빌드 |
| `npm run build:development` | development 모드 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | TypeScript 검사 |

## Git hooks

Husky가 커밋/푸시 전에 검사를 돌립니다.

- **pre-commit**: 스테이징된 `*.ts`/`*.tsx`에 Prettier, ESLint 적용 (`lint-staged`)
- **pre-push**: 전체 `npm run lint`, `npm run typecheck`

검사는 실패하면 커밋/푸시가 중단됩니다.

## 스택

Vite 6 · React 19 · TypeScript · Tailwind CSS 3 · TanStack Query · Zod
