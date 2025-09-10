# CryptoGift Coin (CGC) — Tokenomics & Distribution (Base Mainnet)

**Max Supply:** 2,000,000 CGC  
**Decimals:** 18  
**Contract:** [0x5e3a61b550328f3D8C44f60b3e10a49D3d806175](https://basescan.org/token/0x5e3a61b550328f3D8C44f60b3e10a49D3d806175) (Base Chain ID: 8453)  
**TGE (UTC):** 2025-01-31 (Token Generation Event)  
**Type:** Pure Governance Token (no economic rights)

## Initial Allocation (100%)

### Community Programs & Rewards: 40% (800,000 CGC)
- **TGE Unlock:** 10% (80,000 CGC)
- **Vesting:** 36 months, monthly linear (22,000 CGC/month)
- **Purpose:** Quest rewards, educational achievements, community incentives
- **Control:** MilestoneEscrow contract with caps

### Treasury & Operations (DAO Safe): 25% (500,000 CGC)
- **TGE Unlock:** 0%
- **Vesting:** 48 months, quarterly (31,250 CGC/quarter)
- **Governance:** All releases require DAO proposal approval
- **Purpose:** Protocol development, operations, strategic initiatives
- **Control:** Aragon DAO governance

### Contributors/Team: 15% (300,000 CGC)
- **Cliff:** 12 months
- **Vesting:** 24 months linear after cliff (12,500 CGC/month)
- **TGE Unlock:** 0%
- **Purpose:** Core team and early contributors
- **Note:** Subject to individual vesting agreements

### Liquidity Provision: 10% (200,000 CGC)
- **TGE Unlock:** 100%
- **Purpose:** DEX liquidity pools on Base (Aerodrome/Uniswap)
- **Pairs:** CGC/WETH, CGC/USDC
- **Note:** LP tokens locked for minimum 12 months

### Ecosystem Development: 10% (200,000 CGC)
- **Cliff:** 6 months
- **Vesting:** 18 months linear (11,111 CGC/month)
- **TGE Unlock:** 0%
- **Purpose:** Partnerships, integrations, grants program
- **Control:** DAO governance approval required

### Reserve & Emergency: 5% (100,000 CGC)
- **TGE Unlock:** 0%
- **Vesting:** Locked until DAO approval
- **Purpose:** Emergency situations, protocol security
- **Control:** 3/5 Multisig + DAO approval
- **Note:** Requires critical governance proposal

## Key Addresses

### Token Contract
- **CGC Token:** `0x5e3a61b550328f3D8C44f60b3e10a49D3d806175`

### Custody & Control Contracts
- **MilestoneEscrow (Rewards):** `0x8346CFcaECc90d678d862319449E5a742c03f109`
- **DAO Treasury (Aragon):** `0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31`
- **MasterEIP712Controller:** `0x67D9a01A3F7b5D38694Bb78dD39286Db75D7D869`
- **TaskRulesEIP712:** `0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb`

### Vesting Contracts (To Be Deployed)
- **Team Vesting Contract:** `TBD - pending deployment`
- **Ecosystem Reserve:** `TBD - pending deployment`
- **Emergency Multisig:** `TBD - pending setup`

### Burn Addresses (Standard)
- **Null Address:** `0x0000000000000000000000000000000000000000`
- **Dead Address:** `0x000000000000000000000000000000000000dEaD`

## Supply Calculation Methodology

```
Circulating Supply = Total Supply - (Treasury Locked + Vested/Locked + Burned + Escrow Holdings)
```

### Current Status (as of Jan 2025)
- **Total Minted:** 2,000,000 CGC
- **In Deployer Wallet:** 2,000,000 CGC (pending distribution)
- **Circulating:** 0 CGC (pre-TGE)
- **Burned:** 0 CGC

### Post-TGE Distribution Plan
1. **Immediate (Day 1):**
   - 200,000 CGC → Liquidity pools
   - 80,000 CGC → Community rewards pool
   - Total Day 1 Circulating: 280,000 CGC (14%)

2. **Month 1-12:**
   - Monthly community rewards: ~22,000 CGC
   - No team tokens (cliff period)
   - Gradual increase via rewards

3. **Month 13+:**
   - Team vesting begins
   - Ecosystem partnerships activate
   - Treasury proposals enable

## Emission Schedule & Caps

### Daily/Weekly/Monthly Caps (Community Rewards)
- **Annual Cap:** 800,000 CGC (total rewards pool)
- **Monthly Cap:** 66,666 CGC (enforced on-chain)
- **Weekly Cap:** 16,666 CGC
- **Daily User Cap:** 333 CGC
- **Post-Multiplier Cap:** 120% of base reward

### Governance Controls
All token emissions and distributions are controlled by:
1. **Smart Contract Caps:** Hard limits in MilestoneEscrow
2. **DAO Proposals:** Required for treasury and major allocations
3. **Timelock:** 48-hour delay on critical changes
4. **Multisig:** Emergency functions require 3/5 signatures

## Token Utility

### Governance Rights
- Create and vote on proposals
- Delegate voting power
- Control treasury allocations
- Modify protocol parameters

### Access & Benefits
- Premium educational content
- Priority access to new features
- NFT badges and certifications
- Community events and airdrops

### Non-Financial Benefits
- Experience multipliers
- Reduced cooldowns
- Early access to quests
- Profile customization

**Important:** CGC is a pure governance token with no economic rights, profit sharing, or revenue distribution.

## Compliance & Regulatory

- **No Revenue Sharing:** Token provides governance only
- **No Investment Contract:** Not a security under any jurisdiction
- **KYC Optional:** Not required for token holding or governance
- **Decentralized:** Progressive decentralization via DAO

## Verification & Transparency

### On-Chain Verification
- All contracts verified on BaseScan
- Vesting enforced via smart contracts
- Real-time supply tracking available
- Governance proposals public on Aragon

### Regular Reporting
- Monthly treasury reports
- Quarterly emission updates
- Annual tokenomics review
- Community dashboards

## Updates & Modifications

Any changes to tokenomics require:
1. **Community Discussion:** 7-day forum period
2. **Formal Proposal:** Via Aragon DAO
3. **Voting Period:** 7 days minimum
4. **Execution:** 48-hour timelock
5. **Documentation:** Updated in this document

---

**Last Updated:** January 9, 2025  
**Version:** 1.0  
**Status:** Pre-TGE  
**Next Review:** Post-TGE (February 2025)

## Resources

- **Whitepaper:** [Full Documentation](https://github.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/blob/main/docs/governance/whitepaper.md)
- **DAO Governance:** [Aragon App](https://app.aragon.org/#/daos/base/0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31)
- **Token Contract:** [BaseScan](https://basescan.org/token/0x5e3a61b550328f3D8C44f60b3e10a49D3d806175)
- **GitHub:** [Source Code](https://github.com/CryptoGift-Wallets-DAO)
- **Website:** [Official Site](https://crypto-gift-wallets-dao.vercel.app)

## Contact

- **Email:** dao@cryptogift-wallets.com
- **Discord:** https://discord.gg/cryptogift
- **Twitter:** @CryptoGiftDAO

---

*This document is maintained by the CryptoGift Wallets DAO community and updated via governance proposals.*