# K-AUS 프로젝트 협업 가이드

## 👥 팀 구성

- **CEO (Kyumin Lee)**: kongks5798@gmail.com - GitHub 사용자명: pcpc233-netizen
- **AI 개발자 (카이로스)**: 기능 개발 및 코드 작성

---

## 🚀 시작하기

### ✅ 1단계: CEO - GitHub 초대 수락하기

#### CEO가 해야 할 일:

1. **이메일 확인**
   - kongks5798@gmail.com으로 GitHub 초대 메일이 발송되었습니다
   - 메일 제목: **"You're invited to join the pcpc233-netizen/kaus-hybrid-development repository"**
   - 스팸 폴더도 꼭 확인해주세요!

2. **초대 수락**
   - 이메일의 **"Accept invitation"** (초대 수락) 버튼 클릭
   - 이미 GitHub 계정(pcpc233-netizen)으로 로그인되어 있다면 바로 수락됩니다

3. **저장소 접속 확인**
   - 저장소 링크: https://github.com/pcpc233-netizen/kaus-hybrid-development
   - 이제 모든 코드와 문서를 볼 수 있습니다!

---

### 🤖 2단계: 카이로스 - 저장소 접근 확인

카이로스는 Bolt.new 환경에서 작업하며, 다음 권한이 있습니다:

#### 권한:
- ✅ 코드 읽기 및 쓰기
- ✅ 브랜치 생성 및 푸시
- ✅ Pull Request 생성
- ❌ main 브랜치 직접 수정 (보호됨 - CEO 승인 필요)
- ❌ 프로덕션 배포

#### 작업 환경:
- **Bolt.new** 웹 인터페이스
- GitHub 저장소 연동 완료

---

## 📋 협업 워크플로우

### 흐름 요약

```
1. CEO가 작업 지시
   ↓
2. 카이로스가 코드 개발
   ↓
3. 카이로스가 Pull Request 생성
   ↓
4. CEO가 코드 검토
   ↓
5. CEO가 승인 및 병합
   ↓
6. 완료!
```

---

### 📝 1단계: CEO - 작업 지시하기

#### 방법 A: GitHub Issues 사용 (권장)

GitHub 웹사이트에 접속하여:

1. https://github.com/pcpc233-netizen/kaus-hybrid-development 접속
2. 상단 메뉴에서 **"Issues"** 탭 클릭
3. **"New issue"** (새 이슈) 버튼 클릭
4. 다음과 같이 작성:

```markdown
Title: [Feature] 사용자 프로필 페이지 추가

Description:
## 목표
사용자가 자신의 정보를 확인할 수 있는 페이지 만들기

## 요구사항
- [ ] 사용자 이름, 이메일 표시
- [ ] 보유 NFT 목록 보기
- [ ] 스테이킹 현황 확인
- [ ] 반응형 디자인 (모바일 대응)

## 우선순위
High (높음)

## 예상 완료일
2025-11-10

## 추가 요청사항
파란색 테마로 깔끔하게 디자인해주세요.
```

5. 오른쪽 사이드바에서:
   - **Assignees**: 카이로스 선택 (있다면)
   - **Labels**: `feature`, `high priority` 등 선택

6. **"Submit new issue"** 클릭

#### 방법 B: 직접 대화 (간단한 작업)

- 이메일, 메신저 등으로 카이로스에게 직접 지시
- 예: "로그인 페이지의 버튼 색상을 파란색으로 변경해주세요"

---

### 💻 2단계: 카이로스 - 개발 작업

카이로스가 할 일:

```bash
# 1. 최신 코드 가져오기
git pull origin main

# 2. 새 기능 브랜치 생성
git checkout -b feature/user-profile-page

# 3. Bolt.new에서 코드 작성
# (파일 생성, 수정, 테스트)

# 4. 변경사항 확인
git status

# 5. 커밋
git add .
git commit -m "feat: Add user profile page with NFT display"

# 6. GitHub에 푸시
git push origin feature/user-profile-page

# 7. Pull Request 생성 (GitHub 웹사이트에서)
```

---

### 🔍 3단계: CEO - 코드 검토 및 승인

#### Pull Request 확인하기:

1. **GitHub 접속**
   - https://github.com/pcpc233-netizen/kaus-hybrid-development

2. **Pull requests 탭 클릭**
   - 상단 메뉴에서 **"Pull requests"** 클릭
   - 새로운 PR이 보입니다

3. **PR 열기**
   - PR 제목 클릭 (예: "feat: Add user profile page")

4. **변경사항 확인**
   - **"Files changed"** 탭 클릭
   - 어떤 파일이 변경되었는지 확인
   - 초록색(+) = 추가된 코드
   - 빨간색(-) = 삭제된 코드

#### 리뷰 옵션:

**✅ 옵션 1: 승인하기 (코드가 마음에 들 때)**

