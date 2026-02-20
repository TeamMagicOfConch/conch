# API PACKAGE KNOWLEDGE BASE

## OVERVIEW

Shared TypeScript API package exposing generated Swagger clients plus handwritten auth/token/SSE helpers for mobile and admin consumers.

## STRUCTURE

```text
packages/api/
├── src/common/             # shared axios client primitives
├── src/conch/              # conch API client + auth + review + SSE
├── src/admin/              # admin API client wrappers
├── src/index.ts            # package export surface
└── scripts/generate-types.ts
```

## WHERE TO LOOK

| Task                               | Location                                  | Notes                                            |
| ---------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| Shared HTTP behavior/interceptors  | `src/common/client.ts`                    | base client and cross-cutting transport settings |
| Conch auth token storage flow      | `src/conch/auth.ts`, `src/conch/index.ts` | login/refresh and token wiring                   |
| Conch review + stream request flow | `src/conch/review.ts`, `src/conch/sse.ts` | standard + streaming review endpoints            |
| Admin swagger and token helpers    | `src/admin/index.ts`                      | admin-specific factory and auth token setter     |
| Public exports for app packages    | `src/index.ts`                            | update barrel when adding new public APIs        |

## CONVENTIONS

- Keep generated Swagger types isolated under `src/*/types/`; add handwritten adapters in sibling files.
- Expose public APIs through `src/index.ts` barrel only.
- Preserve explicit factory function style (`createConchSwaggerClient`, `createAdminSwaggerClient`).
- Keep package runtime output compatible with `tsup` entry/exports in `package.json`.

## ANTI-PATTERNS

- Do not import internal deep paths from consuming apps when a root export exists.
- Do not mix admin and conch domain helpers in a single module.
- Do not hand-edit generated type files; regenerate from Swagger.

## COMMANDS

```bash
pnpm --filter @conch/api dev
pnpm --filter @conch/api build
pnpm --filter @conch/api lint
pnpm --filter @conch/api generate-types
```

## NOTES

- Existing source contains generated and handwritten code side by side; keep edits focused on handwritten modules unless regeneration is intended.
