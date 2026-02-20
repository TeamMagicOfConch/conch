# Codiary 이관 설계서

- Date: 2026-02-20
- Scope: `TeamMagicOfConch/Codiary2`를 현재 모노레포에 `apps/codiary`로 편입
- Principle: 신규 기능 추가 없이 원본 레포를 최대한 그대로 이관

## 결정 사항

- 앱 이름은 `codiary2`가 아닌 `codiary`를 사용한다.
- 1차 목표는 "동작하는 그대로 이관"이며, 제품 기능 변경(초대/방/투표/LLM fallback 확장)은 제외한다.
- 이관 중 적용하는 변경은 모노레포 통합/실행에 필요한 최소 수정과 코드 컨벤션 정렬로 제한한다.

## 적용 범위

- 원본 소스 루트 구조를 `apps/codiary`로 복사
  - `src/`, `public/`, `supabase/`, 정적 html 문서 포함
- 워크스페이스 통합
  - 패키지명: `@conch/codiary`
  - 루트 스크립트: `dev:codiary`, `build:codiary` 추가
- 코드 컨벤션
  - 현재 레포 Prettier 규칙(`semi: false`, `singleQuote: true`, `trailingComma: all`)에 맞춰 포맷팅

## 비범위

- 기능 리디자인/신규 도메인 모델 추가
- API 계약 변경
- `apps/conch`, `apps/admin`, `packages/api` 리팩터링

## 검증 기준

- `pnpm --filter @conch/codiary build` 성공
- 루트에서 `pnpm build:codiary` 성공
- 이관된 코드가 현재 레포 컨벤션으로 포맷되어 있음
