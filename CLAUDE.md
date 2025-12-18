# 🤖 CLAUDE.md - GUÍA COMPLETA PARA SESIONES

## 🎯 INFORMACIÓN CRÍTICA DEL PROYECTO

### ESTADO ACTUAL (14 DIC 2025) - MINTERGATEWAY + AUTO-DELEGATION ✅
- **Progreso**: 100% Task System + i18n + Referrals + Bonos + Discord + **GOVERNANCE COMPLETO** ✅
- **Fase actual**: Sistema DAO con MinterGateway v3.3 + TimelockController desplegados
- **Último Deploy**: Governance contracts + Auto-delegation voting power
- **Critical Update**: New governance model: Aragon DAO → TimelockController → CGC Token
- **Nuevo**: Sistema auto-delegación ERC20Votes para activación de voting power en claim flow

### 🎮 DISCORD SERVER CONFIGURADO (9 DIC 2025) ✅
```
SERVIDOR: CryptoGift_Wallets_DAO
├── Guild ID: 1440971032818090006
├── Invite Link: https://discord.gg/XzmKkrvhHc
├── Bot: CryptoGift DAO Bot (automatización via API REST)
└── Collab.Land: Instalado para token gating

ESTRUCTURA CREADA AUTOMÁTICAMENTE:
├── 📢 INFORMACIÓN (4 canales - solo lectura)
│   ├── 📜-bienvenida-y-reglas (con reglas completas)
│   ├── 📣-anuncios (primer anuncio enviado)
│   ├── 🗺️-roadmap (roadmap completo)
│   └── 🔗-links-oficiales (todos los links)
├── ✅ VERIFICACIÓN (2 canales)
├── 💬 COMUNIDAD (5 canales - solo verificados)
├── 📚 EDUCACIÓN (4 canales - solo verificados)
├── 🏛️ GOBERNANZA (3 canales - solo verificados)
├── 🔧 SOPORTE (3 canales)
└── 🔊 VOZ (3 canales)

ROLES CREADOS (10 total):
├── 🔑 Admin (rojo - administrador)
├── 🛠️ Moderador (naranja)
├── 👨‍💻 Team (púrpura)
├── 💎 Diamond Holder (cyan - 100K+ CGC)
├── 🥇 Gold Holder (dorado - 10K+ CGC)
├── 🥈 Silver Holder (plateado - 1K+ CGC)
├── 🥉 Bronze Holder (bronce - 100+ CGC)
├── ✅ Verified (verde)
├── 📢 Announcements (azul)
└── 👥 Member (gris)

SCRIPTS DISPONIBLES:
├── scripts/setup-discord-rest.js    - Configuración via REST API (usado)
└── scripts/setup-discord-server.js  - Configuración via discord.js
```

### 💰 FUNDING & GRANTS SYSTEM (12 DIC 2025) ✅
```
SISTEMA COMPLETO DE FUNDING Y GRANTS:
├── public/GRANT_APPLICATION_GUIDE.md         - Documento maestro (1251 líneas)
├── components/funding/ApplicationGuide.tsx   - Guía de aplicaciones (55KB+) con modales
├── components/funding/GrowthStrategy.tsx     - Plan de crecimiento (800+ líneas)
├── app/funding/page.tsx                      - 4 pestañas: Guide, Growth, Grants, Crowdfunding
└── docs/governance/GRANT_APPLICATION_MASTER_GUIDE.md - Guía técnica detallada

TOP 5 GRANTS (ACTUALIZADO 12 DIC 2025):
├── Base Builder Grants    - 1-5 ETH | paragraph.com/@grants.base.eth
├── Base Weekly Rewards    - 20 ETH/semana (top 100) | builderscore.xyz
├── Optimism RetroPGF      - $10k-500k+ | atlas.optimism.io
├── Gitcoin Grants GG24    - $1k-50k+ (Oct 14-28) | grants.gitcoin.co
└── Base Batches 002       - Demo Day + Funding | devfolio.co (Sep 29 - Oct 18)

CADA GRANT INCLUYE:
├── ✅ Link directo de aplicación (funcionando)
├── 📋 7 pasos detallados (ES/EN)
├── 💡 6+ tips y trucos insider
├── 📝 Requisitos claros
├── ⏰ Timeline cuando aplica
└── 🔲 Modal popup con guía completa

TABS DISPONIBLES:
├── 📖 Application Guide  - Top 5 Grants con Apply/Guide buttons
├── 📈 Growth Strategy    - Plan de acción post-rechazo CoinGecko
├── 💰 Grants & Programs  - 40 oportunidades de funding
└── 👥 Crowdfunding       - Plataformas de crowdfunding

ESTADO APLICACIONES (12 DIC 2025):
├── CoinGecko: ❌ RECHAZADA - Re-aplicar en 14 días con más tracción
├── BaseScan: ✅ ENVIADA (Dic 2025) - Esperando
├── Base Grants: ✅ READY TO APPLY (links actualizados)
├── Base Batches 002: ⏰ Sep 29 - Oct 18, 2025
├── Optimism Atlas: 🔄 REGISTRAR - Crear perfil en atlas.optimism.io
└── Gitcoin Grants: ⏰ GG24 - Oct 14-28, 2025
```

