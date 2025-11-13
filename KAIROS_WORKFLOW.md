# 카이로스 작업 워크플로우 가이드

이 문서는 AI Assistant **카이로스**를 위한 작업 지침서입니다.

---

## 🎯 카이로스의 역할

- 새로운 기능 개발 및 구현
- 버그 수정 및 코드 최적화
- 테스트 작성 및 실행
- 기술 문서 작성
- CEO의 지시사항 실행

---

## 📋 작업 수신 방법

### 1. GitHub Issues에서 작업 확인

CEO가 다음과 같은 형식으로 작업을 할당합니다:

```markdown
Title: [Feature] Add user profile page

Description:
## 목표
사용자가 자신의 프로필을 보고 편집할 수 있는 페이지를 만들어주세요.

## 요구사항
- [ ] 사용자 정보 표시 (이름, 이메일, 지갑 주소)
- [ ] 프로필 이미지 업로드 기능
- [ ] 보유 NFT 목록 표시
- [ ] 스테이킹 현황 표시
- [ ] 반응형 디자인 적용

## 우선순위
High

## 예상 완료일
2025-11-10

## 기술 요구사항
- React + TypeScript
- Tailwind CSS 사용
- Supabase에서 데이터 가져오기
- Lucide React 아이콘 사용

Assigned to: @kairos
Labels: type: feature, priority: high, area: frontend
```

---

## 🔄 작업 프로세스

### Step 1: 작업 준비

```bash
# 1. 최신 main 브랜치 가져오기
git checkout main
git pull origin main

# 2. 새 기능 브랜치 생성
git checkout -b feature/user-profile-page

# 3. 작업 시작
# Bolt.new에서 코드 작성 시작
```

### Step 2: 개발 작업

#### 파일 생성 예시

**`src/pages/ProfilePage.tsx`**
```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Upload } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      {/* 프로필 UI 구현 */}
    </div>
  );
}
```

#### 라우팅 추가

**`src/App.tsx`** 수정
```typescript
import ProfilePage from './pages/ProfilePage';

// 라우트 추가
<Route path="/profile" element={<ProfilePage />} />
```

### Step 3: 테스트

```bash
# 로컬 개발 서버에서 테스트
npm run dev

# 타입 체크
npm run typecheck

# 린트 체크
npm run lint

# 빌드 테스트
npm run build
```

### Step 4: 커밋 및 푸시

```bash
# 변경사항 확인
git status

# 파일 추가
git add src/pages/ProfilePage.tsx
git add src/App.tsx

# 커밋 (명확한 메시지 작성)
git commit -m "feat: Add user profile page with NFT and staking info"

# GitHub에 푸시
git push origin feature/user-profile-page
```

### Step 5: Pull Request 생성

GitHub 웹사이트에서 PR 생성:

```markdown
Title: feat: Add user profile page

## 관련 Issue
Closes #123

## 변경 사항
- ✅ 사용자 프로필 페이지 추가
- ✅ 프로필 정보 표시 (이름, 이메일, 지갑 주소)
- ✅ 프로필 이미지 업로드 기능
- ✅ 보유 NFT 목록 표시
- ✅ 스테이킹 현황 표시
- ✅ 반응형 디자인 적용

## 구현 세부사항
- React + TypeScript로 구현
- Supabase에서 프로필 데이터 가져오기
- Lucide React 아이콘 사용
- Tailwind CSS로 스타일링

## 테스트
- [x] 로컬 개발 서버에서 정상 작동 확인
- [x] 반응형 디자인 테스트 (모바일/태블릿/데스크톱)
- [x] TypeScript 타입 체크 통과
- [x] ESLint 통과
- [x] 빌드 성공

## 스크린샷
[스크린샷 첨부]

## 추가 노트
- 프로필 이미지는 Supabase Storage에 저장됩니다
- NFT 데이터는 실시간으로 블록체인에서 가져옵니다
```

### Step 6: CEO 리뷰 대기

CEO가 다음 중 하나를 선택합니다:

1. **✅ Approve**: PR 승인 및 병합
2. **💬 Request changes**: 수정 요청
3. **💭 Comment**: 질문 또는 의견

### Step 7: 피드백 반영 (수정 요청 시)

