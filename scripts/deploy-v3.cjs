require('dotenv').config();
const hre = require('hardhat');

async function main() {
  console.log('🚀 K-AUS V3 배포 시작...\n');

  const [deployer] = await hre.ethers.getSigners();
  console.log('배포 지갑:', deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('지갑 잔액:', hre.ethers.formatEther(balance), 'ETH\n');

  console.log('1️⃣ KAUS Token V3 배포 중...');
  const KAUSToken = await hre.ethers.getContractFactory('KAUS_Token_V3');
  const kausToken = await KAUSToken.deploy();
  await kausToken.waitForDeployment();
  const tokenAddress = await kausToken.getAddress();
  console.log('✅ KAUS Token V3 배포 완료:', tokenAddress);

  const totalSupply = await kausToken.totalSupply();
  console.log('   토큰 총 발행량:', hre.ethers.formatEther(totalSupply), 'KAUS\n');

  console.log('2️⃣ KAUS NFT V2 배포 중...');
  const KAUSNFT = await hre.ethers.getContractFactory('KAUS_NFT_V2');
  const kausNFT = await KAUSNFT.deploy();
  await kausNFT.waitForDeployment();
  const nftAddress = await kausNFT.getAddress();
  console.log('✅ KAUS NFT V2 배포 완료:', nftAddress);

  const isSoulbound = await kausNFT.isSoulbound();
  console.log('   SBT 모드:', isSoulbound ? '활성화 (전송 불가)' : '비활성화\n');

  console.log('3️⃣ 토큰-NFT 연결 설정 중...');
  const setNFTTx = await kausToken.setNFTContract(nftAddress);
  await setNFTTx.wait();
  console.log('✅ NFT 컨트랙트 연결 완료\n');

  console.log('4️⃣ NFT Minter 권한 부여 중...');
  const authTx = await kausNFT.authorizeMinter(deployer.address);
  await authTx.wait();
  console.log('✅ Minter 권한 부여 완료\n');

  console.log('📋 배포 완료! 아래 주소를 .env 파일에 추가하세요:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('VITE_KAUS_TOKEN_CONTRACT_ADDRESS=' + tokenAddress);
  console.log('VITE_KAUS_NFT_CONTRACT_ADDRESS=' + nftAddress);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔍 블록체인 탐색기 링크:');
  console.log('Token:', `https://sepolia.basescan.org/address/${tokenAddress}`);
  console.log('NFT:', `https://sepolia.basescan.org/address/${nftAddress}\n`);

  console.log('⚠️  다음 단계:');
  console.log('1. .env 파일에 컨트랙트 주소 추가');
  console.log('2. 서버 재시작');
  console.log('3. 프론트엔드 빌드');
  console.log('4. Multi-sig 지갑 설정 (운영 환경)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
