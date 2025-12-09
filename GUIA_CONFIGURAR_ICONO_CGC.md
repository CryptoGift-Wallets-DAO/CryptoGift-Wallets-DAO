# 🎨 GUÍA COMPLETA: CONFIGURAR ICONO CGC EN TODAS LAS PLATAFORMAS

**Actualizado**: 9 de Diciembre, 2025
**Estado**: 🔄 EN PROGRESO

Made by mbxarts.com The Moon in a Box property

---

## 🚨 RESUMEN EJECUTIVO - LEE ESTO PRIMERO

### ¿Qué debes hacer TÚ manualmente?
| Acción | Estado | ¿Puedes hacerlo AHORA? |
|--------|--------|------------------------|
| ✅ BaseScan formulario | ENVIADO | Solo esperar (1-3 días) |
| 🔴 Crear pool de liquidez | PENDIENTE | **SÍ - HAZLO AHORA** |
| 🔴 Aplicar a CoinGecko | PENDIENTE | Después del pool |

### ¿Qué es AUTOMÁTICO (no necesitas hacer nada)?
| Plataforma | Cómo funciona |
|------------|---------------|
| **MetaMask logo** | Se muestra AUTOMÁTICAMENTE después de que CoinGecko liste el token |
| **Coinbase Wallet logo** | Ya tienes tokenlist.json - los usuarios pueden importarlo |
| **Otras wallets** | Obtienen datos de CoinGecko automáticamente |

### ¿Qué es el tokenlist.json?
Es un archivo estándar que ya creaste. Los usuarios de Coinbase Wallet pueden importar `https://mbxarts.com/tokenlist.json` para ver CGC con su logo. **NO necesitas hacer nada más con esto.**

---

## 📋 ESTADO ACTUAL DE CADA PLATAFORMA

| Plataforma | Estado | Acción Requerida |
|------------|--------|------------------|
| ✅ BaseScan | ENVIADO | Esperar aprobación (1-3 días) |
| 🔴 Pool de Liquidez | PENDIENTE | **CREAR AHORA** (~$100 ETH) |
| 🔴 CoinGecko | PENDIENTE | Aplicar después del pool |
| ⏳ MetaMask | AUTOMÁTICO | Nada - aparece después de CoinGecko |
| ✅ Coinbase Wallet | LISTO | tokenlist.json ya existe |
| ✅ Discord | COMPLETADO | Servidor configurado |

---

## 🎯 ORDEN CORRECTO DE PASOS (EMPIEZA AQUÍ)

### PASO 1: ✅ BASESCAN - YA COMPLETADO
Has enviado el formulario. **Solo espera 1-3 días**.

**Qué esperar:**
- Email de BaseScan con aprobación o correcciones
- Si aprueban → Logo aparece automáticamente en BaseScan
- Si rechazan → Te dirán qué corregir

**⚠️ NO necesitas esperar a BaseScan para continuar con los siguientes pasos.**

---

### PASO 2: 🔴 CREAR POOL DE LIQUIDEZ - HAZLO AHORA

**¿Por qué?** CoinGecko NO lista tokens sin liquidez. Necesitas un pool activo en un DEX.

**¿Cuánto necesitas?** ~$100 USD en ETH (Base Network)

#### Paso 2.1: Preparar tus fondos
1. **Verifica que tienes CGC tokens** en tu wallet deployer
2. **Obtén ETH en Base Network** (~$100 USD = ~0.03-0.05 ETH dependiendo del precio)
   - Puedes hacer bridge desde Ethereum mainnet
   - O comprar directamente si tu exchange soporta Base

#### Paso 2.2: Crear Pool en Aerodrome (Click por Click)

**URL**: https://aerodrome.finance/

##### Instrucciones exactas:

**1. Abre Aerodrome**
```
URL: https://aerodrome.finance/
```
- Click en **"Launch App"** (botón azul arriba a la derecha)

**2. Conecta tu wallet**
- Click en **"Connect Wallet"** (arriba a la derecha)
- Selecciona **MetaMask** (o tu wallet)
- En MetaMask: Click **"Conectar"** para aprobar
- Si MetaMask dice "Wrong network": Click **"Switch to Base"**

**3. Ve a Liquidity**
- En el menú superior, click en **"Liquidity"**
- O ve directo a: `https://aerodrome.finance/liquidity`

**4. Crear nueva posición**
- Click en **"New Position"** o **"+ Add Liquidity"**

**5. Seleccionar Token A (CGC)**
- En el primer campo de token, click en el dropdown
- Click en **"Manage Token Lists"** o el ícono de búsqueda
- Pega esta dirección exacta:
```
0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
```
- Click en **"Import"** o **"Add Token"** si aparece
- Selecciona **CGC**

**6. Seleccionar Token B (WETH)**
- En el segundo campo de token
- Busca y selecciona **WETH** (Wrapped ETH)

**7. Seleccionar tipo de pool**
- Elige **"Volatile"** (para tokens normales)
- ❌ NO elijas "Stable" (eso es solo para stablecoins)