**ACCESO:**
- URL: `/funding` → 4 pestañas disponibles
- Growth Strategy: Roadmaps completos para cada área con fases detalladas
- Templates de contenido listos para copiar (Twitter, Farcaster, Discord)
- Scripts de automatización para webhooks y bots

### 💰 SISTEMA DE BONOS AUTOMÁTICOS - ON-CHAIN (4 DIC 2025) ✅
```
DISTRIBUCIÓN AUTOMÁTICA POR SIGNUP:
├── Nuevo Usuario:        200 CGC  (Bono de bienvenida)
├── Referidor Nivel 1:     20 CGC  (10% comisión)
├── Referidor Nivel 2:     10 CGC  (5% comisión)
├── Referidor Nivel 3:      5 CGC  (2.5% comisión)
└── TOTAL MÁXIMO:         235 CGC  (4 transacciones on-chain)

ARCHIVOS CLAVE:
├── lib/web3/token-transfer-service.ts      - Servicio de transferencias viem
├── lib/referrals/signup-bonus-service.ts   - Lógica de distribución multinivel
├── app/api/referrals/bonus/route.ts        - API status y distribución manual
└── app/api/referrals/track/route.ts        - Trigger automático al registrar
```

**CONFIGURACIÓN REQUERIDA (Vercel):**
```bash
PRIVATE_KEY_DAO_DEPLOYER=0x...  # Private key del deployer
CGC_TOKEN_ADDRESS=0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
BASE_RPC_URL=https://mainnet.base.org
```

**TREASURY WALLET:**
- Dirección: `0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6`
- Debe tener CGC tokens suficientes para bonos
- Debe tener ETH para gas (~0.001 ETH por batch)

### 🤝 SISTEMA DE REFERIDOS - ENTERPRISE GRADE (27 NOV 2025) ✅
```
ARQUITECTURA COMPLETA:
├── supabase/migrations/001_referral_system.sql  - Migración DB completa
├── lib/referrals/referral-service.ts            - Core service (800+ líneas)
├── app/api/referrals/code/route.ts              - API código referido
├── app/api/referrals/stats/route.ts             - API estadísticas
├── app/api/referrals/network/route.ts           - API árbol de red
├── app/api/referrals/track/route.ts             - API tracking clicks
├── app/api/referrals/rewards/route.ts           - API recompensas
├── app/api/referrals/leaderboard/route.ts       - API leaderboard
├── hooks/useReferrals.ts                        - React hooks completos
└── app/referrals/page.tsx                       - UI integrada con backend
```

