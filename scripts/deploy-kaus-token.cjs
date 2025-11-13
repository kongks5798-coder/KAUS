require('dotenv').config();
const hre = require('hardhat');

async function main() {
  console.log('🚀 KAUS Token 배포 시작...\n');

  const [deployer] = await hre.ethers.getSigners();
  console.log('배포 지갑:', deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('지갑 잔액:', hre.ethers.formatEther(balance), 'ETH\n');

  console.log('1️⃣ KAUS Token (100억 KAUS) 배포 중...');
  const KAUSToken = await hre.ethers.getContractFactory('KAUSToken');
  const kausToken = await KAUSToken.deploy();
  await kausToken.waitForDeployment();
  const tokenAddress = await kausToken.getAddress();
  console.log('✅ KAUS Token 배포 완료:', tokenAddress);

  const totalSupply = await kausToken.totalSupply();
  console.log('   초기 발행량:', hre.ethers.formatEther(totalSupply), 'KAUS');

  const maxSupply = await kausToken.MAX_SUPPLY();
  console.log('   최대 발행량:', hre.ethers.formatEther(maxSupply), 'KAUS\n');

  console.log('2️⃣ 역할 확인 중...');
  const GOVERNANCE_ROLE = await kausToken.GOVERNANCE_ROLE();
  const MINTER_ROLE = await kausToken.MINTER_ROLE();

  const hasGovernance = await kausToken.hasRole(GOVERNANCE_ROLE, deployer.address);
  const hasMinter = await kausToken.hasRole(MINTER_ROLE, deployer.address);

  console.log('   Governance Role:', hasGovernance ? '✅ 부여됨' : '❌ 없음');
  console.log('   Minter Role:', hasMinter ? '✅ 부여됨' : '❌ 없음\n');

  console.log('3️⃣ 민팅 설정 확인 중...');
  const nextMintTime = await kausToken.getNextMintTime();
  const maxMintable = await kausToken.getMaxMintableAmount();
  const nextMintDate = new Date(Number(nextMintTime) * 1000);

  console.log('   다음 민팅 가능 시간:', nextMintDate.toISOString());
  console.log('   현재 민팅 가능량:', hre.ethers.formatEther(maxMintable), 'KAUS\n');

  console.log('4️⃣ 토큰 통계 조회 중...');
  const stats = await kausToken.getTokenStats();
  console.log('   현재 공급량:', hre.ethers.formatEther(stats[0]), 'KAUS');
  console.log('   최대 공급량:', hre.ethers.formatEther(stats[1]), 'KAUS');
  console.log('   총 소각량:', hre.ethers.formatEther(stats[2]), 'KAUS');
  console.log('   유통량:', hre.ethers.formatEther(stats[3]), 'KAUS\n');

  console.log('📋 배포 완료! 아래 주소를 .env 파일에 추가하세요:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('VITE_KAUS_TOKEN_ADDRESS=' + tokenAddress);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔍 블록체인 탐색기:');
  console.log(`https://sepolia.basescan.org/address/${tokenAddress}\n`);

  console.log('⚠️  다음 단계:');
  console.log('1. .env 파일에 컨트랙트 주소 추가');
  console.log('2. 필요 시 추가 Governance 멤버에게 역할 부여');
  console.log('   - kausToken.grantGovernanceRole(address)');
  console.log('3. 스테이킹 컨트랙트에 MINTER_ROLE 부여');
  console.log('   - kausToken.grantMinterRole(stakingContractAddress)');
  console.log('4. Multi-sig 지갑으로 Owner 권한 이전 (운영 환경)\n');

  console.log('💡 주요 기능:');
  console.log('   - mintByGovernance(): DAO 승인 시 토큰 발행 (30일 간격, 최대 5%)');
  console.log('   - mintStakingReward(): 스테이킹 보상 발행');
  console.log('   - burnWithReason(): 투명한 소각');
  console.log('   - grantGovernanceRole(): 거버넌스 멤버 추가');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
