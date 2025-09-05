# 🤖 CLAUDE.md - GUÍA COMPLETA PARA SESIONES

## 🎯 INFORMACIÓN CRÍTICA DEL PROYECTO

### ESTADO ACTUAL (31 ENE 2025) - ACTUALIZACIÓN CRÍTICA ✅
- **Progreso**: 100% Core System Completado
- **Fase actual**: Production Ready - Sistema completamente operacional
- **Último Deploy**: NUEVO sistema completo con máxima excelencia

### CONTRATOS DESPLEGADOS ✅ (NUEVOS - 31 ENE 2025)
```
Base Mainnet (Chain ID: 8453) - DEPLOYMENT COMPLETO CON MÁXIMA CALIDAD
- CGC Token: 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175 (2M supply + GitHub logo)
- MasterEIP712Controller: 0x67D9a01A3F7b5D38694Bb78dD39286Db75D7D869 (Control layer)
- TaskRulesEIP712: 0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb (Validation layer)
- MilestoneEscrow: 0x8346CFcaECc90d678d862319449E5a742c03f109 (Custody layer)
```

### CONTRATOS ANTERIORES (DEPRECATED)
```
NOTA: Los contratos siguientes fueron reemplazados por el nuevo sistema:
- CGC Token OLD: 0xe8AF8cF18DA5c540daffe76Ae5fEE31C80c74899 (1M supply)
- GovTokenVault: 0xF5606020e772308cc66F2fC3D0832bf9E17E68e0 (reemplazado por MilestoneEscrow)
- AllowedSignersCondition: 0x6101CAAAD91A848d911171B82369CF90B8B00597 (integrado en Master)
- MerklePayouts: 0xC75Be1A1fCb412078102b7C286d12E8ACc75b922 (funcionalidad en Escrow)
```

### DATOS CRÍTICOS (ACTUALIZADOS 4 SEP 2025)
- **Deployer**: 0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6
- **Balance**: ~0.003 ETH (post-deployment, suficiente para operaciones)
- **DAO Aragon**: 0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31
- **Token Supply**: 2M CGC (owner balance: 2M - LISTOS para distribución)
- **Sistema Status**: ✅ PRODUCTION READY - Completamente operacional
- **Verificación**: ✅ Todos los contratos verificados en BaseScan con badge verde
- **🤖 apeX Agent**: ✅ GPT-5 con máximo reasoning + MCP tools + UI mejorada

---

## 🆕 ÚLTIMOS CAMBIOS CRÍTICOS (5 SEP 2025) - GPT-5 OFICIAL

### 📚 **REFERENCIAS OFICIALES SEPTEMBER 2025**

**⚠️ CRITICAL**: GPT-5 fue oficialmente lanzado el **7 de Agosto 2025** por OpenAI. Cualquier implementación que use GPT-4o está **OBSOLETA** desde septiembre 2025.

**DOCUMENTACIÓN OFICIAL OpenAI:**
- **GPT-5 Launch**: https://openai.com/index/introducing-gpt-5/ (August 7, 2025)
- **Developer Guide**: https://openai.com/index/introducing-gpt-5-for-developers/
- **API Docs**: https://platform.openai.com/docs/models/gpt-5
- **Pricing**: $1.25/1M input, $10/1M output (September 2025)

**MICROSOFT INTEGRATION:**
- **Azure GPT-5**: https://azure.microsoft.com/en-us/blog/gpt-5-in-azure-ai-foundry-the-future-of-ai-apps-and-agents-starts-here/

## 🆕 ÚLTIMOS CAMBIOS CRÍTICOS (4 SEP 2025)

### 🤖 apeX AGENT UPGRADE COMPLETO
**Commits Recientes:**
- `032e2b3` - feat: upgrade to GPT-5 with maximum reasoning capabilities
- `c347496` - feat: comprehensive apeX agent improvements and UI enhancements
- `c3f9967` - fix: resolve apeX agent configuration issues for production deployment

