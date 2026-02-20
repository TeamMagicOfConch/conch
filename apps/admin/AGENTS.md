# ADMIN APP KNOWLEDGE BASE

## OVERVIEW

Vite + React admin frontend with React Router pages and Tailwind-based styling, consuming shared API package helpers.

## WHERE TO LOOK

| Task                              | Location                                 | Notes                               |
| --------------------------------- | ---------------------------------------- | ----------------------------------- |
| App bootstrap + router mounting   | `src/main.tsx`, `src/App.tsx`            | top-level providers and route shell |
| Page-level feature work           | `src/pages/`                             | each page component entry           |
| Shared API wiring for admin UI    | `src/lib/index.ts`, `@conch/api` imports | avoid duplicate client factories    |
| Vite behavior/build configuration | `vite.config.ts`                         | plugin and build options            |

## CONVENTIONS

- Keep admin code under `src/` and avoid cross-importing from mobile app internals.
- Reuse shared API package exports from `@conch/api`; avoid local ad-hoc API wrappers unless needed.
- Keep route/page logic thin and push reusable parts into `src/lib/` or small local modules.

## ANTI-PATTERNS

- Do not import from `apps/conch/*` paths.
- Do not duplicate API client/token logic already available in `packages/api/src/admin`.
- Do not bypass Vite entry flow with non-standard bootstrap files.

## COMMANDS

```bash
pnpm --filter @conch/admin dev
pnpm --filter @conch/admin build
pnpm --filter @conch/admin preview
```

## NOTES

- This workspace is smaller than mobile; keep docs terse and point to root AGENTS for shared monorepo rules.
