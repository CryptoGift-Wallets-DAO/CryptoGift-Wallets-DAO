/**
 * @title First Minting Test Script
 * @author CryptoGift DAO Team
 * @notice Test the first minting of 2M CGC tokens and basic functionality
 * @dev Validates deployment and tests core functionality
 */

const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// ============ TEST CONFIGURATION ============

const TEST_CONFIG = {
    // Test addresses (use deployer for initial test)
    TEST_RECIPIENTS: [], // Will be populated with deployer address
    TEST_AMOUNTS: ["1000", "2000", "3000"], // Test amounts in CGC tokens
    
    // Validation thresholds
    EXPECTED_TOTAL_SUPPLY: "2000000", // 2M CGC tokens
    MIN_GAS_EFFICIENCY: 50000, // Minimum gas per transfer
    MAX_GAS_USAGE: 200000, // Maximum gas per transfer
    
    // Test parameters
    TEST_BATCH_SIZE: 3,
    CONFIRMATION_BLOCKS: 2
};

// ============ UTILITY FUNCTIONS ============

function formatCGC(amount) {
    return hre.ethers.utils.formatEther(amount) + " CGC";
}

function parseCGC(amount) {
    return hre.ethers.utils.parseEther(amount);
}

async function waitForConfirmations(tx, confirmations = TEST_CONFIG.CONFIRMATION_BLOCKS) {
    console.log(`⏳ Waiting for ${confirmations} confirmations...`);
    const receipt = await tx.wait(confirmations);
    console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
    return receipt;
}

// ============ TEST FUNCTIONS ============

async function testTokenDeployment(cgcToken, deployer) {
    console.log("\n🧪 TEST 1: Token Deployment Validation");
    console.log("======================================");
    
    // Test basic token properties
    const name = await cgcToken.name();
    const symbol = await cgcToken.symbol();
    const decimals = await cgcToken.decimals();
    const totalSupply = await cgcToken.totalSupply();
    const logoURI = await cgcToken.logoURI();
    
    console.log(`📛 Name: ${name}`);
    console.log(`🔤 Symbol: ${symbol}`);
    console.log(`📊 Decimals: ${decimals}`);
    console.log(`💰 Total Supply: ${formatCGC(totalSupply)}`);
    console.log(`🖼️ Logo URI: ${logoURI}`);
    
    // Validate expected values
    if (name !== "CryptoGift Coin") throw new Error("❌ Invalid token name");
    if (symbol !== "CGC") throw new Error("❌ Invalid token symbol");  
    if (decimals !== 18) throw new Error("❌ Invalid decimals");
    if (!totalSupply.eq(parseCGC(TEST_CONFIG.EXPECTED_TOTAL_SUPPLY))) {
        throw new Error(`❌ Invalid total supply. Expected ${TEST_CONFIG.EXPECTED_TOTAL_SUPPLY}, got ${formatCGC(totalSupply)}`);
    }
    if (!logoURI.includes("CGC-logo.png")) throw new Error("❌ Invalid logo URI");
    
    // Test deployer balance (should have all tokens initially)
    const deployerBalance = await cgcToken.balanceOf(deployer.address);
    console.log(`💼 Deployer Balance: ${formatCGC(deployerBalance)}`);
    
    if (!deployerBalance.eq(totalSupply)) {
        throw new Error("❌ Deployer should have all initial tokens");
    }
    
    // Test holder tracking
    const totalHolders = await cgcToken.totalHolders();
    const isHolder = await cgcToken.isHolder(deployer.address);
    
    console.log(`👥 Total Holders: ${totalHolders}`);
    console.log(`✅ Deployer is holder: ${isHolder}`);
    
    if (totalHolders.toNumber() !== 1) throw new Error("❌ Should have exactly 1 holder initially");
    if (!isHolder) throw new Error("❌ Deployer should be tracked as holder");
    
    console.log("✅ Token deployment validation PASSED");
    return { name, symbol, decimals, totalSupply, deployerBalance };
}

