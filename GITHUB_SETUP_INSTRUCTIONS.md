# GitHub 저장소 설정 가이드 (CEO 필수)

이 가이드는 CEO(pcpc233-netizen)가 GitHub 저장소를 안전하고 효율적으로 관리하기 위한 설정 방법을 설명합니다.

---

## 🔐 1. 브랜치 보호 규칙 설정

### 목적
- `main` 브랜치에 대한 직접 푸시 방지
- Pull Request 리뷰 필수화
- 실수로 인한 프로덕션 코드 손상 방지

### 설정 방법

1. **GitHub 저장소 접속**
   - https://github.com/pcpc233-netizen/kaus-hybrid-development

2. **Settings 탭 클릭**
   - 상단 메뉴에서 Settings 선택

3. **Branches 메뉴 선택**
   - 왼쪽 사이드바에서 "Branches" 클릭

4. **Add branch protection rule 클릭**

5. **Branch name pattern 입력**
   ```
   main
   ```

6. **다음 옵션 활성화:**

   #### 필수 설정 (Require a pull request before merging)
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: **1** (CEO의 승인 필요)
     - ✅ Dismiss stale pull request approvals when new commits are pushed
     - ✅ Require review from Code Owners (선택사항)

   #### 상태 체크 (Require status checks to pass before merging)
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging

   #### 기타 보호 설정
   - ✅ **Require conversation resolution before merging**
   - ✅ **Require signed commits** (보안 강화, 선택사항)
   - ✅ **Require linear history** (깔끔한 히스토리 유지)
   - ⚠️ **Include administrators** (CEO도 규칙 준수, 권장)

   #### 제한 설정 (선택사항)
   - ✅ **Lock branch** (읽기 전용으로 만들고 싶을 때)
   - ✅ **Do not allow bypassing the above settings**

7. **Create 버튼 클릭**

---

## 👥 2. Collaborator 추가

### 카이로스(AI Assistant) 추가 방법

현재 카이로스는 Bolt.new 환경에서 작업하므로, GitHub 계정이 있다면 추가할 수 있습니다.

#### 설정 방법

1. **Settings → Collaborators** 이동
2. **Add people** 클릭
3. 카이로스의 GitHub 사용자명 또는 이메일 입력
4. **Role 선택**: `Write` (읽기/쓰기 권한)
5. **Add** 클릭

#### 권한 설명
- **Read**: 코드 보기만 가능
- **Write**: 브랜치 생성, PR 작성 가능 (권장)
- **Admin**: 저장소 설정 변경 가능 (비권장)

---

## 🏷️ 3. Labels (작업 태그) 설정

### 목적
- 작업 우선순위 관리
- 작업 유형 분류
- 효율적인 프로젝트 관리

### 설정 방법

1. **Issues → Labels** 이동
2. **New label** 클릭
3. 아래 라벨들을 생성:

#### 우선순위 라벨
| Name | Color | Description |
|------|-------|-------------|
| `priority: high` | `#d73a4a` (빨강) | 긴급하게 처리해야 할 작업 |
| `priority: medium` | `#fbca04` (노랑) | 보통 우선순위 작업 |
| `priority: low` | `#0e8a16` (초록) | 나중에 처리 가능한 작업 |

#### 작업 유형 라벨
| Name | Color | Description |
|------|-------|-------------|
| `type: feature` | `#a2eeef` (하늘색) | 새로운 기능 추가 |
| `type: bug` | `#d73a4a` (빨강) | 버그 수정 |
| `type: refactor` | `#1d76db` (파랑) | 코드 리팩토링 |
| `type: docs` | `#0075ca` (진한 파랑) | 문서 작업 |
| `type: test` | `#d4c5f9` (보라) | 테스트 작성 |

#### 상태 라벨
| Name | Color | Description |
|------|-------|-------------|
| `status: in progress` | `#fbca04` (노랑) | 작업 진행 중 |
| `status: review needed` | `#0e8a16` (초록) | 리뷰 필요 |
| `status: blocked` | `#d73a4a` (빨강) | 작업 차단됨 |

#### 영역 라벨
| Name | Color | Description |
|------|-------|-------------|
| `area: frontend` | `#c5def5` (연한 파랑) | 프론트엔드 작업 |
| `area: backend` | `#f9d0c4` (연한 주황) | 백엔드 작업 |
| `area: blockchain` | `#fef2c0` (연한 노랑) | 블록체인 작업 |
| `area: database` | `#bfdadc` (연한 청록) | 데이터베이스 작업 |

---

## 📋 4. Issues Templates 설정

### 목적
- 일관된 작업 요청 형식
- 필요한 정보를 빠짐없이 수집

### 설정 방법

