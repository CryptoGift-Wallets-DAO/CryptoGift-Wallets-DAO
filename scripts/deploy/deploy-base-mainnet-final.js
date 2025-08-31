/**
 * @title Base Mainnet Deployment Script - PRODUCTION
 * @author CryptoGift DAO Team
 * @notice Deploy complete 3-layer security architecture to Base Mainnet
 * @dev Chain ID: 8453 - Base Mainnet
 * 
 * DEPLOYMENT ORDER (CRITICAL):
 * 1. MasterEIP712Controller (owner control)
 * 2. TaskRulesEIP712 (validation layer) 
 * 3. MilestoneEscrow (custody layer)
 * 4. CGCToken (2M supply)
 * 5. Verify all contracts on BaseScan
 * 6. Setup permissions and mint initial supply
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// ============ CONFIGURATION ============

const CONFIG = {
    CHAIN_ID: 8453, // Base Mainnet
    GAS_PRICE: "0.001", // 0.001 Gwei (very low for Base)
    GAS_LIMIT: 8000000,
    CONFIRMATIONS: 3,
    
    // Token configuration
    INITIAL_SUPPLY: "2000000", // 2 million CGC
    TOKEN_NAME: "CryptoGift Coin",
    TOKEN_SYMBOL: "CGC",
    
    // EIP-712 configuration
    SIGNATURE_VALIDITY: 15 * 60, // 15 minutes
    
    // Deployment addresses will be populated
    addresses: {},
    
    // Verification data
    verification: []
};

// ============ DEPLOYMENT FUNCTIONS ============

async function main() {
    console.log("\n🚀 STARTING BASE MAINNET DEPLOYMENT");
    console.log("=====================================");
    
    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    const network = await hre.ethers.provider.getNetwork();
    
    console.log(`📍 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`💼 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${hre.ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    
    // Verify we're on Base Mainnet
    if (network.chainId !== CONFIG.CHAIN_ID) {
        throw new Error(`❌ Wrong network! Expected Base Mainnet (${CONFIG.CHAIN_ID}), got ${network.chainId}`);
    }
    
    // Check minimum balance (0.01 ETH for deployment)
    const minBalance = hre.ethers.utils.parseEther("0.01");
    const balance = await deployer.getBalance();
    if (balance.lt(minBalance)) {
        throw new Error(`❌ Insufficient balance! Need at least 0.01 ETH, got ${hre.ethers.utils.formatEther(balance)} ETH`);
    }
    
    console.log("✅ Pre-flight checks passed");
    
    // ============ STEP 1: DEPLOY MASTER CONTROLLER ============
    console.log("\n🔑 STEP 1: Deploying MasterEIP712Controller...");
    
    const MasterController = await hre.ethers.getContractFactory("MasterEIP712Controller");
    const masterController = await MasterController.deploy(
        deployer.address, // initial owner
        {
            gasPrice: hre.ethers.utils.parseUnits(CONFIG.GAS_PRICE, "gwei"),
            gasLimit: CONFIG.GAS_LIMIT
        }
    );
    
    await masterController.deployed();
    CONFIG.addresses.masterController = masterController.address;
    
    console.log(`✅ MasterEIP712Controller deployed: ${masterController.address}`);
    console.log(`⛽ Gas used: ${(await masterController.deployTransaction.wait()).gasUsed}`);
    
    // Add to verification queue
    CONFIG.verification.push({
        name: "MasterEIP712Controller",
        address: masterController.address,
        constructorArgs: [deployer.address]
    });
    
    // ============ STEP 2: DEPLOY TASK RULES ============
    console.log("\n📋 STEP 2: Deploying TaskRulesEIP712...");
    
    const TaskRules = await hre.ethers.getContractFactory("TaskRulesEIP712");
    const taskRules = await TaskRules.deploy(
        masterController.address,
        CONFIG.SIGNATURE_VALIDITY,
        {
            gasPrice: hre.ethers.utils.parseUnits(CONFIG.GAS_PRICE, "gwei"),
            gasLimit: CONFIG.GAS_LIMIT
        }
    );
    
    await taskRules.deployed();
    CONFIG.addresses.taskRules = taskRules.address;
    
    console.log(`✅ TaskRulesEIP712 deployed: ${taskRules.address}`);
    console.log(`⛽ Gas used: ${(await taskRules.deployTransaction.wait()).gasUsed}`);
    
    CONFIG.verification.push({
        name: "TaskRulesEIP712",
        address: taskRules.address,
        constructorArgs: [masterController.address, CONFIG.SIGNATURE_VALIDITY]
    });
    
    // ============ STEP 3: DEPLOY MILESTONE ESCROW ============
    console.log("\n🏦 STEP 3: Deploying MilestoneEscrow...");
    
    const MilestoneEscrow = await hre.ethers.getContractFactory("MilestoneEscrow");
    const milestoneEscrow = await MilestoneEscrow.deploy(
        masterController.address,
        deployer.address, // treasury (temporary)
        {
            gasPrice: hre.ethers.utils.parseUnits(CONFIG.GAS_PRICE, "gwei"),
            gasLimit: CONFIG.GAS_LIMIT
        }
    );
    
    await milestoneEscrow.deployed();
    CONFIG.addresses.milestoneEscrow = milestoneEscrow.address;
    
    console.log(`✅ MilestoneEscrow deployed: ${milestoneEscrow.address}`);
    console.log(`⛽ Gas used: ${(await milestoneEscrow.deployTransaction.wait()).gasUsed}`);
    
    CONFIG.verification.push({
        name: "MilestoneEscrow",
        address: milestoneEscrow.address,
        constructorArgs: [masterController.address, deployer.address]
    });
    
    // ============ STEP 4: DEPLOY CGC TOKEN ============
    console.log("\n🪙 STEP 4: Deploying CGCToken...");
    
    const CGCToken = await hre.ethers.getContractFactory("CGCToken");
    const cgcToken = await CGCToken.deploy(
        deployer.address, // DAO address (will receive 2M tokens)
        deployer.address, // initial owner
        {
            gasPrice: hre.ethers.utils.parseUnits(CONFIG.GAS_PRICE, "gwei"),
            gasLimit: CONFIG.GAS_LIMIT
        }
    );
    
    await cgcToken.deployed();
    CONFIG.addresses.cgcToken = cgcToken.address;
    
    console.log(`✅ CGCToken deployed: ${cgcToken.address}`);
    console.log(`⛽ Gas used: ${(await cgcToken.deployTransaction.wait()).gasUsed}`);
    
    // Verify initial supply
    const totalSupply = await cgcToken.totalSupply();
    const expectedSupply = hre.ethers.utils.parseEther(CONFIG.INITIAL_SUPPLY);
    console.log(`📊 Total Supply: ${hre.ethers.utils.formatEther(totalSupply)} CGC`);
    console.log(`📊 Expected: ${hre.ethers.utils.formatEther(expectedSupply)} CGC`);
    
    if (!totalSupply.eq(expectedSupply)) {
        throw new Error("❌ Supply mismatch!");
    }
    
    CONFIG.verification.push({
        name: "CGCToken",
        address: cgcToken.address,
        constructorArgs: [deployer.address, deployer.address]
    });
    
    // ============ STEP 5: SETUP PERMISSIONS ============
    console.log("\n🔐 STEP 5: Setting up permissions...");
    
    // Authorize TaskRules in MasterController
    console.log("📝 Authorizing TaskRules...");
    const authTx = await masterController.authorizeEIP712(
        taskRules.address,
        {
            gasPrice: hre.ethers.utils.parseUnits(CONFIG.GAS_PRICE, "gwei")
        }
    );
    await authTx.wait(CONFIG.CONFIRMATIONS);
    console.log(`✅ TaskRules authorized in MasterController`);
    
    // Set MilestoneEscrow as token minter
    console.log("📝 Setting up minter permissions...");
    const minterTx = await cgcToken.addMinter(milestoneEscrow.address, {
        gasPrice: hre.ethers.utils.parseUnits(CONFIG.GAS_PRICE, "gwei")
    });
    await minterTx.wait(CONFIG.CONFIRMATIONS);
    console.log(`✅ MilestoneEscrow added as minter`);
    
    // ============ STEP 6: SAVE DEPLOYMENT DATA ============
    console.log("\n💾 STEP 6: Saving deployment data...");
    
    const deploymentData = {
        timestamp: new Date().toISOString(),
        network: {
            name: network.name,
            chainId: network.chainId
        },
        deployer: deployer.address,
        contracts: CONFIG.addresses,
        config: {
            initialSupply: CONFIG.INITIAL_SUPPLY,
            signatureValidity: CONFIG.SIGNATURE_VALIDITY,
            tokenName: CONFIG.TOKEN_NAME,
            tokenSymbol: CONFIG.TOKEN_SYMBOL
        },
        verification: CONFIG.verification,
        transactionHashes: {
            masterController: masterController.deployTransaction.hash,
            taskRules: taskRules.deployTransaction.hash,
            milestoneEscrow: milestoneEscrow.deployTransaction.hash,
            cgcToken: cgcToken.deployTransaction.hash
        }
    };
    
    // Save to file
    const deploymentFile = path.join(__dirname, '..', '..', `base-mainnet-deployment-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log(`✅ Deployment data saved: ${deploymentFile}`);
    
    // ============ DEPLOYMENT SUMMARY ============
    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=====================================");
    console.log(`🔑 MasterEIP712Controller: ${CONFIG.addresses.masterController}`);
    console.log(`📋 TaskRulesEIP712: ${CONFIG.addresses.taskRules}`);
    console.log(`🏦 MilestoneEscrow: ${CONFIG.addresses.milestoneEscrow}`);
    console.log(`🪙 CGCToken: ${CONFIG.addresses.cgcToken}`);
    console.log(`💰 Total Supply: 2,000,000 CGC`);
    console.log(`💼 Owner: ${deployer.address}`);
    
    // ============ NEXT STEPS ============
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Verify contracts on BaseScan (run verification script)");
    console.log("2. Test token transfers and minting");
    console.log("3. Update frontend configuration with contract addresses");
    console.log("4. Deploy ranking backend with new contract addresses");
    console.log("5. Execute first batch creation test");
    
    console.log("\n⚠️  IMPORTANT: Save your deployment file securely!");
    console.log("⚠️  NEVER expose private keys or share deployment details publicly!");
    
    return deploymentData;
}

// ============ ERROR HANDLING ============

async function handleError(error) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("=====================");
    console.error(error.message);
    
    if (error.transaction) {
        console.error(`📋 Transaction Hash: ${error.transaction.hash}`);
    }
    
    if (error.receipt) {
        console.error(`⛽ Gas Used: ${error.receipt.gasUsed}`);
        console.error(`💰 Gas Price: ${error.receipt.effectiveGasPrice}`);
    }
    
    console.error("\n🔧 Troubleshooting:");
    console.error("1. Check your private key is correct");
    console.error("2. Ensure sufficient ETH balance");
    console.error("3. Verify network configuration");
    console.error("4. Check for any contract compilation errors");
    
    process.exit(1);
}

// ============ EXECUTION ============

if (require.main === module) {
    main()
        .then(() => {
            console.log("\n✅ Script completed successfully!");
            process.exit(0);
        })
        .catch(handleError);
}

module.exports = { main, CONFIG };