### 🎯 CAMBIOS IMPLEMENTADOS:
1. **GPT-5 Integration**: Upgrade completo a GPT-5 con `reasoning_effort: "high"`
2. **MCP Tools**: Acceso real a documentación del proyecto via OpenAI Functions
3. **UI Mejoras**: Auto-scroll arreglado, input continuo, imágenes apeX custom
4. **Parámetros GPT-5**: `max_completion_tokens: 3000`, sin `temperature`
5. **API Version**: Actualizada a 2.0.0 con nuevas capabilities

### 📁 ARCHIVOS MODIFICADOS:
- `app/api/agent/route.ts` - Core agent con GPT-5 + MCP integration
- `components/agent/AgentChat.tsx` - UI improvements + scroll fixes
- `components/agent/ApexAgent.tsx` - Custom apeX22.PNG bubble
- `app/page.tsx` - Header con apeX.png icon
- `public/apeX22.PNG` - Floating bubble image (100% space)
- `public/apeX.png` - Header logo image (100% space)

### 🔧 CONFIGURACIÓN CRÍTICA apeX (SEPTEMBER 2025 OFFICIAL):
```javascript
// GPT-5 Configuration (OFFICIAL September 2025 Release)
model: "gpt-5"                    // ✅ GPT-5 (Aug 7, 2025 release)
max_completion_tokens: 3000      // ✅ REQUIRED for GPT-5 (NOT max_tokens)
reasoning_effort: "high"         // ✅ "minimal" | "high" (Sept 2025)
verbosity: "medium"              // ✅ "low" | "medium" | "high" (Sept 2025)
tools: [MCP functions]          // ✅ Real document access

// ❌ DEPRECATED in GPT-5: temperature (causes API errors)
// ❌ DEPRECATED in GPT-5: max_tokens (use max_completion_tokens)
// ❌ NEVER USE GPT-4o: Outdated since August 2025

// Reference: https://platform.openai.com/docs/models/gpt-5
```

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

### 🔥 PRÓXIMOS PASOS CRÍTICOS (ACTUALIZADOS 31 ENE 2025)
1. ✅ **Deployment completo** - COMPLETADO CON MÁXIMA EXCELENCIA
2. ✅ **Verificar contratos en BaseScan** - COMPLETADO (todos con badge verde)
3. ✅ **Implementar sistema completo** - COMPLETADO (3 capas de seguridad)
4. ✅ **2M CGC Token** - COMPLETADO (con logo GitHub)
5. 🔄 **Frontend Integration** - Conectar UI con nuevos contratos
6. 🔄 **DAO Integration** - Configurar permisos Aragon con nuevo sistema
7. 🔄 **Backend Services** - APIs para interactuar con contratos
8. 🔄 **Monitoring Setup** - Métricas y alertas

### Estado de Tokens (ACTUALIZADO)
```bash
# SISTEMA NUEVO COMPLETAMENTE OPERACIONAL
# CGC Token: 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
# Owner balance: 2,000,000 CGC (listos para distribución)
# Supply total: 2,000,000 CGC (con logo GitHub funcionando)
# Minter autorizado: MilestoneEscrow (0x8346CFcaECc90d678d862319449E5a742c03f109)
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

---

## 🚨 REGLAS ABSOLUTAS E INVIOLABLES

### ❌ PROHIBIDO TERMINANTEMENTE:
1. **NUNCA ESCRIBIR EN .env.local** - Contiene 200+ líneas críticas, SOLO lectura permitida
2. **NUNCA ESCRIBIR SIN LEER COMPLETAMENTE** - Usar Read tool antes de Edit/Write SIEMPRE
3. **NUNCA CREAR ARCHIVOS SIN VERIFICAR** - Usar Glob/Grep para verificar existencia primero

### ⚠️ CONTEXTO DEL ERROR CRÍTICO (2025-01-09):
- Sobrescribí `.env.local` (200+ líneas) con solo 36 líneas
- Pérdida de configuración crítica (recuperada por backup del usuario)
- **ESTAS REGLAS SON ABSOLUTAS - NO HAY EXCEPCIONES**

Ver `CLAUDE_ABSOLUTE_RULES.md` para protocolo completo.