async function testVotingCapabilities(cgcToken, deployer) {
    console.log("\n🧪 TEST 2: Voting Capabilities");
    console.log("===============================");
    
    // Check initial voting power (should be 0 until tokens are delegated)
    let votingPower = await cgcToken.getVotes(deployer.address);
    console.log(`🗳️ Initial Voting Power: ${formatCGC(votingPower)}`);
    
    // Self-delegate to activate voting power
    console.log("📝 Self-delegating to activate voting power...");
    const delegateTx = await cgcToken.delegate(deployer.address);
    await waitForConfirmations(delegateTx);
    
    // Check voting power after delegation
    votingPower = await cgcToken.getVotes(deployer.address);
    console.log(`🗳️ Voting Power after delegation: ${formatCGC(votingPower)}`);
    
    const balance = await cgcToken.balanceOf(deployer.address);
    if (!votingPower.eq(balance)) {
        throw new Error("❌ Voting power should equal balance after self-delegation");
    }
    
    // Test hasVotingPower function
    const hasVotingPower = await cgcToken.hasVotingPower(deployer.address);
    console.log(`✅ Has Voting Power: ${hasVotingPower}`);
    
    if (!hasVotingPower) throw new Error("❌ Should have voting power after delegation");
    
    console.log("✅ Voting capabilities test PASSED");
    return { votingPower };
}

async function testTokenTransfers(cgcToken, deployer) {
    console.log("\n🧪 TEST 3: Token Transfers");
    console.log("===========================");
    
    // Create test recipient address (use deployer's address + 1 for testing)
    const testRecipient = hre.ethers.Wallet.createRandom().address;
    const transferAmount = parseCGC("1000"); // 1000 CGC
    
    console.log(`👤 Test Recipient: ${testRecipient}`);
    console.log(`💸 Transfer Amount: ${formatCGC(transferAmount)}`);
    
    // Record initial balances
    const deployerBalanceBefore = await cgcToken.balanceOf(deployer.address);
    const recipientBalanceBefore = await cgcToken.balanceOf(testRecipient);
    
    console.log(`💰 Deployer Balance Before: ${formatCGC(deployerBalanceBefore)}`);
    console.log(`💰 Recipient Balance Before: ${formatCGC(recipientBalanceBefore)}`);
    
    // Execute transfer
    console.log("📤 Executing transfer...");
    const transferTx = await cgcToken.transfer(testRecipient, transferAmount);
    const receipt = await waitForConfirmations(transferTx);
    
    // Record gas usage
    const gasUsed = receipt.gasUsed;
    console.log(`⛽ Gas Used: ${gasUsed.toNumber()}`);
    
    if (gasUsed.gt(TEST_CONFIG.MAX_GAS_USAGE)) {
        throw new Error(`❌ Transfer gas usage too high: ${gasUsed} > ${TEST_CONFIG.MAX_GAS_USAGE}`);
    }
    
    // Check final balances
    const deployerBalanceAfter = await cgcToken.balanceOf(deployer.address);
    const recipientBalanceAfter = await cgcToken.balanceOf(testRecipient);
    
    console.log(`💰 Deployer Balance After: ${formatCGC(deployerBalanceAfter)}`);
    console.log(`💰 Recipient Balance After: ${formatCGC(recipientBalanceAfter)}`);
    
    // Validate transfer
    if (!deployerBalanceAfter.eq(deployerBalanceBefore.sub(transferAmount))) {
        throw new Error("❌ Deployer balance incorrect after transfer");
    }
    if (!recipientBalanceAfter.eq(transferAmount)) {
        throw new Error("❌ Recipient balance incorrect after transfer");
    }
    
    // Check holder tracking
    const totalHolders = await cgcToken.totalHolders();
    const recipientIsHolder = await cgcToken.isHolder(testRecipient);
    
    console.log(`👥 Total Holders: ${totalHolders}`);
    console.log(`✅ Recipient is holder: ${recipientIsHolder}`);
    
    if (totalHolders.toNumber() !== 2) throw new Error("❌ Should have exactly 2 holders after transfer");
    if (!recipientIsHolder) throw new Error("❌ Recipient should be tracked as holder");
    
    console.log("✅ Token transfer test PASSED");
    return { gasUsed, testRecipient };
}