**CARACTERÍSTICAS:**
- 🏆 **3 niveles de comisión**: 10% (L1), 5% (L2), 2.5% (L3)
- 🎯 **Milestone bonuses**: 5→50 CGC, 10→150, 25→500, 50→1500, 100→5000 CGC
- 📊 **Analytics en tiempo real**: clicks, conversiones, sources, devices
- 🔐 **Prevención de fraude**: IP hashing, ban system, validación
- 🌐 **Tracking completo**: UTM params, referer, session tracking
- 📱 **Social sharing**: Twitter, Telegram, Discord, QR Code
- 🏅 **Tier system**: Starter→Bronze→Silver→Gold→Platinum→Diamond

**TABLAS SUPABASE:**
- `referral_codes` - Códigos únicos por wallet
- `referrals` - Relaciones multinivel
- `referral_rewards` - Historial de recompensas
- `referral_clicks` - Analytics de clicks
- `referral_stats_daily` - Estadísticas agregadas

### CONTRATOS DESPLEGADOS ✅ (NUEVOS - 31 ENE 2025)
```
Base Mainnet (Chain ID: 8453) - DEPLOYMENT COMPLETO CON MÁXIMA CALIDAD
- CGC Token: 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175 (Milestone-based emission: 2M initial → 22M max + GitHub logo)
- MasterEIP712Controller: 0x67D9a01A3F7b5D38694Bb78dD39286Db75D7D869 (Control layer)
- TaskRulesEIP712: 0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb (Validation layer)
- MilestoneEscrow: 0x8346CFcaECc90d678d862319449E5a742c03f109 (Custody layer + Authorized Minter)
```

### 🔐 MINTERGATEWAY SYSTEM (13 DIC 2025) - DESPLEGADO ✅
```
CONTRATOS DESPLEGADOS EN BASE MAINNET:
├── TimelockController: 0x9753d772C632e2d117b81d96939B878D74fB5166
│   ├── Min Delay: 7 días (604800 seconds)
│   ├── Proposer: DAO Aragon (0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31)
│   └── Executor: DAO Aragon (0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31)
│
└── MinterGateway v3.3: 0xdd10540847a4495e21f01230a0d39C7c6785598F
    ├── Owner: Safe 3/5 (0x11323672b5f9bB899Fa332D5d464CC4e66637b42)
    ├── Guardian: Safe 2/3 (0xe9411DD1f2AF42186b2bCE828B6e7d0dd0D7a6bc)
    ├── Initial Supply: 2,000,000 CGC
    └── Max Mintable via Gateway: 20,000,000 CGC

GNOSIS SAFE MULTISIGS:
├── Safe Owner (3/5): 0x11323672b5f9bB899Fa332D5d464CC4e66637b42
│   ├── Controla: MinterGateway (unpause, addAuthorizedCaller)
│   ├── Threshold: 3 de 4 (pendiente 5to signer)
│   └── Signers:
│       ├── LEGRA: 0xB5a639149dF81c673131F9082b9429ad00842420
│       ├── 0x57D32c363555f2ae35045Dc3797cA68c4096C9FE
│       ├── 0x3514433534c281D546B3c3b913c908Bd90689D29
│       └── Deployer: 0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6
│
└── Safe Guardian (2/3): 0xe9411DD1f2AF42186b2bCE828B6e7d0dd0D7a6bc
    ├── Controla: Pause emergencia del Gateway
    └── NO puede: unpause (solo Safe Owner puede)

ACCIONES PENDIENTES (MANUAL):
├── ACTION 3: Batch atómico en Gnosis Safe (4 llamadas a CGCToken)
│   ├── cgcToken.addMinter(0xdd10540847a4495e21f01230a0d39C7c6785598F)
│   ├── cgcToken.removeMinter(0x8346CFcaECc90d678d862319449E5a742c03f109)
│   ├── cgcToken.removeMinter(0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6)
│   └── cgcToken.transferOwnership(0x9753d772C632e2d117b81d96939B878D74fB5166)
│
└── ACTION 5: addAuthorizedCaller desde Safe Owner
    └── gateway.addAuthorizedCaller(<rewards_system_address>)

DOCUMENTACIÓN:
└── docs/MINTER_GATEWAY_IMPLEMENTATION_PLAN.md (v3.3 FINAL - Copy-Paste Ready)
```

