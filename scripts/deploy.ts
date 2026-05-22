import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("=================================================");
  console.log("   Save The City - Deployment Script");
  console.log("   Ritual Chain Testnet (Chain ID: 1979)");
  console.log("=================================================\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "RITUAL\n");

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient RITUAL balance. You need at least 0.01 RITUAL to deploy.");
  }

  // Deploy the contract
  console.log("Deploying SaveTheCity contract...");
  const SaveTheCity = await ethers.getContractFactory("SaveTheCity");
  const saveTheCity = await SaveTheCity.deploy();

  console.log("Waiting for deployment confirmation...");
  await saveTheCity.waitForDeployment();

  const contractAddress = await saveTheCity.getAddress();
  console.log("\n✅ SaveTheCity deployed to:", contractAddress);
  console.log("Transaction hash:", saveTheCity.deploymentTransaction()?.hash);

  // Write the contract address to a file for the frontend
  const deploymentInfo = {
    contractAddress,
    network: "Ritual Chain Testnet",
    chainId: 1979,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    txHash: saveTheCity.deploymentTransaction()?.hash,
  };

  // Save to root
  fs.writeFileSync(
    path.join(__dirname, "../deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also save to frontend env location hint
  console.log("\n=================================================");
  console.log("NEXT STEPS:");
  console.log("=================================================");
  console.log("1. Copy this contract address:");
  console.log("   ", contractAddress);
  console.log("\n2. Open frontend/.env.local and set:");
  console.log("   NEXT_PUBLIC_CONTRACT_ADDRESS=" + contractAddress);
  console.log("\n3. Run the frontend:");
  console.log("   cd frontend && npm run dev");
  console.log("=================================================\n");

  // Verify the contract is working
  console.log("Verifying contract deployment...");
  const owner = await saveTheCity.owner();
  console.log("Contract owner:", owner);
  console.log("Play fee: FREE (gas only)");
  console.log("\n✅ Deployment successful!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