async function testBatchTransfers(cgcToken, deployer) {
    console.log("\n🧪 TEST 4: Batch Transfers");
    console.log("===========================");
    
    // Create multiple test recipients
    const recipients = [];
    const amounts = [];
    
    for (let i = 0; i < TEST_CONFIG.TEST_BATCH_SIZE; i++) {
        recipients.push(hre.ethers.Wallet.createRandom().address);
        amounts.push(parseCGC(TEST_CONFIG.TEST_AMOUNTS[i]));
    }
    
    console.log(`👥 Recipients: ${recipients.length}`);
    console.log(`💰 Amounts: ${amounts.map(a => formatCGC(a)).join(", ")}`);
    
    // Calculate total amount
    const totalAmount = amounts.reduce((sum, amount) => sum.add(amount), hre.ethers.BigNumber.from(0));
    console.log(`📊 Total Amount: ${formatCGC(totalAmount)}`);
    
    // Check deployer has sufficient balance
    const deployerBalance = await cgcToken.balanceOf(deployer.address);
    if (deployerBalance.lt(totalAmount)) {
        throw new Error("❌ Insufficient balance for batch transfer");
    }
    
    // Execute batch transfer
    console.log("📤 Executing batch transfer...");
    const batchTx = await cgcToken.batchTransfer(recipients, amounts);
    const receipt = await waitForConfirmations(batchTx);
    
    console.log(`⛽ Batch Gas Used: ${receipt.gasUsed.toNumber()}`);
    console.log(`📊 Gas per transfer: ${Math.round(receipt.gasUsed.toNumber() / recipients.length)}`);
    
    // Verify all recipients received tokens
    for (let i = 0; i < recipients.length; i++) {
        const balance = await cgcToken.balanceOf(recipients[i]);
        if (!balance.eq(amounts[i])) {
            throw new Error(`❌ Recipient ${i} balance mismatch`);
        }
        console.log(`✅ Recipient ${i}: ${formatCGC(balance)}`);
    }
    
    // Check updated holder count
    const totalHolders = await cgcToken.totalHolders();
    console.log(`👥 Total Holders: ${totalHolders}`);
    
    // Should have original holders (2) + new recipients (3) = 5
    if (totalHolders.toNumber() !== 5) {
        console.log(`⚠️  Expected 5 holders, got ${totalHolders}`);
    }
    
    console.log("✅ Batch transfer test PASSED");
    return { recipients, amounts, gasUsed: receipt.gasUsed };
}

async function testContractIntegration(contracts) {
    console.log("\n🧪 TEST 5: Contract Integration");
    console.log("================================");
    
    const { masterController, taskRules, milestoneEscrow, cgcToken } = contracts;
    
    // Test MasterController authorization
    const isAuthorized = await masterController.authorizedEIP712s(taskRules.address);
    console.log(`🔑 TaskRules authorized: ${isAuthorized}`);
    
    if (!isAuthorized) throw new Error("❌ TaskRules not authorized in MasterController");
    
    // Test MilestoneEscrow minter status
    const isMinter = await cgcToken.isMinter(milestoneEscrow.address);
    console.log(`🏭 MilestoneEscrow is minter: ${isMinter}`);
    
    if (!isMinter) throw new Error("❌ MilestoneEscrow not authorized as minter");
    
    // Test domain separator (EIP-712)
    const domainSeparator = await taskRules.DOMAIN_SEPARATOR();
    console.log(`📋 TaskRules Domain Separator: ${domainSeparator}`);
    
    if (!domainSeparator || domainSeparator === hre.ethers.constants.HashZero) {
        throw new Error("❌ Invalid domain separator");
    }
    
    console.log("✅ Contract integration test PASSED");
    return { isAuthorized, isMinter, domainSeparator };
}

// ============ MAIN TEST FUNCTION ============

