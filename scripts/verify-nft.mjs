import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.SEPOLIA_RPC_URL;
const NFT_CONTRACT_ADDRESS = process.env.VITE_KAUS_NFT_CONTRACT_ADDRESS;

const NFT_ABI = [
  "function totalSupply() public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function getAuthentication(uint256 tokenId) public view returns (tuple(string productId, string orderId, string brand, string productName, uint256 mintedAt, bool isValid))",
  "function tokenURI(uint256 tokenId) public view returns (string)"
];

async function verifyNFT() {
  try {
    console.log('🔍 NFT 검증 시작...\n');
    console.log('RPC URL:', RPC_URL);
    console.log('Contract Address:', NFT_CONTRACT_ADDRESS);
    console.log('');

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

    // 1. Total Supply 확인
    console.log('📊 Total Supply 확인 중...');
    const totalSupply = await contract.totalSupply();
    console.log('Total Supply:', totalSupply.toString());
    console.log('');

    // 2. NFT #359557 확인
    const nftId = '359557';
    console.log(`🔎 NFT #${nftId} 확인 중...`);

    try {
      const owner = await contract.ownerOf(nftId);
      console.log('✅ Owner:', owner);

      const auth = await contract.getAuthentication(nftId);
      console.log('✅ Authentication:');
      console.log('  - Product ID:', auth.productId);
      console.log('  - Order ID:', auth.orderId);
      console.log('  - Brand:', auth.brand);
      console.log('  - Product Name:', auth.productName);
      console.log('  - Minted At:', new Date(Number(auth.mintedAt) * 1000).toISOString());
      console.log('  - Is Valid:', auth.isValid);

      const tokenURI = await contract.tokenURI(nftId);
      console.log('✅ Token URI:', tokenURI);

    } catch (error) {
      console.log('❌ NFT #' + nftId + '를 찾을 수 없습니다.');
      console.log('Error:', error.message);
    }

    console.log('');

    // 3. NFT #1 확인 (비교용)
    console.log('🔎 NFT #1 확인 중 (비교용)...');
    try {
      const owner = await contract.ownerOf(1);
      console.log('✅ Owner:', owner);

      const auth = await contract.getAuthentication(1);
      console.log('✅ Authentication:');
      console.log('  - Brand:', auth.brand);
      console.log('  - Product Name:', auth.productName);
      console.log('  - Is Valid:', auth.isValid);
    } catch (error) {
      console.log('❌ NFT #1를 찾을 수 없습니다.');
      console.log('Error:', error.message);
    }

  } catch (error) {
    console.error('❌ 검증 실패:', error);
  }
}

verifyNFT();
