# 🪙 KAUS Token 배포 및 관리 가이드

**작성일**: 2025-11-10
**대상**: COO 공경수(유비) CEO
**목적**: KAUS Token 스마트컨트랙트 배포 및 운영 가이드

---

## 📋 목차

1. [개요](#개요)
2. [새로운 KAUSToken 스펙](#새로운-kaustoken-스펙)
3. [배포 전 준비사항](#배포-전-준비사항)
4. [배포 절차](#배포-절차)
5. [배포 후 설정](#배포-후-설정)
6. [GitHub 업로드 방법](#github-업로드-방법)
7. [운영 및 관리](#운영-및-관리)
8. [보안 고려사항](#보안-고려사항)

---

## 개요

### 📊 컨트랙트 비교

| 항목 | KAUS_Token_V3 | KAUSToken (신규) |
|------|---------------|------------------|
| 초기 발행량 | 10억 KAUS | **100억 KAUS** |
| 최대 공급량 | 제한 없음 | **500억 KAUS** |
| 거버넌스 | Staking 기반 | **AccessControl 기반** |
| 민팅 제한 | 없음 | **30일 간격, 5%씩** |
| 소각 기능 | 기본 | **사유 기록** |
| 보안 | 기본 | **ReentrancyGuard** |

### ✨ 신규 컨트랙트 주요 특징

1. **100억 KAUS 초기 발행** (CEO 지갑으로)
2. **역할 기반 권한 관리** (GOVERNANCE_ROLE, MINTER_ROLE)
3. **Timelock 보안** (급격한 인플레이션 방지)
4. **투명한 소각 시스템** (모든 소각에 사유 기록)
5. **스테이킹 보상 연동** (별도 MINTER_ROLE)

---

## 새로운 KAUSToken 스펙

### 🏗️ 기술 스펙

```solidity
계약명: KAUSToken
심볼: KAUS
소수점: 18
표준: ERC-20 + ERC20Burnable + AccessControl + Ownable
```

### 💰 토큰 이코노미

- **초기 발행량**: 10,000,000,000 KAUS (100억)
- **최대 발행량**: 50,000,000,000 KAUS (500억)
- **민팅 규칙**:
  - 최소 30일 간격
  - 한 번에 최대 현재 공급량의 5%
- **소각 규칙**: 누구나 자신의 토큰 소각 가능 (사유 필수)

### 🔐 역할 구조

```
┌─────────────────────────────────────┐
│     DEFAULT_ADMIN_ROLE (CEO)       │
│   - 모든 역할 부여/제거 권한        │
└──────────┬──────────────────────────┘
           │
     ┌─────┴─────┬──────────────┐
     │           │              │
┌────▼────┐ ┌───▼────────┐ ┌──▼────────┐
│ OWNER   │ │GOVERNANCE  │ │  MINTER   │
│ (CEO)   │ │   ROLE     │ │   ROLE    │
│         │ │            │ │           │
│- 역할 관리│ │- DAO 민팅  │ │- 스테이킹 │
│- 최종 권한│ │- 소각 권한 │ │  보상 발행│
└─────────┘ └────────────┘ └───────────┘
```

---

## 배포 전 준비사항

### 1️⃣ 환경 변수 확인

`.env` 파일에 다음 항목이 있는지 확인:

```env
# Base Sepolia 테스트넷
SEPOLIA_RPC_URL=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=당신의_프라이빗키
ETHERSCAN_API_KEY=당신의_API키

# Base 메인넷 (프로덕션)
BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

⚠️ **보안 주의사항**:
- Private Key는 절대 GitHub에 업로드하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있습니다
- 메인넷 배포 시 반드시 새 지갑 생성을 권장합니다

### 2️⃣ 배포 지갑 잔액 확인

```bash
# Base Sepolia 테스트넷 ETH 필요 (약 0.01 ETH)
# https://www.coinbase.com/faucets 에서 무료로 받을 수 있습니다

# 또는 Base Sepolia Faucet
# https://www.alchemy.com/faucets/base-sepolia
```

### 3️⃣ 필요한 도구 설치 확인

```bash
node --version  # v18 이상 권장
npm --version   # v9 이상 권장
```

---

## 배포 절차

### 🧪 1단계: 로컬 테스트 (권장)

```bash
# 1. 컨트랙트 컴파일
npx hardhat compile

# 2. 로컬 노드 실행 (새 터미널)
npx hardhat node

# 3. 로컬에 배포 테스트
npx hardhat run scripts/deploy-kaus-token.cjs --network localhost
```

### 🌐 2단계: 테스트넷 배포

```bash
# Base Sepolia 테스트넷에 배포
npx hardhat run scripts/deploy-kaus-token.cjs --network baseSepolia
```

**배포 예상 결과:**

```
🚀 KAUS Token 배포 시작...

배포 지갑: 0xYourAddress
지갑 잔액: 0.05 ETH

1️⃣ KAUS Token (100억 KAUS) 배포 중...
✅ KAUS Token 배포 완료: 0x1234567890abcdef...
   초기 발행량: 10000000000.0 KAUS
   최대 발행량: 50000000000.0 KAUS

2️⃣ 역할 확인 중...
   Governance Role: ✅ 부여됨
   Minter Role: ✅ 부여됨

📋 배포 완료! 아래 주소를 .env 파일에 추가하세요:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VITE_KAUS_TOKEN_ADDRESS=0x1234567890abcdef...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3️⃣ 컨트랙트 주소 저장

배포된 주소를 `.env` 파일에 추가:

```env
VITE_KAUS_TOKEN_ADDRESS=0x배포된_주소
```

### 🚀 4단계: 메인넷 배포 (프로덕션)

⚠️ **매우 중요**: 메인넷 배포 전 체크리스트

- [ ] 테스트넷에서 충분히 테스트 완료
- [ ] 배포 지갑에 충분한 ETH 보유 (약 0.05 ETH)
- [ ] 배포 지갑 주소 재확인
- [ ] Multi-sig 지갑 주소 준비
- [ ] 팀원들과 배포 일정 공유

```bash
# hardhat.config.cjs에 Base 메인넷 설정 추가 후
npx hardhat run scripts/deploy-kaus-token.cjs --network base
```

---

## 배포 후 설정

### 1️⃣ 거버넌스 멤버 추가

DAO 거버넌스에 참여할 멤버들에게 GOVERNANCE_ROLE 부여:

```javascript
// Hardhat console 사용
npx hardhat console --network baseSepolia

const token = await ethers.getContractAt(
  "KAUSToken",
  "0x배포된_주소"
);

// 거버넌스 멤버 추가
await token.grantGovernanceRole("0xDAO멤버_지갑주소");
```

### 2️⃣ 스테이킹 컨트랙트 연동

스테이킹 컨트랙트가 보상을 발행할 수 있도록 MINTER_ROLE 부여:

```javascript
await token.grantMinterRole("0x스테이킹컨트랙트_주소");
```

### 3️⃣ Multi-sig 지갑으로 소유권 이전 (필수)

⚠️ **보안상 매우 중요**: 운영 환경에서는 반드시 Multi-sig 지갑으로 소유권 이전

```javascript
// Safe (Gnosis Safe) 또는 다른 Multi-sig 지갑 사용
await token.transferOwnership("0xMultisig_지갑주소");
```

**추천 Multi-sig 솔루션:**
- [Safe (구 Gnosis Safe)](https://safe.global/) - 가장 많이 사용
- [Coinbase Wallet](https://www.coinbase.com/wallet) - Multi-sig 기능

---

## GitHub 업로드 방법

### 📤 방법 1: 처음 업로드하는 경우

```bash
# 1. Git 초기화
git init

# 2. 모든 파일 추가 (.gitignore가 .env 등 제외)
git add .

# 3. 첫 커밋
git commit -m "feat: Add KAUS Token smart contract with governance

- Add KAUSToken.sol with 100B initial supply
- Add deployment script deploy-kaus-token.cjs
- Implement timelock minting mechanism (30 days, 5% max)
- Add role-based access control (GOVERNANCE_ROLE, MINTER_ROLE)
- Add transparent burn mechanism with reason tracking
- Add reentrancy protection"

# 4. GitHub 저장소 연결
git remote add origin https://github.com/당신의계정/저장소명.git

# 5. 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### 📤 방법 2: 기존 저장소에 업데이트하는 경우

```bash
# 1. 변경사항 확인
git status

# 2. 새 파일들 추가
git add contracts/KAUSToken.sol
git add scripts/deploy-kaus-token.cjs
git add KAUS_TOKEN_DEPLOYMENT_GUIDE.md

# 3. 커밋
git commit -m "feat: Add KAUS Token smart contract

- 100억 KAUS 초기 발행
- 거버넌스 기반 토큰 이코노미
- 타임락 및 보안 기능 강화"

# 4. 푸시
git push origin main
```

### 🔗 CEO와 공유할 GitHub 링크

배포 후 CEO에게 다음 정보를 공유하세요:

```
📧 이메일 제목: [완료] KAUS Token 스마트컨트랙트 배포

안녕하세요 CEO님,

KAUS Token 스마트컨트랙트가 성공적으로 배포되었습니다.

🔗 GitHub 저장소:
https://github.com/당신의계정/저장소명

📄 주요 파일:
- 스마트컨트랙트: contracts/KAUSToken.sol
- 배포 스크립트: scripts/deploy-kaus-token.cjs
- 배포 가이드: KAUS_TOKEN_DEPLOYMENT_GUIDE.md

⛓️ 배포된 컨트랙트 주소:
- 네트워크: Base Sepolia
- 주소: 0x배포된_주소
- 탐색기: https://sepolia.basescan.org/address/0x배포된_주소

💰 토큰 정보:
- 초기 발행량: 100억 KAUS
- 최대 공급량: 500억 KAUS
- CEO 지갑 보유량: 100억 KAUS

📋 다음 단계:
1. 거버넌스 멤버 지정
2. Multi-sig 지갑 설정
3. 메인넷 배포 일정 협의

감사합니다.
```

---

## 운영 및 관리

### 📊 토큰 통계 조회

```javascript
// Hardhat console 또는 프론트엔드에서
const stats = await token.getTokenStats();

console.log("현재 공급량:", ethers.formatEther(stats[0]));
console.log("최대 공급량:", ethers.formatEther(stats[1]));
console.log("총 소각량:", ethers.formatEther(stats[2]));
console.log("유통량:", ethers.formatEther(stats[3]));
```

### 🪙 DAO 승인 토큰 발행

```javascript
// 30일이 지나고, DAO 투표를 통과한 경우
await token.mintByGovernance(
  "0x수령자_주소",
  ethers.parseEther("1000000"), // 100만 KAUS
  "Q1 2025 생태계 확장 자금"
);
```

### 🔥 토큰 소각

```javascript
// 누구나 자신의 토큰 소각 가능
await token.burnWithReason(
  ethers.parseEther("1000"),
  "가치 방어를 위한 자발적 소각"
);
```

### 🎁 스테이킹 보상 발행

```javascript
// MINTER_ROLE을 가진 스테이킹 컨트랙트만 호출 가능
await token.mintStakingReward(
  "0x스테이커_주소",
  ethers.parseEther("100") // 100 KAUS 보상
);
```

---

## 보안 고려사항

### 🔒 보안 체크리스트

- [x] **ReentrancyGuard 적용**: 재진입 공격 방지
- [x] **Timelock 메커니즘**: 급격한 토큰 발행 방지
- [x] **역할 기반 접근 제어**: 권한 분산
- [x] **최대 공급량 제한**: 무한 인플레이션 방지
- [x] **투명한 소각 기록**: 모든 소각에 사유 기록
- [ ] **Multi-sig 지갑 설정** (배포 후 필수)
- [ ] **감사(Audit) 완료** (메인넷 배포 전 권장)

### 🛡️ 운영 보안 수칙

1. **Private Key 관리**
   - 절대 코드에 하드코딩 금지
   - Hardware Wallet 사용 권장
   - 정기적인 키 교체

2. **Multi-sig 지갑 사용**
   - 최소 3명 이상의 서명자
   - 2/3 이상의 서명 필요
   - Safe (Gnosis Safe) 사용 권장

3. **스마트컨트랙트 감사**
   - 메인넷 배포 전 전문 감사 받기
   - [CertiK](https://www.certik.com/)
   - [OpenZeppelin](https://www.openzeppelin.com/security-audits)

4. **점진적 권한 이양**
   ```
   1단계: CEO 개인 지갑 (개발/테스트)
   2단계: 팀 Multi-sig (베타)
   3단계: DAO Timelock (프로덕션)
   ```

---

## 📞 문의 및 지원

### 기술 지원
- **개발자**: COO 공경수(유비)
- **문서**: 이 가이드 참조
- **긴급 연락**: [연락처]

### 추가 리소스
- [Hardhat 문서](https://hardhat.org/docs)
- [OpenZeppelin 문서](https://docs.openzeppelin.com/)
- [Base 네트워크 문서](https://docs.base.org/)
- [Ethers.js 문서](https://docs.ethers.org/)

---

## 📅 로드맵

### Phase 1: 테스트넷 (현재)
- [x] 스마트컨트랙트 개발
- [x] 배포 스크립트 작성
- [ ] 테스트넷 배포
- [ ] 기능 테스트

### Phase 2: 감사 및 준비
- [ ] 스마트컨트랙트 감사
- [ ] Multi-sig 지갑 설정
- [ ] 거버넌스 프로세스 정의
- [ ] 커뮤니티 공지

### Phase 3: 메인넷 배포
- [ ] 메인넷 배포
- [ ] 초기 유동성 공급
- [ ] DEX 리스팅
- [ ] 마케팅 캠페인

---

**마지막 업데이트**: 2025-11-10
**버전**: 1.0.0
**작성자**: KAUS 개발팀
