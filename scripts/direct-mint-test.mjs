import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

async function main() {
  const contractAddress = process.env.VITE_KAUS_NFT_CONTRACT_ADDRESS;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!contractAddress || !rpcUrl || !privateKey) {
    console.error("❌ Missing environment variables");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("🔑 Using account:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  const abi = JSON.parse(
    readFileSync('./artifacts/contracts/KAUS_NFT.sol/KAUS_NFT.json', 'utf8')
  ).abi;

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  console.log("📝 Connected to contract:", contractAddress);

  const testRecipient = "0x086a998fb9123a2dd9d0962824f5ee461ad9bd73";
  const testProductId = "ba27775b-c350-46e2-a966-adaa52b90713";
  const testOrderId = "8526c9e4-4131-485c-a456-ce195d439cf4";
  const testBrand = "CHANEL";
  const testProductName = "클래식 플랩백";
  const testTokenURI = `https://kaus-nft-metadata.example.com/${testOrderId}.json`;

  console.log("\n🎨 Minting NFT...");
  console.log("Recipient:", testRecipient);
  console.log("Product:", testBrand, testProductName);
  console.log("Order ID:", testOrderId);

  try {
    const tx = await contract.mintNFT(
      testRecipient,
      testProductId,
      testOrderId,
      testBrand,
      testProductName,
      testTokenURI
    );

    console.log("⏳ Transaction submitted:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    const totalSupply = await contract.totalSupply();
    console.log("\n📊 Total Supply:", totalSupply.toString());

    const tokenId = totalSupply.toString();
    const auth = await contract.getAuthentication(tokenId);

    console.log("\n🎉 NFT Minted Successfully!");
    console.log("Token ID:", tokenId);
    console.log("\n📋 Authentication Details:");
    console.log("Product ID:", auth.productId);
    console.log("Order ID:", auth.orderId);
    console.log("Brand:", auth.brand);
    console.log("Product Name:", auth.productName);
    console.log("Minted At:", new Date(Number(auth.mintedAt) * 1000).toLocaleString());
    console.log("Is Valid:", auth.isValid);

    console.log("\n🔗 View on BaseScan:");
    console.log(`https://sepolia.basescan.org/tx/${tx.hash}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
