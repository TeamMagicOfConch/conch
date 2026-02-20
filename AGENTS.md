# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-20 19:46:21 +0900
**Commit:** 12b092c
**Branch:** conch-physics

## OVERVIEW

TypeScript strict monorepo. Expo/React Native app + Vite admin + shared API client package, orchestrated with Turborepo and pnpm workspaces.

## STRUCTURE

```text
conch/
├── apps/
│   ├── conch/      # Expo Router mobile app
│   └── admin/      # Vite + React + Tailwind admin UI
├── packages/
│   └── api/        # shared API clients + generated types
├── turbo.json
└── pnpm-workspace.yaml
```

## WHERE TO LOOK

| Task                       | Location                                          | Notes                                            |
| -------------------------- | ------------------------------------------------- | ------------------------------------------------ |
| Mobile route/screen change | `apps/conch/app/`                                 | Expo Router route groups like `(app)`, `onboard` |
| Mobile hooks/state         | `apps/conch/hooks/`, `apps/conch/app/**/hooks.ts` | Existing `use*` patterns                         |
| Mobile UI primitives       | `apps/conch/components/`                          | `layout/common/physics` barrel exports           |
| Admin page or routing      | `apps/admin/src/pages/`, `apps/admin/src/App.tsx` | Vite app entry in `src/main.tsx`                 |
| API integration            | `packages/api/src/`                               | `conch/`, `admin/`, `common/` split              |
| Build/test command source  | root `package.json` + package `package.json`      | turbo orchestrates workspace tasks               |

## CODE MAP

| Symbol                     | Type     | Location                               | Role                               |
| -------------------------- | -------- | -------------------------------------- | ---------------------------------- |
| `Layout`                   | Function | `apps/conch/app/_layout.tsx`           | mobile root shell + startup gating |
| `useStartUp`               | Function | `apps/conch/app/useStartUp.ts`         | login/onboarding bootstrap flow    |
| `useReviewList`            | Function | `apps/conch/app/(app)/(home)/hooks.ts` | home list fetch/pagination/refresh |
| `useOpenAIStream`          | Function | `apps/conch/hooks/useOpenAIStream.ts`  | review SSE stream orchestration    |
| `createConchSwaggerClient` | Function | `packages/api/src/conch/index.ts`      | conch swagger client factory       |
| `createAdminSwaggerClient` | Function | `packages/api/src/admin/index.ts`      | admin swagger client factory       |

## CONVENTIONS

- Import order: React/RN core -> external libs -> workspace/internal aliases -> relative paths.
- Formatting: semicolonless, single quote, trailing commas, 160 print width.
- Types: strict mode baseline; avoid unsafe type suppression patterns.
- Naming: components `PascalCase`, hooks `useCamelCase`, tests under `__tests__/*.test.ts`.
- Barrel exports are common (`index.ts`) and expected in feature folders.

## ANTI-PATTERNS (THIS PROJECT)

- Do not use `npm`/`yarn`; use `pnpm` only.
- Do not commit dotfiles as routine feature changes.
- Do not bypass workspace patterns with ad-hoc package wiring.
- Do not break alias boundaries (`@conch/*`, `@admin/*`, `@api/*`) with deep fragile relative imports.

## UNIQUE STYLES

- Mobile app uses Expo Router grouped routes and colocated feature components under route folders.
- API package mixes generated swagger types with handwritten helpers/SSE utilities.
- Root test/build are turbo fan-out commands, not single-package direct runs.

## COMMANDS

```bash
# Root
pnpm dev
pnpm dev:conch
pnpm dev:admin
pnpm lint
pnpm test
pnpm build
pnpm build:conch
pnpm build:admin

# Mobile app
pnpm --filter conch dev
pnpm --filter conch test

# API package
pnpm --filter @conch/api dev
pnpm --filter @conch/api build
pnpm --filter @conch/api generate-types
```

## NOTES

- Current repo scale is compact (~135 files, depth up to 6), so AGENTS hierarchy is kept shallow and domain-driven.
- Child AGENTS files in `apps/conch`, `apps/admin`, `packages/api` carry domain specifics; avoid duplicating root-level rules there.
