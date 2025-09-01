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

**Fase**: ✅ PRODUCTION READY - Sistema Completamente Operacional  
**Red**: Base Mainnet (Chain ID: 8453)  
**DAO Desplegado**: ✅ `0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31`  
**Token**: CGC (CryptoGift Coin) - ✅ 2,000,000 supply con logo GitHub  
**Framework**: Aragon OSx v1.4.0 + Sistema EIP-712 personalizado  
**Última Actualización**: 31 Enero 2025 - Deployment completo con máxima excelencia

## 🚀 Quick Start

### Prerrequisitos

- Node.js v18+
- Git
- Una wallet con ETH en Base
- OpenAI API Key (para el agente AI)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/cryptogift-wallets/dao.git
cd cryptogift-wallets-DAO

# 🟢 IMPORTANTE: Este proyecto usa PNPM
pnpm install

# Configurar ambiente
cp .env.example .env.local
# Editar .env.local con tus valores (incluir OPENAI_API_KEY)

# Iniciar en desarrollo
pnpm dev
```

### 🤖 **NUEVO: Agente IA Integrado**

```bash
# Acceder al agente web integrado
http://localhost:3000/agent

# Usar en tu código React
import { AgentChat } from '@/components/agent/AgentChat';

<AgentChat userId="user123" initialMode="general" />
```

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

### Deployment (✅ COMPLETADO CON MÁXIMA EXCELENCIA - 31 ENE 2025)

```bash
# ✅ NUEVO SISTEMA COMPLETO - PRODUCTION READY
# CGC Token (2M): 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
# MasterEIP712Controller: 0x67D9a01A3F7b5D38694Bb78dD39286Db75D7D869
# TaskRulesEIP712: 0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb
# MilestoneEscrow: 0x8346CFcaECc90d678d862319449E5a742c03f109

# ✅ VERIFICACIÓN BASESCAN: Todos los contratos muestran badge verde "Source Code"
# ✅ TESTING: Sistema completamente probado y operacional

# CONTRATOS ANTERIORES (DEPRECATED):
# CGC Token OLD (1M): 0xe8AF8cF18DA5c540daffe76Ae5fEE31C80c74899
# GovTokenVault: 0xF5606020e772308cc66F2fC3D0832bf9E17E68e0 
# AllowedSignersCondition: 0x6101CAAAD91A848d911171B82369CF90B8B00597
# MerklePayouts: 0xC75Be1A1fCb412078102b7C286d12E8ACc75b922
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

## 🔧 Contratos Principales (✅ DESPLEGADOS 31 ENE 2025)

### CGC Token
- **Tipo**: ERC-20 with Votes & Permit
- **Supply**: 2,000,000 CGC (actualizado)
- **Logo**: GitHub CDN integrado
- **Decimales**: 18
- **Address**: `0x5e3a61b550328f3D8C44f60b3e10a49D3d806175`

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
- **Función**: Custody y liberación programática de tokens
- **Features**: Batch operations, Secure custody, Minting integration
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

## 📊 Tokenomics (ACTUALIZADO - 2M CGC Supply)

| Categoría | % | Cantidad |
|-----------|---|----------|
| Recompensas Educativas | 40% | 800,000 CGC |
| Tesoro DAO | 25% | 500,000 CGC |
| Core Contributors | 15% | 300,000 CGC |
| Desarrollo Ecosistema | 10% | 200,000 CGC |
| Liquidez | 5% | 100,000 CGC |
| Reserva Emergencia | 5% | 100,000 CGC |

**Total Supply**: 2,000,000 CGC (actualizado desde 1M)  
**Estado Actual**: 2M CGC minteados al deployer, listos para distribución según tokenomics

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

- [Whitepaper](docs/governance/whitepaper.md)
- [Tokenomics](docs/tokenomics/tokenomics.md)
- [Manual de Gobernanza Aragon](docs/governance/aragon-manual.md)
- [Especificación EIP-712](docs/technical/spec-eip712.md)
- [Arquitectura Técnica](docs/technical/arquitectura.md)

## 🔗 Links Importantes

- **DAO en Aragon**: [Ver en Aragon App](https://app.aragon.org/dao/base-mainnet/0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31)
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
- **Twitter**: @CryptoGiftDAO

---

*Built with ❤️ by CryptoGift Wallets Community*