# GitHub Secrets 설정 가이드

Stage Deploy CI/CD 워크플로우를 실행하기 위해서는 GitHub Secrets에 Expo 인증 토큰을 설정해야 합니다.

## 1. Expo Personal Access Token 생성

### 단계:

1. Expo 웹사이트 로그인: https://expo.dev
2. 계정 설정 페이지로 이동:
   - https://expo.dev/accounts/[your-username]/settings/access-tokens
   - 또는 우측 상단 프로필 → Settings → Access Tokens
3. "Create Token" 버튼 클릭
4. 토큰 이름 입력 (예: "GitHub Actions - Stage Deploy")
5. 권한 선택:
   - ✅ Read & Write (빌드, 업데이트, 제출에 필요)
6. "Create Token" 클릭
7. **생성된 토큰을 안전한 곳에 복사** (다시 볼 수 없습니다!)

## 2. GitHub Repository에 Secret 추가

### 단계:

1. GitHub 리포지토리 페이지로 이동:
   - https://github.com/[username]/[repo-name]
2. Settings 탭 클릭
3. 좌측 메뉴에서 "Secrets and variables" → "Actions" 클릭
4. "New repository secret" 버튼 클릭
5. Secret 정보 입력:
   - **Name**: `EXPO_TOKEN`
   - **Secret**: 1단계에서 복사한 Expo Personal Access Token 붙여넣기
6. "Add secret" 버튼 클릭

## 3. 설정 확인

Secret이 제대로 추가되었는지 확인:

1. Repository Settings → Secrets and variables → Actions
2. "Repository secrets" 목록에서 `EXPO_TOKEN`이 표시되는지 확인
   - ✅ Secret 값은 표시되지 않으며, 이는 정상입니다
   - ✅ Secret 이름만 확인 가능

## 4. 워크플로우 테스트

Secret 설정이 완료되면 `stage-deploy` 브랜치에 푸시하여 워크플로우가 정상 동작하는지 확인할 수 있습니다.

```bash
# stage-deploy 브랜치 생성 (아직 없는 경우)
git checkout -b stage-deploy

# 변경사항 푸시
git push origin stage-deploy
```

## 보안 주의사항

⚠️ **중요:**
- Expo Personal Access Token은 절대 코드에 직접 포함하지 마세요
- Token은 GitHub Secrets를 통해서만 사용하세요
- Token이 유출되었다면 즉시 Expo 설정에서 해당 Token을 삭제하고 새로 생성하세요
- Token은 필요한 최소 권한만 부여하세요

## 문제 해결

### "Authentication failed" 에러 발생 시:
1. EXPO_TOKEN Secret이 올바르게 설정되었는지 확인
2. Token이 만료되지 않았는지 확인
3. Token의 권한이 충분한지 확인 (Read & Write 필요)

### "Project not found" 에러 발생 시:
1. `apps/conch/app.json`의 `extra.eas.projectId`가 올바른지 확인
2. Expo 계정에서 해당 프로젝트에 접근 권한이 있는지 확인

