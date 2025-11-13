# K-AUS 시스템 아키텍처 v1.0

## 1. 프로젝트 개요

### 1.1 프로젝트 명
**K-AUS (Korean Authentication System)** - 패션 명품 블록체인 정품 인증 시스템

### 1.2 목표
명품 패션 상품 구매 시 블록체인 기반 NFT 정품 인증서를 자동으로 발급하여, 위조 방지 및 소유권 증명을 제공하는 시스템 구축

### 1.3 핵심 가치
- **위조 방지**: 블록체인의 불변성을 활용한 정품 인증
- **소유권 증명**: NFT를 통한 명확한 소유권 기록
- **투명성**: 모든 거래 내역의 블록체인 기록
- **편의성**: 자동화된 인증서 발급 프로세스

---

## 2. 사용자 유형

### 2.1 일반 고객 (Customer)
- 패션몰에서 명품 구매
- 회원가입 및 로그인
- 구매 내역 조회
- 보유한 NFT 정품 인증서 조회

### 2.2 관리자 (Admin)
- 상품 관리
- 주문 현황 모니터링
- 블록체인 작업 상태 모니터링
- 고객 관리

---

## 3. 기술 스택

### 3.1 프론트엔드
- **React 18** - UI 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Lucide React** - 아이콘
- **React Router** - 페이지 라우팅

### 3.2 백엔드
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL 데이터베이스
  - 인증 시스템
  - Row Level Security
  - Real-time subscriptions

### 3.3 블록체인 (Track 1 - 완료됨)
- **Ethereum** - 블록체인 플랫폼
- **Solidity** - 스마트 컨트랙트 언어
- **KAUS_Token.sol** - ERC-20 토큰
- **KAUS_NFT.sol** - ERC-721 NFT 정품 인증서

---

## 4. [PoC] 핵심 사용자 흐름

