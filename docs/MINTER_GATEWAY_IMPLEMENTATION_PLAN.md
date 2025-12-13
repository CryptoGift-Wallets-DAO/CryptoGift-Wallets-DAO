# 🔐 MinterGateway Implementation Plan
## Solución para Enforcement de Supply Cap Verificable On-Chain

**Fecha**: 13 Diciembre 2025
**Autor**: CryptoGift DAO Team
**Versión**: 3.0 FINAL (Copy-Paste Ready)
**Estado**: ✅ LISTO PARA IMPLEMENTACIÓN - Sin Ambigüedades

---

## ⚠️ IMPORTANTE: ESTE ES EL DOCUMENTO DEFINITIVO

Este documento contiene:
- ✅ **UN SOLO** contrato final (sin bloques viejos)
- ✅ **Todas** las funciones view alineadas correctamente
- ✅ **Cero** contradicciones sobre MilestoneEscrow
- ✅ **Postura honesta** sobre Timelock (delay, no imposibilidad absoluta)
- ✅ **Política clara** de pause/unpause para evitar DoS
- ✅ **CGC decimals verificado**: 18 (línea 288 de CGCToken.sol)

---

## 📋 RESUMEN EJECUTIVO

### El Problema
CGCToken tiene función `mint()` **SIN CAP**:
```solidity
// CGCToken.sol línea 137 - Comentario literal: "NO LIMITS"
function mint(address to, uint256 amount) external {
    require(minters[msg.sender], "Not authorized to mint");
    // ❌ NO HAY require(totalSupply() + amount <= MAX_SUPPLY)
    _mint(to, amount);
}
```

### La Solución
MinterGateway: contrato intermediario que **sí enforza** el cap.

---

## 🔍 HECHOS VERIFICADOS (No Suposiciones)

### 1. CGCToken Decimals
```solidity
// CGCToken.sol línea 287-289
function decimals() public pure override returns (uint8) {
    return 18;  // ✅ VERIFICADO
}
```

### 2. MilestoneEscrow NO Mintea
```solidity
// MilestoneEscrow.sol línea 487-494
function withdraw() external nonReentrant {
    cgcToken.safeTransfer(msg.sender, amount);  // ← TRANSFER, no MINT
}
```
**HECHO**: MilestoneEscrow **NUNCA** llama `mint()`. Solo `transfer()`.

### 3. Quién Puede Mintear Hoy
| Dirección | ¿Es Minter? | ¿Llama mint()? | Fuente |
|-----------|-------------|----------------|--------|
| MilestoneEscrow | ✅ Sí (en deploy) | ❌ **NUNCA** | Código verificado |
| Deployer EOA | ✅ Si corrió script | ✅ Sí (manual) | mint-additional-supply.js |
| Aragon DAO | Owner del token | Puede añadir minters | CGCToken.addMinter() |

---

## 🏗️ ARQUITECTURA FINAL

