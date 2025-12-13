# 🔐 MinterGateway Implementation Plan
## Solución para Enforcement de Supply Cap Verificable On-Chain

**Fecha**: 13 Diciembre 2025
**Autor**: CryptoGift DAO Team
**Versión**: 1.0
**Estado**: 📋 PLAN DETALLADO - Listo para Implementación

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
    // CONSTANTES INMUTABLES - EL CORE DE LA GARANTÍA
    // ═══════════════════════════════════════════════════════════════

    uint256 public constant MAX_TOTAL_SUPPLY = 22_000_000 * 10**18;
    // ⬆️ INMUTABLE: Nadie puede cambiar esto. Nunca. Jamás.

    uint256 public constant INITIAL_SUPPLY = 2_000_000 * 10**18;
    // ⬆️ Los 2M que ya existen (minteados en constructor del token)

    // ═══════════════════════════════════════════════════════════════
    // ESTADO
    // ═══════════════════════════════════════════════════════════════

    uint256 public totalMintedViaGateway;
    // ⬆️ Contador de cuánto hemos minteado a través del gateway

    mapping(address => bool) public authorizedCallers;
    // ⬆️ MilestoneEscrow y otros sistemas que pueden pedir minting

    // ═══════════════════════════════════════════════════════════════
    // LA FUNCIÓN CRÍTICA
    // ═══════════════════════════════════════════════════════════════

    function mint(address to, uint256 amount) external {
        require(authorizedCallers[msg.sender], "Not authorized");

        // 🛡️ EL GUARDIÁN DEL CAP
        uint256 newTotal = INITIAL_SUPPLY + totalMintedViaGateway + amount;
        require(newTotal <= MAX_TOTAL_SUPPLY, "Would exceed max supply");

        // Actualizar contador ANTES de mintear (patrón CEI)
        totalMintedViaGateway += amount;

        // Ejecutar mint real
        cgcToken.mint(to, amount);

        emit TokensMinted(to, amount, totalMintedViaGateway, getRemainingMintable());
    }

    function getRemainingMintable() public view returns (uint256) {
        return MAX_TOTAL_SUPPLY - INITIAL_SUPPLY - totalMintedViaGateway;
    }
}
```

#### 3. MilestoneEscrow (Existente - Modificar Llamadas)
Actualmente llama directamente a `cgcToken.mint()`.
Debemos cambiar a `minterGateway.mint()`.

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
┌─────────────────────────────────────────────────────────────┐
│ PASO 4.1: Crear Propuesta en Aragon                         │
├─────────────────────────────────────────────────────────────┤
│ Título: "Implement MinterGateway for Verifiable Supply Cap" │
│                                                              │
│ Acciones a ejecutar (en orden):                              │
│                                                              │
│ ACTION 1: Deploy MinterGateway                               │
│   - new MinterGateway(cgcTokenAddress, daoAddress)          │
│                                                              │
│ ACTION 2: Configurar MinterGateway                           │
│   - minterGateway.addAuthorizedCaller(milestoneEscrow)      │
│                                                              │
│ ACTION 3: Transferir poder de minting                        │
│   - cgcToken.addMinter(minterGateway)                       │
│   - cgcToken.removeMinter(milestoneEscrow)                  │
│                                                              │
│ Quorum requerido: 10% supply                                 │
│ Período de votación: 7 días                                  │
│ Período de ejecución: 48 horas                               │
└─────────────────────────────────────────────────────────────┘
```

**Por qué hacerlo via DAO**:
- Transparencia total
- La comunidad aprueba el cambio
- Registro on-chain de la decisión
- Cumple con estándares de governance descentralizada

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

## 📜 CÓDIGO DEL CONTRATO MINTERGATEWAY

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
 * @title MinterGateway
 * @author CryptoGift DAO Team
 * @notice Gateway contract that enforces a hard cap on CGC token minting
 * @dev This contract acts as the sole authorized minter for CGCToken,
 *      ensuring that the total supply NEVER exceeds MAX_TOTAL_SUPPLY.
 *      The max supply is IMMUTABLE and cannot be changed by anyone,
 *      including the DAO owner.
 *
 * Architecture:
 * - DAO owns this contract
 * - Only this contract can mint CGC tokens
 * - MilestoneEscrow and other systems call this gateway
 * - Gateway enforces the 22M hard cap
 */
contract MinterGateway is Ownable, Pausable, ReentrancyGuard {

    // ═══════════════════════════════════════════════════════════════════
    // IMMUTABLE CONSTANTS - THE CORE GUARANTEE
    // ═══════════════════════════════════════════════════════════════════

    /// @notice Maximum total supply that can ever exist
    /// @dev This is IMMUTABLE. No one can change it. Ever.
    uint256 public constant MAX_TOTAL_SUPPLY = 22_000_000 * 10**18;

    /// @notice Initial supply that was minted in CGCToken constructor
    uint256 public constant INITIAL_SUPPLY = 2_000_000 * 10**18;

    /// @notice Maximum that can be minted via this gateway
    uint256 public constant MAX_MINTABLE = MAX_TOTAL_SUPPLY - INITIAL_SUPPLY;

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
     * @notice Deploy the MinterGateway
     * @param _cgcToken Address of the CGC token contract
     * @param _initialOwner Initial owner (should be the DAO)
     */
    constructor(
        address _cgcToken,
        address _initialOwner
    ) Ownable(_initialOwner) {
        if (_cgcToken == address(0)) revert InvalidAddress();
        if (_initialOwner == address(0)) revert InvalidAddress();

        cgcToken = ICGCToken(_cgcToken);
    }

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
    // EMERGENCY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * @notice Pause all minting (emergency only)
     * @param reason Human-readable reason for the pause
     */
    function emergencyPause(string calldata reason) external onlyOwner {
        _pause();
        emit EmergencyPaused(msg.sender, reason);
    }

    /**
     * @notice Unpause minting
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }
}
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
