import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.VITE_SEPOLIA_RPC_URL;
const NFT_CONTRACT_ADDRESS = process.env.VITE_KAUS_NFT_CONTRACT_ADDRESS;

const NFT_ABI = [
  "function getAuthentication(uint256 tokenId) public view returns (tuple(string productId, string orderId, string brand, string productName, uint256 mintedAt, bool isValid))"
];

async function testVerify(tokenId) {
  console.log(`\n🔍 Testing NFT #${tokenId}...`);
  console.log('RPC_URL:', RPC_URL);
  console.log('Contract:', NFT_CONTRACT_ADDRESS);

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

    console.log('Calling getAuthentication...');
    const auth = await contract.getAuthentication(tokenId);

    console.log('✅ Success!');
    console.log('Result:', {
      productId: auth.productId,
      orderId: auth.orderId,
      brand: auth.brand,
      productName: auth.productName,
      mintedAt: Number(auth.mintedAt),
      isValid: auth.isValid,
    });

    return true;
  } catch (error) {
    console.log('❌ Error!');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Error data:', error.data);
    console.log('Full error:', JSON.stringify(error, null, 2));
    return false;
  }
}

async function main() {
  console.log('🚀 Testing verification service...\n');

  await testVerify('1');
  await testVerify('999');
}

main();