### Separación de Ownerships (CRÍTICO)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ARQUITECTURA DE OWNERSHIPS FINAL                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │                      CGCTOKEN OWNERSHIP                                │  ║
║  │                                                                        │  ║
║  │  Owner: TimelockController (7 días delay)                             │  ║
║  │                                                                        │  ║
║  │  ¿Por qué Timelock y no Multisig?                                     │  ║
║  │  - Protege contra añadir nuevos minters de forma instantánea          │  ║
║  │  - 7 días = tiempo suficiente para que comunidad audite propuestas    │  ║
║  │                                                                        │  ║
║  │  ⚠️ VERDAD HONESTA:                                                   │  ║
║  │  Con Timelock, el bypass del Gateway ES POSIBLE después de 7 días.   │  ║
║  │  El cap del Gateway es inmutable, pero el DAO podría proponer         │  ║
║  │  addMinter(otraDireccion) y esperar 7 días para ejecutar.            │  ║
║  │                                                                        │  ║
║  │  Si quieres bypass IMPOSIBLE: usar renounceOwnership()               │  ║
║  │  (pero entonces perdemos capacidad de emergencia)                     │  ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │                    MINTERGATEWAY OWNERSHIP                             │  ║
║  │                                                                        │  ║
║  │  Owner: Multisig 3/5 (respuesta rápida)                               │  ║
║  │                                                                        │  ║
║  │  ¿Por qué Multisig y no Timelock?                                     │  ║
║  │  - Gateway solo puede mintear hasta el cap (no hay riesgo de bypass) │  ║
║  │  - Necesitamos respuesta rápida para:                                 │  ║
║  │    • unpause después de emergencia (evitar DoS de 7 días)            │  ║
║  │    • añadir/remover authorized callers                                │  ║
║  │                                                                        │  ║
║  │  Guardian: EOA del equipo de seguridad                                │  ║
║  │  - Puede pausar instantáneo (emergencia)                              │  ║
║  │  - NO puede unpause (evita que guardian malicioso controle minting)  │  ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Diagrama de Flujo

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         FLUJO DE MINTING CON GATEWAY                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   [Sistema que quiere mintear]                                               ║
║          │                                                                   ║
║          │ minterGateway.mint(recipient, amount)                             ║
║          ▼                                                                   ║
║   ┌──────────────────────────────────────────────────────────────────────┐   ║
║   │                     MINTER GATEWAY                                   │   ║
║   │                                                                      │   ║
║   │  1. ¿Está el caller autorizado?                                     │   ║
║   │     authorizedCallers[msg.sender] == true?                          │   ║
║   │                                                                      │   ║
║   │  2. ¿Cabe bajo el cap?                                              │   ║
║   │     totalMintedViaGateway + amount <= maxMintableViaGateway?        │   ║
║   │                                                                      │   ║
║   │  3. Si pasa: cgcToken.mint(recipient, amount)                       │   ║
║   │     Si falla: REVERT "Would exceed max supply"                      │   ║
║   └──────────────────────────────────────────────────────────────────────┘   ║
║          │                                                                   ║
║          ▼                                                                   ║
║   [CGCToken] ← Gateway es el ÚNICO minter autorizado                        ║
║          │                                                                   ║
║          ▼                                                                   ║
║   [Tokens minteados] ← GARANTIZADO bajo 22M mientras Gateway sea único      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 📜 CONTRATO FINAL (COPY-PASTE READY)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ICGCToken {
    function mint(address to, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);
}

/**
 * @title MinterGateway v3.0 FINAL
 * @author CryptoGift DAO Team
 * @notice Enforces hard cap on CGC token minting
 *
 * @dev VERIFIED FACTS:
 * - CGC has 18 decimals (CGCToken.sol line 288)
 * - MilestoneEscrow never calls mint() (uses transfer)
 * - This contract reads actual totalSupply() at deployment
 *
 * OWNERSHIP MODEL:
 * - Gateway owner: Multisig 3/5 (fast response for unpause/callers)
 * - Token owner: Timelock 7 days (protects against new minters)
 * - Guardian: EOA for emergency pause only
 */