### CONTRATOS ANTERIORES (DEPRECATED)
```
NOTA: Los contratos siguientes fueron reemplazados por el nuevo sistema:
- CGC Token OLD: 0xe8AF8cF18DA5c540daffe76Ae5fEE31C80c74899 (1M supply)
- GovTokenVault: 0xF5606020e772308cc66F2fC3D0832bf9E17E68e0 (reemplazado por MilestoneEscrow)
- AllowedSignersCondition: 0x6101CAAAD91A848d911171B82369CF90B8B00597 (integrado en Master)
- MerklePayouts: 0xC75Be1A1fCb412078102b7C286d12E8ACc75b922 (funcionalidad en Escrow)
```

### DATOS CRÍTICOS (ACTUALIZADOS 14 DIC 2025)
- **Deployer**: 0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6
- **Balance**: ~0.003 ETH (post-deployment, suficiente para operaciones)
- **DAO Aragon**: 0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31
- **TimelockController**: 0x9753d772C632e2d117b81d96939B878D74fB5166 (7-day delay, owner de CGC Token)
- **MinterGateway v3.3**: 0xdd10540847a4495e21f01230a0d39C7c6785598F (20M max mintable)
- **Safe Owner (3/5)**: 0x11323672b5f9bB899Fa332D5d464CC4e66637b42
- **Safe Guardian (2/3)**: 0xe9411DD1f2AF42186b2bCE828B6e7d0dd0D7a6bc
- **Token Supply**: Milestone-Based Progressive Emission (Initial: 2M CGC → Max via Gateway: 20M → Total Max: 22M)
- **Sistema Status**: ✅ 100% OPERATIONAL - Sistema DAO con mecánicas competitivas
- **Verificación**: ✅ Todos los contratos verificados en BaseScan con badge verde
- **🔐 MinterGateway**: ✅ DESPLEGADO - TimelockController + MinterGateway v3.3 en mainnet
- **🗳️ Auto-Delegation**: ✅ Sistema ERC20Votes con activación automática de voting power
- **🤖 apeX Agent**: ✅ GPT-5 con máximo reasoning + MCP tools + UI mejorada
- **🎯 Task System**: ✅ Sistema competitivo con timeouts automáticos y confirmación
- **👨‍💼 Admin Panel**: ✅ Validación segura con autorización wallet-based
- **⏰ Competitive Features**: ✅ Countdown timers, auto-expiration, claim confirmation
- **🏷️ Token Metadata**: ✅ Sistema completo con logos optimizados, APIs CoinGecko
- **📊 CoinGecko Ready**: ✅ Total Supply + Circulating Supply APIs + whitepaper actualizado
- **🤖 Automated Minting**: 📋 Sistema diseñado (ver `docs/AUTOMATED_MINTING_SYSTEM.md`) - OBJETIVO A CORTO PLAZO

---

## 🌐 SISTEMA I18N OBLIGATORIO - PATRÓN DE DESARROLLO

### ⚠️ REGLA CRÍTICA: TODA CONSTRUCCIÓN DEBE SER BILINGÜE
**A partir del 26 NOV 2025, TODO nuevo componente, página, o texto visible al usuario DEBE implementarse usando el sistema i18n.**

### 📁 ARCHIVOS DE TRADUCCIÓN
```
src/locales/en.json  - Inglés (DEFAULT)
src/locales/es.json  - Español
```

### 🔧 PATRÓN OBLIGATORIO PARA COMPONENTES

```typescript
// 1. IMPORTAR el hook
import { useTranslations } from 'next-intl';

// 2. USAR el hook con el namespace apropiado
const t = useTranslations('dashboard');      // Para dashboard
const tNav = useTranslations('navigation');  // Para navegación
const tCommon = useTranslations('common');   // Para textos comunes

// 3. USAR t() para TODOS los textos visibles
<h1>{t('title')}</h1>                    // ❌ NO: <h1>Dashboard</h1>
<button>{tCommon('confirm')}</button>    // ❌ NO: <button>Confirm</button>
<span>{t('stats.totalSupply')}</span>    // Acceso anidado
```

