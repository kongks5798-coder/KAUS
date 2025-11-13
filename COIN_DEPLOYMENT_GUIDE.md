# 🪙 KAUS 코인 발행 완벽 가이드

이 가이드는 KAUS 토큰을 실제 블록체인에 배포하는 방법을 초보자도 이해할 수 있도록 단계별로 설명합니다.

---

## ✅ 이미 배포된 KAUS 시스템

**KAUS NFT Contract (Base Sepolia 테스트넷)**
- 📍 **컨트랙트 주소**: `0x351a4A012Af3Ba719E1D87f67323B6c63752bC04`
- 🌐 **네트워크**: Base Sepolia Testnet
- 🔗 **RPC URL**: https://sepolia.base.org
- 🔍 **탐색기**: https://sepolia.basescan.org/address/0x351a4A012Af3Ba719E1D87f67323B6c63752bC04
- ✅ **상태**: 배포 완료 및 운영 중

**KAUS Token V3 (준비 중)**
- 💎 **총 공급량**: 10,000,000,000 KAUS (100억 개)
- 🔒 **스테이킹 기능**: 4단계 락업 (30/90/180/365일), 연 10% 리워드
- 🗳️ **거버넌스**: 투표권 기반 의사결정
- 🔐 **Multi-sig 보안**: 권한 기반 민팅 통제
- 📦 **상태**: 배포 준비 완료

**주요 기능**
- ✅ NFT 인증서 발행 (상품 진품 증명)
- ✅ 토큰 스테이킹 및 리워드
- ✅ 거버넌스 제안 및 투표
- ✅ IPFS 메타데이터 저장
- ✅ 이메일 알림 시스템

---

## 📋 목차

