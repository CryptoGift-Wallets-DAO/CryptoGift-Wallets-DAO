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

**Fase**: Implementación Inicial  
**Red**: Base Mainnet  
**DAO Desplegado**: ✅ `0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31`  
**Token**: CGC (CryptoGift Coin) - 1,000,000 supply  
**Framework**: Aragon OSx v1.4.0

## 🚀 Quick Start

### Prerrequisitos

- Node.js v18+
- Git
- Una wallet con ETH en Base

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/cryptogift-wallets/dao.git
cd cryptogift-wallets-DAO

# 🟢 IMPORTANTE: Este proyecto usa PNPM
pnpm install

# Configurar ambiente
cp .env.example .env.dao
# Editar .env.dao con tus valores
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

### Deployment (YA COMPLETADO ✅)

```bash
# ✅ Estado actual: Todos los contratos desplegados
# CGC Token: 0xe8AF8cF18DA5c540daffe76Ae5fEE31C80c74899
# GovTokenVault: 0xF5606020e772308cc66F2fC3D0832bf9E17E68e0
# AllowedSignersCondition: 0x6101CAAAD91A848d911171B82369CF90B8B00597
# MerklePayouts: 0xC75Be1A1fCb412078102b7C286d12E8ACc75b922

# Para re-deployment (si necesario):
pnpm exec hardhat run scripts/deploy-production-final.js --network base
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

## 🔧 Contratos Principales

### GovTokenVault
- **Función**: Custodia y liberación programática de CGC
- **Features**: EIP-712, ERC-1271, Anti-replay, Caps, Shadow mode
- **Address**: `[Por desplegar]`

### CGC Token
- **Tipo**: ERC-20
- **Supply**: 1,000,000 CGC
- **Decimales**: 18
- **Address**: `[Por desplegar]`

### AllowedSignersCondition
- **Función**: Control de firmantes autorizados
- **Integración**: Aragon permission system
- **Address**: `[Por desplegar]`

## 🎯 Features Principales

- ✅ **Liberación Programática**: Tokens liberados al cumplir metas
- ✅ **Verificación On-chain**: Attestations via EAS
- ✅ **Firma del DAO**: ERC-1271 con Aragon
- ✅ **Anti-replay**: Nonces y deadlines
- ✅ **Rate Limiting**: Caps globales y por usuario
- ✅ **Shadow Mode**: Testing sin transferencias reales
- ✅ **Batch Operations**: Merkle trees para distribuciones masivas
- 🚧 **Streams**: Pagos continuos via Superfluid (próximamente)

## 📊 Tokenomics

| Categoría | % | Cantidad |
|-----------|---|----------|
| Recompensas Educativas | 40% | 400,000 CGC |
| Tesoro DAO | 25% | 250,000 CGC |
| Core Contributors | 15% | 150,000 CGC |
| Desarrollo Ecosistema | 10% | 100,000 CGC |
| Liquidez | 5% | 50,000 CGC |
| Reserva Emergencia | 5% | 50,000 CGC |

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