### 📋 NAMESPACES DISPONIBLES
| Namespace | Uso |
|-----------|-----|
| `navigation` | Links de navegación, menús |
| `common` | Botones, acciones comunes (Confirm, Cancel, Loading) |
| `wallet` | Conexión wallet, balances |
| `dashboard` | Página principal, stats, paneles |
| `tasks` | Sistema de tareas |
| `admin` | Panel de administración |
| `agent` | apeX Assistant |
| `funding` | Página de financiamiento |
| `theme` | Selector de tema |
| `footer` | Pie de página |
| `referrals` | **Sistema de referidos multinivel** ✅ (100+ claves) |

### 🔄 FLUJO DE TRABAJO i18n
1. **Antes de crear texto hardcodeado** → Añadir clave a AMBOS archivos JSON
2. **Crear componente** → Usar `useTranslations()` desde el inicio
3. **Verificar** → Cambiar idioma y confirmar que todo traduce correctamente

### ⚙️ CONFIGURACIÓN ACTUAL
```typescript
// src/i18n/request.ts - Lee cookie NEXT_LOCALE
// app/api/locale/route.ts - Setea cookie al cambiar idioma
// app/layout.tsx - NextIntlClientProvider envuelve la app
// components/ui/LanguageToggle.tsx - Toggle EN|ES
```

### 🎯 COMMITS RECIENTES i18n (26 NOV 2025)
- `1b72ff2` - feat(i18n): complete Dashboard translation with all Action Panels
- `7fa809c` - fix(i18n): read NEXT_LOCALE cookie directly in getRequestConfig
- `7e5cdf9` - feat(i18n): implement useTranslations for Navbar and Dashboard

---

## 🚀 CAMBIOS CRÍTICOS (9 ENE 2025) - SISTEMA COMPETITIVO IMPLEMENTADO

### 📊 RESUMEN EJECUTIVO DE CAMBIOS (ENERO 2025)
- ✅ **Task Claiming Fix**: Solucionado bug crítico donde tasks claimed desaparecían
- ✅ **Competitive Mechanics**: Sistema que muestra todas las tareas en progreso
- ✅ **Countdown Timers**: Timers mostrando tiempo restante de acceso exclusivo
- ✅ **Auto-Expiration**: Lógica automática devolviendo tareas expiradas al pool
- ✅ **Claim Confirmation**: Modal detallado previo a claim para prevenir errores
- ✅ **ESLint Compliance**: Resueltos errores de compilación para deployment

### 🔑 ARCHIVOS CRÍTICOS MODIFICADOS (ENERO 2025)
```
lib/tasks/task-service.ts - Core timeout system + competitive mechanics
components/tasks/TaskCard.tsx - Countdown display + modal integration
components/tasks/TaskClaimModal.tsx - NEW confirmation modal
app/api/tasks/route.ts - Enhanced API logic + user relevant tasks
```

### 🎯 COMMITS RECIENTES (ENERO 2025)
- `4b1f1c7` - docs: update documentation with competitive task system implementation
- `fca066b` - feat: enhance task system with competitive features and claim confirmation
- `6bc3fd2` - fix: escape apostrophes in TaskClaimModal JSX to resolve ESLint errors

### 🔄 ÚLTIMOS COMMITS (12 DIC 2025) - GRANTS + TWITTER + QR CODE
- `ef35cc8` - feat: complete overhaul of Top 5 Grants with correct links, step-by-step guides, and tips
- `4e78e25` - fix: update remaining old Twitter links (giftwalletcoin → cryptogiftdao)
- `0ed9ae4` - fix: update all Twitter/X links to correct handle + add View All button
- `aa65393` - docs: add comprehensive Twitter/X optimization guide with actionable content
- `dcb9945` - fix: add CGC logo overlay in center of QR code
- `d616817` - feat: add QR code modal for referral links