1. [준비물](#1-준비물)
2. [환경 설정](#2-환경-설정)
3. [테스트넷 배포](#3-테스트넷-배포-무료)
4. [메인넷 배포](#4-메인넷-배포-실전)
5. [배포 후 확인](#5-배포-후-확인)
6. [거래소 상장](#6-거래소-상장-선택)
7. [문제 해결](#7-문제-해결)

---

## 1. 준비물

### A. MetaMask 지갑 만들기 (5분)

1. **설치**
   - Chrome 브라우저에서 [metamask.io](https://metamask.io) 접속
   - "Download" → "Install MetaMask for Chrome" 클릭
   - Chrome 확장 프로그램 설치

2. **지갑 생성**
   - "시작하기" 클릭
   - "지갑 만들기" 선택
   - 비밀번호 설정 (8자 이상)
   - **복구 문구 12단어를 종이에 반드시 적어서 안전한 곳에 보관**
   - ⚠️ 복구 문구를 잃어버리면 지갑을 영원히 잃습니다!

3. **지갑 주소 확인**
   - MetaMask를 열면 `0x...` 로 시작하는 주소 보임
   - 이것이 당신의 지갑 주소입니다

---

### B. 가스비(수수료) 준비

#### 테스트용 (무료)
테스트넷에서는 무료로 ETH를 받을 수 있습니다:

1. **Sepolia 네트워크로 전환**
   - MetaMask 상단 네트워크 클릭
   - "테스트 네트워크 표시" 활성화
   - "Sepolia 테스트 네트워크" 선택

2. **무료 ETH 받기**
   - [Sepolia Faucet](https://sepoliafaucet.com) 접속
   - 지갑 주소 입력
   - "Send Me ETH" 클릭
   - 5분 후 MetaMask에서 0.5 ETH 확인

#### 실전용 (유료)
실제 메인넷 배포시 필요:

- **필요 금액**: 약 0.05 ~ 0.1 ETH (약 20~40만원)
- **구매 방법**:
  1. 업비트 또는 빗썸에서 ETH 구매
  2. MetaMask 주소로 출금
  3. 10~30분 후 도착 확인

---

### C. Infura API 키 받기 (무료, 5분)

Infura는 이더리움 네트워크에 접속할 수 있게 해주는 서비스입니다.

1. [infura.io](https://infura.io) 접속
2. "Sign Up" 클릭 → 이메일로 회원가입
3. 로그인 후 "Create New Key" 클릭
4. Product: "Web3 API (Formerly Ethereum)" 선택
5. 이름 입력 (예: "KAUS Token")
6. "Create" 클릭
7. API Key 복사 (나중에 사용)

---

### D. 개인키 내보내기 (중요!)

⚠️ **경고: 개인키는 절대 타인과 공유하지 마세요!**

1. MetaMask 열기
2. 우측 상단 점 3개 클릭
3. "계정 세부정보" 클릭
4. "개인 키 내보내기" 클릭
5. MetaMask 비밀번호 입력
6. 나온 개인키 복사 (나중에 사용)

---

## 2. 환경 설정

### A. 프로젝트 다운로드

```bash
# Git 설치되어 있는 경우
git clone https://github.com/pcpc233-netizen/kaus-hybrid-development.git
cd kaus-hybrid-development

# 또는 ZIP 파일로 다운로드
# GitHub에서 Code → Download ZIP → 압축 해제 후 폴더로 이동
```

**이 프로젝트에는 이미 다음 스마트 컨트랙트가 포함되어 있습니다:**
- `contracts/KAUSToken.sol` - 기본 ERC20 토큰
- `contracts/KAUS_Token_V3.sol` - 스테이킹 + 거버넌스 기능
- `contracts/KAUS_NFT_V2.sol` - NFT 인증서 (Multi-sig 지원)

---

### B. Node.js 설치 확인

```bash
# 버전 확인
node --version
npm --version

# 설치 안 되어있으면 nodejs.org에서 다운로드
```

---

### C. 환경 변수 설정

1. **`.env` 파일 생성**

Windows:
```cmd
copy .env.example .env
```

Mac/Linux:
```bash
cp .env.example .env
```

2. **`.env` 파일 편집**

메모장이나 VS Code로 `.env` 파일을 열어서 다음 내용을 채웁니다:

```bash
# Infura에서 받은 API 키 입력
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/당신의_API_키

# MetaMask에서 내보낸 개인키 입력 (0x로 시작)
DEPLOYER_PRIVATE_KEY=당신의_개인키

# Base Sepolia 네트워크 (KAUS 프로젝트 사용 중)
VITE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Supabase 설정 (프론트엔드용)
VITE_SUPABASE_URL=당신의_supabase_url
VITE_SUPABASE_ANON_KEY=당신의_supabase_anon_key

# 선택사항: Etherscan API 키 (컨트랙트 검증용)
ETHERSCAN_API_KEY=

# 선택사항: IPFS (Pinata)
VITE_PINATA_JWT=당신의_pinata_jwt

# 선택사항: 이메일 (Resend)
RESEND_API_KEY=당신의_resend_api_key
```

**예시:**
```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/a1b2c3d4e5f6g7h8i9j0
DEPLOYER_PRIVATE_KEY=0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
VITE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

---

### D. 패키지 설치

```bash
npm install
```

이 명령어가 모든 필요한 라이브러리를 자동으로 설치합니다.

---

## 3. 테스트넷 배포 (무료)

⭐ **추천: 먼저 테스트넷에서 연습하세요!**

### 배포 실행

**옵션 1: 기본 토큰만 배포**
```bash
npx hardhat run scripts/deploy-kaus-token.cjs --network sepolia
```

**옵션 2: V3 토큰 + NFT 함께 배포 (추천)**
```bash
npx hardhat run scripts/deploy-v3.cjs --network sepolia
```

이 명령어는 다음을 배포합니다:
- KAUS Token V3 (스테이킹 + 거버넌스)
- KAUS NFT V2 (Multi-sig 보안)

### 예상 결과

**기본 토큰 배포:**
```
Deploying KAUS Token...
KAUS Token deployed to: 0x1234567890abcdef1234567890abcdef12345678
Total Supply: 10000000000 KAUS
Owner: 0xYourWalletAddress...
Deployment successful!
```

**V3 + NFT 배포:**
```
Deploying KAUS Token V3...
KAUS Token V3 deployed to: 0x1234...abcd
Total Supply: 10000000000 KAUS

Deploying KAUS NFT V2...
KAUS NFT V2 deployed to: 0x5678...efgh
Authorized minter added: 0xYourWalletAddress...

Deployment complete!
Save these addresses in your .env file.
```

### ✅ 배포된 주소 저장

나온 컨트랙트 주소(`0x1234...`)를 **반드시 메모**해두세요!

---

## 4. 메인넷 배포 (실전)

⚠️ **주의: 실제 돈이 들어갑니다! 테스트를 충분히 한 후에 진행하세요.**

### A. hardhat.config.cjs 수정

`hardhat.config.cjs` 파일을 열어서 mainnet 설정 추가:

```javascript
module.exports = {
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    },
    // 메인넷 설정 추가
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
  }
};
```

### B. .env 파일에 메인넷 RPC 추가

```bash
INFURA_API_KEY=당신의_API_키
MAINNET_RPC_URL=https://mainnet.infura.io/v3/당신의_API_키

# 또는 Base 메인넷 사용 (가스비 저렴)
BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

### C. 메인넷 배포 실행

```bash
npx hardhat run scripts/deploy-kaus-token.cjs --network mainnet
```

**예상 비용**: 약 0.03 ~ 0.08 ETH (20~40만원)

### D. 배포 완료

배포가 완료되면 컨트랙트 주소가 나옵니다. 이 주소를 **안전하게 보관**하세요!

---

## 5. 배포 후 확인

### A. Etherscan에서 확인

**테스트넷:**
1. [https://sepolia.etherscan.io](https://sepolia.etherscan.io) 접속
2. 검색창에 컨트랙트 주소 입력
3. 토큰 정보 확인

**메인넷:**
1. [https://etherscan.io](https://etherscan.io) 접속
2. 검색창에 컨트랙트 주소 입력
3. 토큰 정보 확인

확인할 내용:
- ✅ Token Name: KAUS Token
- ✅ Symbol: KAUS
- ✅ Total Supply: 10,000,000,000 KAUS
- ✅ Owner: 당신의 지갑 주소

---

### B. MetaMask에 토큰 추가

1. MetaMask 열기
2. "토큰 가져오기" 클릭
3. "사용자 정의 토큰" 탭
4. **토큰 컨트랙트 주소** 입력 (배포된 주소)
5. 토큰 기호(KAUS)와 소수점(18)이 자동으로 채워짐
6. "사용자 정의 토큰 추가" 클릭

이제 MetaMask에서 **100억 KAUS** 토큰을 볼 수 있습니다!

---

### C. 토큰 전송 테스트

```javascript
// 다른 지갑으로 테스트 전송
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x배포된_컨트랙트_주소";
  const KAUSToken = await ethers.getContractAt("KAUSToken", contractAddress);

  // 100 KAUS 전송
  const tx = await KAUSToken.transfer(
    "0x받는사람_지갑주소",
    ethers.parseEther("100")
  );

  await tx.wait();
  console.log("Transfer successful!");
}

main();
```

---

## 6. 거래소 상장 (선택)

### A. 탈중앙화 거래소 (DEX) - 쉬움

#### Uniswap 상장

1. [app.uniswap.org](https://app.uniswap.org) 접속
2. MetaMask 연결
3. "Create Pool" 클릭
4. KAUS 토큰 주소 입력
5. ETH와 페어링
6. 유동성 공급 (예: 1,000,000 KAUS + 10 ETH)
7. 완료!

**비용**: 가스비만 (약 10~30만원)

#### PancakeSwap (BSC 네트워크)

1. 먼저 BSC 네트워크에 토큰 배포 필요
2. [pancakeswap.finance](https://pancakeswap.finance) 접속
3. 유동성 풀 생성

---

### B. 중앙화 거래소 (CEX) - 어려움

#### 소형 거래소
- Gate.io
- MEXC
- Bitget

**절차:**
1. 거래소 상장 신청서 작성
2. 토큰 정보 제출
3. 상장 수수료 지불 (수백만원~수천만원)
4. 심사 대기 (1~3개월)

#### 대형 거래소
- 업비트
- 빗썸
- 바이낸스

**절차:**
1. 법률 검토 필수
2. 상장 신청서 제출
3. 철저한 심사 (프로젝트 가치, 법적 문제 등)
4. 상장 수수료 (수천만원~수억원)
5. 심사 대기 (3~12개월)

**필요 서류:**
- 사업자등록증
- 법률 검토 의견서
- 백서 (Whitepaper)
- 프로젝트 로드맵
- 팀 소개
- 감사 보고서

---

## 7. 문제 해결

### 자주 발생하는 오류

#### 1. "insufficient funds for gas"
**원인**: 지갑에 ETH 부족
**해결**: MetaMask에 ETH 추가

#### 2. "nonce too low"
**원인**: 트랜잭션 순서 문제
**해결**:
```bash
# hardhat 캐시 삭제
npx hardhat clean
```

#### 3. "invalid private key"
**원인**: .env 파일의 개인키 형식 오류
**해결**: 개인키가 `0x`로 시작하는지 확인

#### 4. "network timeout"
**원인**: Infura API 키 문제 또는 네트워크 지연
**해결**:
- Infura 대시보드에서 API 키 확인
- 몇 분 후 다시 시도

#### 5. "contract already deployed"
**원인**: 같은 주소로 재배포 시도
**해결**: 정상입니다. 이미 배포된 주소 사용

---

### 가스비 절약 팁

1. **가스비 낮을 때 배포**
   - [Etherscan Gas Tracker](https://etherscan.io/gastracker) 확인
   - 주말이나 새벽 시간대 추천

2. **가스 리미트 수동 설정**
```javascript
const tx = await contract.deploy({
  gasLimit: 3000000,
  gasPrice: ethers.parseUnits('20', 'gwei')
});
```

---

## 💰 비용 요약

| 항목 | 테스트넷 | 메인넷 |
|------|----------|--------|
| 지갑 생성 | 무료 | 무료 |
| Infura API | 무료 | 무료 |
| 가스비 (배포) | 무료 | 20~40만원 |
| Uniswap 상장 | - | 10~30만원 |
| 소형 거래소 상장 | - | 500만원~5천만원 |
| 대형 거래소 상장 | - | 5천만원~수억원 |

---

## 🎯 추천 로드맵

### Phase 1: 테스트 (1주)
1. Sepolia 테스트넷 배포
2. 기능 테스트
3. 버그 수정

### Phase 2: 메인넷 배포 (1일)
1. 충분한 ETH 준비
2. 메인넷 배포
3. Etherscan 확인

### Phase 3: DEX 상장 (1주)
1. Uniswap 풀 생성
2. 초기 유동성 공급
3. 커뮤니티 공지

### Phase 4: CEX 상장 (3~12개월)
1. 법률 검토
2. 백서 작성
3. 거래소 신청
4. 심사 대기

---

## 📚 추가 자료

- [Hardhat 공식 문서](https://hardhat.org/docs)
- [OpenZeppelin 계약 가이드](https://docs.openzeppelin.com/contracts)
- [Etherscan API 문서](https://docs.etherscan.io)
- [MetaMask 사용 가이드](https://metamask.io/faqs)

---

## 🆘 도움이 필요하신가요?

문제가 발생하면:

1. **GitHub Issues**: 이 저장소의 Issues 탭에서 질문
2. **Hardhat Discord**: [discord.gg/hardhat](https://discord.gg/hardhat)
3. **Ethereum Stack Exchange**: [ethereum.stackexchange.com](https://ethereum.stackexchange.com)

---

## ⚖️ 법적 고지

- 토큰 발행 전 해당 국가의 법률을 반드시 확인하세요
- 증권형 토큰의 경우 금융 당국 신고가 필요할 수 있습니다
- 투자 권유가 아니며, 모든 책임은 본인에게 있습니다

---

**마지막 업데이트**: 2025년 11월 11일
**작성자**: KAUS Project Team
