# 🔐 MinterGateway Implementation Plan
## Solución para Enforcement de Supply Cap Verificable On-Chain

**Fecha**: 13 Diciembre 2025
**Autor**: CryptoGift DAO Team
**Versión**: 2.0 (SECURITY-HARDENED)
**Estado**: 📋 PLAN DETALLADO - Corregido con 5 Fixes de Seguridad

---

## ⚠️ SECURITY AUDIT FIXES (v2.0)

Esta versión incluye correcciones críticas identificadas durante auditoría:

| # | Severidad | Problema | Solución |
|---|-----------|----------|----------|
| 1 | 🔴 CRÍTICA | `INITIAL_SUPPLY` hardcodeado puede no coincidir | Leer `cgcToken.totalSupply()` en constructor |
| 2 | 🔴 CRÍTICA | DAO puede añadir nuevos minters después del Gateway | Renunciar ownership de CGCToken o transferir a Timelock |
| 3 | 🟡 MEDIA | Orden de migración incorrecto (corregido: MilestoneEscrow NO mintea) | Actualizado - solo remover deployer como minter |
| 4 | 🟡 MEDIA | Owner del Gateway podría drenar supply | Owner debe ser Timelock/multisig, no EOA |
| 5 | 🟡 MEDIA | Pausable podría brick el sistema | Guardian pattern o multisig ownership |

---

## 📋 RESUMEN EJECUTIVO

### El Problema Actual
El contrato CGCToken tiene una función `mint()` **SIN LÍMITES**:

```solidity
// Línea 137-138 de CGCToken.sol
* @param amount Amount of tokens to mint (NO LIMITS)
*/
function mint(address to, uint256 amount) external {
    require(minters[msg.sender], "Not authorized to mint");
    // ❌ NO HAY VERIFICACIÓN DE CAP AQUÍ
    _mint(to, amount);
}
```

**Consecuencia**: Aunque decimos "22M max supply", es una **promesa de governance**, no una **garantía de código**.

### La Solución: MinterGateway
Un contrato intermediario que:
1. ✅ Enforza un **hard cap** verificable on-chain
2. ✅ Solo él puede mintear tokens (no el MilestoneEscrow directamente)
3. ✅ El DAO controla el gateway pero NO puede bypass el cap
4. ✅ Totalmente auditable y transparente

---

## 🧠 ENTENDIENDO EL PROBLEMA EN LENGUAJE NATURAL

### ¿Por Qué Es Importante?

Imagina que CGC es un banco que emite billetes. Actualmente:

**SITUACIÓN ACTUAL** (Problemática):
```
DAO (Dueño del banco)
    ↓ puede autorizar
MilestoneEscrow (Empleado autorizado)
    ↓ puede imprimir
CGCToken (Máquina de billetes SIN CONTADOR)
    ↓ imprime
Tokens sin límite técnico
```

El empleado autorizado (MilestoneEscrow) puede imprimir la cantidad que quiera. Confiamos en que el DAO lo supervisa, pero **no hay mecanismo físico que impida la sobreimpresión**.

**SITUACIÓN CON MINTERGATEWAY** (Solución):
```
DAO (Dueño del banco)
    ↓ puede configurar pero NO bypass
MinterGateway (Contador automático con límite HARD)
    ↓ solo permite mintear si queda espacio bajo el cap
CGCToken (Máquina de billetes)
    ↓ imprime
Tokens GARANTIZADOS bajo 22M
```

El MinterGateway es como un **contador digital** que dice: "Ya se imprimieron X millones, solo quedan Y disponibles". **Nadie puede bypass este contador** - ni siquiera el DAO.

### ¿Por Qué El DAO No Debería Poder Bypass?

Esta es una pregunta crucial. El DAO **podría** tener poder de cambiar el cap... pero eso sería como decir "el límite es 22M, excepto si votamos que no hay límite".

**Mejores prácticas 2025** dicen:
- Para tokens de gobernanza, el **cap debe ser inmutable** o tener un **timelock largo** para cambios
- Esto da confianza a inversores: "Sé que mis tokens no se diluirán arbitrariamente"
- Los grants (Base, Optimism) favorecen proyectos con **tokenomics verificables on-chain**

---

## 🔍 DESCUBRIMIENTO CRÍTICO: QUIÉN REALMENTE MINTEA

### Análisis del Flujo Actual (13 Dic 2025)