### 🔄 COMMITS ANTERIORES (11 DIC 2025)
- `a13fd50` - feat: add funding application guide with bilingual content and copy buttons
- `94fa767` - docs: update guide with Aerodrome pool data + CoinGecko application ready
- `c5fa846` - feat: complete Discord server setup + update all Discord links

### ⏰ SISTEMA DE TIMEOUTS IMPLEMENTADO
- **Timeout Formula**: 50% del tiempo estimado (mínimo 2h, máximo 7 días)
- **Auto-Processing**: Tasks expiradas vuelven automáticamente a available
- **Competition Logic**: Después de expirar, CUALQUIERA puede completar la tarea
- **History Preservation**: Se mantiene historial de claims anteriores

---

## 🚀 CAMBIOS CRÍTICOS (6 SEP 2025) - SISTEMA 100% OPERACIONAL

### 📊 RESUMEN EJECUTIVO DE CAMBIOS
- ✅ **MetaMask Fix Crítico**: Solucionado error "Cannot convert string to Uint8Array"
- ✅ **Admin Validation System**: Panel completo con autorización segura
- ✅ **Automatic Payment System**: CGC payments automáticos post-validación
- ✅ **Task Lifecycle Complete**: Sistema end-to-end funcional
- ✅ **Database + Blockchain Sync**: Sincronización perfecta DB ↔ Smart Contracts

### 🔑 ARCHIVOS CRÍTICOS MODIFICADOS
```
lib/web3/hooks.ts - keccak256 fix + validation hooks
components/admin/ValidationPanel.tsx - NEW admin panel
app/admin/page.tsx - NEW admin dashboard
app/api/tasks/validate/route.ts - NEW validation API
components/tasks/TaskCard.tsx - assignee display
lib/supabase/types.ts - validation fields
```

### 🎯 SISTEMA OPERACIONAL CRÍTICO
- **Task Flow**: available → claimed → in_progress → validated → completed
- **Payment Flow**: admin approval → blockchain validation → automatic CGC release
- **Admin Access**: Solo `0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6` y `0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31`
- **Error Recovery**: Revert validation si payment blockchain falla

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

### 🔥 PRÓXIMOS PASOS CRÍTICOS (ACTUALIZADOS 14 DIC 2025)
1. ✅ **Deployment completo** - COMPLETADO CON MÁXIMA EXCELENCIA
2. ✅ **Verificar contratos en BaseScan** - COMPLETADO (todos con badge verde)
3. ✅ **Implementar sistema completo** - COMPLETADO (3 capas de seguridad)
4. ✅ **CGC Token Milestone Emission** - COMPLETADO (2M initial → 22M max + logo GitHub)
5. ✅ **Frontend Integration** - COMPLETADO (UI conectada con contratos)
6. ✅ **Backend Services** - COMPLETADO (APIs para contratos funcionales)
7. ✅ **Task System Complete** - COMPLETADO (lifecycle end-to-end)
8. ✅ **Admin Validation** - COMPLETADO (panel seguro con payments automáticos)
9. ✅ **Competitive System** - COMPLETADO (countdown timers + claim confirmation)
10. ✅ **Auto-Expiration Logic** - COMPLETADO (task timeout system)
11. ✅ **Token Metadata System** - COMPLETADO (logos, APIs, whitepaper, CoinGecko)
12. ✅ **Discord Server Setup** - COMPLETADO (10 roles, 21 canales, mensajes automáticos)
13. ✅ **Domain Migration** - COMPLETADO (mbxarts.com configurado con Vercel)
14. ✅ **Collab.Land Integration** - COMPLETADO (instalado en Discord para token gating)
15. ✅ **Funding Application Guide** - COMPLETADO (16 secciones bilingües, Top 5 grants, PDF)
16. ✅ **MinterGateway v3.3** - COMPLETADO (TimelockController + Gateway desplegados)
17. ✅ **Auto-Delegation System** - COMPLETADO (ERC20Votes voting power activation)
18. 🔄 **Apply Base Builder Grants** - Usar guía para enviar solicitud
19. 🔄 **Register Optimism Atlas** - Crear perfil en atlas.optimism.io
20. 🔄 **Register Gitcoin Grants** - Preparar para GG22
21. 🔄 **BaseScan Logo Submission** - Enviar 32x32 SVG a BaseScan
22. 🔄 **CoinGecko Form Submission** - Completar form con APIs y documentación
23. 🔄 **Collab.Land TGR Config** - Configurar Token Gating Rules
24. 🔄 **Execute Gateway Migration** - Ejecutar batch atómico para activar MinterGateway
25. 🔄 **Production Testing** - Test completo con usuarios reales

