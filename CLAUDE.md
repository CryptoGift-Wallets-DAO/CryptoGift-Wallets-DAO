# 🤖 CLAUDE.md - GUÍA COMPLETA PARA SESIONES

## 🎯 INFORMACIÓN CRÍTICA DEL PROYECTO

### ESTADO ACTUAL (30 AGO 2025)
- **Progreso**: 50% completado (contratos desplegados)
- **Fase actual**: Post-deployment, configuración DAO
- **Bloqueador**: Transferir tokens al vault + configurar Aragon

### CONTRATOS DESPLEGADOS ✅
```
Base Mainnet (Chain ID: 8453)
- CGC Token: 0xe8AF8cF18DA5c540daffe76Ae5fEE31C80c74899
- GovTokenVault: 0xF5606020e772308cc66F2fC3D0832bf9E17E68e0
- AllowedSignersCondition: 0x6101CAAAD91A848d911171B82369CF90B8B00597
- MerklePayouts: 0xC75Be1A1fCb412078102b7C286d12E8ACc75b922
```

### DATOS CRÍTICOS
- **Deployer**: 0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6
- **Balance**: ~0.0045 ETH (suficiente)
- **DAO Aragon**: 0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31
- **Token Supply**: 1M CGC (owner balance: 0 - PENDIENTE transferir al vault)

---

## 🚨 ANTI-CRASH PROTOCOL

### Claude CLI Crashea Frecuentemente
**Error común**: `Bad substitution: hasCode` - Bug conocido del CLI npm

### 🛡️ HERRAMIENTAS DE EMERGENCIA
```bash
# Verificación rápida de estado
node scripts/verify-contracts-external.js

# Toolkit completo independiente
node scripts/emergency-toolkit.js status
node scripts/emergency-toolkit.js backup
node scripts/emergency-toolkit.js transfer 400000
```

### 📋 PROTOCOLO DE RECUPERACIÓN
1. **LEE ESTE ARCHIVO PRIMERO** siempre al iniciar sesión
2. Ejecuta `node scripts/verify-contracts-external.js`
3. Revisa `SESION_CONTINUIDAD_30AGO2025.md` para contexto
4. Lee `CLAUDE_CRASH_PREVENTION.md` para detalles técnicos
5. Usa herramientas externas, NO dependas del CLI

---

## 📦 PACKAGE MANAGERS - REGLA DE ORO

### 🟢 PNPM (PROYECTO)
```bash
pnpm install              # Dependencias
pnpm run compile          # Compilar contratos
pnpm exec hardhat test    # Tests
pnpm exec hardhat run scripts/deploy-production-final.js --network base
```

### 🟡 NPM (SOLO CLAUDE CLI)
```bash
npm install -g @anthropic-ai/claude-code  # ÚNICA excepción
```

**NUNCA mezcles**: Todo el proyecto usa pnpm excepto la instalación de Claude CLI.

---

## 🗂️ ARQUITECTURA DEL PROYECTO

### Estructura Principal
```
/contracts/           - Smart contracts (Solidity 0.8.20)
/scripts/            - Deployment & utility scripts
/deployments/        - Deployment artifacts
/app/               - Next.js dashboard (shadow mode)
/docs/              - Documentación técnica
```

### Archivos Críticos
- `.env.dao` - Variables de entorno (NUNCA commitear)
- `hardhat.config.js` - Configuración deployment
- `deployments/deployment-base-latest.json` - Estado actual
- `package.json` - Dependencias pnpm

---

## 🎯 ROADMAP INMEDIATO

### 🔥 PRÓXIMOS PASOS CRÍTICOS
1. **Transferir 400K CGC al vault** (usar emergency toolkit)
2. **Configurar permisos Aragon DAO**
3. **Verificar contratos en Basescan**
4. **Implementar MilestoneEscrow system**
5. **Bots Discord/Telegram**

### Estado de Transferencia de Tokens
```bash
# VERIFICAR ANTES DE CONTINUAR
node scripts/emergency-toolkit.js token
# Owner balance debe ser 1M CGC para poder transferir
# Vault balance debe ser 0 CGC (pendiente transferir 400K)
```

---

## 🔧 COMANDOS ESENCIALES