**8. Establecer cantidades**
- **CGC**: Escribe la cantidad (ejemplo: `100000`)
- **ETH/WETH**: Escribe la cantidad (ejemplo: `0.025` que son ~$50)
- El sistema te mostrará el precio implícito

**9. Revisar el precio**
- El precio se calcula automáticamente basado en las cantidades
- Ejemplo: 100,000 CGC + 0.025 ETH = 1 CGC vale 0.00000025 ETH
- Si ETH = $2000, entonces 1 CGC = $0.0005

**10. Aprobar CGC**
- Click en **"Approve CGC"**
- En MetaMask: Click **"Confirmar"**
- Espera ~10 segundos a que se confirme
- El botón cambiará a "Add Liquidity"

**11. Añadir liquidez**
- Click en **"Add Liquidity"** o **"Supply"**
- En MetaMask: Click **"Confirmar"**
- Espera ~10 segundos a que se confirme

**12. ¡ÉXITO!**
- Verás un mensaje de confirmación
- **IMPORTANTE**: Guarda estos datos:
  - **Transaction Hash**: Copia el hash de la transacción
  - **Pool Link**: Copia el URL de la página del pool

**Ejemplo de datos a guardar:**
```
Pool creado exitosamente:
- DEX: Aerodrome
- Par: CGC/WETH
- Transaction Hash: 0x123abc... (copia el tuyo)
- Pool URL: https://aerodrome.finance/pool/0x... (copia el tuyo)
- Cantidad CGC: 100,000
- Cantidad ETH: 0.025
- Fecha: 9 de Diciembre, 2025
```

---

### PASO 3: 🔴 APLICAR A COINGECKO - DESPUÉS DEL POOL

**URL del formulario**: https://support.coingecko.com/hc/en-us/requests/new

#### Paso 3.1: Abrir el formulario
1. Ve a: `https://support.coingecko.com/hc/en-us/requests/new`
2. Si no tienes cuenta CoinGecko, créala primero

#### Paso 3.2: Seleccionar categoría
- Click en el dropdown de categoría
- Selecciona: **"Cryptocurrency Listing Request"**

#### Paso 3.3: Llenar el formulario (copia estos valores exactos)

| Campo | Valor a poner |
|-------|---------------|
| **Subject** | `New Token Listing Request: CryptoGift Coin (CGC) on Base` |
| **Blockchain/Network** | `Base` |
| **Contract Address** | `0x5e3a61b550328f3D8C44f60b3e10a49D3d806175` |
| **Project Name** | `CryptoGift Wallets DAO` |
| **Token Symbol** | `CGC` |
| **Token Name** | `CryptoGift Coin` |
| **Total Supply** | `22000000` |
| **Decimals** | `18` |
| **Project Website** | `https://mbxarts.com` |
| **Logo URL** | `https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-200x200.png` |
| **Twitter** | `https://x.com/CryptoGiftDAO` |
| **Discord** | `https://discord.gg/XzmKkrvhHc` |
| **GitHub** | `https://github.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO` |
| **Whitepaper** | `https://mbxarts.com/CRYPTOGIFT_WHITEPAPER_v1.2.pdf` |
| **Total Supply API** | `https://mbxarts.com/api/token/total-supply` |
| **Circulating Supply API** | `https://mbxarts.com/api/token/circulating-supply` |
| **DEX/Exchange** | `[PEGAR TU POOL URL DE AERODROME]` |
| **Pool Transaction Hash** | `[PEGAR TU TRANSACTION HASH DEL PASO 2]` |
| **Contact Email** | `admin@mbxarts.com` |

#### Paso 3.4: Descripción del proyecto (copia todo esto)
```
CryptoGift Wallets DAO is a decentralized autonomous organization built on Base that rewards users for completing educational tasks and community milestones.

CGC (CryptoGift Coin) is the governance token that enables:
- Community-driven decision making through Aragon DAO
- Task rewards distribution for educational achievements
- Multi-level referral commissions (10%, 5%, 2.5%)
- Milestone-based progressive token emission

Technical Details:
- Initial Circulating Supply: 2,000,000 CGC
- Maximum Supply: 22,000,000 CGC (via milestone-based minting)
- Emission Model: Milestone-based progressive minting
- Contract: Verified on BaseScan with source code
- DAO: Aragon OSx integration on Base

The project has an active Discord community, verified smart contracts, and a functional task reward system with multi-level referrals.
```

#### Paso 3.5: Adjuntar logo (si hay opción)
1. Descarga el logo de: `https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-200x200.png`
2. Si el formulario permite subir archivo, súbelo

#### Paso 3.6: Enviar
1. Revisa todo una última vez
2. Click en **"Submit"**
3. **GUARDA** el número de ticket que te den

---

### PASO 4: ⏳ METAMASK - ES AUTOMÁTICO

**NO necesitas hacer nada manual para que el logo aparezca en MetaMask.**

#### ¿Cómo funciona?
1. CoinGecko aprueba el token (1-2 semanas después de aplicar)
2. MetaMask obtiene datos de tokens de APIs públicas (incluido CoinGecko)
3. El logo aparece AUTOMÁTICAMENTE en MetaMask para todos los usuarios

