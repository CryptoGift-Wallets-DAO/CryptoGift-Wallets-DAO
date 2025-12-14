# 🏛️ CryptoGift Wallets DAO

> From zero to Web3—together. Learn. Earn. Co-govern.

## 🤖 INICIO RÁPIDO PARA CLAUDE SESSIONS

**🚨 IMPORTANTE**: Si vienes de un crash de Claude CLI, lee **PRIMERO** el archivo [`CLAUDE.md`](./CLAUDE.md) para recuperar el contexto completo.

### 📚 Archivos Críticos para Iniciar
1. **[`CLAUDE.md`](./CLAUDE.md)** - Información de sesión y comandos esenciales
2. **[`CLAUDE_CRASH_PREVENTION.md`](./CLAUDE_CRASH_PREVENTION.md)** - Anti-crash protocol
3. **[`SESION_CONTINUIDAD_30AGO2025.md`](./SESION_CONTINUIDAD_30AGO2025.md)** - Contexto de última sesión

### ⚡ Verificación Inmediata
```bash
# Estado de contratos desplegados
node scripts/verify-contracts-external.js

# Estado completo del proyecto
node scripts/emergency-toolkit.js status
```

## 📋 Estado del Proyecto

**Fase**: ✅ PRODUCTION READY - Sistema Competitivo + Token Metadata Completamente Operacional
**Red**: Base Mainnet (Chain ID: 8453)
**DAO Desplegado**: ✅ `0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31`
**Token**: CGC (CryptoGift Coin) - ✅ 2M initial supply (22M max via milestone-based emission) + logo GitHub + CoinGecko APIs
**Framework**: Aragon OSx v1.4.0 + Sistema EIP-712 personalizado
**Última Actualización**: 7 Diciembre 2025 - Milestone-based progressive emission model implemented

## 🚀 Quick Start

### Prerrequisitos

- Node.js v18+
- Git
- Una wallet con ETH en Base
- OpenAI API Key (para el agente AI)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO.git
cd CryptoGift-Wallets-DAO

# 🟢 IMPORTANTE: Este proyecto usa PNPM
pnpm install

# Configurar ambiente
cp .env.example .env.local
# Editar .env.local con tus valores (incluir OPENAI_API_KEY)

# Iniciar en desarrollo
pnpm dev
```

### 🤖 **apeX Agent - GPT-5 con Máximo Reasoning**

**🚀 UPGRADE 4 SEP 2025**: apeX ahora utiliza GPT-5 con capacidades de reasoning avanzadas + acceso real a toda la documentación del proyecto.

```bash
# Acceder al agente web integrado
http://localhost:3000/agent

# Acceder desde burbuja flotante en cualquier página
# → Burbuja con imagen apeX22.PNG en esquina inferior derecha

# Usar en tu código React
import { AgentChat } from '@/components/agent/AgentChat';
import { ApexAgent } from '@/components/agent/ApexAgent';

<AgentChat userId="user123" initialMode="technical" />
<ApexAgent /> // Burbuja flotante global
```

**Características apeX Agent v2.0:**
- ✅ **GPT-5** con `reasoning_effort: "high"` (máximo juice)
- ✅ **MCP Integration** - Acceso real a TODOS los archivos del proyecto
- ✅ **Smart UI** - Auto-scroll mejorado, input continuo
- ✅ **Custom Images** - apeX22.PNG bubble + apeX.png header icon
- ✅ **3000 tokens** - Mayor capacidad de respuesta
- ✅ **Tool Calling** - Puede leer documentación, buscar archivos, obtener estructura

### 🚨 Package Manager Policy

**🟢 PNPM** (todo el proyecto):
```bash
pnpm install              # Dependencias
pnpm run compile          # Compilar contratos  
pnpm exec hardhat test    # Tests
pnpm exec hardhat run scripts/deploy-production-final.js --network base
```

**🟡 NPM** (solo Claude CLI):
```bash
npm install -g @anthropic-ai/claude-code  # ÚNICA excepción
```

### Deployment (✅ COMPLETADO - GOVERNANCE UPDATE DIC 2025)

```bash
# ✅ CORE CONTRACTS
# CGC Token (2M initial, 22M max): 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
# Aragon DAO: 0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31

# ✅ GOVERNANCE CONTRACTS (NEW - DIC 2025)
# TimelockController (7-day delay): 0x9753d772C632e2d117b81d96939B878D74fB5166
# MinterGateway v3.3 (20M max): 0xdd10540847a4495e21f01230a0d39C7c6785598F

# ✅ TASK SYSTEM CONTRACTS
# MasterEIP712Controller: 0x67D9a01A3F7b5D38694Bb78dD39286Db75D7D869
# TaskRulesEIP712: 0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb
# MilestoneEscrow: 0x8346CFcaECc90d678d862319449E5a742c03f109