contract MinterGateway is Ownable, Pausable, ReentrancyGuard {

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Maximum total supply that can ever exist (22 million with 18 decimals)
    /// @dev CGC decimals verified: 18 (CGCToken.sol line 288)
    uint256 public constant MAX_TOTAL_SUPPLY = 22_000_000 * 10**18;

    // ═══════════════════════════════════════════════════════════════════════
    // IMMUTABLE VALUES (set in constructor, never change)
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice The CGC token contract
    ICGCToken public immutable cgcToken;

    /// @notice Supply at the moment this gateway was deployed
    /// @dev Read from cgcToken.totalSupply() - NOT hardcoded
    uint256 public immutable initialSupplyAtDeployment;

    /// @notice Maximum tokens that can be minted through this gateway
    /// @dev Calculated as: MAX_TOTAL_SUPPLY - initialSupplyAtDeployment
    uint256 public immutable maxMintableViaGateway;

    // ═══════════════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Running total of tokens minted via this gateway
    uint256 public totalMintedViaGateway;

    /// @notice Addresses authorized to request minting
    mapping(address => bool) public authorizedCallers;

    /// @notice Count of authorized callers
    uint256 public authorizedCallerCount;

    /// @notice Guardian can pause but NOT unpause (prevents DoS)
    address public guardian;

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event GatewayDeployed(
        address indexed cgcToken,
        uint256 initialSupply,
        uint256 maxMintable,
        address indexed owner,
        address indexed guardian
    );
    event TokensMinted(
        address indexed to,
        uint256 amount,
        uint256 totalMintedSoFar,
        uint256 remainingMintable,
        address indexed requestedBy
    );
    event AuthorizedCallerAdded(address indexed caller);
    event AuthorizedCallerRemoved(address indexed caller);
    event GuardianChanged(address indexed oldGuardian, address indexed newGuardian);
    event EmergencyPaused(address indexed by, string reason);
    event EmergencyUnpaused(address indexed by);

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error NotAuthorized();
    error WouldExceedMaxSupply(uint256 requested, uint256 remaining);
    error InvalidAddress();
    error InvalidAmount();
    error AlreadyAuthorized();
    error NotAuthorizedCaller();
    error InitialSupplyExceedsMax();
    error DecimalsMismatch();

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @param _cgcToken Address of CGC token (0x5e3a61b550328f3D8C44f60b3e10a49D3d806175)
     * @param _owner Multisig 3/5 address (for fast unpause and caller management)
     * @param _guardian EOA that can pause in emergencies
     */
    constructor(
        address _cgcToken,
        address _owner,
        address _guardian
    ) Ownable(_owner) {
        if (_cgcToken == address(0)) revert InvalidAddress();
        if (_owner == address(0)) revert InvalidAddress();
        if (_guardian == address(0)) revert InvalidAddress();

        cgcToken = ICGCToken(_cgcToken);
        guardian = _guardian;

        // Verify decimals match our assumption
        if (cgcToken.decimals() != 18) revert DecimalsMismatch();

        // Read ACTUAL supply at deployment (not hardcoded)
        initialSupplyAtDeployment = cgcToken.totalSupply();

        // Verify we haven't already exceeded max
        if (initialSupplyAtDeployment >= MAX_TOTAL_SUPPLY) {
            revert InitialSupplyExceedsMax();
        }

        // Calculate how much can be minted via this gateway
        maxMintableViaGateway = MAX_TOTAL_SUPPLY - initialSupplyAtDeployment;

        emit GatewayDeployed(
            _cgcToken,
            initialSupplyAtDeployment,
            maxMintableViaGateway,
            _owner,
            _guardian
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CORE MINTING
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Mint tokens with cap enforcement
     * @param to Recipient address
     * @param amount Amount to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount)
        external
        whenNotPaused
        nonReentrant
    {
        if (!authorizedCallers[msg.sender]) revert NotAuthorized();
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        uint256 remaining = getRemainingMintable();
        if (amount > remaining) {
            revert WouldExceedMaxSupply(amount, remaining);
        }

        // CEI pattern: update state before external call
        totalMintedViaGateway += amount;

        cgcToken.mint(to, amount);

        emit TokensMinted(
            to,
            amount,
            totalMintedViaGateway,
            getRemainingMintable(),
            msg.sender
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS (ALL use correct variables)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Tokens remaining under the cap
     * @return Remaining mintable via this gateway
     */
    function getRemainingMintable() public view returns (uint256) {
        return maxMintableViaGateway - totalMintedViaGateway;
    }

    /**
     * @notice Current effective total supply
     * @return initialSupplyAtDeployment + totalMintedViaGateway
     */
    function getEffectiveTotalSupply() public view returns (uint256) {
        return initialSupplyAtDeployment + totalMintedViaGateway;
    }

    /**
     * @notice Check if a mint would succeed
     */
    function canMint(uint256 amount) external view returns (bool possible, uint256 remaining) {
        remaining = getRemainingMintable();
        possible = amount <= remaining && !paused();
    }

    /**
     * @notice Get all supply information
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
        initialSupply = initialSupplyAtDeployment;      // ← Correct variable
        mintedViaGateway = totalMintedViaGateway;
        effectiveTotal = getEffectiveTotalSupply();
        remainingMintable = getRemainingMintable();
        percentageMinted = (effectiveTotal * 10000) / MAX_TOTAL_SUPPLY;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AUTHORIZED CALLER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    function addAuthorizedCaller(address caller) external onlyOwner {
        if (caller == address(0)) revert InvalidAddress();
        if (authorizedCallers[caller]) revert AlreadyAuthorized();
        authorizedCallers[caller] = true;
        authorizedCallerCount++;
        emit AuthorizedCallerAdded(caller);
    }

    function removeAuthorizedCaller(address caller) external onlyOwner {
        if (!authorizedCallers[caller]) revert NotAuthorizedCaller();
        authorizedCallers[caller] = false;
        authorizedCallerCount--;
        emit AuthorizedCallerRemoved(caller);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EMERGENCY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Pause minting (guardian OR owner)
     * @dev Guardian can pause for quick response
     */
    function emergencyPause(string calldata reason) external {
        require(msg.sender == guardian || msg.sender == owner(), "Not authorized");
        _pause();
        emit EmergencyPaused(msg.sender, reason);
    }

    /**
     * @notice Unpause minting (ONLY owner/multisig)
     * @dev Guardian cannot unpause - prevents DoS attack
     *      Owner is Multisig, so unpause is fast (no 7-day delay)
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }

    function setGuardian(address newGuardian) external onlyOwner {
        if (newGuardian == address(0)) revert InvalidAddress();
        address old = guardian;
        guardian = newGuardian;
        emit GuardianChanged(old, newGuardian);
    }
}
```

---

## 📋 RUNBOOK DE DEPLOY (5 Acciones)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         RUNBOOK DE DEPLOY MAINNET                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  PRE-REQUISITOS:                                                             ║
║  • Multisig 3/5 creado (Gnosis Safe recomendado)                            ║
║  • Guardian EOA identificado                                                 ║
║  • ETH para gas (~0.02 ETH)                                                 ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ACTION 1: Deploy TimelockController                                         ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ new TimelockController(                                                 │ ║
║  │     7 days,              // minDelay                                    │ ║
║  │     [daoAddress],        // proposers                                   │ ║
║  │     [daoAddress],        // executors                                   │ ║
║  │     address(0)           // admin (none)                                │ ║
║  │ )                                                                       │ ║
║  │                                                                         │ ║
║  │ PROPÓSITO: Proteger CGCToken.addMinter() con delay de 7 días           │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ACTION 2: Deploy MinterGateway                                              ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ new MinterGateway(                                                      │ ║
║  │     0x5e3a61b550328f3D8C44f60b3e10a49D3d806175,  // CGC Token          │ ║
║  │     multisigAddress,                              // Owner (3/5 Safe)  │ ║
║  │     guardianEOA                                   // Guardian          │ ║
║  │ )                                                                       │ ║
║  │                                                                         │ ║
║  │ Constructor automáticamente:                                            │ ║
║  │ • Verifica decimals == 18                                               │ ║
║  │ • Lee totalSupply() actual                                              │ ║
║  │ • Calcula maxMintableViaGateway                                         │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ACTION 3: Configurar minters en CGCToken                                    ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ cgcToken.addMinter(gatewayAddress)       // Gateway puede mintear      │ ║
║  │ cgcToken.removeMinter(escrowAddress)     // 0x8346CFcaE... (nunca usó) │ ║
║  │ cgcToken.removeMinter(deployerAddress)   // 0xc655BF2B... (si aplica)  │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ACTION 4: Transferir ownership de CGCToken al Timelock                      ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ cgcToken.transferOwnership(timelockAddress)                             │ ║
║  │                                                                         │ ║
║  │ RESULTADO: Cualquier addMinter() futuro requiere 7 días                │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
║  ACTION 5: Verificación Post-Deploy                                          ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │ ☐ gateway.cgcToken() == 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175     │ ║
║  │ ☐ gateway.initialSupplyAtDeployment() == cgcToken.totalSupply()        │ ║
║  │ ☐ gateway.maxMintableViaGateway() == 22M - initialSupply               │ ║
║  │ ☐ gateway.owner() == multisigAddress                                   │ ║
║  │ ☐ gateway.guardian() == guardianEOA                                    │ ║
║  │ ☐ cgcToken.minters(gateway) == true                                    │ ║
║  │ ☐ cgcToken.minters(escrow) == false                                    │ ║
║  │ ☐ cgcToken.minters(deployer) == false                                  │ ║
║  │ ☐ cgcToken.owner() == timelockAddress                                  │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🛡️ MATRIZ DE SEGURIDAD HONESTA

### Qué Protege Este Sistema

| Ataque | ¿Protegido? | Explicación |
|--------|-------------|-------------|
| Minter autorizado mintea infinito | ✅ **SÍ** | Cap en Gateway es inmutable |
| Caller no autorizado intenta mintear | ✅ **SÍ** | authorizedCallers check |
| Guardian malicioso pausa indefinido | ✅ **SÍ** | Unpause es Multisig (rápido) |
| DAO añade nuevo minter bypass | ⚠️ **CON DELAY** | Timelock da 7 días de aviso |
| Bug en contrato Gateway | ✅ **MITIGADO** | Multisig puede pausar, comunidad puede migrar |

### Lo Que NO Protege (Honestidad)

| Escenario | Realidad |
|-----------|----------|
| DAO vota añadir minter bypass | **POSIBLE** después de 7 días de delay |
| Multisig 3/5 se compromete | Gateway owner comprometido = callers manipulables |
| Timelock + DAO maliciosos coordinados | Pueden bypass después de delay |

**SOLUCIÓN PARA BYPASS ABSOLUTO**: Si se requiere que bypass sea **100% imposible**, usar `cgcToken.renounceOwnership()` en lugar de Timelock. Pero esto elimina capacidad de emergencia.

---

## ❌ LO QUE SE ELIMINÓ (Contradicciones Anteriores)

1. **Fase 6 "Actualizar MilestoneEscrow"** - ELIMINADA
   - MilestoneEscrow **nunca** llama mint(), usa transfer()
   - No necesita modificación alguna

2. **Tests `test_milestoneEscrowThroughGateway()`** - ELIMINADOS
   - Escrow no pasa por Gateway porque no mintea

3. **Variables `INITIAL_SUPPLY` y `MAX_MINTABLE` hardcodeadas** - ELIMINADAS
   - Todas las funciones usan `initialSupplyAtDeployment` y `maxMintableViaGateway`

4. **Afirmaciones "bypass imposible"** - CORREGIDAS
   - Ahora dice: "bypass posible con delay de 7 días"

---

## 📊 TESTS REQUERIDOS

```javascript
// Tests que SÍ tienen sentido:
test_cannotMintOverCap()
test_onlyAuthorizedCanMint()
test_correctInitialSupplyReading()
test_correctMaxMintableCalculation()
test_pauseStopsMinting()
test_guardianCanPause()
test_guardianCannotUnpause()
test_ownerCanUnpause()
test_getRemainingMintableDecreases()
test_getEffectiveTotalSupplyIncreases()
test_decimalsVerification()

// Tests que NO tienen sentido (MilestoneEscrow no mintea):
// ❌ test_milestoneEscrowThroughGateway()
// ❌ test_escrowMintAfterMigration()
```

---

## 🎯 CRITERIO GO/NO-GO

| Criterio | Estado |
|----------|--------|
| Un solo código final sin bloques viejos | ✅ |
| View functions usan variables correctas | ✅ |
| Sin contradicción MilestoneEscrow | ✅ |
| Postura Timelock honesta | ✅ |
| Política pause/unpause clara | ✅ |
| CGC decimals verificado (18) | ✅ |

**VEREDICTO: GO** - Este documento está listo para implementación.

---

## 📞 DIRECCIONES DE REFERENCIA

```
CGC Token:         0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
MilestoneEscrow:   0x8346CFcaECc90d678d862319449E5a742c03f109 (NO mintea)
Deployer:          0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6
DAO Aragon:        0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31 (owner actual)
```

---

**Made by mbxarts.com The Moon in a Box property**
**Co-Author: Godez22**
**Versión: 3.0 FINAL - 13 Diciembre 2025**