#### Mientras tanto, ¿cómo ven los usuarios el token?
Los usuarios pueden añadir CGC manualmente (sin logo) así:

1. Abrir MetaMask
2. Asegurarse de estar en **Base Network**
3. Click en **"Import tokens"** (abajo de la lista)
4. Pegar: `0x5e3a61b550328f3D8C44f60b3e10a49D3d806175`
5. Click **"Add Custom Token"** → **"Import Tokens"**

El token aparecerá sin logo hasta que CoinGecko lo apruebe. **Esto es normal.**

---

### PASO 5: ✅ COINBASE WALLET - YA LISTO

El archivo `tokenlist.json` ya existe. Los usuarios de Coinbase Wallet pueden:

1. Abrir Coinbase Wallet
2. Ir a **Settings** → **Manage Token Lists**
3. Añadir URL: `https://mbxarts.com/tokenlist.json`
4. CGC aparecerá con su logo

**No necesitas hacer nada más.**

---

## 📊 URLs OFICIALES (COPIA/PEGA)

### Logos:
```
SVG 32x32 (BaseScan):
https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/cgc-logo-32x32.svg

PNG 200x200 (CoinGecko):
https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-200x200.png

PNG 512x512 (Wallets):
https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-512x512.png
```

### Token Info:
```
Contract Address: 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
Network: Base (Chain ID: 8453)
Symbol: CGC
Decimals: 18
Name: CryptoGift Coin
```

### Links del Proyecto:
```
Website: https://mbxarts.com
Docs: https://mbxarts.com/docs
Whitepaper: https://mbxarts.com/CRYPTOGIFT_WHITEPAPER_v1.2.pdf
Token List: https://mbxarts.com/tokenlist.json
Twitter: https://x.com/CryptoGiftDAO
Discord: https://discord.gg/XzmKkrvhHc
GitHub: https://github.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO
BaseScan: https://basescan.org/token/0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
Aragon DAO: https://app.aragon.org/#/daos/base/0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31
Total Supply API: https://mbxarts.com/api/token/total-supply
Circulating Supply API: https://mbxarts.com/api/token/circulating-supply
```

---

## ✅ CHECKLIST DE PROGRESO

### Ya Completado:
- [x] Logo SVG 32x32 creado y subido a GitHub
- [x] Logo PNG 200x200 creado y subido a GitHub
- [x] Logo PNG 512x512 creado y subido a GitHub
- [x] URLs de GitHub RAW funcionando y verificadas
- [x] tokenlist.json creado y accesible
- [x] Team section en website con LinkedIn
- [x] Email admin@mbxarts.com visible en website
- [x] Dominio mbxarts.com configurado
- [x] Discord server completamente configurado
- [x] APIs Total Supply y Circulating Supply funcionando
- [x] Whitepaper PDF disponible
- [x] **BaseScan formulario ENVIADO**

### Pendiente (en orden):
- [ ] Esperar aprobación de BaseScan (1-3 días) - **PARALELO**
- [ ] **SIGUIENTE**: Crear liquidity pool en Aerodrome (~$100 ETH necesarios)
- [ ] Aplicar a CoinGecko (después del pool)
- [ ] Esperar aprobación de CoinGecko (1-2 semanas)
- [ ] Logo automático en MetaMask (después de CoinGecko)

---

## ❓ PREGUNTAS FRECUENTES

### ¿Puedo hacer el pool de liquidez AHORA mientras espero BaseScan?
**SÍ.** Son procesos independientes. Puedes y debes crear el pool ahora.

### ¿Por qué necesito un pool de liquidez?
CoinGecko solo lista tokens que tienen precio y pueden ser comerciados. Sin un pool, el token no tiene precio y no se puede comprar/vender.

### ¿Cuánto ETH necesito para el pool?
Mínimo recomendado: **$100 en ETH** (~0.03-0.05 ETH). Esto crea liquidez básica para que CoinGecko acepte el listing.

### ¿El logo aparecerá en MetaMask automáticamente?
**SÍ**, pero SOLO después de que CoinGecko apruebe el token. Antes de eso, usuarios pueden añadir el token manualmente (sin logo).

### ¿Para qué sirve el tokenlist.json?
Para Coinbase Wallet y otras wallets que soporten importar token lists. Los usuarios pueden importar `https://mbxarts.com/tokenlist.json` para ver CGC con logo.

### ¿Cuánto tiempo tarda todo el proceso?
- BaseScan: 1-3 días
- CoinGecko: 1-2 semanas después de aplicar
- MetaMask: Automático después de CoinGecko

---

## 🎯 TU PRÓXIMO PASO AHORA MISMO

**1. ¿Tienes ~$100 en ETH en Base Network?**
   - **SÍ** → Ve al PASO 2 y crea el pool de liquidez
   - **NO** → Primero obtén ETH en Base (bridge desde Ethereum o compra directa)

**2. Después del pool** → Aplica a CoinGecko (PASO 3)

**3. Mientras tanto** → Espera BaseScan (proceso paralelo)

---

Made by mbxarts.com The Moon in a Box property

Co-Author: Godez22