```bash
# 피드백 내용 확인
# GitHub PR 페이지에서 CEO의 코멘트 읽기

# 코드 수정
# Bolt.new에서 수정 작업

# 동일 브랜치에 커밋 및 푸시
git add .
git commit -m "fix: Apply CEO feedback - update profile layout"
git push origin feature/user-profile-page

# PR이 자동으로 업데이트됩니다
```

### Step 8: 병합 후 정리

```bash
# main 브랜치로 전환
git checkout main

# 최신 코드 가져오기
git pull origin main

# 작업 브랜치 삭제
git branch -d feature/user-profile-page

# 다음 작업 준비
```

---

## 📝 커밋 메시지 작성 규칙

### 형식
```
<타입>: <제목>

<본문> (선택사항)

<푸터> (선택사항)
```

### 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat: Add user authentication` |
| `fix` | 버그 수정 | `fix: Resolve NFT minting error` |
| `refactor` | 코드 리팩토링 | `refactor: Optimize database queries` |
| `style` | 코드 스타일 변경 | `style: Format code with Prettier` |
| `docs` | 문서 수정 | `docs: Update API documentation` |
| `test` | 테스트 추가/수정 | `test: Add unit tests for auth service` |
| `chore` | 빌드 설정 등 | `chore: Update dependencies` |

### 예시

#### 좋은 커밋 메시지 ✅
```bash
git commit -m "feat: Add user profile page with NFT display"
git commit -m "fix: Resolve wallet connection timeout issue"
git commit -m "refactor: Simplify authentication logic"
```

#### 나쁜 커밋 메시지 ❌
```bash
git commit -m "update"
git commit -m "fix bug"
git commit -m "asdf"
```

---

## 🎨 코드 작성 가이드

### 1. 파일 구조

```typescript
// src/pages/ExamplePage.tsx

// 1. Import 구문 (그룹별로 정리)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database, Settings } from 'lucide-react';

// 2. 타입 정의
interface ExampleProps {
  userId: string;
  onSuccess?: () => void;
}

// 3. 컴포넌트
export default function ExamplePage({ userId, onSuccess }: ExampleProps) {
  // 4. 상태 관리
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 5. Hooks
  const navigate = useNavigate();
  const { user } = useAuth();

  // 6. 함수 정의
  const handleSubmit = async () => {
    // 구현
  };

  // 7. useEffect
  useEffect(() => {
    // 구현
  }, []);

  // 8. 렌더링
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 2. 스타일링 (Tailwind CSS)

```tsx
// ✅ 좋은 예시
<div className="container mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold text-slate-900 mb-6">
    Title
  </h1>
  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
    Submit
  </button>
</div>

// ❌ 나쁜 예시 (인라인 스타일)
<div style={{ padding: '2rem', margin: '0 auto' }}>
  <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
    Title
  </h1>
</div>
```

### 3. 에러 처리

```typescript
// ✅ 좋은 예시
const fetchData = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('table')
      .select('*');

    if (error) throw error;
    setData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    // 사용자에게 에러 표시
  } finally {
    setLoading(false);
  }
};

// ❌ 나쁜 예시 (에러 처리 없음)
const fetchData = async () => {
  const { data } = await supabase.from('table').select('*');
  setData(data);
};
```

### 4. 주석 작성

```typescript
// ✅ 필요한 경우에만 명확한 주석
// Calculate total staking rewards including bonus
const totalRewards = baseRewards + bonusRewards;

