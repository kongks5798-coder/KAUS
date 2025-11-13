const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.VITE_KAUS_NFT_CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("❌ Please set VITE_KAUS_NFT_CONTRACT_ADDRESS in .env file");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("🔑 Using account:", deployer.address);

  const KAUS_NFT = await hre.ethers.getContractFactory("KAUS_NFT");
  const kausNFT = KAUS_NFT.attach(contractAddress);

  console.log("📝 Connected to KAUS_NFT at:", contractAddress);

  const testRecipient = deployer.address;
  const testProductId = "prod_test_001";
  const testOrderId = "order_test_001";
  const testBrand = "CHANEL";
  const testProductName = "Classic Flap Bag";
  const testTokenURI = "https://example.com/metadata/1.json";

  console.log("\n🎨 Minting test NFT...");
  console.log("Recipient:", testRecipient);
  console.log("Product:", testBrand, testProductName);

  const tx = await kausNFT.mintNFT(
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

  const events = receipt.logs.filter(log => {
    try {
      const parsed = kausNFT.interface.parseLog(log);
      return parsed && parsed.name === 'NFTMinted';
    } catch {
      return false;
    }
  });

  if (events.length > 0) {
    const event = kausNFT.interface.parseLog(events[0]);
    const tokenId = event.args.tokenId.toString();
    console.log("\n🎉 NFT Minted Successfully!");
    console.log("Token ID:", tokenId);

    const auth = await kausNFT.getAuthentication(tokenId);
    console.log("\n📋 Authentication Details:");
    console.log("Product ID:", auth.productId);
    console.log("Order ID:", auth.orderId);
    console.log("Brand:", auth.brand);
    console.log("Product Name:", auth.productName);
    console.log("Minted At:", new Date(Number(auth.mintedAt) * 1000).toLocaleString());
    console.log("Is Valid:", auth.isValid);
  }

  const totalSupply = await kausNFT.totalSupply();
  console.log("\n📊 Total Supply:", totalSupply.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
