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

로그인 API는 아직 연동되지 않았습니다. 로그인 화면의 **임시 로그인**으로 대시보드에 들어갈 수 있습니다.

## 환경 변수

Vite는 `VITE_`로 시작하는 변수만 클라이언트에 노출합니다. 저장소에는 `.env.example`만 올리고, 실제 `.env.*` 파일은 git에서 제외합니다.

| 파일 | 사용 시점 |
| --- | --- |
| `.env.development` | `npm run dev`, `npm run build:development` |
| `.env.production` | `npm run build`, `npm run build:production` |

| 변수 | 설명 |
| --- | --- |
| `VITE_API_SERVICE` | 백엔드 API 주소. 기본값은 `http://localhost:3000` |

`VITE_API_SERVICE`가 localhost이면 앱은 `/api`로 요청하고, Vite 개발 서버가 그 주소로 프록시합니다. 백엔드가 다른 포트에서 떠 있으면 `.env.development`의 값을 바꾸면 됩니다.

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

Vite 6 · React 19 · TypeScript · Tailwind CSS 3 · React Router 7 · TanStack Query · Axios · Zustand · Zod