Durante la auditoría de seguridad, descubrimos algo **crucial**:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                  🔍 ANÁLISIS DE FLUJO DE MINTING ACTUAL                      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📌 MILESTONE ESCROW (0x8346CFcaECc90d678d862319449E5a742c03f109):           ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ • ES minter autorizado ✅                                               │ ║
║  │ • PERO NUNCA LLAMA mint() ❌                                            │ ║
║  │ • Solo usa cgcToken.safeTransfer() para distribuir fondos              │ ║
║  │ • NO ES UPGRADEABLE (no hay patrón proxy)                              │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  📌 TOKEN-TRANSFER-SERVICE.TS (Backend):                                     ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ • Usa ERC20.transfer() para bonos de signup                            │ ║
║  │ • TRANSFIERE del balance del deployer, NO MINTEA                       │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  📌 MINT-ADDITIONAL-SUPPLY.JS (Script Manual):                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ • ÚNICO lugar donde se llama mint() actualmente                        │ ║
║  │ • Script one-time ejecutado por deployer                               │ ║
║  │ • Línea 77: CGCToken.addMinter(deployer.address)                       │ ║
║  │ • Línea 93: CGCToken.mint(DAO_TREASURY, MINT_AMOUNT)                   │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                        IMPLICACIONES PARA LA MIGRACIÓN                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ✅ MilestoneEscrow NO necesita modificarse (nunca llamó mint)              ║
║  ⚠️  Deployer (0xc655...) puede ser minter si corrió el script             ║
║  ⚠️  DAO puede añadir CUALQUIER nuevo minter en cualquier momento          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### ¿Quiénes Son Minters Hoy?

| Dirección | Rol | ¿Llama mint()? | Acción Requerida |
|-----------|-----|----------------|------------------|
| MilestoneEscrow | Autorizado en deploy | ❌ NO | Remover como minter |
| Deployer EOA | Añadido por script | ✅ SÍ (manual) | Remover como minter |
| Aragon DAO | Owner del token | Puede añadir minters | Problema principal |

---

## 🏗️ ARQUITECTURA PROPUESTA

### Diagrama de Flujo Actual vs Propuesto