### Verificación Rápida
```bash
# Estado completo del proyecto
node scripts/emergency-toolkit.js status

# Solo contratos
node scripts/verify-contracts-external.js

# Balance y transacciones
cast balance 0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6 --rpc-url https://mainnet.base.org
```

### Deployment & Testing
```bash
# Compilar (siempre usar pnpm)
pnpm exec hardhat compile

# Tests
pnpm exec hardhat test

# Deploy a testnet (si necesario)
pnpm exec hardhat run scripts/deploy-production-final.js --network baseSepolia
```

### Troubleshooting
```bash
# Si Claude crashea
export DISABLE_AUTOUPDATER=1
export SHELL=/bin/bash
claude

# Reinstalar Claude CLI (solo si es necesario)
npm uninstall -g @anthropic-ai/claude-code
curl -fsSL https://claude.ai/install.sh | bash
```

---

## 📚 DOCUMENTACIÓN RELEVANTE

### Lectura Obligatoria al Iniciar Sesión
1. `CLAUDE.md` (este archivo) - Información inmediata
2. `README.md` - Overview del proyecto
3. `SESION_CONTINUIDAD_30AGO2025.md` - Contexto de última sesión
4. `CLAUDE_CRASH_PREVENTION.md` - Detalles técnicos anti-crash

### Documentación Técnica
1. `docs/PLAN_DESARROLLO_COMPLETO.md` - Roadmap completo
2. `docs/AUDIT_SISTEMA_ACTUAL.md` - Estado técnico detallado
3. `docs/INTEGRACION_ARAGON_COMPLETA.md` - Integración DAO

### Archivos de Deployment
1. `deployments/deployment-base-latest.json` - Estado actual
2. `scripts/deploy-production-final.js` - Script principal deployment
3. `hardhat.config.js` - Configuración networks

---

## 🎮 REGLAS DE COMPORTAMIENTO

### 🔒 PROTOCOLO OBLIGATORIO
1. **MINIMAL SCOPE**: Un problema = una corrección quirúrgica
2. **CONSULT FIRST**: Si afecta >5 líneas → CONSULTAR
3. **VERIFY EACH STEP**: Probar cada cambio antes del siguiente
4. **PRESERVE FUNCTIONALITY**: Nunca romper lo que funciona

### 🚫 RED FLAGS - PARAR Y CONSULTAR
- Cambios en múltiples herramientas (npm↔pnpm)
- Soluciones en cascada (arreglar 3+ cosas juntas)
- Timeouts/errores de red
- Cualquier "temporal" o "workaround"

### ✅ VERIFICACIÓN OBLIGATORIA
**NO marcar como completado sin:**
- ✅ Prueba reproducible
- ✅ Screenshot/log/hash que demuestre resultado
- ✅ Funcionalidad original preservada

---

## 🚀 OBJETIVOS DEL PROYECTO

### Visión General
Sistema DAO completamente automatizado para:
- Asignar tareas automáticamente a colaboradores
- Verificar completación vía EAS (Ethereum Attestation Service)
- Distribuir tokens CGC (100-150 por milestone)
- Funcionar sin intervención manual

### Stack Tecnológico
- **Blockchain**: Base Mainnet (Chain ID: 8453)
- **Smart Contracts**: Solidity 0.8.20 + Hardhat
- **Frontend**: Next.js 14 + Wagmi v2
- **Backend**: Node.js + TypeScript
- **DAO**: Aragon OSx v1.4.0
- **Package Manager**: pnpm (excepto Claude CLI)

### Presupuesto
- **MVP (2 semanas)**: $10,000
- **Sistema completo (8 semanas)**: $50,000-75,000

---

## 📞 COMANDOS PARA DEBUGGING

### Si algo no funciona
```bash
# Check node/pnpm versions
node --version && pnpm --version

# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Reset git if needed
git status
git stash
git clean -fd
```

### Estado de Networks
```bash
# Base Mainnet RPC check
curl -X POST https://mainnet.base.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Gas price check
cast gas-price --rpc-url https://mainnet.base.org
```

---

**🔑 RECORDATORIO CLAVE**: Este archivo es tu punto de partida SIEMPRE. Si Claude crashea, vuelve aquí primero.