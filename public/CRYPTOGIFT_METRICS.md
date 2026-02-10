# 📊 CryptoGift Wallets DAO — Metrics & Definitions

**Version**: 1.0 | **Last Updated**: February 2026

---

## Core Metrics

| Metric | Value | Time Window | Definition | Source | Verified |
|--------|-------|-------------|------------|--------|----------|
| **Claim Rate** | 85.7% | All-time (Beta) | (Gifts Claimed / Gifts Created) × 100 | Internal Analytics | ✅ |
| **On-Chain Transactions** | 717+ | All-time | Total successful transactions on Base Mainnet | [BaseScan](https://basescan.org/token/0x5e3a61b550328f3D8C44f60b3e10a49D3d806175) | ✅ |
| **Error Rate** | 0% | All-time | (Failed Transactions / Total Transactions) × 100 | BaseScan | ✅ |
| **Smart Contracts Deployed** | 5 | Current | Verified contracts on Base Mainnet | BaseScan | ✅ |
| **Development Days** | 400+ | Since 2024 | Days of active development | Git History | ✅ |
| **Build Deployments** | 100+ | All-time | Successful CI/CD deployments | Vercel Dashboard | ✅ |
| **Languages Supported** | 2 | Current | EN, ES (i18n implemented) | Codebase | ✅ |
| **Uptime** | 99.9% | Last 90 days | (Uptime Minutes / Total Minutes) × 100 | Vercel Status | ✅ |

---

## Token Metrics (CGC)

| Metric | Value | Definition | Source | Verified |
|--------|-------|------------|--------|----------|
| **Initial Supply** | 2,000,000 CGC | Tokens minted at TGE | [BaseScan](https://basescan.org/token/0x5e3a61b550328f3D8C44f60b3e10a49D3d806175) | ✅ |
| **Max Supply** | 22,000,000 CGC | Maximum tokens possible via milestone emission | Smart Contract | ✅ |
| **Circulating Supply** | ~2,000,000 CGC | Tokens in circulation (not locked/vesting) | [API](https://mbxarts.com/api/cgc/circulating-supply) | ✅ |
| **Decimals** | 18 | Token decimal places | Smart Contract | ✅ |
| **Holders** | TBD | Unique addresses holding CGC | BaseScan | ✅ |
| **Token Standard** | ERC-20 | With Votes & Permit extensions | Smart Contract | ✅ |

---

## Governance Metrics

| Metric | Value | Definition | Source | Verified |
|--------|-------|------------|--------|----------|
| **DAO Type** | Aragon OSx v1.4.0 | Governance framework | [Aragon](https://app.aragon.org/dao/base-mainnet/0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31) | ✅ |
| **Voting Plugin** | Token Voting v1.3 | Governance mechanism | Aragon | ✅ |
| **Quorum** | 10% | Minimum participation for valid vote | DAO Config | ✅ |
| **Support Threshold** | 51% | Required approval percentage | DAO Config | ✅ |
| **Min Voting Duration** | 7 days | Minimum proposal duration | DAO Config | ✅ |
| **Min Proposer Power** | 1,000 CGC | Minimum CGC to create proposal | DAO Config | ✅ |
| **Timelock Delay** | 7 days | Delay for owner operations | [TimelockController](https://basescan.org/address/0x9753d772C632e2d117b81d96939B878D74fB5166) | ✅ |
| **Multisig Threshold** | 3/5 | Required signatures for Safe Owner | [Safe](https://basescan.org/address/0x11323672b5f9bB899Fa332D5d464CC4e66637b42) | ✅ |

---

## Liquidity Metrics

| Metric | Value | Definition | Source | Verified |
|--------|-------|------------|--------|----------|
| **DEX** | Aerodrome Finance | Primary liquidity venue | [Aerodrome](https://aerodrome.finance) | ✅ |
| **Pool Pair** | WETH/CGC | Trading pair | Aerodrome | ✅ |
| **Pool Address** | 0x3032f627... | Liquidity pool contract | [BaseScan](https://basescan.org/address/0x3032f62729513ec8a328143f7d5926b5257a43cd) | ✅ |
| **Pool TVL** | ~$100 USD | Total Value Locked (variable) | Aerodrome | ✅ |

---

## Community Metrics

| Metric | Value | Time Window | Definition | Source | Verified |
|--------|-------|-------------|------------|--------|----------|
| **Discord Members** | Active | Current | Members in Discord server | [Discord](https://discord.gg/XzmKkrvhHc) | ✅ |
| **Discord Channels** | 21 | Current | Total channels configured | Discord | ✅ |
| **Discord Roles** | 10 | Current | Configured permission roles | Discord | ✅ |
| **Telegram Members** | Active | Current | Members in Telegram group | [Telegram](https://t.me/cryptogiftwalletsdao) | ✅ |
| **X/Twitter Followers** | TBD | Current | @cryptogiftdao followers | [X](https://x.com/cryptogiftdao) | ✅ |
| **Giveth Status** | Published | Current | Project published on Giveth | [Giveth](https://giveth.io/project/cryptogift-wallets-dao) | ✅ |

---

## Technical Infrastructure Metrics

| Metric | Value | Definition | Source | Verified |
|--------|-------|------------|--------|----------|
| **Hosting** | Vercel | Frontend hosting platform | Vercel Dashboard | ✅ |
| **Database** | Supabase | PostgreSQL database | Supabase Dashboard | ✅ |
| **RPC Provider** | Base Public + Alchemy | Blockchain connectivity | Config | ✅ |
| **IPFS Provider** | NFT.Storage | Metadata storage | Config | ✅ |
| **Cache** | Upstash Redis | Caching layer | Config | ✅ |
| **Paymaster** | Biconomy | Gas sponsorship | Config | ✅ |

---

## Competitive Benchmark

| Metric | CryptoGift | Industry Average | Source |
|--------|------------|------------------|--------|
| **Claim Rate** | 85.7% | 3-4% | Internal vs Industry Reports |
| **Onboarding Time** | 5 minutes | 15-30 minutes | User Testing |
| **Gas Cost (User)** | $0 | $1-10 | Transaction Analysis |
| **Wallet Required** | No | Yes | Feature Comparison |
| **Non-Custodial** | Yes | Mostly No | Architecture Review |

---

## Metric Definitions Glossary

### Claim Rate
- **Definition**: Percentage of created gifts that are successfully claimed by recipients
- **Formula**: `(Total Gifts Claimed / Total Gifts Created) × 100`
- **Why It Matters**: Primary indicator of product-market fit and user experience quality
- **Industry Benchmark**: Traditional crypto gift cards see 3-4% claim rates

### On-Chain Transactions
- **Definition**: Total number of successful blockchain transactions related to CryptoGift
- **Includes**: Token transfers, gift creations, claims, governance votes
- **Excludes**: Failed/reverted transactions
- **Source**: Direct from BaseScan API/Explorer

### Error Rate
- **Definition**: Percentage of attempted transactions that fail or revert
- **Formula**: `(Failed Transactions / Total Transaction Attempts) × 100`
- **Target**: <1% for production quality

### Circulating Supply
- **Definition**: Total tokens available for trading (not locked, vesting, or burned)
- **Formula**: `Total Supply - (Locked + Vesting + Burned + Escrow)`
- **API Endpoint**: `https://mbxarts.com/api/cgc/circulating-supply`

### TVL (Total Value Locked)
- **Definition**: Total value of assets deposited in liquidity pools
- **Measurement**: USD value at current market prices
- **Volatility**: Changes with token price and liquidity additions/removals

---

## Verification Links

| Contract/Resource | Address/Link | Verification |
|-------------------|--------------|--------------|
| CGC Token | `0x5e3a61b550328f3D8C44f60b3e10a49D3d806175` | [BaseScan ✅](https://basescan.org/token/0x5e3a61b550328f3D8C44f60b3e10a49D3d806175) |
| TimelockController | `0x9753d772C632e2d117b81d96939B878D74fB5166` | [BaseScan ✅](https://basescan.org/address/0x9753d772C632e2d117b81d96939B878D74fB5166) |
| MinterGateway | `0xdd10540847a4495e21f01230a0d39C7c6785598F` | [BaseScan ✅](https://basescan.org/address/0xdd10540847a4495e21f01230a0d39C7c6785598F) |
| MasterEIP712Controller | `0x67D9a01A3F7b5D38694Bb78dD39286Db75D7D869` | [BaseScan ✅](https://basescan.org/address/0x67D9a01A3F7b5D38694Bb78dD39286Db75D7D869) |
| TaskRulesEIP712 | `0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb` | [BaseScan ✅](https://basescan.org/address/0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb) |
| MilestoneEscrow | `0x8346CFcaECc90d678d862319449E5a742c03f109` | [BaseScan ✅](https://basescan.org/address/0x8346CFcaECc90d678d862319449E5a742c03f109) |
| Aragon DAO | `0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31` | [Aragon ✅](https://app.aragon.org/dao/base-mainnet/0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31) |
| Safe Owner (3/5) | `0x11323672b5f9bB899Fa332D5d464CC4e66637b42` | [BaseScan ✅](https://basescan.org/address/0x11323672b5f9bB899Fa332D5d464CC4e66637b42) |
| Safe Guardian (2/3) | `0xe9411DD1f2AF42186b2bCE828B6e7d0dd0D7a6bc` | [BaseScan ✅](https://basescan.org/address/0xe9411DD1f2AF42186b2bCE828B6e7d0dd0D7a6bc) |
| Aerodrome Pool | `0x3032f62729513ec8a328143f7d5926b5257a43cd` | [BaseScan ✅](https://basescan.org/address/0x3032f62729513ec8a328143f7d5926b5257a43cd) |

---

## Data Update Schedule

| Metric Category | Update Frequency | Method |
|-----------------|------------------|--------|
| On-Chain Metrics | Real-time | BaseScan API |
| Token Metrics | Real-time | Smart Contract Reads |
| Community Metrics | Weekly | Manual Count |
| Infrastructure Metrics | Daily | Dashboard Aggregation |

---

## Notes

1. **All on-chain metrics are verifiable** via BaseScan links provided
2. **Community metrics may fluctuate** based on platform activity
3. **Liquidity metrics are volatile** and depend on market conditions
4. **Historical data available** upon request for due diligence

---

Made by mbxarts.com | The Moon in a Box property