# ✅ VERIFICACIÓN BASESCAN: Todos los contratos muestran badge verde "Source Code"

# GOVERNANCE CHAIN: Aragon DAO → TimelockController → CGC Token Owner
```

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Quest Platform │────▶│  EAS Attestor │────▶│    Aragon   │
│  (Wonderverse)  │     │     (Bot)     │     │     DAO     │
└─────────────────┘     └──────────────┘     └─────────────┘
                               │                      │
                               ▼                      ▼
                        ┌──────────────┐      ┌─────────────┐
                        │     EAS      │      │ GovToken    │
                        │  Attestation │      │   Vault     │
                        └──────────────┘      └─────────────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │  CGC Token  │
                                              │   Holder    │
                                              └─────────────┘
```

## 📁 Estructura del Proyecto

```
cryptogift-wallets-DAO/
├── contracts/              # Smart contracts
│   ├── GovTokenVault.sol  # Vault principal
│   ├── conditions/        # Condiciones Aragon
│   └── interfaces/        # Interfaces
├── scripts/               # Scripts de deployment
│   ├── deploy/           # Deploy contracts
│   └── operations/       # Operaciones DAO
├── bots/                 # Servicios automatizados
│   ├── eas-attestor/    # Bot de attestations
│   └── discord-bot/     # Bot de Discord
├── docs/                # Documentación
│   ├── governance/      # Gobernanza y DAO
│   ├── tokenomics/      # Economía del token
│   └── technical/       # Especificaciones
└── tests/              # Tests
```

## 🔧 Contratos Principales (✅ ACTUALIZADO DIC 2025)

### CGC Token
- **Tipo**: ERC-20 with Votes & Permit (ERC20Votes)
- **Initial Supply**: 2,000,000 CGC (current circulating)
- **Max Supply**: 22,000,000 CGC (via MinterGateway progressive emission)
- **Owner**: TimelockController (7-day delay for security)
- **Logo**: GitHub CDN integrado + BaseScan compatible
- **Metadata**: Logos optimizados (64x64, 256x256, 512x512), SVG, tokenlist
- **APIs**: Total Supply + Circulating Supply (CoinGecko compliant)
- **Decimales**: 18
- **Address**: `0x5e3a61b550328f3D8C44f60b3e10a49D3d806175`

### TimelockController (NEW - DIC 2025)
- **Función**: 7-day delay for CGC token owner operations
- **Proposer/Executor**: Aragon DAO (`0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31`)
- **Seguridad**: Prevents immediate malicious changes to token
- **Address**: `0x9753d772C632e2d117b81d96939B878D74fB5166`

### MinterGateway v3.3 (NEW - DIC 2025)
- **Función**: Primary minting mechanism with supply cap
- **Max Mintable**: 20,000,000 CGC (total max supply: 22M)
- **Seguridad**: Requires authorized caller approval, pausable
- **Owner**: Safe 3/5 Multisig
- **Address**: `0xdd10540847a4495e21f01230a0d39C7c6785598F`

### MasterEIP712Controller
- **Función**: Control de autorizaciones EIP-712
- **Features**: Rate limiting, Multi-admin, Emergency controls
- **Seguridad**: 3-layer authorization system
- **Address**: `0x67D9a01A3F7b5D38694Bb78dD39286Db75D7D869`

### TaskRulesEIP712
- **Función**: Validación de tareas y cálculo de recompensas
- **Features**: Complexity levels 1-5, Custom rewards sin límites
- **Integración**: EIP-712 structured signing
- **Address**: `0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb`

### MilestoneEscrow
- **Función**: Task reward distribution (transfers, no minting)
- **Features**: Batch operations, Secure custody, EIP-712 verification
- **Seguridad**: Master-controlled authorization
- **Address**: `0x8346CFcaECc90d678d862319449E5a742c03f109`

## 🎯 Features Principales

### Smart Contracts & DAO
- ✅ **Liberación Programática**: Tokens liberados al cumplir metas
- ✅ **Verificación On-chain**: Attestations via EAS
- ✅ **Firma del DAO**: ERC-1271 con Aragon
- ✅ **Anti-replay**: Nonces y deadlines
- ✅ **Rate Limiting**: Caps globales y por usuario
- ✅ **Shadow Mode**: Testing sin transferencias reales
- ✅ **Batch Operations**: Merkle trees para distribuciones masivas
- 🚧 **Streams**: Pagos continuos via Superfluid (próximamente)