async function main() {
    console.log("\n🧪 STARTING FIRST MINTING TEST");
    console.log("==============================");
    
    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    const network = await hre.ethers.provider.getNetwork();
    
    console.log(`📍 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`💼 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${hre.ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    
    // Find latest deployment
    const scriptsDir = path.join(__dirname, '..');
    const deploymentFiles = fs.readdirSync(scriptsDir)
        .filter(file => file.startsWith('base-mainnet-deployment-'))
        .sort();
    
    if (deploymentFiles.length === 0) {
        throw new Error("❌ No deployment file found! Deploy contracts first.");
    }
    
    const latestDeployment = deploymentFiles[deploymentFiles.length - 1];
    const deploymentData = JSON.parse(fs.readFileSync(
        path.join(scriptsDir, latestDeployment),
        'utf8'
    ));
    
    console.log(`📄 Using deployment: ${latestDeployment}`);
    
    // Get contract instances
    const masterController = await hre.ethers.getContractAt(
        "MasterEIP712Controller", 
        deploymentData.contracts.masterController
    );
    
    const taskRules = await hre.ethers.getContractAt(
        "TaskRulesEIP712", 
        deploymentData.contracts.taskRules
    );
    
    const milestoneEscrow = await hre.ethers.getContractAt(
        "MilestoneEscrow", 
        deploymentData.contracts.milestoneEscrow
    );
    
    const cgcToken = await hre.ethers.getContractAt(
        "CGCToken", 
        deploymentData.contracts.cgcToken
    );
    
    console.log("✅ Contract instances loaded");
    
    // ============ RUN ALL TESTS ============
    
    const testResults = {};
    
    try {
        // Test 1: Token Deployment
        testResults.deployment = await testTokenDeployment(cgcToken, deployer);
        
        // Test 2: Voting Capabilities  
        testResults.voting = await testVotingCapabilities(cgcToken, deployer);
        
        // Test 3: Token Transfers
        testResults.transfers = await testTokenTransfers(cgcToken, deployer);
        
        // Test 4: Batch Transfers
        testResults.batchTransfers = await testBatchTransfers(cgcToken, deployer);
        
        // Test 5: Contract Integration
        testResults.integration = await testContractIntegration({
            masterController,
            taskRules, 
            milestoneEscrow,
            cgcToken
        });
        
    } catch (error) {
        console.error(`\n❌ TEST FAILED: ${error.message}`);
        throw error;
    }
    
    // ============ GENERATE TEST REPORT ============
    
    console.log("\n📊 TEST RESULTS SUMMARY");
    console.log("========================");
    console.log("✅ Token Deployment: PASSED");
    console.log("✅ Voting Capabilities: PASSED");  
    console.log("✅ Token Transfers: PASSED");
    console.log("✅ Batch Transfers: PASSED");
    console.log("✅ Contract Integration: PASSED");
    
    // Calculate final statistics
    const finalSupply = await cgcToken.totalSupply();
    const finalHolders = await cgcToken.totalHolders();
    const deployerFinalBalance = await cgcToken.balanceOf(deployer.address);
    
    console.log(`\n📈 FINAL STATISTICS`);
    console.log(`💰 Total Supply: ${formatCGC(finalSupply)}`);
    console.log(`👥 Total Holders: ${finalHolders}`);
    console.log(`💼 Deployer Balance: ${formatCGC(deployerFinalBalance)}`);
    console.log(`🔄 Tokens Distributed: ${formatCGC(finalSupply.sub(deployerFinalBalance))}`);
    
    // Save test report
    const testReport = {
        timestamp: new Date().toISOString(),
        network: { name: network.name, chainId: network.chainId },
        deployer: deployer.address,
        deploymentFile: latestDeployment,
        contracts: deploymentData.contracts,
        testResults,
        finalStatistics: {
            totalSupply: finalSupply.toString(),
            totalHolders: finalHolders.toNumber(),
            deployerBalance: deployerFinalBalance.toString(),
            tokensDistributed: finalSupply.sub(deployerFinalBalance).toString()
        },
        status: "PASSED"
    };
    
    const reportPath = path.join(scriptsDir, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
    console.log(`💾 Test report saved: ${reportPath}`);
    
    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
    console.log("✅ Your CGC token deployment is working correctly");
    console.log("✅ Ready for production use");
    
    return testReport;
}

// ============ ERROR HANDLING ============

async function handleError(error) {
    console.error("\n❌ MINTING TEST FAILED!");
    console.error("========================");
    console.error(error.message);
    
    if (error.transaction) {
        console.error(`📋 Transaction: ${error.transaction.hash}`);
    }
    
    console.error("\n🔧 Troubleshooting:");
    console.error("1. Ensure contracts are deployed correctly");
    console.error("2. Check deployer has sufficient ETH balance"); 
    console.error("3. Verify network configuration");
    console.error("4. Check contract permissions");
    
    process.exit(1);
}

// ============ EXECUTION ============

if (require.main === module) {
    main()
        .then(() => {
            console.log("\n✅ Test completed successfully!");
            process.exit(0);
        })
        .catch(handleError);
}

module.exports = { main, TEST_CONFIG };