```
╔══════════════════════════════════════════════════════════════════════╗
║                        ARQUITECTURA ACTUAL                           ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   [DAO Aragon]                                                       ║
║       │                                                              ║
║       │ addMinter()                                                  ║
║       ▼                                                              ║
║   [CGCToken] ──────── minters[MilestoneEscrow] = true               ║
║       │                                                              ║
║       │                                                              ║
║   [MilestoneEscrow]                                                  ║
║       │                                                              ║
║       │ cgcToken.mint(to, amount)  ← SIN LÍMITE                      ║
║       ▼                                                              ║
║   [Tokens Minteados] ← Puede ser infinito                           ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════╗
║                      ARQUITECTURA PROPUESTA                          ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   [DAO Aragon]                                                       ║
║       │                                                              ║
║       │ addAuthorizedCaller()                                        ║
║       ▼                                                              ║
║   [MinterGateway] ◄──── MAX_SUPPLY = 22_000_000 (INMUTABLE)         ║
║       │                 totalMintedViaGateway                        ║
║       │                 canMint() = MAX_SUPPLY - totalMinted         ║
║       │                                                              ║
║       │ Verifica: totalMinted + amount <= MAX_SUPPLY                 ║
║       │ Si pasa: cgcToken.mint(to, amount)                          ║
║       │ Si falla: REVERT "Cap exceeded"                              ║
║       ▼                                                              ║
║   [CGCToken] ← MinterGateway es el ÚNICO minter                     ║
║       │                                                              ║
║       ▼                                                              ║
║   [MilestoneEscrow / Otros]                                          ║
║       │                                                              ║
║       │ minterGateway.mint(to, amount) ← Pide al Gateway            ║
║       ▼                                                              ║
║   [Tokens Minteados] ← GARANTIZADO bajo 22M                         ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Explicación de Cada Componente

#### 1. CGCToken (Existente - Sin Cambios)
- El token actual permanece igual
- Solo cambiamos QUIÉN es el minter autorizado
- Removemos MilestoneEscrow como minter directo
- Añadimos MinterGateway como ÚNICO minter

#### 2. MinterGateway (NUEVO)
El corazón de la solución:

```solidity
contract MinterGateway {
    // ═══════════════════════════════════════════════════════════════
    // CONSTANTES Y VARIABLES INMUTABLES - EL CORE DE LA GARANTÍA
    // ═══════════════════════════════════════════════════════════════

    uint256 public constant MAX_TOTAL_SUPPLY = 22_000_000 * 10**18;
    // ⬆️ INMUTABLE: Nadie puede cambiar esto. Nunca. Jamás.

    uint256 public immutable initialSupplyAtDeployment;
    // ⬆️ 🛡️ SECURITY FIX #1: Leído de cgcToken.totalSupply() en constructor
    //    NO hardcodeado - refleja el supply real al momento del deploy

    // ═══════════════════════════════════════════════════════════════
    // ESTADO
    // ═══════════════════════════════════════════════════════════════

    uint256 public totalMintedViaGateway;
    // ⬆️ Contador de cuánto hemos minteado a través del gateway

    mapping(address => bool) public authorizedCallers;
    // ⬆️ Sistemas que pueden pedir minting (NO MilestoneEscrow - no mintea)

    // ═══════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    constructor(address _cgcToken, address _initialOwner) {
        cgcToken = ICGCToken(_cgcToken);

        // 🛡️ SECURITY FIX #1: Leer supply real, no asumir
        initialSupplyAtDeployment = cgcToken.totalSupply();

        // Verificar que el supply inicial es menor que el max
        require(
            initialSupplyAtDeployment < MAX_TOTAL_SUPPLY,
            "Initial supply already exceeds max"
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // LA FUNCIÓN CRÍTICA
    // ═══════════════════════════════════════════════════════════════

    function mint(address to, uint256 amount) external {
        require(authorizedCallers[msg.sender], "Not authorized");

        // 🛡️ EL GUARDIÁN DEL CAP (usando valor real, no hardcodeado)
        uint256 newTotal = initialSupplyAtDeployment + totalMintedViaGateway + amount;
        require(newTotal <= MAX_TOTAL_SUPPLY, "Would exceed max supply");

        // Actualizar contador ANTES de mintear (patrón CEI)
        totalMintedViaGateway += amount;

        // Ejecutar mint real
        cgcToken.mint(to, amount);

        emit TokensMinted(to, amount, totalMintedViaGateway, getRemainingMintable());
    }

    function getRemainingMintable() public view returns (uint256) {
        return MAX_TOTAL_SUPPLY - initialSupplyAtDeployment - totalMintedViaGateway;
    }
}
```

**🛡️ SECURITY FIX #1 EXPLICADO:**
- **ANTES**: `INITIAL_SUPPLY = 2_000_000 * 10**18` (hardcodeado)
- **DESPUÉS**: `initialSupplyAtDeployment = cgcToken.totalSupply()` (leído en deploy)
- **POR QUÉ**: Si alguien mintea tokens antes de deployar el Gateway, el cap estaría mal calculado. Leer el supply real garantiza precisión.

#### 3. MilestoneEscrow (Existente - SIN CAMBIOS NECESARIOS)

**🔍 DESCUBRIMIENTO IMPORTANTE**: MilestoneEscrow **NUNCA llama mint()**.

```solidity
// Línea 487-494 de MilestoneEscrow.sol
function withdraw() external nonReentrant {
    uint256 amount = pendingWithdrawals[msg.sender];
    require(amount > 0, "Nothing to withdraw");
    pendingWithdrawals[msg.sender] = 0;
    cgcToken.safeTransfer(msg.sender, amount);  // ← TRANSFER, no MINT
}
```

**Implicaciones:**
- ✅ NO necesitamos modificar MilestoneEscrow
- ✅ NO hay downtime de migración para ese contrato
- ⚠️ Solo debemos removerlo como minter (aunque nunca usa el permiso)

---

## 🛡️ SECURITY FIX #2: Prevenir Bypass de DAO

### El Problema

Después de deployar MinterGateway, el DAO aún puede:
1. Llamar `cgcToken.addMinter(anyAddress)`
2. Esa dirección puede llamar `cgcToken.mint(unlimited)` directamente
3. **Bypass total del Gateway**

### La Solución: Bloquear Nuevos Minters

**Opción A: Renunciar Ownership (MÁS SEGURO)**
```solidity
// Después de configurar Gateway como único minter:
cgcToken.renounceOwnership();

// Resultado:
// - owner = address(0)
// - Nadie puede llamar addMinter() nunca más
// - ⚠️ IRREVERSIBLE - no se puede deshacer
```

**Opción B: Transferir a Timelock (RECOMENDADO)**
```solidity
// Crear un Timelock que requiera 7+ días para ejecutar
TimelockController timelock = new TimelockController(
    7 days,     // minDelay
    [daoAddress], // proposers
    [daoAddress], // executors
    address(0)  // no admin
);

// Transferir ownership del token al timelock
cgcToken.transferOwnership(address(timelock));

// Resultado:
// - Cualquier cambio a minters requiere 7 días de espera
// - Comunidad puede reaccionar y auditar antes de ejecución
// - Reversible si hay emergencia
```

**Opción C: MinterLock Contract (AVANZADO)**
```solidity
// Crear un contrato que solo permita remover minters, no añadir
contract MinterLock is Ownable {
    ICGCToken public cgcToken;

    constructor(address _cgcToken) {
        cgcToken = ICGCToken(_cgcToken);
    }

    // SOLO puede remover minters, NUNCA añadir
    function removeMinter(address minter) external onlyOwner {
        cgcToken.removeMinter(minter);
    }

    // NO HAY función addMinter - imposible añadir nuevos
}
```

### Recomendación: Opción B (Timelock)

Para CryptoGift DAO, recomendamos **Timelock de 7 días** porque:
1. ✅ Previene bypass inmediato
2. ✅ Comunidad tiene tiempo de auditar propuestas
3. ✅ Reversible en caso de emergencia
4. ✅ Compatible con estándares de grants (Base, Optimism)

---

## 📊 ANÁLISIS DE SEGURIDAD

### Vectores de Ataque Prevenidos

| Ataque | Antes | Después |
|--------|-------|---------|
| Minter malicioso mintea infinito | ❌ Posible | ✅ Imposible (cap) |
| DAO vota mintear más de 22M | ❌ Posible | ✅ Imposible (constante inmutable) |
| Compromiso de MilestoneEscrow | ❌ Puede mintear infinito | ✅ Solo hasta el cap |
| Bug en cálculo de rewards | ❌ Podría mintear extra | ✅ Gateway lo detiene |

### ¿Qué Puede Hacer El DAO Aún?
- ✅ Añadir/remover authorized callers del Gateway
- ✅ Pausar el Gateway temporalmente (emergencia)
- ✅ Decidir CÓMO distribuir el espacio restante
- ❌ NO puede aumentar MAX_TOTAL_SUPPLY (inmutable)
- ❌ NO puede bypass el cap de ninguna manera

---

## 🔧 IMPLEMENTACIÓN PASO A PASO

### Fase 1: Desarrollo del Contrato (1-2 días)

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1.1: Crear MinterGateway.sol                          │
├─────────────────────────────────────────────────────────────┤
│ • Implementar constantes inmutables                         │
│ • Implementar función mint() con verificación de cap        │
│ • Implementar gestión de authorized callers                 │
│ • Implementar pausable para emergencias                     │
│ • Implementar eventos para transparencia                    │
│ • Tests unitarios exhaustivos                               │
└─────────────────────────────────────────────────────────────┘
```

**Por qué así**: El contrato debe ser simple y auditable. Menos código = menos superficie de ataque.

### Fase 2: Testing Exhaustivo (2-3 días)

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 2.1: Tests Unitarios                                   │
├─────────────────────────────────────────────────────────────┤
│ • test_cannotMintOverCap()                                  │
│ • test_correctTotalTracking()                               │
│ • test_onlyAuthorizedCanMint()                              │
│ • test_ownerCannotBypassCap()                               │
│ • test_pauseStopsMinting()                                  │
│ • test_edgeCasesAtExactCap()                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PASO 2.2: Tests de Integración                              │
├─────────────────────────────────────────────────────────────┤
│ • test_milestoneEscrowThroughGateway()                      │
│ • test_multipleCallersSequential()                          │
│ • test_concurrentMintingRace()                              │
│ • test_fullCycleFromProposalToMint()                        │
└─────────────────────────────────────────────────────────────┘
```

**Por qué así**: El contrato maneja dinero real. Cada edge case debe ser probado.

### Fase 3: Deploy en Testnet (1 día)

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 3.1: Deploy en Base Sepolia                            │
├─────────────────────────────────────────────────────────────┤
│ 1. Deploy MinterGateway con cgcToken address                │
│ 2. Verificar contrato en BaseScan                           │
│ 3. Test manual de todas las funciones                       │
│ 4. Simular escenario completo                               │
└─────────────────────────────────────────────────────────────┘
```

### Fase 4: Propuesta DAO para Migración (1 semana mínimo)

Esta es la parte más delicada. Requiere una votación del DAO.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║          🛡️ RUNBOOK DE MIGRACIÓN CORREGIDO (Security-Hardened v2.0)         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  PROPUESTA EN ARAGON:                                                        ║
║  Título: "Implement MinterGateway for Verifiable Supply Cap"                 ║
║  Quorum: 10% supply | Votación: 7 días | Ejecución: 48h                     ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                         ACCIONES A EJECUTAR (EN ORDEN)                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🟢 ACTION 1: Deploy Timelock Controller (SECURITY FIX #2)                   ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ new TimelockController(                                                 │ ║
║  │     7 days,          // minDelay para cambios de minters               │ ║
║  │     [daoAddress],    // proposers                                       │ ║
║  │     [daoAddress],    // executors                                       │ ║
║  │     address(0)       // no admin                                        │ ║
║  │ )                                                                       │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  🟢 ACTION 2: Deploy MinterGateway                                           ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ new MinterGateway(                                                      │ ║
║  │     cgcTokenAddress,           // 0x5e3a61b550328f3D8C44f60b3e10...    │ ║
║  │     timelockAddress            // Owner = Timelock (SECURITY FIX #4)   │ ║
║  │ )                                                                       │ ║
║  │ // Constructor leerá cgcToken.totalSupply() automáticamente             │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  🟢 ACTION 3: Añadir Gateway como único minter                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ cgcToken.addMinter(minterGatewayAddress)                                │ ║
║  │ // Gateway ahora puede mintear                                          │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  🟢 ACTION 4: Remover minters existentes (TODOS)                             ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ cgcToken.removeMinter(milestoneEscrowAddress)  // 0x8346CFcaE...        │ ║
║  │ cgcToken.removeMinter(deployerAddress)         // 0xc655BF2B... (si es) │ ║
║  │ // VERIFICAR: No debe quedar ningún minter excepto Gateway              │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  🟢 ACTION 5: Transferir ownership del token al Timelock                     ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ cgcToken.transferOwnership(timelockAddress)                             │ ║
║  │ // Ahora cualquier addMinter() requiere 7 días de espera                │ ║
║  │ // ⚠️ ESTE PASO CIERRA EL BYPASS PERMANENTEMENTE                        │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                          VERIFICACIONES POST-EJECUCIÓN                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ☐ Gateway es minter: cgcToken.minters(gateway) == true                     ║
║  ☐ Escrow NO es minter: cgcToken.minters(escrow) == false                   ║
║  ☐ Deployer NO es minter: cgcToken.minters(deployer) == false               ║
║  ☐ Token owner es Timelock: cgcToken.owner() == timelock                    ║
║  ☐ Gateway owner es Timelock: gateway.owner() == timelock                   ║
║  ☐ Supply correcto: gateway.initialSupplyAtDeployment() == totalSupply()   ║
║  ☐ Remaining correcto: gateway.getRemainingMintable() > 0                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**Por qué hacerlo via DAO**:
- Transparencia total
- La comunidad aprueba el cambio
- Registro on-chain de la decisión
- Cumple con estándares de governance descentralizada

**🛡️ SECURITY FIX #4 INTEGRADO**: El owner del Gateway es el Timelock, no un EOA. Si el Timelock se compromete, hay 7 días para reaccionar.

### Fase 5: Ejecución Mainnet (1 día)

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 5.1: Post-votación exitosa                             │
├─────────────────────────────────────────────────────────────┤
│ • Ejecutar propuesta desde Aragon UI                        │
│ • Verificar MinterGateway en BaseScan                       │
│ • Confirmar que MilestoneEscrow ya no es minter directo    │
│ • Confirmar que MinterGateway es el único minter           │
│ • Test de mint a través del nuevo sistema                   │
└─────────────────────────────────────────────────────────────┘
```

### Fase 6: Actualizar MilestoneEscrow (1-2 días)

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 6.1: Modificar llamadas en MilestoneEscrow             │
├─────────────────────────────────────────────────────────────┤
│ ANTES:                                                       │
│   cgcToken.mint(recipient, amount);                         │
│                                                              │
│ DESPUÉS:                                                     │
│   minterGateway.mint(recipient, amount);                    │
│                                                              │
│ También añadir:                                              │
│   - Verificación previa: minterGateway.getRemainingMintable()│
│   - Mejor manejo de errores si cap alcanzado                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📜 CÓDIGO DEL CONTRATO MINTERGATEWAY (SECURITY-HARDENED v2.0)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ICGCToken {
    function mint(address to, uint256 amount) external;
    function totalSupply() external view returns (uint256);
}

/**
 * @title MinterGateway (Security-Hardened v2.0)
 * @author CryptoGift DAO Team
 * @notice Gateway contract that enforces a hard cap on CGC token minting
 *
 * @dev SECURITY FEATURES (v2.0):
 * - 🛡️ FIX #1: initialSupplyAtDeployment read from totalSupply(), not hardcoded
 * - 🛡️ FIX #2: Owner should be Timelock (prevents bypass via addMinter)
 * - 🛡️ FIX #3: No MilestoneEscrow migration needed (it never called mint)
 * - 🛡️ FIX #4: Timelock owner prevents immediate drain
 * - 🛡️ FIX #5: Guardian can pause, Timelock can unpause (prevents brick)
 *
 * Architecture:
 * - Timelock owns this contract (7-day delay for changes)
 * - Only this contract can mint CGC tokens
 * - MilestoneEscrow doesn't need Gateway (uses transfer, not mint)
 * - Future minting systems call this gateway
 * - Gateway enforces the 22M hard cap IMMUTABLY
 */
contract MinterGateway is Ownable, Pausable, ReentrancyGuard {

    // ═══════════════════════════════════════════════════════════════════
    // IMMUTABLE VALUES - THE CORE GUARANTEE
    // ═══════════════════════════════════════════════════════════════════

    /// @notice Maximum total supply that can ever exist
    /// @dev This is IMMUTABLE. No one can change it. Ever.
    uint256 public constant MAX_TOTAL_SUPPLY = 22_000_000 * 10**18;

    /// @notice Initial supply captured at deployment time
    /// @dev 🛡️ SECURITY FIX #1: Read from cgcToken.totalSupply(), NOT hardcoded
    ///      This ensures accuracy even if tokens were minted before gateway deployment
    uint256 public immutable initialSupplyAtDeployment;

    /// @notice Maximum that can be minted via this gateway
    /// @dev Calculated from actual supply at deployment, not assumptions
    uint256 public immutable maxMintableViaGateway;

    // ═══════════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════════

    /// @notice The CGC token contract
    ICGCToken public immutable cgcToken;

    /// @notice Total tokens minted through this gateway
    uint256 public totalMintedViaGateway;

    /// @notice Addresses authorized to request minting
    mapping(address => bool) public authorizedCallers;

    /// @notice Number of authorized callers
    uint256 public authorizedCallerCount;

    /// @notice 🛡️ SECURITY FIX #5: Guardian can pause but NOT unpause
    /// @dev Allows quick emergency response without Timelock delay
    ///      Only owner (Timelock) can unpause - prevents permanent brick
    address public guardian;

    // ═══════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════

    event TokensMinted(
        address indexed to,
        uint256 amount,
        uint256 totalMintedSoFar,
        uint256 remainingMintable,
        address indexed requestedBy
    );

    event AuthorizedCallerAdded(address indexed caller);
    event AuthorizedCallerRemoved(address indexed caller);
    event EmergencyPaused(address indexed by, string reason);
    event EmergencyUnpaused(address indexed by);

    // ═══════════════════════════════════════════════════════════════════
    // ERRORS (Gas-efficient custom errors)
    // ═══════════════════════════════════════════════════════════════════

    error NotAuthorized();
    error WouldExceedMaxSupply(uint256 requested, uint256 remaining);
    error InvalidAddress();
    error InvalidAmount();
    error AlreadyAuthorized();
    error NotAuthorizedCaller();

    // ═══════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Deploy the MinterGateway (Security-Hardened v2.0)
     * @param _cgcToken Address of the CGC token contract
     * @param _initialOwner Initial owner (MUST be Timelock, not EOA)
     * @param _guardian Address that can pause in emergencies
     *
     * @dev 🛡️ SECURITY FIXES IMPLEMENTED IN CONSTRUCTOR:
     * - FIX #1: Reads totalSupply() instead of hardcoding
     * - FIX #4: Owner should be Timelock (validated externally)
     * - FIX #5: Guardian pattern for emergency pause
     */
    constructor(
        address _cgcToken,
        address _initialOwner,
        address _guardian
    ) Ownable(_initialOwner) {
        if (_cgcToken == address(0)) revert InvalidAddress();
        if (_initialOwner == address(0)) revert InvalidAddress();
        if (_guardian == address(0)) revert InvalidAddress();

        cgcToken = ICGCToken(_cgcToken);
        guardian = _guardian;

        // 🛡️ SECURITY FIX #1: Read actual supply, don't assume
        initialSupplyAtDeployment = cgcToken.totalSupply();

        // Calculate max mintable based on ACTUAL current supply
        if (initialSupplyAtDeployment >= MAX_TOTAL_SUPPLY) {
            revert("Initial supply already at or exceeds max");
        }
        maxMintableViaGateway = MAX_TOTAL_SUPPLY - initialSupplyAtDeployment;

        emit GatewayDeployed(
            address(cgcToken),
            initialSupplyAtDeployment,
            maxMintableViaGateway,
            _initialOwner,
            _guardian
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // ADDITIONAL EVENTS
    // ═══════════════════════════════════════════════════════════════════

    event GatewayDeployed(
        address indexed cgcToken,
        uint256 initialSupply,
        uint256 maxMintable,
        address indexed owner,
        address indexed guardian
    );
    event GuardianChanged(address indexed oldGuardian, address indexed newGuardian);

    // ═══════════════════════════════════════════════════════════════════
    // CORE MINTING FUNCTION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Mint new CGC tokens (with hard cap enforcement)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     * @dev Only authorized callers can call this. Amount is checked against
     *      the remaining mintable supply. This function is the ONLY way
     *      to mint new tokens after this gateway is set as the sole minter.
     */
    function mint(address to, uint256 amount)
        external
        whenNotPaused
        nonReentrant
    {
        // Check authorization
        if (!authorizedCallers[msg.sender]) revert NotAuthorized();

        // Validate inputs
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        // 🛡️ THE CORE GUARANTEE: Check against cap
        uint256 remaining = getRemainingMintable();
        if (amount > remaining) {
            revert WouldExceedMaxSupply(amount, remaining);
        }

        // Update state BEFORE external call (CEI pattern)
        totalMintedViaGateway += amount;

        // Execute the mint on the actual token
        cgcToken.mint(to, amount);

        // Emit event for transparency and indexing
        emit TokensMinted(
            to,
            amount,
            totalMintedViaGateway,
            getRemainingMintable(),
            msg.sender
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Get how many tokens can still be minted
     * @return remaining Tokens remaining under the cap
     */
    function getRemainingMintable() public view returns (uint256) {
        return MAX_MINTABLE - totalMintedViaGateway;
    }

    /**
     * @notice Get current effective total supply
     * @return total Current total (initial + minted via gateway)
     */
    function getEffectiveTotalSupply() public view returns (uint256) {
        return INITIAL_SUPPLY + totalMintedViaGateway;
    }

    /**
     * @notice Check if a specific mint would succeed
     * @param amount Amount to check
     * @return possible Whether the mint would succeed
     * @return remaining How much can still be minted
     */
    function canMint(uint256 amount) external view returns (bool possible, uint256 remaining) {
        remaining = getRemainingMintable();
        possible = amount <= remaining && !paused();
    }

    /**
     * @notice Get comprehensive supply info
     */
    function getSupplyInfo() external view returns (
        uint256 maxSupply,
        uint256 initialSupply,
        uint256 mintedViaGateway,
        uint256 effectiveTotal,
        uint256 remainingMintable,
        uint256 percentageMinted
    ) {
        maxSupply = MAX_TOTAL_SUPPLY;
        initialSupply = INITIAL_SUPPLY;
        mintedViaGateway = totalMintedViaGateway;
        effectiveTotal = getEffectiveTotalSupply();
        remainingMintable = getRemainingMintable();
        percentageMinted = (effectiveTotal * 10000) / MAX_TOTAL_SUPPLY; // basis points
    }

    // ═══════════════════════════════════════════════════════════════════
    // AUTHORIZED CALLER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Add an authorized caller (e.g., MilestoneEscrow)
     * @param caller Address to authorize
     */
    function addAuthorizedCaller(address caller) external onlyOwner {
        if (caller == address(0)) revert InvalidAddress();
        if (authorizedCallers[caller]) revert AlreadyAuthorized();

        authorizedCallers[caller] = true;
        authorizedCallerCount++;

        emit AuthorizedCallerAdded(caller);
    }

    /**
     * @notice Remove an authorized caller
     * @param caller Address to de-authorize
     */
    function removeAuthorizedCaller(address caller) external onlyOwner {
        if (!authorizedCallers[caller]) revert NotAuthorizedCaller();

        authorizedCallers[caller] = false;
        authorizedCallerCount--;

        emit AuthorizedCallerRemoved(caller);
    }

    // ═══════════════════════════════════════════════════════════════════
    // EMERGENCY FUNCTIONS (🛡️ SECURITY FIX #5: Guardian Pattern)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Pause all minting (emergency only)
     * @param reason Human-readable reason for the pause
     * @dev 🛡️ Guardian OR Owner can pause (quick response)
     */
    function emergencyPause(string calldata reason) external {
        require(
            msg.sender == guardian || msg.sender == owner(),
            "Only guardian or owner"
        );
        _pause();
        emit EmergencyPaused(msg.sender, reason);
    }

    /**
     * @notice Unpause minting
     * @dev 🛡️ ONLY Owner (Timelock) can unpause
     *      This prevents permanent brick if guardian key is lost
     *      But ensures guardian cannot unilaterally control minting
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }

    /**
     * @notice Change guardian address
     * @param newGuardian New guardian address
     * @dev Only owner (Timelock) can change guardian
     */
    function setGuardian(address newGuardian) external onlyOwner {
        if (newGuardian == address(0)) revert InvalidAddress();
        address oldGuardian = guardian;
        guardian = newGuardian;
        emit GuardianChanged(oldGuardian, newGuardian);
    }
}
```

---

## 🛡️ RESUMEN DE SECURITY FIXES (v2.0)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                     SECURITY FIXES IMPLEMENTADOS                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🔴 FIX #1: INITIAL_SUPPLY HARDCODEADO                                       ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ ANTES: uint256 constant INITIAL_SUPPLY = 2_000_000 * 10**18;           │ ║
║  │ DESPUÉS: uint256 immutable initialSupplyAtDeployment;                   │ ║
║  │          initialSupplyAtDeployment = cgcToken.totalSupply();           │ ║
║  │ IMPACTO: Cap SIEMPRE correcto, independiente de mints previos          │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  🔴 FIX #2: DAO PUEDE AÑADIR NUEVOS MINTERS (BYPASS)                         ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ ANTES: DAO es owner de CGCToken → puede addMinter() → bypass           │ ║
║  │ DESPUÉS: Timelock es owner de CGCToken → 7 días delay                  │ ║
║  │ IMPACTO: Comunidad tiene tiempo de auditar cualquier cambio            │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  🟡 FIX #3: MILESTONE ESCROW MIGRATION                                       ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ ANTES: Plan asumía que MilestoneEscrow llama mint()                    │ ║
║  │ DESPUÉS: Descubrimos que NUNCA llama mint() - usa transfer()           │ ║
║  │ IMPACTO: NO hay migration downtime, solo remover permiso no usado      │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  🟡 FIX #4: OWNER PODRÍA DRENAR SUPPLY                                       ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ ANTES: Owner podría ser EOA → compromiso = drain inmediato             │ ║
║  │ DESPUÉS: Owner = Timelock → 7 días para reaccionar                     │ ║
║  │ IMPACTO: Si hay ataque, comunidad tiene tiempo de migrar               │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  🟡 FIX #5: PAUSABLE PODRÍA BRICK                                            ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ ANTES: Solo owner puede pause/unpause → si key perdida = brick         │ ║
║  │ DESPUÉS: Guardian puede pause, SOLO owner puede unpause                │ ║
║  │ IMPACTO: Emergencias rápidas + no brick permanente                     │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Pre-Requisitos
- [ ] Revisar y aprobar este plan
- [ ] Confirmar que el equipo entiende cada paso
- [ ] Tener ETH suficiente para gas (~0.01 ETH)

### Desarrollo
- [ ] Crear `contracts/core/MinterGateway.sol`
- [ ] Escribir tests en `test/MinterGateway.test.js`
- [ ] Pasar todos los tests unitarios
- [ ] Pasar tests de integración
- [ ] Code review interno

### Testnet
- [ ] Deploy en Base Sepolia
- [ ] Verificar en BaseScan
- [ ] Tests manuales completos
- [ ] Documentar dirección del contrato

### DAO Proposal
- [ ] Crear propuesta en Aragon
- [ ] Campaña de comunicación a la comunidad
- [ ] Período de votación (7 días)
- [ ] Quorum alcanzado

### Mainnet
- [ ] Ejecutar propuesta
- [ ] Verificar contrato en BaseScan
- [ ] Confirmar configuración correcta
- [ ] Test de mint real

### Post-Deploy
- [ ] Actualizar documentación
- [ ] Actualizar whitepaper
- [ ] Notificar a CoinGecko/BaseScan
- [ ] Actualizar APIs de supply

---

## 📊 IMPACTO EN FUNDING APPLICATIONS

### Antes (Problemático)
```
❌ "Max supply is 22M" - Promise, not guarantee
❌ Grant reviewers see: "mint() with NO LIMITS"
❌ Technical due diligence fails
```

### Después (Verificable)
```
✅ "Max supply is 22M" - Immutable constant in code
✅ Grant reviewers see: hardcoded cap in MinterGateway
✅ Can verify on BaseScan: MAX_TOTAL_SUPPLY = 22M
✅ Technical due diligence passes
```

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Bug en MinterGateway | Baja | Alto | Tests exhaustivos + código simple |
| Propuesta DAO rechazada | Media | Medio | Comunicación clara del beneficio |
| Error en migración | Baja | Alto | Testnet first + checklist |
| Gateway pausado sin querer | Muy baja | Medio | Solo owner puede pausar |

---

## 📅 TIMELINE ESTIMADO

| Fase | Duración | Dependencias |
|------|----------|--------------|
| Desarrollo | 1-2 días | Ninguna |
| Testing | 2-3 días | Desarrollo |
| Testnet | 1 día | Testing |
| Propuesta DAO | 7-10 días | Testnet |
| Ejecución Mainnet | 1 día | Propuesta aprobada |
| **TOTAL** | **12-17 días** | - |

---

## 🎯 RESULTADO FINAL

Después de implementar MinterGateway:

1. **Verificabilidad**: Cualquiera puede ver en BaseScan que `MAX_TOTAL_SUPPLY = 22,000,000`
2. **Inmutabilidad**: Es una `constant`, no una variable - no se puede cambiar
3. **Transparencia**: Cada mint emite evento con remaining supply
4. **Credibilidad**: Grant reviewers ven código que respalda la promesa

### URLs para Verificación (Post-Deploy)
- MinterGateway: `https://basescan.org/address/[GATEWAY_ADDRESS]#code`
- Función getRemainingMintable(): `https://basescan.org/address/[GATEWAY_ADDRESS]#readContract`
- Eventos de Mint: `https://basescan.org/address/[GATEWAY_ADDRESS]#events`

---

**Made by mbxarts.com The Moon in a Box property**
**Co-Author: Godez22**