### 🤖 **AI Agent (NUEVO)**
- ✅ **GPT-5 Thinking Mode**: Razonamiento avanzado con chain-of-thought
- ✅ **Acceso Documental en Tiempo Real**: MCP Streamable HTTP
- ✅ **Streaming SSE**: Respuestas en tiempo real
- ✅ **4 Modos Especializados**: General, Técnico, Gobernanza, Operaciones
- ✅ **Seguridad Enterprise**: Rate limiting, audit logging, sesiones
- ✅ **Citaciones Automáticas**: Referencias a documentación
- ✅ **Componente React**: Integración plug-and-play
- ✅ **API RESTful**: Endpoints para integraciones custom

## 📊 Tokenomics - Milestone-Based Progressive Emission Model

### Initial Distribution (2M CGC)

| Categoría | % | Cantidad |
|-----------|---|----------|
| Recompensas Educativas | 40% | 800,000 CGC |
| Tesoro DAO | 25% | 500,000 CGC |
| Core Contributors | 15% | 300,000 CGC |
| Desarrollo Ecosistema | 10% | 200,000 CGC |
| Liquidez | 5% | 100,000 CGC |
| Reserva Emergencia | 5% | 100,000 CGC |

**Initial Supply**: 2,000,000 CGC (current circulating)
**Max Supply**: 22,000,000 CGC (theoretical maximum via MinterGateway)
**Emission Model**: Governance-Controlled Progressive Minting
- New tokens minted via MinterGateway v3.3 (`0xdd10540847a4495e21f01230a0d39C7c6785598F`)
- Gateway enforces 20M max mintable cap (total 22M with initial 2M)
- CGC Token owner: TimelockController (7-day delay for security)
- Governance chain: Aragon DAO → TimelockController → CGC Token
- Prevents arbitrary dilution while enabling sustainable ecosystem growth

## 🏛️ Gobernanza

### Parámetros de Votación
- **Quórum**: 10% del supply circulante
- **Umbral**: 51% mayoría simple
- **Duración**: 7 días mínimo
- **Poder mínimo para proponer**: 1,000 CGC

### Tipos de Propuestas
- **REL**: Liberación de tokens
- **PAR**: Cambio de parámetros
- **INT**: Integraciones
- **EMR**: Emergencias

## 🔐 Seguridad

### Medidas Implementadas
- ✅ Pausable contracts
- ✅ Reentrancy guards
- ✅ Signature verification (EIP-712 + ERC-1271)
- ✅ Time-based restrictions (TTL, cooldowns)
- ✅ Amount caps and limits
- ✅ Multi-signature emergency controls

### Auditorías
- [ ] Auditoría de código (pendiente)
- [ ] Bug bounty program (próximamente)

## 🛠️ Desarrollo

### Compilar Contratos
```bash
npx hardhat compile
```

### Ejecutar Tests
```bash
npx hardhat test
npm run test:coverage
```

### Verificar en Basescan
```bash
npx hardhat verify --network base DEPLOYED_CONTRACT_ADDRESS
```

### Iniciar Bot de Attestations
```bash
cd bots/eas-attestor
npm install
npm start
```

## 📚 Documentación

- [Whitepaper](docs/governance/whitepaper.md) - ✅ Actualizado a 2M supply
- [Tokenomics CGC](docs/tokenomics-cgc.md) - ✅ CoinGecko compliant
- [Manual de Gobernanza Aragon](docs/governance/aragon-manual.md)
- [Especificación EIP-712](docs/technical/spec-eip712.md)
- [Arquitectura Técnica](docs/technical/arquitectura.md)

## 🔗 Links Importantes

- **DAO en Aragon**: [Ver en Aragon App](https://app.aragon.org/dao/base-mainnet/0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31)
- **Token en BaseScan**: [0x5e3a...175](https://basescan.org/token/0x5e3a61b550328f3D8C44f60b3e10a49D3d806175)
- **APIs CoinGecko**: 
  - Total Supply: `/api/cgc/total-supply`
  - Circulating Supply: `/api/cgc/circulating-supply`
- **Discord**: [Unirse](https://discord.gg/cryptogift)
- **Forum**: https://forum.cryptogift-wallets.com
- **Docs**: https://docs.cryptogift-wallets.com

## 🤝 Contribuir

1. Fork el repositorio
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT - Ver [LICENSE](LICENSE) para detalles

## ⚠️ Disclaimer

Este proyecto está en desarrollo activo. Los smart contracts no han sido auditados. Úsalos bajo tu propio riesgo.

## 👥 Equipo

- **Fundador**: Godez22
- **Desarrollo**: CryptoGift Wallets Team
- **Comunidad**: Todos los holders de CGC

## 📞 Contacto

- **Email**: dao@cryptogift-wallets.com
- **Security**: security@cryptogift-wallets.com
- **Twitter**: @cryptogiftdao

---

*Built with ❤️ by CryptoGift Wallets Community*