### Estado de Tokens (ACTUALIZADO 14 DIC 2025)
```bash
# GOVERNANCE MODEL - NUEVO SISTEMA DE MINTING
# CGC Token: 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
# Token Owner: TimelockController (0x9753d772C632e2d117b81d96939B878D74fB5166)
# Timelock Delay: 7 días para operaciones de owner
# Primary Minter: MinterGateway v3.3 (0xdd10540847a4495e21f01230a0d39C7c6785598F)
#
# SUPPLY MODEL:
# Initial Supply: 2,000,000 CGC (circulating)
# Max Mintable via Gateway: 20,000,000 CGC
# Total Max Supply: 22,000,000 CGC
#
# GOVERNANCE CHAIN:
# Aragon DAO → TimelockController → CGC Token Owner
# MinterGateway requires authorized caller approval for minting
#
# Logo: GitHub logo funcionando en todos los exploradores
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

---

## 🗣️ PREFERENCIAS DE COMUNICACIÓN CON EL USUARIO

### 📌 IDIOMA
- **SIEMPRE responder en español** al usuario
- Código y documentación técnica: en inglés (estándar profesional)
- Comentarios en código: inglés

### 📋 GUÍAS PASO A PASO (Solo cuando sea absolutamente necesario)
**Antes de dar instrucciones manuales**, Claude DEBE:
1. **Verificar si puede hacerlo automáticamente** - Si puede, hacerlo sin preguntar
2. **Buscar información actualizada** - Usar WebSearch para obtener la documentación más reciente de la app/sistema
3. **Dar pasos detallados click por click** - No asumir que el usuario conoce la interfaz

**Formato obligatorio para guías manuales:**
```
PASO 1: [Acción específica]
   → Click en [elemento exacto]
   → Ubicación: [dónde encontrarlo]

PASO 2: [Siguiente acción]
   → [Detalles específicos]

💡 NOTA: [Explicación en lenguaje natural de cualquier tecnicismo]
```

### 🎯 NIVELES DE COMUNICACIÓN
| Contexto | Estilo |
|----------|--------|
| Conversación con usuario | Claro, conciso, en español, tecnicismos explicados |
| Código fuente | Profesional, best practices, inglés |
| Documentación técnica | Profesional, estructurada, inglés |
| Commits de git | Profesional, descriptivo, inglés |
| Comentarios de código | Breves, útiles, inglés |

### 📝 REGLAS DE COMMITS (OBLIGATORIO)
- **Claude SIEMPRE hace el commit** → Usuario SIEMPRE hace el push
- **Formato**: Seguir `COMMIT_ATTRIBUTION.md` sin excepciones
- **Atribución**: Incluir `🤖 Generated with Claude Code` + `Co-Authored-By: Godez22`
- **NO preguntar**: Hacer el commit automáticamente al completar tareas

### ⚙️ CONFIGURACIÓN DE PERMISOS (.claude/settings.local.json)
**IMPORTANTE**: Este archivo es SOLO para permisos de herramientas.
- ✅ Usar wildcards amplios: `Bash(git:*)` en vez de comandos específicos
- ❌ NUNCA guardar comandos completos (heredocs, commits largos)
- ❌ NO es para instrucciones de comportamiento (esas van aquí en CLAUDE.md)
- 📏 El archivo debe tener máximo ~50 líneas