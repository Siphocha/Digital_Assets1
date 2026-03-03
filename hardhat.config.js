require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "shanghai", // This MUST be here
      viaIR: true, // Add this for better optimization
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      hardfork: "shanghai", // Add this to ensure the network uses Shanghai
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
};