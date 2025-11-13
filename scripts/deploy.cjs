const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting KAUS NFT deployment...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  const KAUS_NFT = await hre.ethers.getContractFactory("KAUS_NFT");
  console.log("⏳ Deploying KAUS_NFT contract...");

  const kausNFT = await KAUS_NFT.deploy();
  await kausNFT.waitForDeployment();

  const contractAddress = await kausNFT.getAddress();
  console.log("✅ KAUS_NFT deployed to:", contractAddress);

  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log("Contract Name: KAUS_NFT");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("========================\n");

  console.log("🔧 Add this to your .env file:");
  console.log(`VITE_KAUS_NFT_CONTRACT_ADDRESS=${contractAddress}`);

  if (hre.network.name === "sepolia") {
    console.log("\n🔍 Verify on Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);

    console.log("\n⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      console.log("🔍 Verifying contract on Etherscan...");
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }

  const totalSupply = await kausNFT.totalSupply();
  console.log("\n📊 Initial total supply:", totalSupply.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
