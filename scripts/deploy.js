const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  //Our walllet address (deployer)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

 
  const ALU_LOGO_HASH = "0xade19c79a4c8b89b6d4f7f5717d0b3c18a70c799da57271fc142568bedf7f8ee"; 
  
  const ASSET_NAME = "ALU Official Logo";
  const FILE_TYPE = "image/png";

  console.log("\n!!! Deploying ALUAssetRegistry !!!");
  const ALUAssetRegistry = await ethers.getContractFactory("ALUAssetRegistry");
  const assetRegistry = await ALUAssetRegistry.deploy();
  await assetRegistry.waitForDeployment();
  
  const assetRegistryAddress = await assetRegistry.getAddress();
  console.log("ALUAssetRegistry deployed to:", assetRegistryAddress);

  //Register the logo! Just that!
  console.log("\nRegistering ALU logo as NFT...");
  const registerTx = await assetRegistry.registerAsset(
    ASSET_NAME,
    FILE_TYPE,
    ALU_LOGO_HASH
  );
  await registerTx.wait();
  
  console.log("ALU logo registered successfully!");
  
  //Logo ID
  const tokenId = 1; //First token
  console.log("Token ID:", tokenId);

  //Deploy ALULogoToken
  console.log("\n!!! Deploying ALULogoToken !!!");
  const ALULogoToken = await ethers.getContractFactory("ALULogoToken");
  const logoToken = await ALULogoToken.deploy(deployer.address);
  await logoToken.waitForDeployment();
  
  const logoTokenAddress = await logoToken.getAddress();
  console.log("ALULogoToken deployed to:", logoTokenAddress);
  console.log("Total supply minted to owner:", deployer.address);

  // Get token details
  const totalSupply = await logoToken.totalSupply();
  const ownerBalance = await logoToken.balanceOf(deployer.address);
  console.log("Total supply:", ethers.formatEther(totalSupply), "ALUT");
  console.log("Owner balance:", ethers.formatEther(ownerBalance), "ALUT");

  console.log("\n!!! Deployment Summary !!!");
  console.log("ALUAssetRegistry:", assetRegistryAddress);
  console.log("ALULogoToken:", logoTokenAddress);
  console.log("ALU Logo Hash:", ALU_LOGO_HASH);
  console.log("Token ID:", tokenId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });