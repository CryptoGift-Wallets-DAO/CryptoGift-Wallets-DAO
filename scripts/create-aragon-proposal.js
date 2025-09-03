#!/usr/bin/env node
/**
 * 🏛️ CREAR PROPUESTA EN ARAGON DAO
 * Método correcto para transferir tokens usando governance
 */

const hre = require("hardhat");
const fs = require('fs');
require('dotenv').config({ path: '.env.dao' });

const colors = {
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// ABI básica de Aragon DAO
const ARAGON_DAO_ABI = [
  "function hasPermission(address _who, address _where, bytes32 _what, bytes _how) view returns (bool)",
  "function execute(bytes32 _callId, (address to, uint256 value, bytes data)[] _actions, uint256 _allowFailureMap) payable returns (bytes[] memory execResults, uint256 failureMap)",
  "function createProposal(bytes _metadata, (address to, uint256 value, bytes data)[] _actions, uint256 _allowFailureMap, bool _approve, bool _execute, uint256 _startDate, uint256 _endDate) returns (uint256 proposalId)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)"
];

const TOKEN_VOTING_ABI = [
  "function createProposal(bytes _metadata, (address to, uint256 value, bytes data)[] _actions, uint256 _allowFailureMap) returns (uint256 proposalId)"
];

async function createAragonProposal() {
  try {
    console.log(`${colors.bright}${colors.cyan}🏛️ CREAR PROPUESTA EN ARAGON DAO${colors.reset}`);
    console.log('═'.repeat(60));

    const deploymentData = JSON.parse(
      fs.readFileSync('deployments/deployment-base-latest.json', 'utf8')
    );

    const daoAddress = deploymentData.config.aragonDAO;
    const vaultAddress = deploymentData.contracts.GovTokenVault.address;
    const tokenAddress = deploymentData.contracts.CGCToken.address;

    console.log(`🏛️ DAO: ${colors.magenta}${daoAddress}${colors.reset}`);
    console.log(`🏦 Vault: ${colors.blue}${vaultAddress}${colors.reset}`);
    console.log(`📄 Token: ${colors.green}${tokenAddress}${colors.reset}`);
    console.log('');

    const [deployer] = await hre.ethers.getSigners();
    console.log(`🔑 Proposer: ${colors.yellow}${deployer.address}${colors.reset}`);

    // Conectar al DAO
    const dao = new hre.ethers.Contract(daoAddress, ARAGON_DAO_ABI, deployer);
    
    console.log(`${colors.yellow}📋 PASO 1: Verificar permisos de propuesta${colors.reset}`);
    
    try {
      // Verificar si podemos crear propuestas
      const supportsInterface = await dao.supportsInterface("0x01ffc9a7");
      console.log(`   Interface ERC165: ${colors.green}${supportsInterface}${colors.reset}`);
    } catch (error) {
      console.log(`   ${colors.red}❌ Error verificando interface: ${error.message}${colors.reset}`);
    }

    console.log(`${colors.yellow}📋 PASO 2: Preparar acción de transferencia${colors.reset}`);
    
    const CGCToken = await hre.ethers.getContractAt("CGCToken", tokenAddress);
    const transferAmount = hre.ethers.parseEther("400000");
    
    // Crear la acción
    const action = {
      to: tokenAddress,
      value: 0,
      data: CGCToken.interface.encodeFunctionData("transfer", [vaultAddress, transferAmount])
    };

    console.log(`   Target: ${colors.blue}${action.to}${colors.reset}`);
    console.log(`   Value: ${action.value} ETH`);
    console.log(`   Data: ${action.data.slice(0, 42)}...`);

    // Crear metadata de la propuesta
    const metadata = {
      title: "Initial Token Distribution to Vault",
      description: "Transfer 400,000 CGC tokens (40% of supply) from DAO treasury to GovTokenVault according to established tokenomics. This is essential for the DAO to function properly and distribute rewards to contributors.",
      actions: [{
        to: action.to,
        value: action.value.toString(),
        data: action.data,
        description: "Transfer 400,000 CGC to vault"
      }],
      timestamp: new Date().toISOString(),
      proposer: deployer.address
    };

    const metadataBytes = hre.ethers.toUtf8Bytes(JSON.stringify(metadata));

    console.log(`${colors.yellow}📋 PASO 3: Intentar crear propuesta${colors.reset}`);
    
    try {
      // Método 1: Crear propuesta directa
      const tx = await dao.createProposal(
        metadataBytes,
        [action],
        0, // allowFailureMap - 0 significa que no permitimos fallos
        false, // approve - no auto-aprobar
        false, // execute - no auto-ejecutar
        Math.floor(Date.now() / 1000), // startDate - ahora
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // endDate - 1 semana
      );

      console.log(`   TX Hash: ${colors.blue}${tx.hash}${colors.reset}`);
      const receipt = await tx.wait();
      
      console.log(`${colors.green}✅ PROPUESTA CREADA${colors.reset}`);
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);

      // Extraer proposal ID del evento
      const proposalId = receipt.logs[0]?.topics[1] || "unknown";
      console.log(`   Proposal ID: ${colors.bright}${proposalId}${colors.reset}`);

      return {
        success: true,
        txHash: tx.hash,
        proposalId,
        blockNumber: receipt.blockNumber
      };

    } catch (createError) {
      console.log(`   ${colors.yellow}⚠️  Método directo falló: ${createError.message}${colors.reset}`);
      
      // Método 2: Intentar con TokenVoting plugin
      console.log(`${colors.yellow}📋 PASO 4: Intentar con TokenVoting plugin${colors.reset}`);
      
      try {
        const tokenVoting = new hre.ethers.Contract(daoAddress, TOKEN_VOTING_ABI, deployer);
        
        const tx = await tokenVoting.createProposal(
          metadataBytes,
          [action],
          0 // allowFailureMap
        );

        const receipt = await tx.wait();
        
        console.log(`${colors.green}✅ PROPUESTA CREADA VIA TOKEN VOTING${colors.reset}`);
        
        return {
          success: true,
          method: "tokenVoting",
          txHash: tx.hash,
          blockNumber: receipt.blockNumber
        };

      } catch (tokenVotingError) {
        console.log(`   ${colors.red}❌ TokenVoting también falló: ${tokenVotingError.message}${colors.reset}`);
      }
    }

    // Si todo falla, crear archivo para uso manual
    console.log(`${colors.yellow}📋 PASO 5: Crear archivos para propuesta manual${colors.reset}`);
    
    const proposalData = {
      dao: daoAddress,
      metadata,
      actions: [action],
      calldata: action.data,
      target: action.to,
      value: action.value,
      description: "Transfer 400,000 CGC to vault",
      aragon_url: `https://app.aragon.org/#/daos/base/${daoAddress}`,
      manual_instructions: {
        step1: "Go to https://app.aragon.org",
        step2: `Connect to DAO: ${daoAddress}`,
        step3: "Create new proposal",
        step4: `Target: ${action.to}`,
        step5: `Calldata: ${action.data}`,
        step6: "Submit and vote"
      }
    };

    const filename = `manual-proposal-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(proposalData, null, 2));
    
    console.log(`${colors.green}✅ Propuesta manual creada: ${filename}${colors.reset}`);
    console.log('');
    
    console.log(`${colors.bright}${colors.cyan}🚀 INSTRUCCIONES MANUALES:${colors.reset}`);
    console.log(`1. Ir a: ${colors.blue}https://app.aragon.org${colors.reset}`);
    console.log(`2. Conectar a DAO: ${colors.magenta}${daoAddress}${colors.reset}`);
    console.log(`3. Crear nueva propuesta`);
    console.log(`4. Target Contract: ${colors.green}${action.to}${colors.reset}`);
    console.log(`5. Function: transfer(address,uint256)`);
    console.log(`6. Parameters: ${colors.blue}${vaultAddress}${colors.reset}, ${colors.yellow}400000000000000000000000${colors.reset}`);
    console.log(`7. Submit y votar`);

    return {
      success: true,
      method: "manual",
      filename,
      instructions: proposalData.manual_instructions
    };

  } catch (error) {
    console.error(`${colors.red}💥 Error creando propuesta: ${error.message}${colors.reset}`);
    throw error;
  }
}

if (require.main === module) {
  createAragonProposal()
    .then((result) => {
      console.log('\n📊 Result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createAragonProposal };