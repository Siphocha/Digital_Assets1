const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ALUAssetRegistry and ALULogoToken", function () {
  let assetRegistry;
  let logoToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const VALID_HASH = ethers.keccak256(ethers.toUtf8Bytes("valid logo content"));
  const DIFFERENT_HASH = ethers.keccak256(ethers.toUtf8Bytes("different content"));
  
  const ASSET_NAME = "ALU Official Logo";
  const FILE_TYPE = "image/png";

  beforeEach(async function () {
    //Sign on SIGNERS
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    //Deploying ALUAssetRegistry
    const ALUAssetRegistry = await ethers.getContractFactory("ALUAssetRegistry");
    assetRegistry = await ALUAssetRegistry.deploy();
    await assetRegistry.waitForDeployment();

    //Deploying ALULogoToken
    const ALULogoToken = await ethers.getContractFactory("ALULogoToken");
    logoToken = await ALULogoToken.deploy(owner.address);
    await logoToken.waitForDeployment();
  });

  describe("ALUAssetRegistry - Registration Tests", function () {
    it("Should register the ALU logo successfully and return a token ID", async function () {
      // Register asset
      const tx = await assetRegistry.registerAsset(ASSET_NAME, FILE_TYPE, VALID_HASH);
      const receipt = await tx.wait();
      
      //Token ID should 100% be 1
      expect(await assetRegistry.ownerOf(1)).to.equal(owner.address);
      
      //Checking emissions
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "AssetRegistered"
      );
      expect(event).to.not.be.undefined;
    });

    it("Should reject registering the same hash a second time", async function () {
      await assetRegistry.registerAsset(ASSET_NAME, FILE_TYPE, VALID_HASH);
      
      //Any second registration should fail
      await expect(
        assetRegistry.registerAsset(ASSET_NAME, FILE_TYPE, VALID_HASH)
      ).to.be.revertedWith("ALUAssetRegistry: This logo has already been registered");
    });

    it("Should verify logo integrity returns true when correct hash is supplied", async function () {
      await assetRegistry.registerAsset(ASSET_NAME, FILE_TYPE, VALID_HASH);
      
      const [isAuthentic, message] = await assetRegistry.verifyLogoIntegrity(1, VALID_HASH);
      expect(isAuthentic).to.be.true;
      expect(message).to.equal("Logo is authentic.");
    });

    it("Should verify logo integrity returns false when incorrect hash is supplied", async function () {
      await assetRegistry.registerAsset(ASSET_NAME, FILE_TYPE, VALID_HASH);
      
      const [isAuthentic, message] = await assetRegistry.verifyLogoIntegrity(1, DIFFERENT_HASH);
      expect(isAuthentic).to.be.false;
      expect(message).to.equal("Warning: logo does not match.");
    });

    it("Should getAsset return the correct asset name and file type", async function () {
      await assetRegistry.registerAsset(ASSET_NAME, FILE_TYPE, VALID_HASH);
      
      const asset = await assetRegistry.getAsset(1);
      expect(asset.assetName).to.equal(ASSET_NAME);
      expect(asset.fileType).to.equal(FILE_TYPE);
      expect(asset.contentHash).to.equal(VALID_HASH);
      expect(asset.registrant).to.equal(owner.address);
      expect(asset.timestamp).to.be.gt(0);
    });
  });

  describe("ALULogoToken - Tokenization Tests", function () {
    it("Should mint full supply of 1,000,000 ALUT tokens to the logo owner", async function () {
      const totalSupply = await logoToken.totalSupply();
      const ownerBalance = await logoToken.balanceOf(owner.address);
      
      // Check total supply (formatted from wei)
      expect(ethers.formatEther(totalSupply)).to.equal("1000000.0");
      expect(ownerBalance).to.equal(totalSupply);
    });

    it("Should distributeShares correctly transfer tokens to recipient", async function () {
      const transferAmount = ethers.parseEther("100000"); 
      
      await logoToken.approve(owner.address, transferAmount);
      
      //Distributing shares
      await logoToken.distributeShares(addr1.address, transferAmount);
      
      //Balance checks
      const addr1Balance = await logoToken.balanceOf(addr1.address);
      const ownerBalance = await logoToken.balanceOf(owner.address);
      
      expect(addr1Balance).to.equal(transferAmount);
      expect(ownerBalance).to.equal(ethers.parseEther("900000")); // 1,000,000 - 100,000
    });

    it("Should ownershipPercentage return correct percentage for a wallet", async function () {
      const transferAmount = ethers.parseEther("250000");
      
      //Percentage checks
      await logoToken.transfer(addr1.address, transferAmount);
      
      const percentage = await logoToken.ownershipPercentage(addr1.address);
      expect(percentage).to.equal(25); 
      //250,000 / 1,000,000 = 25%
      
      const ownerPercentage = await logoToken.ownershipPercentage(owner.address);
      expect(ownerPercentage).to.equal(75); 
      //750,000 / 1,000,000 = 75%
    });

    it("Should distributeShares require amount greater than zero", async function () {
      await expect(
        logoToken.distributeShares(addr1.address, 0)
      ).to.be.revertedWith("ALULogoToken: amount must be greater than zero");
    });

    it("Should ownershipPercentage return 0 for address with no tokens", async function () {
      const percentage = await logoToken.ownershipPercentage(addr2.address);
      expect(percentage).to.equal(0);
    });
  });
});