1. **"Review changes"** 버튼 클릭
2. 코멘트 작성 (선택사항):
   ```
   잘 만들어졌네요! 병합하겠습니다.
   ```
3. **"Approve"** (승인) 선택
4. **"Submit review"** 클릭
5. 화면 맨 아래 **"Merge pull request"** 버튼 클릭
6. **"Confirm merge"** 클릭
7. 완료! ✅

**💬 옵션 2: 수정 요청 (변경이 필요할 때)**

1. 코드의 특정 줄에 마우스를 올리면 **"+"** 버튼이 나타남
2. 클릭하여 코멘트 작성:
   ```
   이 부분은 빨간색이 아니라 파란색으로 해주세요.
   ```
3. **"Start a review"** 클릭
4. 모든 코멘트를 작성한 후
5. **"Review changes"** → **"Request changes"** 선택
6. **"Submit review"** 클릭

**❓ 옵션 3: 질문하기**

1. PR 하단의 댓글란에 질문 작성:
   ```
   이 기능은 모바일에서도 잘 작동하나요?
   ```
2. **"Comment"** 클릭

---

### 🔧 4단계: 카이로스 - 피드백 반영

CEO가 수정을 요청했다면:

```bash
# 1. 동일 브랜치에서 작업
git checkout feature/user-profile-page

# 2. CEO 피드백에 따라 코드 수정
# (Bolt.new에서 수정)

# 3. 다시 커밋 및 푸시
git add .
git commit -m "fix: Change button color to blue as requested"
git push origin feature/user-profile-page

# Pull Request가 자동으로 업데이트됩니다!
```

---

## 🎯 브랜치 전략

```
main (프로덕션 - 보호됨)
  ├── feature/user-profile (카이로스 작업 중)
  ├── feature/nft-gallery (카이로스 작업 중)
  └── fix/login-error (버그 수정)
```

### 브랜치 명명 규칙

| 브랜치 이름 | 용도 | 예시 |
|-------------|------|------|
| `main` | 프로덕션 배포 코드 | - |
| `feature/기능이름` | 새 기능 개발 | `feature/user-dashboard` |
| `fix/버그설명` | 버그 수정 | `fix/login-timeout` |
| `hotfix/긴급수정` | 긴급 수정 | `hotfix/payment-error` |

---

## 📝 커밋 메시지 작성법

### 형식
```
<타입>: <간단한 설명>
```

### 타입

