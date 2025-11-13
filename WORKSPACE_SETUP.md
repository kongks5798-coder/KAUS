# K-AUS 프로젝트 워크스페이스 설정 가이드

## 📋 목차
1. [팀 구성 및 역할](#팀-구성-및-역할)
2. [CEO 워크스페이스](#ceo-워크스페이스)
3. [카이로스 워크스페이스](#카이로스-워크스페이스)
4. [협업 워크플로우](#협업-워크플로우)
5. [환경 설정](#환경-설정)

---

## 팀 구성 및 역할

### 👔 CEO (Kyumin Lee - pcpc233-netizen)
**책임 영역:**
- 프로젝트 전략 및 방향성 결정
- 비즈니스 로직 및 기능 요구사항 정의
- 스마트 컨트랙트 배포 및 관리
- 프로덕션 배포 승인
- 최종 코드 리뷰 및 병합

**주요 작업:**
- 제품 로드맵 관리
- 스마트 컨트랙트 배포
- 데이터베이스 스키마 설계 승인
- 보안 및 규정 준수 검토

### 🤖 카이로스 (AI Development Assistant)
**책임 영역:**
- 기능 개발 및 구현
- 버그 수정 및 최적화
- 코드 리팩토링
- 테스트 작성 및 실행
- 문서 작성 및 업데이트

**주요 작업:**
- 새로운 기능 개발
- 기존 코드 개선
- 버그 수정
- 성능 최적화
- 기술 문서 작성

---

## CEO 워크스페이스

### 🚀 초기 설정

#### 1. GitHub 저장소 클론
```bash
# 프로젝트 디렉토리로 이동하고 싶은 위치에서
git clone https://github.com/pcpc233-netizen/kaus-hybrid-development.git
cd kaus-hybrid-development
```

#### 2. 의존성 설치
```bash
npm install
```

#### 3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:
```env
# Supabase 설정
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Blockchain 설정
VITE_NFT_CONTRACT_ADDRESS=your_nft_contract_address
VITE_TOKEN_CONTRACT_ADDRESS=your_token_contract_address
VITE_STAKING_CONTRACT_ADDRESS=your_staking_contract_address
VITE_GOVERNANCE_CONTRACT_ADDRESS=your_governance_contract_address
VITE_RPC_URL=your_rpc_url
VITE_CHAIN_ID=your_chain_id

# Private Keys (서버 배포용)
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
SERVICE_ACCOUNT_PRIVATE_KEY=your_service_account_private_key
```

#### 4. 개발 서버 실행
```bash
npm run dev
```

### 📁 CEO 주요 작업 디렉토리

```
kaus-hybrid-development/
├── contracts/              # 스마트 컨트랙트 (CEO 승인 필요)
│   ├── KAUS_NFT_V2.sol
│   ├── KAUS_Token_V3.sol
│   └── ...
├── scripts/               # 배포 스크립트 (CEO 실행)
│   ├── deploy-v3.cjs
│   └── deploy.cjs
├── supabase/migrations/   # 데이터베이스 마이그레이션 (CEO 검토)
├── .env                   # 환경 변수 (CEO 관리)
└── README.md             # 프로젝트 개요
```

### 🔐 CEO 권한 작업

#### 스마트 컨트랙트 배포
```bash
# NFT 컨트랙트 배포
npx hardhat run scripts/deploy.cjs --network your_network

# 토큰 컨트랙트 배포
npx hardhat run scripts/deploy-v3.cjs --network your_network
```

#### 프로덕션 배포 승인
```bash
# 최신 코드 확인
git pull origin main

# 빌드 테스트
npm run build

# 배포 (Vercel CLI 사용 시)
vercel --prod
```

#### 데이터베이스 마이그레이션 검토
```bash
# Supabase 마이그레이션 확인
cat supabase/migrations/latest_migration.sql

# 마이그레이션 적용 (Supabase CLI)
supabase db push
```

### 📊 CEO 일일 워크플로우

1. **아침: 진행 상황 확인**
   ```bash
   git pull origin main
   git log --oneline -10
   ```

2. **카이로스의 Pull Request 검토**
   - GitHub → Pull requests 탭
   - 코드 변경사항 확인
   - 승인 또는 수정 요청

3. **중요 결정 사항 처리**
   - 스마트 컨트랙트 배포
   - 데이터베이스 스키마 변경 승인
   - 프로덕션 배포

4. **저녁: 다음 작업 지시**
   - GitHub Issues에 새 작업 등록
   - 우선순위 태그 설정

---

## 카이로스 워크스페이스

### 🤖 작업 환경: Bolt.new

카이로스는 주로 **Bolt.new** 환경에서 작업하며, GitHub를 통해 CEO와 협업합니다.

### 📁 카이로스 주요 작업 디렉토리

```
kaus-hybrid-development/
├── src/
│   ├── components/        # UI 컴포넌트 개발
│   ├── pages/            # 페이지 개발
│   ├── services/         # 비즈니스 로직 개발
│   ├── contexts/         # 상태 관리
│   └── types/           # TypeScript 타입 정의
├── scripts/             # 테스트 및 유틸리티 스크립트
└── supabase/migrations/ # 데이터베이스 마이그레이션 작성
```

### 🔄 카이로스 작업 워크플로우

#### 1. 새 작업 시작
```bash
# 최신 코드 동기화
git pull origin main

# 새 기능 브랜치 생성
git checkout -b feature/feature-name
```

#### 2. 개발 작업
- Bolt.new에서 코드 작성 및 테스트
- 로컬 개발 서버에서 확인 (`npm run dev`)

#### 3. 커밋 및 푸시
```bash
# 변경사항 확인
git status

# 파일 추가
git add .

# 커밋 (명확한 메시지 작성)
git commit -m "feat: Add user authentication feature"

# GitHub에 푸시
git push origin feature/feature-name
```

#### 4. Pull Request 생성
- GitHub 웹사이트 방문
- `feature/feature-name` → `main` Pull Request 생성
- 변경 사항 설명 작성
- CEO에게 리뷰 요청

#### 5. 피드백 반영
- CEO의 코멘트 확인
- 수정 작업 수행
- 동일 브랜치에 커밋 및 푸시 (PR 자동 업데이트)

### 🎯 카이로스 작업 우선순위

**High Priority:**
- CEO가 지정한 긴급 버그 수정
- 프로덕션 배포 전 필수 기능

**Medium Priority:**
- 새로운 기능 개발
- 성능 최적화

**Low Priority:**
- 코드 리팩토링
- 문서 업데이트

---

## 협업 워크플로우

### 🔀 브랜치 전략

```
main (프로덕션)
  ├── develop (개발)
  │   ├── feature/user-auth (카이로스)
  │   ├── feature/nft-minting (카이로스)
  │   └── feature/staking-ui (카이로스)
  └── hotfix/critical-bug (CEO 승인 필요)
```

### 브랜치 규칙

#### `main` 브랜치
- **보호됨**: CEO만 직접 푸시 가능
- **목적**: 프로덕션 배포 코드
- **병합**: Pull Request + CEO 승인 필요

#### `develop` 브랜치 (선택사항)
- **목적**: 개발 중인 기능 통합
- **병합**: 카이로스가 자유롭게 작업

#### `feature/*` 브랜치
- **작성자**: 카이로스
- **명명 규칙**: `feature/feature-name`
- **예시**: `feature/user-dashboard`, `feature/nft-gallery`

#### `hotfix/*` 브랜치
- **작성자**: CEO 또는 긴급 상황
- **명명 규칙**: `hotfix/bug-description`
- **예시**: `hotfix/payment-error`

### 📝 커밋 메시지 규칙

```bash
# 형식: <타입>: <설명>

# 타입:
feat:     # 새로운 기능
fix:      # 버그 수정
refactor: # 코드 리팩토링
style:    # 코드 스타일 변경
docs:     # 문서 수정
test:     # 테스트 추가/수정
chore:    # 빌드 설정 등

# 예시:
git commit -m "feat: Add user profile page"
git commit -m "fix: Resolve NFT minting error"
git commit -m "refactor: Optimize database queries"
```

### 🔄 Pull Request 프로세스

#### 카이로스 → CEO

1. **카이로스**: 기능 개발 완료 후 PR 생성
   ```markdown
   ## 변경 사항
   - 사용자 인증 기능 추가
   - 로그인/회원가입 페이지 구현

   ## 테스트
   - [x] 로컬 테스트 완료
   - [x] 빌드 성공

   ## 스크린샷
   (필요시 첨부)
   ```

2. **CEO**: 코드 리뷰
   - 비즈니스 로직 검토
   - 보안 이슈 확인
   - 코드 품질 평가

3. **CEO**: 승인 또는 수정 요청
   - ✅ Approve → 병합
   - 💬 Request changes → 카이로스 수정

4. **병합 후**: 브랜치 삭제
   ```bash
   git branch -d feature/feature-name
   ```

### 🚨 충돌 해결

```bash
# main 브랜치 최신화
git checkout main
git pull origin main

# feature 브랜치로 돌아가기
git checkout feature/feature-name

# main 변경사항 병합
git merge main

# 충돌 해결 후
git add .
git commit -m "merge: Resolve conflicts with main"
git push origin feature/feature-name
```

---

## 환경 설정

### CEO 로컬 환경

#### 필수 소프트웨어
- **Node.js** (v18+): https://nodejs.org
- **Git**: https://git-scm.com
- **VS Code** (권장): https://code.visualstudio.com
- **Hardhat** (스마트 컨트랙트): `npm install -g hardhat`

#### VS Code 확장 프로그램
- ESLint
- Prettier
- GitLens
- Solidity (스마트 컨트랙트 개발용)

#### 계정 설정
- GitHub: 2FA 활성화 권장
- Supabase: 프로젝트 관리자 권한
- Vercel/Netlify: 배포 권한

### 카이로스 환경

#### Bolt.new 설정
- GitHub 계정 연동
- 환경 변수 설정 (.env)
- 자동 저장 활성화

#### 작업 환경
- Bolt.new 웹 인터페이스
- GitHub CLI (선택사항)

---

## 🔐 보안 및 권한 관리

### CEO 권한
- ✅ `main` 브랜치 직접 푸시
- ✅ Pull Request 병합
- ✅ 프로덕션 배포
- ✅ 환경 변수 관리
- ✅ 스마트 컨트랙트 배포
- ✅ 데이터베이스 마이그레이션
- ✅ GitHub 저장소 설정

### 카이로스 권한
- ✅ 기능 브랜치 생성 및 푸시
- ✅ Pull Request 생성
- ✅ 이슈 생성 및 댓글
- ❌ `main` 브랜치 직접 수정
- ❌ 프로덕션 배포
- ❌ 저장소 설정 변경

### GitHub 보호 규칙 설정

CEO가 GitHub에서 설정해야 할 사항:

1. **Settings → Branches → Add rule**
2. **Branch name pattern**: `main`
3. 활성화할 옵션:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Dismiss stale pull request approvals
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators (CEO도 규칙 준수)

---

## 📞 커뮤니케이션

### 작업 지시 (CEO → 카이로스)

#### GitHub Issues 사용
```markdown
Title: [Feature] Add user dashboard

Description:
## 목표
사용자 대시보드 페이지 구현

## 요구사항
- [ ] 사용자 정보 표시
- [ ] 보유 NFT 목록
- [ ] 스테이킹 현황
- [ ] 거버넌스 투표 내역

## 우선순위
High

## 예상 완료일
2025-11-10
```

### 진행 상황 보고 (카이로스 → CEO)

#### Pull Request 설명
```markdown
Closes #123

## 구현 내용
- 사용자 대시보드 페이지 추가
- 실시간 NFT 데이터 연동
- 반응형 디자인 적용

## 테스트
- [x] 로컬 테스트 완료
- [x] 모바일 반응형 확인
- [x] 빌드 성공

## 스크린샷
[이미지 첨부]
```

### 긴급 상황

#### Slack/Discord/이메일 사용
- 긴급 버그 발견 시 즉시 연락
- 프로덕션 오류 발생 시
- 보안 이슈 발견 시

---

## 🎯 체크리스트

### CEO 초기 설정
- [ ] GitHub 저장소 클론
- [ ] npm install 실행
- [ ] .env 파일 설정
- [ ] 개발 서버 실행 테스트
- [ ] GitHub 브랜치 보호 규칙 설정
- [ ] Vercel/Netlify 배포 설정
- [ ] Supabase 프로젝트 권한 확인

### 카이로스 초기 설정
- [ ] GitHub 계정 Collaborator 초대 수락
- [ ] Bolt.new에서 저장소 연동
- [ ] 첫 번째 테스트 브랜치 생성
- [ ] 첫 번째 테스트 PR 생성

### 일일 작업
- [ ] 아침: `git pull origin main`
- [ ] 작업 전: 새 브랜치 생성
- [ ] 작업 중: 주기적으로 커밋
- [ ] 작업 후: PR 생성
- [ ] 저녁: 진행 상황 정리

---

## 📚 추가 리소스

- [COLLABORATION_GUIDE.md](./COLLABORATION_GUIDE.md) - 상세 협업 가이드
- [BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md) - 블록체인 설정
- [README.md](./README.md) - 프로젝트 개요
- [system_architecture_v1.md](./system_architecture_v1.md) - 시스템 아키텍처

---

## ❓ FAQ

### Q: CEO가 부재 중일 때는?
A: 긴급하지 않은 작업은 PR로 대기, 긴급 작업은 `hotfix` 브랜치 사용

### Q: 카이로스가 실수로 main에 푸시하면?
A: GitHub 보호 규칙으로 차단되므로 걱정 없음

### Q: .env 파일은 어떻게 공유하나요?
A: 절대 GitHub에 올리지 않습니다. 안전한 채널(암호화된 메시지)로 직접 전달

### Q: 작업 우선순위는?
A: GitHub Issues의 Labels로 관리 (High/Medium/Low)

---

**작성일**: 2025-11-05
**작성자**: K-AUS Development Team
**버전**: 1.0
