# CONCH APP KNOWLEDGE BASE

## OVERVIEW

Expo Router mobile app with route-grouped screens, feature-colocated components, and custom hooks for lifecycle/SSE behaviors.

## STRUCTURE

```text
apps/conch/
├── app/                     # route tree and screen-level logic
│   ├── (app)/(home)/        # home feed, calendar/list hooks, view components
│   ├── (app)/(review)/      # review creation + review detail routes
│   └── onboard/             # onboarding flow + step components
├── components/              # shared UI primitives (layout/common/physics)
├── hooks/                   # app-wide hooks (streaming, refresh, sound)
├── utils/                   # date/string/api helpers
└── assets/                  # icons, images, color constants
```

## WHERE TO LOOK

| Task                            | Location                                                    | Notes                              |
| ------------------------------- | ----------------------------------------------------------- | ---------------------------------- |
| Startup gating/login bootstrap  | `app/useStartUp.ts`, `app/_layout.tsx`                      | controls onboard vs app flow       |
| Home list + month navigation    | `app/(app)/(home)/hooks.ts`, `app/(app)/(home)/components/` | cursor pagination + date selection |
| New review writing flow         | `app/(app)/(review)/new-review/`                            | context + multi-step components    |
| Review detail page data loading | `app/(app)/(review)/review/hooks.ts`                        | route param -> API lookup          |
| Streaming feedback behavior     | `hooks/useOpenAIStream.ts`                                  | incremental text + sound fade out  |
| Shared layout shell/navbar      | `components/layout/`                                        | barrel exports used by routes      |

## CONVENTIONS

- Keep route-specific code inside the matching route folder first, then promote to `components/` only when reused.
- Preserve barrel-export pattern (`index.ts`) for components/hooks/utils folders.
- Use project aliases (`@conch/*`, `@api/*`) instead of deep relative paths.
- Keep hook naming consistent (`useXxx`) and colocate small helper types near hook usage.

## ANTI-PATTERNS

- Do not move route-level UI into global shared folders prematurely.
- Do not call API clients directly from random components when a route hook already owns fetch state.
- Do not introduce alternate state systems for onboarding/review flows without matching existing context/hook style.
- Do not add path imports that bypass alias boundaries.

## COMMANDS

```bash
pnpm --filter conch dev
pnpm --filter conch test
pnpm --filter conch build:simulator
```

## NOTES

- Test coverage in this app is currently sparse (`utils/__tests__/string.test.ts`), so prefer targeted verification when changing route hooks.