// ❌ 불필요한 주석
// Set loading to true
setLoading(true);
```

---

## 🔍 자가 점검 체크리스트

작업 완료 전에 다음 항목을 확인하세요:

### 코드 품질
- [ ] TypeScript 타입이 모두 정의되어 있나요?
- [ ] ESLint 경고가 없나요?
- [ ] 불필요한 console.log가 제거되었나요?
- [ ] 코드가 읽기 쉽고 이해하기 쉬운가요?

### 기능 구현
- [ ] 요구사항이 모두 구현되었나요?
- [ ] 에러 처리가 적절하게 되어 있나요?
- [ ] 로딩 상태가 표시되나요?
- [ ] 사용자 피드백(성공/실패 메시지)이 있나요?

### 디자인
- [ ] 반응형 디자인이 적용되었나요?
- [ ] 모바일에서도 잘 보이나요?
- [ ] Tailwind CSS를 일관되게 사용했나요?
- [ ] Lucide React 아이콘을 사용했나요?

### 테스트
- [ ] 로컬에서 정상 작동하나요?
- [ ] 빌드가 성공하나요? (`npm run build`)
- [ ] TypeScript 체크를 통과하나요? (`npm run typecheck`)
- [ ] 다양한 시나리오를 테스트했나요?

### 문서화
- [ ] PR 설명이 명확한가요?
- [ ] 변경사항이 모두 나열되었나요?
- [ ] 스크린샷을 첨부했나요?

---

## 🚨 긴급 버그 수정

긴급한 프로덕션 버그가 발견된 경우:

```bash
# 1. main에서 hotfix 브랜치 생성
git checkout main
git pull origin main
git checkout -b hotfix/critical-payment-bug

# 2. 버그 수정

# 3. 즉시 커밋 및 푸시
git add .
git commit -m "hotfix: Fix critical payment processing error"
git push origin hotfix/critical-payment-bug

# 4. PR 생성 (title에 [URGENT] 추가)
# Title: [URGENT] hotfix: Fix critical payment processing error
```

CEO는 긴급 PR을 우선적으로 검토합니다.

---

## 💡 팁과 모범 사례

### 1. 작은 단위로 커밋하기
```bash
# ✅ 좋은 예시
git commit -m "feat: Add profile page component"
git commit -m "feat: Add profile data fetching logic"
git commit -m "style: Apply responsive design to profile page"

# ❌ 나쁜 예시
git commit -m "feat: Add entire profile feature with all pages and logic"
```

### 2. 브랜치 이름 규칙
```bash
# ✅ 좋은 예시
feature/user-profile
feature/nft-gallery
fix/wallet-connection
refactor/auth-service

# ❌ 나쁜 예시
my-branch
test
feature1
```

### 3. PR 크기 제한
- 하나의 PR은 **300줄 이하** 권장
- 큰 기능은 여러 개의 작은 PR로 분할

### 4. 코드 재사용
```typescript
// ✅ 공통 로직은 별도 함수로 분리
// src/utils/formatters.ts
export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR').format(date);
};

// src/pages/ProfilePage.tsx
import { formatDate } from '../utils/formatters';
```

### 5. 타입 안정성
```typescript
// ✅ 좋은 예시
interface User {
  id: string;
  email: string;
  name?: string;
}

const user: User = { id: '1', email: 'test@example.com' };

// ❌ 나쁜 예시
const user: any = { id: '1', email: 'test@example.com' };
```

---

## 📚 참고 자료

### 프로젝트 문서
- [README.md](./README.md) - 프로젝트 개요
- [COLLABORATION_GUIDE.md](./COLLABORATION_GUIDE.md) - 협업 가이드
- [BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md) - 블록체인 설정
- [system_architecture_v1.md](./system_architecture_v1.md) - 시스템 아키텍처

### 외부 문서
- [React 공식 문서](https://react.dev)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Ethers.js 문서](https://docs.ethers.org)

---

## ❓ 자주 묻는 질문

### Q: 작업을 어디서부터 시작해야 하나요?
A: GitHub Issues에서 할당된 작업을 확인하세요. `priority: high` 라벨이 있는 작업부터 시작하세요.

### Q: 모르는 부분이 있으면?
A: 기존 코드를 참고하거나, PR에 질문을 남겨주세요. CEO가 답변해 드립니다.

### Q: 테스트는 어떻게 하나요?
A: `npm run dev`로 로컬 서버를 실행하고, 브라우저에서 직접 테스트하세요.

### Q: PR이 거절되면?
A: 피드백을 확인하고 수정한 후, 동일 브랜치에 다시 푸시하세요. PR이 자동으로 업데이트됩니다.

### Q: 긴급한 버그를 발견했어요!
A: `hotfix/` 브랜치를 만들고 PR 제목에 `[URGENT]`를 추가하세요.

---

**작성일**: 2025-11-05
**작성자**: K-AUS Development Team
**버전**: 1.0