### 4.1 회원가입 흐름
1. 고객이 회원가입 폼 작성 (이메일, 비밀번호, 이름, 전화번호)
2. 프론트엔드에서 Supabase Auth API 호출
3. Supabase Auth에 사용자 생성
4. `customers` 테이블에 추가 정보 저장
5. `blockchain_jobs` 테이블에 지갑 생성 작업 추가 (상태: PENDING)
6. **[PoC #6] Job Queue 생성 완료**
7. 백그라운드 워커가 주기적으로 PENDING 작업 확인
8. 지갑 생성 작업 처리 (현재는 더미, 추후 Track 1 연동)
9. **[PoC #7] 내부 DB 미러링** - 생성된 지갑 주소를 `customers` 테이블에 저장
10. 작업 상태를 COMPLETED로 변경

### 4.2 상품 조회 흐름
1. 고객이 상품 목록 페이지 접속
2. 프론트엔드에서 `products` 테이블 조회 API 호출
3. 상품 카드 형태로 리스트 표시
4. 상품 클릭 시 상세 페이지 이동
5. 상품 이미지, 설명, 가격, 브랜드 정보 표시

### 4.3 구매 흐름
1. 로그인한 고객이 상품 상세 페이지에서 "구매하기" 클릭
2. 구매 확인 모달 표시
3. 확인 시 주문 생성 API 호출
4. `orders` 테이블에 주문 정보 저장
5. `blockchain_jobs` 테이블에 NFT 발급 작업 추가 (상태: PENDING)
6. **[PoC #6] Job Queue 생성 완료**
7. 고객에게 "구매 완료, NFT 발급 중" 메시지 표시
8. 백그라운드 워커가 NFT 발급 작업 처리 (현재는 더미, 추후 Track 1 연동)
9. **[PoC #7] 내부 DB 미러링** - 발급된 NFT 정보를 `blockchain_mirror` 테이블에 저장
   - NFT ID
   - 트랜잭션 해시
   - 블록 번호
   - 소유자 주소
   - 연결된 주문 ID
10. 작업 상태를 COMPLETED로 변경
11. 고객이 마이페이지에서 발급된 NFT 확인 가능

### 4.4 NFT 조회 흐름
1. 고객이 마이페이지의 "내 정품 인증서" 섹션 접속
2. `blockchain_mirror` 테이블에서 고객의 NFT 목록 조회
3. 연결된 `orders` 및 `products` 정보 함께 조회 (JOIN)
4. NFT 카드 형태로 리스트 표시
   - 상품 이미지
   - 상품 이름
   - NFT ID
   - 발급일
5. NFT 클릭 시 상세 정보 표시
   - 블록체인 트랜잭션 해시
   - 블록 번호
   - Etherscan 링크

---

## 5. 데이터베이스 ERD (Entity Relationship Diagram)

### 5.1 테이블 목록

#### customers (고객)
- `id` (uuid, PK) - Supabase Auth user ID와 동일
- `email` (text, unique, not null)
- `name` (text, not null)
- `phone` (text)
- `wallet_address` (text) - 블록체인 지갑 주소 (나중에 저장)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### products (상품)
- `id` (uuid, PK)
- `name` (text, not null)
- `brand` (text, not null)
- `price` (numeric, not null)
- `description` (text)
- `image_url` (text)
- `requires_nft` (boolean, default: true) - 정품 인증 필요 여부
- `stock` (integer, default: 0)
- `created_at` (timestamp)

#### orders (주문)
- `id` (uuid, PK)
- `customer_id` (uuid, FK -> customers.id)
- `product_id` (uuid, FK -> products.id)
- `status` (text) - 'pending', 'completed', 'cancelled'
- `total_price` (numeric, not null)
- `shipping_address` (text)
- `created_at` (timestamp)
- `completed_at` (timestamp)

#### blockchain_jobs (블록체인 작업 큐)
- `id` (uuid, PK)
- `job_type` (text, not null) - 'CREATE_WALLET', 'MINT_NFT'
- `status` (text, not null) - 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
- `customer_id` (uuid, FK -> customers.id)
- `order_id` (uuid, FK -> orders.id, nullable) - NFT 발급 시에만
- `retry_count` (integer, default: 0)
- `error_message` (text, nullable)
- `result_data` (jsonb, nullable) - 처리 결과 저장
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `completed_at` (timestamp, nullable)

#### blockchain_mirror (블록체인 데이터 미러)
- `id` (uuid, PK)
- `nft_id` (text, not null, unique) - 블록체인의 NFT ID
- `transaction_hash` (text, not null) - 트랜잭션 해시
- `block_number` (bigint, not null) - 블록 번호
- `owner_address` (text, not null) - 소유자 지갑 주소
- `customer_id` (uuid, FK -> customers.id)
- `order_id` (uuid, FK -> orders.id)
- `product_id` (uuid, FK -> products.id)
- `metadata_uri` (text) - NFT 메타데이터 URI
- `minted_at` (timestamp, not null)
- `created_at` (timestamp)

### 5.2 테이블 관계
- `orders.customer_id` -> `customers.id` (Many-to-One)
- `orders.product_id` -> `products.id` (Many-to-One)
- `blockchain_jobs.customer_id` -> `customers.id` (Many-to-One)
- `blockchain_jobs.order_id` -> `orders.id` (One-to-One, nullable)
- `blockchain_mirror.customer_id` -> `customers.id` (Many-to-One)
- `blockchain_mirror.order_id` -> `orders.id` (One-to-One)
- `blockchain_mirror.product_id` -> `products.id` (Many-to-One)

---

## 6. API 엔드포인트 (Supabase Functions)

### 6.1 인증 API
- `supabase.auth.signUp()` - 회원가입
- `supabase.auth.signInWithPassword()` - 로그인
- `supabase.auth.signOut()` - 로그아웃
- `supabase.auth.getSession()` - 현재 세션 조회

### 6.2 고객 API
- `GET /customers/me` - 내 정보 조회
- `PUT /customers/me` - 내 정보 수정

### 6.3 상품 API
- `GET /products` - 상품 목록 조회
- `GET /products/:id` - 상품 상세 조회

### 6.4 주문 API
- `POST /orders` - 주문 생성
- `GET /orders` - 내 주문 목록 조회
- `GET /orders/:id` - 주문 상세 조회

### 6.5 NFT API
- `GET /nfts` - 내 NFT 목록 조회
- `GET /nfts/:id` - NFT 상세 조회

### 6.6 Job Queue API (내부 사용)
- `POST /jobs` - 작업 생성
- `GET /jobs/pending` - 대기 중인 작업 조회
- `PUT /jobs/:id` - 작업 상태 업데이트

---

## 7. 보안 요구사항

### 7.1 인증
- Supabase Auth 기반 JWT 토큰 인증
- 모든 API 요청에 Authorization 헤더 필요

### 7.2 Row Level Security (RLS)
- 고객은 자신의 데이터만 조회/수정 가능
- 관리자는 모든 데이터 접근 가능
- 상품은 모든 사용자가 조회 가능

### 7.3 데이터 검증
- 이메일 형식 검증
- 비밀번호 강도 검증 (최소 8자, 영문+숫자)
- 전화번호 형식 검증
- SQL Injection 방지 (Supabase ORM 사용)

---

## 8. Job Queue 처리 로직

### 8.1 워커 동작 방식
- 주기적으로 (예: 10초마다) `blockchain_jobs` 테이블 확인
- `status = 'PENDING'` 인 작업을 가져옴
- 작업 타입에 따라 적절한 핸들러 실행
- 성공 시 `status = 'COMPLETED'` 로 변경
- 실패 시 `retry_count` 증가, 3회 초과 시 `status = 'FAILED'`

### 8.2 CREATE_WALLET 핸들러
- 현재: 더미 지갑 주소 생성 (랜덤 16진수)
- 추후: Track 1 스마트 컨트랙트 연동
- 생성된 지갑 주소를 `customers.wallet_address`에 저장

### 8.3 MINT_NFT 핸들러
- 현재: 더미 NFT ID 및 트랜잭션 해시 생성
- 추후: Track 1 `KAUS_NFT.sol` 컨트랙트 `mint()` 함수 호출
- 발급된 NFT 정보를 `blockchain_mirror` 테이블에 저장
- 관련 주문 상태를 'completed'로 변경

---

## 9. Track 1 연동 준비사항

### 9.1 필요한 환경변수
- `BLOCKCHAIN_RPC_URL` - Ethereum RPC 엔드포인트
- `KAUS_TOKEN_ADDRESS` - KAUS 토큰 컨트랙트 주소
- `KAUS_NFT_ADDRESS` - KAUS NFT 컨트랙트 주소
- `ADMIN_PRIVATE_KEY` - NFT 발급 권한이 있는 지갑의 Private Key

### 9.2 연동 인터페이스
```typescript
interface BlockchainService {
  createWallet(): Promise<{ address: string; privateKey: string }>;
  mintNFT(params: {
    to: string;
    productId: string;
    orderId: string;
  }): Promise<{ nftId: string; transactionHash: string; blockNumber: number }>;
}
```

### 9.3 연동 시점
- PoC 프로토타입 완성 후
- 카이로스 COO와 협업하여 진행
- Job 핸들러 내부의 더미 로직을 실제 블록체인 호출로 교체

---

## 10. 프로젝트 폴더 구조

```
/src
  /api
    /auth.ts          - 인증 관련 API
    /customers.ts     - 고객 API
    /products.ts      - 상품 API
    /orders.ts        - 주문 API
    /nfts.ts          - NFT API
    /jobs.ts          - Job Queue API
  /components
    /auth
      /LoginForm.tsx
      /SignupForm.tsx
    /products
      /ProductCard.tsx
      /ProductList.tsx
      /ProductDetail.tsx
    /orders
      /OrderCard.tsx
      /OrderList.tsx
    /nfts
      /NFTCard.tsx
      /NFTList.tsx
    /common
      /Button.tsx
      /Input.tsx
      /Modal.tsx
      /Loading.tsx
      /Navbar.tsx
  /pages
    /HomePage.tsx
    /LoginPage.tsx
    /SignupPage.tsx
    /ProductsPage.tsx
    /ProductDetailPage.tsx
    /MyPage.tsx
    /OrdersPage.tsx
    /NFTsPage.tsx
  /services
    /supabase.ts      - Supabase 클라이언트 초기화
    /jobQueue.ts      - Job Queue 워커
    /blockchain.ts    - 블록체인 연동 (추후)
  /types
    /customer.ts
    /product.ts
    /order.ts
    /job.ts
    /nft.ts
  /utils
    /validation.ts    - 입력값 검증
    /formatters.ts    - 데이터 포맷팅
  /contexts
    /AuthContext.tsx  - 인증 상태 관리
  App.tsx
  main.tsx
```

---

## 11. 개발 일정 (1주)

### Day 1-2: 기반 구축
- 데이터베이스 스키마 생성
- 프로젝트 폴더 구조 세팅
- Supabase 클라이언트 초기화

### Day 3-4: 핵심 기능
- 회원가입/로그인 구현
- 상품 목록/상세 구현
- 구매 기능 구현
- Job Queue 시스템 구현

### Day 5: 블록체인 미러링
- NFT 조회 기능 구현
- 마이페이지 구현

### Day 6: UI/UX
- 네비게이션 바
- 라우팅 설정
- 반응형 디자인

### Day 7: 테스트 및 데모 준비
- 전체 플로우 테스트
- 버그 수정
- 데모 시나리오 작성

---

## 12. 성공 지표 (PoC)

### 필수 달성 항목
- ✅ 회원가입 시 Job Queue에 CREATE_WALLET 작업 생성
- ✅ 구매 시 Job Queue에 MINT_NFT 작업 생성
- ✅ Job Queue 워커가 작업을 자동으로 처리
- ✅ 처리된 NFT 정보가 blockchain_mirror 테이블에 저장
- ✅ 마이페이지에서 발급된 NFT 조회 가능

### 데모 시나리오
1. 회원가입 → 백그라운드에서 지갑 생성 → 완료 확인
2. 상품 목록 조회 → 상품 선택
3. 구매 진행 → 백그라운드에서 NFT 발급 → 완료 확인
4. 마이페이지 접속 → 발급된 NFT 확인

---

## 부록: 용어 정의

- **PoC (Proof of Concept)**: 개념 증명, 실현 가능성을 보여주는 프로토타입
- **Job Queue**: 백그라운드에서 처리할 작업들의 대기열
- **미러링**: 블록체인 데이터를 로컬 DB에 복사하여 빠른 조회 제공
- **RLS (Row Level Security)**: 행 단위 보안 정책, 각 사용자가 자신의 데이터만 접근
- **NFT (Non-Fungible Token)**: 대체 불가능한 토큰, 고유한 디지털 자산
- **ERC-20**: 이더리움 토큰 표준 (교환 가능)
- **ERC-721**: 이더리움 NFT 표준 (교환 불가능)
