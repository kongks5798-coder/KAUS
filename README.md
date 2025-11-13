# K-AUS (Korean Authentication System)

블록체인 기반 명품 패션 정품 인증 시스템

## 프로젝트 개요

K-AUS는 명품 구매 시 자동으로 블록체인 NFT 정품 인증서를 발급하여 위조 방지 및 소유권 증명을 제공하는 시스템입니다.

## 주요 기능

### ✅ 완성된 기능 (PoC)

1. **회원가입 & 로그인**
   - Supabase Auth 기반 인증
   - 회원가입 시 자동으로 블록체인 지갑 생성 Job Queue 추가

2. **상품 관리**
   - 명품 패션 상품 목록 조회
   - 상품 상세 정보 확인
   - 5개의 샘플 명품 데이터 포함 (CHANEL, HERMES, LOUIS VUITTON, GUCCI, DIOR)

3. **구매 기능**
   - 상품 구매 처리
   - 구매 시 자동으로 NFT 발급 Job Queue 추가
   - 주문 내역 조회

4. **Job Queue 시스템** (PoC 핵심 #6)
   - 백그라운드에서 블록체인 작업 자동 처리
   - 지갑 생성 작업 (CREATE_WALLET)
   - NFT 발급 작업 (MINT_NFT)
   - 10초 간격으로 자동 실행
   - 실패 시 자동 재시도 (최대 3회)

5. **블록체인 미러링** (PoC 핵심 #7)
   - 블록체인 데이터를 로컬 DB에 복사 저장
   - NFT 정보를 빠르게 조회 가능
   - 트랜잭션 해시, 블록 번호, 소유자 주소 등 저장

6. **NFT 인증서 조회**
   - 내가 보유한 NFT 정품 인증서 목록
   - NFT 상세 정보 확인
   - 블록체인 탐색기 링크 제공

7. **마이페이지**
   - 사용자 정보 조회
   - 블록체인 지갑 주소 확인
   - Job 처리 내역 모니터링

## 기술 스택

### 프론트엔드
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Lucide React (아이콘)

### 백엔드
- Supabase (PostgreSQL + Auth + Row Level Security)

### 블록체인
- Ethereum (Sepolia Testnet / Base Network)
- Solidity 0.8.20
- Hardhat (개발 프레임워크)
- OpenZeppelin Contracts v5.4.0
- Ethers.js v6
- **KAUS Token (ERC-20)** - 생태계 기축통화 (100억 발행)
- **KAUS_NFT (ERC-721)** - 정품 인증 NFT
- **KAUS_Token_V3 (ERC-20)** - Staking & Governance

## 프로젝트 구조

```
├── contracts/                  # 스마트 컨트랙트
│   ├── KAUSToken.sol          # 🪙 KAUS Token (기축통화, 100억)
│   ├── KAUS_Token_V3.sol      # KAUS Token V3 (Staking)
│   ├── KAUS_NFT_V2.sol        # NFT V2 (SBT 기능)
│   └── KAUS_NFT.sol           # 정품 인증 NFT
├── scripts/                    # 배포 스크립트
│   ├── deploy-kaus-token.cjs  # 🪙 KAUS Token 배포
│   ├── deploy-v3.cjs          # V3 통합 배포
│   ├── deploy.cjs             # 레거시 배포
│   └── test-mint.cjs          # 테스트 민팅
├── src/
│   ├── components/          # UI 컴포넌트
│   │   └── Navbar.tsx      # 네비게이션 바
│   ├── contexts/           # React Context
│   │   └── AuthContext.tsx # 인증 상태 관리
│   ├── lib/                # 외부 라이브러리 설정
│   │   └── supabase.ts     # Supabase 클라이언트
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── NFTsPage.tsx
│   │   └── MyPage.tsx
│   ├── services/           # 비즈니스 로직
│   │   ├── auth.ts         # 인증 서비스
│   │   ├── blockchain.ts   # 블록체인 연동 서비스
│   │   ├── products.ts     # 상품 서비스
│   │   ├── orders.ts       # 주문 서비스
│   │   ├── nfts.ts         # NFT 서비스
│   │   └── jobQueue.ts     # Job Queue 워커 (더미/실제 자동 전환)
│   └── types/              # TypeScript 타입
│       └── index.ts
└── hardhat.config.js   # Hardhat 설정
```

## 데이터베이스 스키마

### customers (고객)
- 기본 정보 및 블록체인 지갑 주소

### products (상품)
- 명품 상품 정보 (브랜드, 가격, 이미지 등)

### orders (주문)
- 구매 주문 정보 및 상태

### blockchain_jobs (블록체인 작업 큐)
- 백그라운드 처리할 작업 목록
- Job 타입: CREATE_WALLET, MINT_NFT
- 상태: PENDING, PROCESSING, COMPLETED, FAILED

### blockchain_mirror (블록체인 미러링)
- 발급된 NFT 정보를 로컬에 복사
- 트랜잭션 해시, 블록 번호, 소유자 등

## 개발 서버 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## PoC 데모 시나리오

### 1단계: 회원가입
1. `/signup` 페이지 접속
2. 이메일, 이름, 비밀번호 입력
3. 회원가입 완료
4. 백그라운드에서 블록체인 지갑 생성 Job 추가됨
5. 10초 이내에 지갑 자동 생성 완료

### 2단계: 상품 구매
1. `/products` 페이지에서 명품 선택
2. 상품 상세 페이지에서 구매하기
3. 배송지 입력 후 구매 확정
4. 백그라운드에서 NFT 발급 Job 추가됨
5. 20초 이내에 NFT 자동 발급 완료

### 3단계: NFT 인증서 확인
1. `/my-nfts` 페이지 접속
2. 발급된 NFT 정품 인증서 확인
3. NFT ID, 트랜잭션 해시, 블록 번호 등 조회
4. 블록체인 탐색기 링크 클릭 가능

### 4단계: 마이페이지 모니터링
1. `/my-page` 페이지 접속
2. 생성된 블록체인 지갑 주소 확인
3. Job 처리 내역 확인 (COMPLETED 상태)

## 🚀 블록체인 연동 (실제 NFT 발급)

### 현재 상태: 하이브리드 모드

시스템은 환경변수 설정 여부에 따라 자동으로 전환됩니다:

- **환경변수 미설정**: 더미 데이터로 데모 동작 (현재 상태)
- **환경변수 설정**: 실제 블록체인(Sepolia)에서 NFT 발급

### 실제 블록체인 연동 방법

상세한 가이드는 **[BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md)** 문서를 참고하세요.

**간단 요약:**

1. Alchemy 계정 생성 및 Sepolia RPC URL 받기
2. MetaMask에서 테스트 지갑 생성
3. Sepolia Faucet에서 테스트 ETH 받기 (무료)
4. `.env` 파일에 환경변수 설정
5. 스마트 컨트랙트 배포: `npx hardhat run scripts/deploy.js --network sepolia`
6. 프론트엔드 재시작

**배포 후 자동으로 실제 NFT가 발급됩니다!**

## 보안

- Row Level Security (RLS) 적용
- 사용자는 자신의 데이터만 접근 가능
- JWT 토큰 기반 인증
- SQL Injection 방지 (Supabase ORM 사용)

## 📚 상세 문서

### 시스템 아키텍처
- **[system_architecture_v1.md](./system_architecture_v1.md)** - 전체 시스템 아키텍처 및 설계 문서
- **[BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md)** - 블록체인 연동 가이드 (Sepolia 테스트넷)

### 🪙 KAUS Token (신규)
- **[CEO_KAUS_TOKEN_SUMMARY.md](./CEO_KAUS_TOKEN_SUMMARY.md)** - ⭐ CEO 요약 보고서 (30초 브리핑)
- **[KAUS_TOKEN_DEPLOYMENT_GUIDE.md](./KAUS_TOKEN_DEPLOYMENT_GUIDE.md)** - 상세 배포 가이드

### 환경 설정
- **[.env.example](./.env.example)** - 환경변수 설정 예시

## 🎓 스마트 컨트랙트

### 🪙 KAUSToken.sol (신규 - 기축통화)

**토큰 이코노미:**
- 초기 발행: 100억 KAUS
- 최대 공급: 500억 KAUS
- 민팅 규칙: 30일 간격, 최대 5%

**주요 기능:**
- `mintByGovernance()`: DAO 승인 토큰 발행
- `mintStakingReward()`: 스테이킹 보상 발행
- `burnWithReason()`: 투명한 소각
- `grantGovernanceRole()`: 거버넌스 멤버 추가

**배포:**
```bash
npx hardhat run scripts/deploy-kaus-token.cjs --network baseSepolia
```

### KAUS_NFT.sol (정품 인증)

**주요 기능:**
- `mintNFT()`: NFT 정품 인증서 발급
- `getAuthentication()`: 인증 정보 조회
- `revokeAuthentication()`: 인증 취소 (관리자)
- `isAuthenticationValid()`: 유효성 확인

### 컨트랙트 배포 명령어

```bash
# 컴파일
npx hardhat compile

# KAUS Token 배포 (Base Sepolia)
npx hardhat run scripts/deploy-kaus-token.cjs --network baseSepolia

# V3 통합 배포 (Token + NFT)
npx hardhat run scripts/deploy-v3.cjs --network baseSepolia

# 레거시 NFT 배포
npx hardhat run scripts/deploy.cjs --network sepolia
```

## 개발자

- Track 1 (블록체인): 보스(CEO), 카이로스(COO)
- Track 2 (백엔드/프론트): 규민 이사(PM)