| 타입 | 의미 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat: Add user login page` |
| `fix` | 버그 수정 | `fix: Resolve wallet connection error` |
| `refactor` | 코드 개선 | `refactor: Simplify authentication logic` |
| `style` | 디자인 변경 | `style: Update button colors to blue` |
| `docs` | 문서 수정 | `docs: Update README with setup instructions` |

### 좋은 예시 ✅
```bash
feat: Add user profile page with NFT display
fix: Resolve NFT minting transaction timeout
style: Update navigation bar colors
```

### 나쁜 예시 ❌
```bash
update
changes
fix
```

---

## 💬 커뮤니케이션 방법

### CEO ↔ 카이로스 소통 채널

#### 1. GitHub Issues (작업 요청)
- CEO가 새 작업 요청 시 사용
- 체계적인 작업 관리

#### 2. Pull Request 댓글 (코드 리뷰)
- 코드 특정 부분에 대한 질문/답변
- 수정 요청

#### 3. 이메일 (긴급)
- CEO: kongks5798@gmail.com
- 긴급하거나 민감한 사항

---

## 🔍 CEO를 위한 코드 리뷰 가이드

### 확인할 사항

#### ✅ 기능 구현
- 요구한 기능이 모두 구현되었나?
- 예상대로 작동하나?
- 사용자 경험이 좋은가?

#### ✅ 디자인
- 요청한 색상/스타일이 적용되었나?
- 모바일에서도 잘 보이나?
- 깔끔하고 전문적인가?

#### ✅ 성능
- 페이지가 빠르게 로딩되나?
- 버튼 클릭 시 반응이 빠른가?

### 리뷰 코멘트 예시

**좋은 코멘트 ✅**
```
로그인 페이지가 깔끔하네요!
다만 버튼을 조금 더 크게 만들어주세요.
```

```
이 부분은 잘 만들어졌어요.
모바일에서 텍스트가 잘 안 보이니 크기를 키워주세요.
```

**명확하지 않은 코멘트 ❌**
```
이거 좀 고쳐주세요.
더 예쁘게 해주세요.
```

---

## 🔐 보안 규칙

### ⚠️ 절대 GitHub에 올리면 안 되는 것

- ❌ `.env` 파일 (실제 비밀번호/키)
- ❌ Private Keys (블록체인 지갑 키)
- ❌ API Secret Keys
- ❌ 비밀번호
- ❌ 개인정보

### ✅ GitHub에 올려도 되는 것

- ✅ 소스 코드
- ✅ 문서 (README, 가이드)
- ✅ 설정 파일
- ✅ `.env.example` (예시 파일만)

---

## 🚨 긴급 상황 대응

### 프로덕션에 심각한 버그 발견 시

1. **CEO가 즉시 이메일 또는 메시지**
   - kongks5798@gmail.com
   - "긴급: 결제 시스템 오류 발생"

2. **카이로스가 최우선 작업**
   ```bash
   git checkout -b hotfix/payment-error
   # 버그 수정
   git commit -m "hotfix: Fix critical payment error"
   git push origin hotfix/payment-error
   ```

3. **CEO가 즉시 리뷰 및 승인**
   - 빠른 검토
   - 승인 후 즉시 병합

---

## 📚 주요 문서

| 문서 | 대상 | 내용 |
|------|------|------|
| **README.md** | 모두 | 프로젝트 소개 |
| **WORKSPACE_SETUP.md** | CEO | 작업 환경 설정 방법 |
| **GITHUB_SETUP_INSTRUCTIONS.md** | CEO | GitHub 저장소 설정 |
| **KAIROS_WORKFLOW.md** | 카이로스 | 개발 작업 흐름 |
| **COLLABORATION_GUIDE.md** | 모두 | 이 문서 (협업 방법) |

---

## 💡 유용한 팁

### CEO를 위한 팁

1. **명확한 요구사항 작성**
   - "예쁘게" ❌
   - "파란색 버튼, 둥근 모서리" ✅

2. **빠른 피드백**
   - PR이 올라오면 가능한 빨리 검토
   - 빠른 피드백 = 빠른 개발

3. **우선순위 명시**
   - 긴급한 작업은 "High priority" 표시

### 카이로스를 위한 팁

1. **작은 단위로 커밋**
   - 한 번에 많은 변경 ❌
   - 기능별로 나누어 커밋 ✅

2. **명확한 PR 설명**
   - 무엇을 변경했는지
   - 왜 변경했는지
   - 어떻게 테스트했는지

3. **로컬에서 먼저 테스트**
   - 푸시 전에 빌드 확인
   - 에러 없는지 체크

---

## ❓ 자주 묻는 질문

### Q: CEO - Pull Request를 어떻게 승인하나요?
**A:** GitHub → Pull requests → 해당 PR 클릭 → Review changes → Approve → Merge pull request

### Q: CEO - 코드를 잘 모르는데 어떻게 리뷰하나요?
**A:** 기능이 요구사항대로 작동하는지, 디자인이 마음에 드는지만 확인하면 됩니다!

### Q: 카이로스 - main 브랜치에 직접 푸시할 수 있나요?
**A:** 아니요. main은 보호되어 있어 Pull Request + CEO 승인이 필요합니다.

### Q: 작업 중 충돌이 발생하면?
**A:** `git pull origin main` → 충돌 해결 → 다시 커밋 → 푸시

### Q: CEO - 수정 요청했는데 카이로스가 고치지 않아요
**A:** PR 댓글에 명확히 작성했는지 확인, 필요시 이메일로 연락

---

## 📞 연락처 및 링크

- **CEO 이메일**: kongks5798@gmail.com
- **GitHub 계정**: pcpc233-netizen
- **저장소 링크**: https://github.com/pcpc233-netizen/kaus-hybrid-development
- **Issues**: https://github.com/pcpc233-netizen/kaus-hybrid-development/issues
- **Pull Requests**: https://github.com/pcpc233-netizen/kaus-hybrid-development/pulls

---

## 🎯 시작 체크리스트

### CEO 체크리스트

- [ ] kongks5798@gmail.com에서 GitHub 초대 메일 확인
- [ ] "Accept invitation" 클릭하여 초대 수락
- [ ] https://github.com/pcpc233-netizen/kaus-hybrid-development 접속 확인
- [ ] 첫 번째 Issue 생성 (테스트용)
- [ ] GITHUB_SETUP_INSTRUCTIONS.md 문서 읽기

### 카이로스 체크리스트

- [ ] GitHub 저장소 접근 확인
- [ ] Bolt.new 환경 설정 확인
- [ ] CEO의 첫 번째 작업 지시 대기
- [ ] KAIROS_WORKFLOW.md 문서 숙지

---

## 📊 현재 상태

```
✅ GitHub 저장소 생성 완료
✅ 초기 코드 업로드 완료
✅ 협업 문서 작성 완료
✅ CEO 초대 발송 완료
⏳ CEO 초대 수락 대기 중
⏳ 첫 번째 작업 지시 대기 중
```

---

**작성일**: 2025-11-05
**작성자**: K-AUS Development Team
**버전**: 2.0
**CEO 이메일**: kongks5798@gmail.com
