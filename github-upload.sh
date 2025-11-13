#!/bin/bash

# KAUS Token GitHub 업로드 스크립트
# 사용법: ./github-upload.sh

echo "🚀 KAUS Token GitHub 업로드 시작..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Git 저장소 확인
if [ -d .git ]; then
    echo -e "${YELLOW}⚠️  Git 저장소가 이미 존재합니다.${NC}"
    echo "기존 저장소를 사용합니다."
    echo ""
else
    echo "📦 Git 저장소 초기화 중..."
    git init
    echo -e "${GREEN}✅ Git 저장소 초기화 완료${NC}"
    echo ""
fi

# 2. .gitignore 확인
if [ -f .gitignore ]; then
    echo -e "${GREEN}✅ .gitignore 파일이 있습니다.${NC}"

    # .env가 gitignore에 있는지 확인
    if grep -q "^\.env$" .gitignore; then
        echo -e "${GREEN}✅ .env 파일이 안전하게 제외됩니다.${NC}"
    else
        echo -e "${YELLOW}⚠️  .env를 .gitignore에 추가합니다.${NC}"
        echo ".env" >> .gitignore
    fi
else
    echo -e "${RED}❌ .gitignore 파일이 없습니다!${NC}"
    exit 1
fi
echo ""

# 3. 민감한 정보 확인
echo "🔍 민감한 정보 검사 중..."
if grep -r "PRIVATE_KEY" --include="*.sol" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.cjs" .; then
    echo -e "${RED}❌ 소스코드에 PRIVATE_KEY가 포함되어 있습니다!${NC}"
    echo "배포를 중단합니다. 민감한 정보를 제거한 후 다시 시도하세요."
    exit 1
fi
echo -e "${GREEN}✅ 민감한 정보 없음${NC}"
echo ""

# 4. 파일 추가
echo "📝 변경사항 추가 중..."
git add .

# 변경된 파일 확인
CHANGED_FILES=$(git diff --cached --name-only)
if [ -z "$CHANGED_FILES" ]; then
    echo -e "${YELLOW}⚠️  변경사항이 없습니다.${NC}"
    echo "이미 모든 파일이 커밋되었습니다."
else
    echo "다음 파일들이 추가됩니다:"
    echo "$CHANGED_FILES"
fi
echo ""

# 5. 커밋
echo "💾 커밋 생성 중..."
COMMIT_MESSAGE="feat: Add KAUS Token smart contract

- Add KAUSToken.sol with 100B initial supply
- Implement AccessControl-based governance
- Add timelock minting mechanism (30 days, max 5%)
- Add transparent burn mechanism with reason tracking
- Add deployment script and comprehensive guides
- Add CEO summary and deployment documentation"

git commit -m "$COMMIT_MESSAGE"
echo -e "${GREEN}✅ 커밋 완료${NC}"
echo ""

# 6. 원격 저장소 확인
echo "🔗 원격 저장소 확인 중..."
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    echo -e "${YELLOW}⚠️  원격 저장소가 설정되지 않았습니다.${NC}"
    echo ""
    echo "GitHub에서 새 저장소를 생성한 후 아래 명령어를 실행하세요:"
    echo ""
    echo -e "${GREEN}git remote add origin https://github.com/계정명/저장소명.git${NC}"
    echo -e "${GREEN}git branch -M main${NC}"
    echo -e "${GREEN}git push -u origin main${NC}"
    echo ""
    echo "또는 이 스크립트를 다시 실행하세요."
    exit 0
else
    echo -e "${GREEN}✅ 원격 저장소: $REMOTE_URL${NC}"
    echo ""
fi

# 7. 브랜치 확인 및 설정
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "📌 main 브랜치로 전환 중..."
    git branch -M main
fi

# 8. 푸시
echo "🚀 GitHub로 푸시 중..."
echo ""
read -p "GitHub로 푸시하시겠습니까? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin main

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ GitHub 업로드 완료!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "📋 다음 단계:"
        echo "1. GitHub 저장소 확인: $REMOTE_URL"
        echo "2. CEO에게 링크 공유"
        echo "3. CEO_KAUS_TOKEN_SUMMARY.md 문서 확인"
        echo ""
        echo "🎉 성공적으로 업로드되었습니다!"
    else
        echo ""
        echo -e "${RED}❌ 푸시 실패${NC}"
        echo "다음을 확인하세요:"
        echo "1. GitHub 인증 정보"
        echo "2. 네트워크 연결"
        echo "3. 저장소 권한"
    fi
else
    echo "푸시가 취소되었습니다."
    echo ""
    echo "나중에 수동으로 푸시하려면:"
    echo -e "${GREEN}git push -u origin main${NC}"
fi

echo ""
echo "📚 문서 위치:"
echo "  - CEO 요약: CEO_KAUS_TOKEN_SUMMARY.md"
echo "  - 상세 가이드: KAUS_TOKEN_DEPLOYMENT_GUIDE.md"
echo "  - 스마트컨트랙트: contracts/KAUSToken.sol"