1. **Settings → Features** 에서 Issues 활성화 확인
2. **.github/ISSUE_TEMPLATE/** 디렉토리 생성 (다음 단계에서 자동 생성)

#### Feature Request Template
```markdown
---
name: Feature Request
about: 새로운 기능 제안
title: '[Feature] '
labels: 'type: feature, priority: medium'
assignees: ''
---

## 기능 설명
기능에 대한 명확한 설명을 작성하세요.

## 목적
이 기능이 왜 필요한가요?

## 요구사항
- [ ] 요구사항 1
- [ ] 요구사항 2

## 우선순위
- [ ] High
- [ ] Medium
- [ ] Low

## 예상 완료일
YYYY-MM-DD
```

#### Bug Report Template
```markdown
---
name: Bug Report
about: 버그 신고
title: '[Bug] '
labels: 'type: bug, priority: high'
assignees: ''
---

## 버그 설명
버그에 대한 명확한 설명을 작성하세요.

## 재현 방법
1. '...'로 이동
2. '...'를 클릭
3. 오류 발생

## 예상 동작
어떻게 동작해야 하나요?

## 실제 동작
실제로 어떻게 동작하나요?

## 스크린샷
가능하면 스크린샷을 첨부하세요.

## 환경
- OS: [예: Windows 10]
- Browser: [예: Chrome 120]
- Node version: [예: 18.0.0]
```

---

## 🔔 5. Notifications 설정

### CEO를 위한 알림 설정

1. **Settings → Notifications** (GitHub 프로필 설정)

2. **Watching 설정**
   - 모든 활동 알림: ✅ All Activity
   - 특정 활동만: ⚠️ Participating and @mentions

3. **Email 알림**
   - Pull request reviews: ✅ 활성화
   - Comments: ✅ 활성화
   - Issues: ✅ 활성화

4. **저장소별 Watch 설정**
   - https://github.com/pcpc233-netizen/kaus-hybrid-development
   - Watch → All Activity 선택

---

## 🔑 6. Secrets 관리 (GitHub Actions용)

### 목적
- CI/CD 파이프라인에서 환경 변수 사용
- 민감한 정보 안전하게 보관

### 설정 방법

1. **Settings → Secrets and variables → Actions**
2. **New repository secret** 클릭
3. 다음 Secrets 추가:

| Name | Value | 용도 |
|------|-------|------|
| `VITE_SUPABASE_URL` | Supabase URL | 프론트엔드 빌드 |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key | 프론트엔드 빌드 |
| `DEPLOYER_PRIVATE_KEY` | Deployer Private Key | 스마트 컨트랙트 배포 |
| `VERCEL_TOKEN` | Vercel Deploy Token | 자동 배포 |

⚠️ **주의**: 절대 Private Key를 GitHub에 직접 노출하지 마세요!

---

## 📊 7. Projects (프로젝트 보드) 설정 (선택사항)

### 목적
- 작업 진행 상황 시각화
- 칸반 보드 스타일 관리

### 설정 방법

1. **Projects → New project** 클릭
2. **Template 선택**: Board
3. **Project name**: K-AUS Development Board

4. **컬럼 구성**:
   - 📋 Backlog (할 일)
   - 🏃 In Progress (진행 중)
   - 👀 Review (리뷰 중)
   - ✅ Done (완료)

5. **Issues 자동 연동**:
   - Settings → Workflows
   - "Item added to project" 활성화

---

## 🤖 8. GitHub Actions 설정 (자동화)

### 기본 CI/CD 워크플로우

#### `.github/workflows/ci.yml` 생성

```yaml
name: CI

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Type check
      run: npm run typecheck

    - name: Lint
      run: npm run lint

    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

이 워크플로우는:
- PR 생성 시 자동으로 실행
- 타입 체크, 린트, 빌드 테스트
- 실패 시 PR 병합 차단

---

## 🔒 9. 보안 설정

### Code scanning alerts

1. **Security → Code scanning** 이동
2. **Set up code scanning** 클릭
3. **CodeQL Analysis** 활성화

### Dependabot alerts

1. **Settings → Security & analysis**
2. 다음 항목 활성화:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates

---

## 📱 10. Repository Insights

### About 섹션 설정

1. 저장소 메인 페이지에서 ⚙️ 클릭
2. 다음 정보 입력:

```
Description: K-AUS 하이브리드 개발 프로젝트 - 블록체인 기반 제품 인증 시스템

Website: https://kaus-hybrid-development.vercel.app (배포 후)

Topics:
- blockchain
- nft
- react
- typescript
- supabase
- ethereum
- web3
- staking
- governance
```

---

## ✅ 설정 완료 체크리스트

### CEO가 완료해야 할 작업

- [ ] 브랜치 보호 규칙 설정 (`main` 브랜치)
- [ ] Collaborators 추가 (필요시)
- [ ] Labels 생성 (우선순위, 타입, 상태, 영역)
- [ ] Issue Templates 생성
- [ ] Notifications 설정
- [ ] Repository Secrets 추가
- [ ] About 섹션 정보 입력
- [ ] Dependabot 활성화
- [ ] GitHub Actions CI 워크플로우 추가 (선택사항)

---

## 🎯 다음 단계

설정이 완료되면:

1. **첫 번째 Issue 생성**
   ```markdown
   Title: [Feature] Test GitHub workflow
   Description: GitHub 워크플로우 테스트용 작업
   Labels: type: feature, priority: low
   Assignee: (카이로스)
   ```

2. **카이로스에게 작업 지시**
   - Issue에 상세 설명 작성
   - 예상 완료일 지정

3. **Pull Request 리뷰 연습**
   - 카이로스가 PR 생성
   - CEO가 리뷰 및 승인

---

## ❓ 자주 묻는 질문

### Q: 브랜치 보호 규칙이 너무 엄격하지 않나요?
A: 긴급 상황에는 CEO 권한으로 일시적으로 비활성화 가능합니다. 하지만 프로덕션 안정성을 위해 권장됩니다.

### Q: GitHub Actions가 실패하면?
A: PR 병합이 차단되므로, 오류를 수정한 후 다시 푸시하면 자동으로 재실행됩니다.

### Q: Secrets를 잊어버렸어요!
A: Secrets는 읽을 수 없습니다. 새로운 값으로 업데이트만 가능합니다.

---

**작성일**: 2025-11-05
**작성자**: K-AUS Development Team
**버전**: 1.0
