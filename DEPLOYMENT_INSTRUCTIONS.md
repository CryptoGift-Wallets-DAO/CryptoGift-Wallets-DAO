# 🚀 CryptoGift DAO Production Deployment Instructions

## 📋 Overview

Complete deployment guide for the CryptoGift DAO 3-layer security architecture on Base Mainnet. This will deploy 2,000,000 CGC tokens with the complete visual ranking system.

## ⚠️ CRITICAL SECURITY NOTICE

**NEVER commit or expose your private keys!** All sensitive information should be stored in `.env.deployment` which is protected by `.gitignore`.

## 🔧 Prerequisites

### 1. Base Mainnet Requirements
- Minimum 0.02 ETH on Base Mainnet for deployment
- Base Mainnet RPC URL (https://mainnet.base.org)
- BaseScan API key from https://basescan.org/apis

### 2. Environment Setup
```bash
# Copy the environment template
cp .env.deployment.example .env.deployment

# Fill in your actual values (NEVER commit this file)
nano .env.deployment
```

### 3. Required Environment Variables
```bash
# Critical - Your deployment private key
DEPLOYER_PRIVATE_KEY=0x...

# Network configuration
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_api_key_here

# Optional but recommended
SENTRY_DSN=your_sentry_dsn
DISCORD_WEBHOOK_URL=your_discord_webhook
```

## 🚀 Deployment Process

### Method 1: One-Command Deployment (Recommended)
```bash
# Make script executable (if needed)
chmod +x scripts/DEPLOY_PRODUCTION.sh

# Run complete deployment process
./scripts/DEPLOY_PRODUCTION.sh
```

This script will:
1. ✅ Run pre-flight checks
2. 🔨 Compile all contracts
3. 🚀 Deploy to Base Mainnet
4. 🔍 Verify on BaseScan
5. 🧪 Run comprehensive tests
6. 📊 Generate deployment report

### Method 2: Manual Step-by-Step

#### Step 1: Deploy Contracts
```bash
pnpm hardhat run scripts/deploy/deploy-base-mainnet-final.js --network base --config hardhat.config.production.js
```

#### Step 2: Verify Contracts
```bash
pnpm hardhat run scripts/verify-base-mainnet.js --network base --config hardhat.config.production.js
```

#### Step 3: Test Deployment
```bash
pnpm hardhat run scripts/test-first-mint.js --network base --config hardhat.config.production.js
```

## 📊 Expected Results

### Contracts Deployed
1. **MasterEIP712Controller** - Owner control layer
2. **TaskRulesEIP712** - Validation layer  
3. **MilestoneEscrow** - Custody layer
4. **CGCToken** - 2,000,000 CGC tokens

### Token Configuration
- **Name**: CryptoGift Coin
- **Symbol**: CGC
- **Decimals**: 18
- **Total Supply**: 2,000,000 CGC
- **Logo**: Integrated CGC monkey logo 🦍

### Security Features
- 3-layer architecture validation
- EIP-712 structured signatures
- 15-minute signature validity
- Rate limiting and circuit breakers
- No token amount limits (unlimited minting capability)

## 🔍 Verification Checklist

After deployment, verify:

- [ ] All 4 contracts deployed successfully
- [ ] All contracts verified on BaseScan
- [ ] Total supply is exactly 2,000,000 CGC
- [ ] Deployer received all initial tokens
- [ ] MasterController authorizes TaskRules
- [ ] MilestoneEscrow has minter permissions
- [ ] Token transfers work correctly
- [ ] Batch transfers work correctly
- [ ] Voting delegation works
- [ ] Logo URI points to CGC logo

## 📁 Generated Files

The deployment will create:
- `base-mainnet-deployment-TIMESTAMP.json` - Contract addresses and config
- `verification-report-TIMESTAMP.json` - BaseScan verification results  
- `test-report-TIMESTAMP.json` - Test execution results

**⚠️ These files contain sensitive information and are git-ignored for security.**

## 🌐 Frontend Configuration

After successful deployment, update your frontend `.env.local`:

```bash
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# Copy these from your deployment file
NEXT_PUBLIC_MASTER_CONTROLLER_ADDRESS=0x...
NEXT_PUBLIC_TASK_RULES_ADDRESS=0x...
NEXT_PUBLIC_MILESTONE_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_CGC_TOKEN_ADDRESS=0x...
```

## 🖥️ Backend Configuration

Update `ranking-backend/.env`:

```bash
BASE_RPC_URL=https://mainnet.base.org
CHAIN_ID=8453

# Copy contract addresses from deployment
MASTER_CONTROLLER_ADDRESS=0x...
TASK_RULES_ADDRESS=0x...
MILESTONE_ESCROW_ADDRESS=0x...
CGC_TOKEN_ADDRESS=0x...

# Your other backend config
SUPABASE_URL=...
REDIS_URL=...
```

## 🔗 BaseScan Links

After deployment, your contracts will be available at:
- MasterController: `https://basescan.org/address/0x...`
- TaskRules: `https://basescan.org/address/0x...`
- MilestoneEscrow: `https://basescan.org/address/0x...`
- CGCToken: `https://basescan.org/address/0x...`

## 🧪 Post-Deployment Testing

Run additional tests to ensure everything works:

```bash
# Test token functionality
pnpm hardhat run scripts/test-token-functions.js --network base

# Test escrow functionality  
pnpm hardhat run scripts/test-escrow-functions.js --network base

# Test EIP-712 signatures
pnpm hardhat run scripts/test-eip712-signatures.js --network base
```

## 🚨 Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Ensure you have at least 0.02 ETH on Base Mainnet
   - Check gas price settings in environment

2. **"Already Verified"**
   - Normal message if contracts were previously verified
   - Check BaseScan links to confirm verification

3. **"Signature validation failed"**
   - Check your private key format (must start with 0x)
   - Ensure you're using the correct network

4. **"Contract not deployed"**
   - Check transaction was mined successfully
   - Verify correct network configuration

### Recovery Commands

```bash
# Check deployment status
pnpm hardhat deployment-summary

# Retry verification only
pnpm hardhat run scripts/verify-base-mainnet.js --network base

# Retry testing only
pnpm hardhat run scripts/test-first-mint.js --network base
```

## 🔒 Security Best Practices

### Immediate Actions
1. **Secure your private keys** - Use hardware wallet for production
2. **Enable BaseScan alerts** - Monitor contract activity
3. **Set up monitoring** - Sentry for error tracking
4. **Backup deployment files** - Store securely offline

### Ongoing Security
1. Regular security audits of contract interactions
2. Monitor token holder activity
3. Track unusual transaction patterns
4. Keep emergency pause mechanisms ready

## 📋 Next Steps After Deployment

1. **Update documentation** with contract addresses
2. **Deploy ranking backend** with new configuration
3. **Deploy frontend** to production
4. **Set up monitoring** dashboards
5. **Create first task batches** for testing
6. **Announce launch** to community

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ All contracts deployed and verified
- ✅ 2,000,000 CGC tokens minted
- ✅ All tests passing
- ✅ Logo displaying correctly
- ✅ Ready for production use

## 📞 Support

If you encounter issues:
1. Check this documentation first
2. Review error messages carefully
3. Check network status and gas prices
4. Verify environment configuration
5. Contact the development team if needed

---

**🦍 Your CryptoGift DAO is ready to launch on Base Mainnet!**

Made by mbxarts.com The Moon in a Box property

Co-Author: Godez22