# K-AUS 블록체인 설정 가이드

이 가이드는 K-AUS 시스템을 실제 블록체인(Sepolia 테스트넷)과 연동하는 방법을 안내합니다.

## 📌 현재 상태

- ✅ 스마트 컨트랙트 작성 완료 (`contracts/KAUS_NFT.sol`)
- ✅ 배포 스크립트 작성 완료 (`scripts/deploy.js`)
- ✅ 블록체인 서비스 구현 완료 (`src/services/blockchain.ts`)
- ✅ Job Queue 연동 완료 (더미/실제 자동 전환)

**환경변수가 설정되지 않으면 자동으로 더미 데이터를 사용합니다.**

---

## 🚀 Step 1: 준비사항

### 1-1. Alchemy 계정 생성 (무료)

1. [Alchemy](https://www.alchemy.com/) 접속
2. 계정 생성 후 로그인
3. "Create App" 클릭
4. 설정:
   - Chain: Ethereum
   - Network: Sepolia
   - Name: KAUS-NFT
5. "API Key" 확인 (나중에 사용)

### 1-2. MetaMask 지갑 설치

1. [MetaMask](https://metamask.io/) 설치
2. 지갑 생성
3. 네트워크를 "Sepolia Test Network"로 전환
4. Private Key 내보내기 (Settings → Advanced → Export Private Key)
   - ⚠️ 절대 공유하지 말 것!

### 1-3. Sepolia 테스트 ETH 받기

테스트 ETH는 무료로 받을 수 있습니다 (최소 0.5 ETH 권장):

1. [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
2. [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
3. [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

지갑 주소를 입력하고 요청하면 몇 분 내에 받을 수 있습니다.

### 1-4. Etherscan API Key (선택)

컨트랙트 자동 검증을 위해 (선택사항):

1. [Etherscan](https://etherscan.io/) 계정 생성
2. API Keys 메뉴에서 API Key 생성

---

## ⚙️ Step 2: 환경변수 설정

### 2-1. `.env` 파일 생성

프로젝트 루트에 `.env` 파일을 만들고 다음 내용을 입력하세요:

```bash
# Supabase (이미 설정되어 있음)
VITE_SUPABASE_URL=your_existing_supabase_url
VITE_SUPABASE_ANON_KEY=your_existing_supabase_key

# Blockchain Configuration
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
VITE_BLOCKCHAIN_ADMIN_PRIVATE_KEY=your_metamask_private_key_here
VITE_KAUS_NFT_CONTRACT_ADDRESS=

# Hardhat Deployment
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
DEPLOYER_PRIVATE_KEY=your_metamask_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**입력 예시:**
```bash
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/abc123def456
VITE_BLOCKCHAIN_ADMIN_PRIVATE_KEY=0x1234567890abcdef...
```

⚠️ **보안 주의사항:**
- Private Key는 절대 GitHub에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 이미 포함되어 있습니다
- 테스트넷용 지갑을 별도로 만들어 사용하는 것을 권장합니다

---

## 🔨 Step 3: 스마트 컨트랙트 배포

### 3-1. 컨트랙트 컴파일

```bash
npx hardhat compile
```

성공하면 `artifacts/` 폴더에 컴파일된 파일이 생성됩니다.

### 3-2. Sepolia 테스트넷에 배포

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**예상 출력:**
```
🚀 Starting KAUS NFT deployment...
📝 Deploying contracts with account: 0x1234...
💰 Account balance: 0.5 ETH
⏳ Deploying KAUS_NFT contract...
✅ KAUS_NFT deployed to: 0xAbCdEf1234567890...

🔧 Add this to your .env file:
VITE_KAUS_NFT_CONTRACT_ADDRESS=0xAbCdEf1234567890...
```

### 3-3. `.env` 파일 업데이트

배포된 컨트랙트 주소를 `.env` 파일에 추가하세요:

```bash
VITE_KAUS_NFT_CONTRACT_ADDRESS=0xAbCdEf1234567890...
```

### 3-4. 배포 확인

Sepolia Etherscan에서 컨트랙트 확인:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

---

## ✅ Step 4: 테스트 NFT 발급

### 4-1. 테스트 민팅 스크립트 실행

```bash
npx hardhat run scripts/test-mint.js --network sepolia
```

**예상 출력:**
```
🔑 Using account: 0x1234...
📝 Connected to KAUS_NFT at: 0xAbCd...
🎨 Minting test NFT...
⏳ Transaction submitted: 0x5678...
✅ Transaction confirmed in block: 1234567

🎉 NFT Minted Successfully!
Token ID: 1
📋 Authentication Details:
Product ID: prod_test_001
Order ID: order_test_001
Brand: CHANEL
Product Name: Classic Flap Bag
```

### 4-2. Etherscan에서 확인

트랜잭션 링크를 열어 블록체인에서 확인:
```
https://sepolia.etherscan.io/tx/YOUR_TX_HASH
```

---

## 🎯 Step 5: 프론트엔드 재시작

환경변수를 추가했으므로 개발 서버를 재시작하세요:

```bash
# 현재 실행 중인 서버 중지 (Ctrl+C)
npm run dev
```

이제 Job Queue Worker가 다음과 같이 표시됩니다:
```
🚀 Job Queue Worker started (⛓️ BLOCKCHAIN MODE, interval: 10000ms)
```

---

## 📊 Step 6: 실제 플로우 테스트

### 6-1. 회원가입 테스트

1. `/signup` 페이지에서 회원가입
2. 콘솔에서 다음 로그 확인:
   ```
   🔐 Creating real blockchain wallet...
   ✅ Real wallet created: 0x9876...
   ```
3. 마이페이지에서 실제 지갑 주소 확인

### 6-2. 구매 및 NFT 발급 테스트

1. `/products` 페이지에서 상품 선택
2. 구매 진행
3. 콘솔에서 다음 로그 확인:
   ```
   🎨 Minting real NFT on blockchain...
   ⏳ Transaction submitted: 0x1234...
   ✅ Transaction confirmed in block: 7890123
   ✅ Real NFT minted: 1 Tx: 0x1234...
   ```
4. `/my-nfts` 페이지에서 NFT 확인
5. "블록체인에서 확인" 버튼 클릭하여 Etherscan에서 확인

---

## 🎬 데모 시나리오

### 완전한 PoC 데모 플로우:

1. **회원가입** (20초)
   - 계정 생성
   - 백그라운드에서 실제 지갑 생성
   - Sepolia 네트워크에 트랜잭션 발생

2. **상품 구매** (30초)
   - 명품 선택 및 구매
   - 백그라운드에서 실제 NFT 발급
   - Sepolia 네트워크에 NFT 민팅 트랜잭션 발생

3. **NFT 확인** (즉시)
   - 마이페이지에서 NFT 목록 조회
   - 실제 트랜잭션 해시 및 블록 번호 표시
   - Etherscan 링크로 블록체인 검증

---

## 🔧 트러블슈팅

### 문제 1: "Insufficient funds" 에러

**원인:** 지갑에 ETH가 부족합니다.

**해결:**
- Sepolia Faucet에서 더 많은 테스트 ETH 받기
- 최소 0.5 ETH 권장 (NFT 발급당 약 0.01 ETH 소요)

### 문제 2: "Network connection error"

**원인:** RPC URL이 잘못되었거나 네트워크 문제입니다.

**해결:**
- `.env` 파일의 `VITE_SEPOLIA_RPC_URL` 확인
- Alchemy Dashboard에서 API Key가 활성화되었는지 확인
- 네트워크 연결 상태 확인

### 문제 3: 컨트랙트 배포 실패

**원인:** Gas 부족 또는 네트워크 문제입니다.

**해결:**
```bash
# 네트워크 연결 테스트
npx hardhat run scripts/deploy.js --network sepolia --verbose

# 지갑 잔액 확인
npx hardhat console --network sepolia
> (await ethers.provider.getBalance(YOUR_ADDRESS))
```

### 문제 4: Job이 FAILED 상태로 변경됨

**원인:** 블록체인 연결 실패 또는 설정 오류입니다.

**해결:**
1. 브라우저 콘솔에서 에러 메시지 확인
2. 마이페이지에서 Job 상세 에러 확인
3. 환경변수 재확인:
   - RPC URL이 올바른지
   - Private Key가 올바른지
   - Contract Address가 올바른지

---

## 💰 비용 정보

### Sepolia 테스트넷 (현재 설정)
- **비용: 무료**
- 테스트 ETH는 Faucet에서 무료로 받을 수 있음
- NFT 발급당 약 0.01 테스트 ETH 소요

### Ethereum 메인넷 (프로덕션)
- 컨트랙트 배포: 약 $50-200
- NFT 발급당: 약 $5-20 (Gas 비용에 따라 변동)

### Layer 2 솔루션 (대안)
- **Polygon**: 메인넷 대비 1/10 수준 비용
- **Arbitrum**: 메인넷 대비 1/10 수준 비용
- **Optimism**: 메인넷 대비 1/10 수준 비용

---

## 📚 다음 단계

### Week 2: 최적화 및 테스트
- [ ] Gas 비용 최적화
- [ ] 에러 핸들링 강화
- [ ] 메타데이터 서버 구축 (IPFS 또는 S3)
- [ ] 대량 민팅 테스트

### Week 3: 메인넷 준비
- [ ] 보안 감사
- [ ] 메인넷 배포 계획 수립
- [ ] Layer 2 솔루션 검토
- [ ] 운영 비용 산정

---

## 🆘 도움이 필요하신가요?

### 유용한 리소스
- [Hardhat 공식 문서](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethers.js 문서](https://docs.ethers.org/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Alchemy 문서](https://docs.alchemy.com/)

### 체크리스트

#### 배포 전:
- [ ] Alchemy 계정 생성 완료
- [ ] MetaMask 지갑 생성 완료
- [ ] Sepolia 테스트 ETH 받기 완료
- [ ] `.env` 파일 설정 완료

#### 배포 후:
- [ ] 스마트 컨트랙트 컴파일 성공
- [ ] Sepolia에 배포 성공
- [ ] Etherscan에서 컨트랙트 확인
- [ ] 테스트 NFT 발급 성공
- [ ] 프론트엔드 연동 확인

---

**축하합니다! 🎉**

이제 K-AUS 시스템이 실제 블록체인과 연동되어 진짜 NFT를 발급할 수 있습니다!
