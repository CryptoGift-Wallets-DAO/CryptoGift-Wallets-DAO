import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-solhint";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "dotenv/config";

// Ensure required environment variables
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const RPC_URL_BASE = process.env.RPC_URL || "https://mainnet.base.org";
const RPC_URL_BASE_SEPOLIA = process.env.RPC_URL_BASE_SEPOLIA || "https://sepolia.base.org";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

// Optional keys for additional deployers
const ATTESTOR_PRIVATE_KEY = process.env.ATTESTOR_PRIVATE_KEY || DEPLOYER_PRIVATE_KEY;
const BOT_PRIVATE_KEY = process.env.BOT_PRIVATE_KEY || DEPLOYER_PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf"
          }
        }
      },
      viaIR: false,
      evmVersion: "cancun",
      metadata: {
        bytecodeHash: "ipfs"
      }
    }
  },
  
  networks: {
    // Local development
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
      mining: {
        auto: true,
        interval: 0
      },
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 20,
        accountsBalance: "10000000000000000000000"
      }
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    
    // Base Mainnet
    base: {
      url: RPC_URL_BASE,
      chainId: 8453,
      accounts: [DEPLOYER_PRIVATE_KEY, ATTESTOR_PRIVATE_KEY, BOT_PRIVATE_KEY],
      gasPrice: "auto",
      gas: "auto",
      timeout: 120000,
      httpHeaders: {}
    },
    
    // Base Sepolia Testnet
    baseSepolia: {
      url: RPC_URL_BASE_SEPOLIA,
      chainId: 84532,
      accounts: [DEPLOYER_PRIVATE_KEY, ATTESTOR_PRIVATE_KEY, BOT_PRIVATE_KEY],
      gasPrice: "auto",
      gas: "auto",
      timeout: 120000,
      httpHeaders: {}
    },
    
    // Ethereum Mainnet (for forking)
    mainnet: {
      url: process.env.RPC_URL_MAINNET || "https://eth.llamarpc.com",
      chainId: 1,
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
    },
    
    // Sepolia Testnet
    sepolia: {
      url: process.env.RPC_URL_SEPOLIA || "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts: [DEPLOYER_PRIVATE_KEY],
    }
  },
  
  // Etherscan verification
  etherscan: {
    apiKey: {
      base: BASESCAN_API_KEY,
      baseSepolia: BASESCAN_API_KEY,
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  },
  
  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 5,
    token: "ETH",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    excludeContracts: ["contracts/test/", "contracts/mocks/"],
    src: "./contracts",
    noColors: false,
    outputFile: process.env.GAS_REPORT_OUTPUT,
    showTimeSpent: true,
    showMethodSig: true
  },
  
  // Contract sizer
  contractSizer: {
    alphaSort: false,
    runOnCompile: true,
    disambiguatePaths: false,
    strict: true,
    only: [],
    except: ["test/", "mocks/"]
  },
  
  // TypeChain
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
    dontOverrideCompile: false
  },
  
  // Paths
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./scripts/deploy",
    deployments: "./deployments"
  },
  
  // Mocha test configuration
  mocha: {
    timeout: 120000,
    reporter: "spec"
  },
  
  // Defender (optional)
  defender: {
    apiKey: process.env.DEFENDER_API_KEY || "",
    apiSecret: process.env.DEFENDER_API_SECRET || ""
  }
};

export default config;