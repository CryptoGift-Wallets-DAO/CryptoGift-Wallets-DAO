# 🎨 GUÍA COMPLETA: CONFIGURAR ICONO CGC EN TODAS LAS PLATAFORMAS

**Actualizado**: 9 de Diciembre, 2025
**Estado**: 🔄 EN PROGRESO

Made by mbxarts.com The Moon in a Box property

---

## 📋 ESTADO ACTUAL

| Plataforma | Estado | Próximo Paso |
|------------|--------|--------------|
| ✅ BaseScan | ENVIADO | Esperar aprobación (1-3 días) |
| 🔄 CoinGecko | PENDIENTE | Crear liquidity pool primero |
| 🔄 MetaMask | PENDIENTE | Después de CoinGecko |
| 🔄 Coinbase Wallet | PENDIENTE | Después de CoinGecko |
| ✅ Discord | COMPLETADO | Servidor configurado |

---

## ✅ PASO 1: BASESCAN - YA COMPLETADO

Has enviado el formulario. Espera 1-3 días para la aprobación.

**Qué esperar:**
- Recibirás un email de BaseScan
- Si aprueban, el logo aparecerá automáticamente en BaseScan
- Si rechazan, te dirán qué corregir

---

## 🔄 PASO 2: COINGECKO - REQUIERE LIQUIDITY POOL

### ⚠️ IMPORTANTE: CoinGecko NO lista tokens sin liquidez

Antes de aplicar a CoinGecko, DEBES crear un pool de liquidez en un DEX.

### Paso 2.1: Elegir DEX (Recomendado: Aerodrome)

**Aerodrome** es el DEX más popular en Base. Opciones:
- **Aerodrome** (recomendado): https://aerodrome.finance/
- **Uniswap V3**: https://app.uniswap.org/
- **BaseSwap**: https://baseswap.fi/

### Paso 2.2: Crear Pool de Liquidez en Aerodrome (PASO A PASO)

#### Requisitos previos:
- CGC tokens en tu wallet (tienes 2M en el deployer)
- ETH en Base para el par y gas (~$100 mínimo recomendado)

#### Instrucciones click por click:

1. **Abre Aerodrome**
   - Ve a: https://aerodrome.finance/
   - Click en **"Launch App"** (botón azul arriba a la derecha)

2. **Conecta tu wallet**
   - Click en **"Connect Wallet"** (arriba a la derecha)
   - Selecciona **MetaMask**
   - Aprueba la conexión en MetaMask
   - Asegúrate de estar en **Base Network** (si no, MetaMask te pedirá cambiar)

3. **Ve a Liquidity**
   - En el menú de arriba, click en **"Liquidity"**
   - O ve directo a: https://aerodrome.finance/liquidity

4. **Click en "New Position"**
   - Busca el botón **"New Position"** o **"+ Add Liquidity"**
   - Click en él

5. **Selecciona los tokens del par**
   - **Token A**: Busca "CGC" o pega la dirección:
     ```
     0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
     ```
   - **Token B**: Selecciona **WETH** (Wrapped ETH)

6. **Selecciona tipo de pool**
   - Elige **"Volatile"** (para tokens normales)
   - NO elijas "Stable" (eso es para stablecoins)

7. **Ingresa las cantidades**
   - **CGC**: Pon la cantidad que quieras (ej: 100,000 CGC)
   - **ETH**: Se calculará automáticamente basado en el precio que pongas
   - **TIP**: Empieza con ~$50-100 de cada lado

8. **Establece el precio inicial**
   - Si es un pool nuevo, TÚ decides el precio inicial
   - Ejemplo: Si pones 100,000 CGC = 0.05 ETH, eso significa:
     - 1 CGC = 0.0000005 ETH
     - Si ETH = $2000, entonces 1 CGC = $0.001

9. **Aprueba CGC**
   - Click en **"Approve CGC"**
   - Confirma en MetaMask (esto permite al DEX usar tus CGC)
   - Espera confirmación

10. **Añade liquidez**
    - Click en **"Add Liquidity"** o **"Supply"**
    - Confirma en MetaMask
    - Espera confirmación

11. **¡Listo!**
    - Tu pool está creado
    - Ahora CGC tiene liquidez y precio en un DEX
    - Guarda el link del pool para CoinGecko

### Paso 2.3: Aplicar a CoinGecko (después de crear pool)

#### Instrucciones click por click:

1. **Abre el formulario de CoinGecko**
   - Ve a: https://www.coingecko.com/en/coins/new
   - O: https://support.coingecko.com/hc/en-us/requests/new

2. **Selecciona categoría**
   - Click en **"Cryptocurrency Listing Request"**

3. **Llena el formulario con estos datos exactos:**

| Campo | Qué poner |
|-------|-----------|
| Subject | `New Token Listing Request: CryptoGift Coin (CGC) on Base` |
| Blockchain/Network | `Base` |
| Contract Address | `0x5e3a61b550328f3D8C44f60b3e10a49D3d806175` |
| Project Name | `CryptoGift Wallets DAO` |
| Token Symbol | `CGC` |
| Token Name | `CryptoGift Coin` |
| Project Website | `https://mbxarts.com` |
| Logo URL | `https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-200x200.png` |
| Twitter | `https://x.com/CryptoGiftDAO` |
| Discord | `https://discord.gg/XzmKkrvhHc` |
| GitHub | `https://github.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO` |
| Whitepaper | `https://mbxarts.com/CRYPTOGIFT_WHITEPAPER_v1.2.pdf` |
| DEX/Exchange | `[PEGAR LINK DE TU POOL EN AERODROME]` |

4. **Descripción del proyecto (copia esto):**
```
CryptoGift Wallets DAO is a decentralized autonomous organization built on Base that rewards users for completing educational tasks and community milestones.

CGC (CryptoGift Coin) is the governance token that enables:
- Community-driven decision making through Aragon DAO
- Task rewards distribution for educational achievements
- Multi-level referral commissions (10%, 5%, 2.5%)
- Milestone-based progressive token emission

Technical Details:
- Total Supply: 2,000,000 CGC (initial) / 22,000,000 CGC (max)
- Emission Model: Milestone-based progressive minting
- Contract Verified: BaseScan verified with source code
- DAO: Aragon OSx integration

The project has an active Discord community, verified smart contracts, and a functional task reward system.
```

5. **Adjunta el logo**
   - Si hay opción de subir archivo, descarga primero:
     https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-200x200.png
   - Súbelo al formulario

6. **Envía el formulario**
   - Click en **"Submit"**
   - Guarda el número de ticket que te den

---

## 🔄 PASO 3: METAMASK - Añadir Token Manualmente

MetaMask no muestra logos automáticamente para tokens nuevos. Los usuarios deben añadir el token manualmente.

### Para que TÚ veas CGC en tu MetaMask:

1. Abre MetaMask
2. Asegúrate de estar en **Base Network**
3. Click en **"Import tokens"** (abajo de la lista de tokens)
4. Pega la dirección del contrato:
   ```
   0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
   ```
5. Los demás campos se llenan automáticamente:
   - Symbol: CGC
   - Decimals: 18
6. Click en **"Add Custom Token"**
7. Click en **"Import Tokens"**

### Para que OTROS vean CGC:
- Después de que CoinGecko apruebe el token, MetaMask lo mostrará automáticamente
- Por ahora, deben añadirlo manualmente con la dirección

---

## 🔄 PASO 4: COINBASE WALLET - Usar Token List

Coinbase Wallet puede leer token lists. Ya tienes uno creado.

### Instrucciones para usuarios de Coinbase Wallet:

1. Abre Coinbase Wallet
2. Ve a **Settings** (Configuración)
3. Busca **"Manage Token Lists"** o **"Custom Tokens"**
4. Añade esta URL:
   ```
   https://mbxarts.com/tokenlist.json
   ```
5. El token CGC aparecerá con su logo

---

## 📊 URLs OFICIALES PARA COPIAR/PEGAR

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
```

---

## ✅ CHECKLIST ACTUALIZADO

### Completado:
- [x] Logo SVG 32x32 creado y subido a GitHub
- [x] Logo PNG 200x200 creado y subido a GitHub
- [x] Logo PNG 512x512 creado y subido a GitHub
- [x] URLs de GitHub RAW funcionando
- [x] tokenlist.json creado y accesible
- [x] Team section en website con LinkedIn
- [x] Email admin@mbxarts.com visible en website
- [x] Dominio mbxarts.com configurado
- [x] Discord server completamente configurado
- [x] **BaseScan formulario ENVIADO** ✅

### Pendiente:
- [ ] Esperar aprobación de BaseScan (1-3 días)
- [ ] Crear liquidity pool en Aerodrome (~$100 ETH necesarios)
- [ ] Aplicar a CoinGecko (después del pool)
- [ ] Esperar aprobación de CoinGecko (1-2 semanas)

---

## ❓ PREGUNTAS FRECUENTES

### ¿Por qué necesito crear un pool de liquidez?
CoinGecko solo lista tokens que tienen precio y pueden ser comerciados. Sin un pool, el token no tiene precio y no se puede comprar/vender.

### ¿Cuánto ETH necesito para el pool?
Mínimo recomendado: $100 en ETH (~0.05 ETH). Esto crea liquidez básica para que CoinGecko acepte el listing.

### ¿Qué precio pongo al crear el pool?
Tú decides el precio inicial. Considera:
- ¿Cuánto vale el proyecto?
- ¿Cuántos tokens hay en circulación?
- Un precio inicial bajo permite más crecimiento

### ¿Cuánto tiempo tarda CoinGecko?
Normalmente 1-2 semanas. Pueden pedir información adicional.

### ¿El logo aparecerá en MetaMask automáticamente?
Después de que CoinGecko apruebe el token, sí. Antes, los usuarios deben añadirlo manualmente.

---

## 🎯 PRÓXIMO PASO INMEDIATO

**CREAR EL POOL DE LIQUIDEZ EN AERODROME**

1. Ve a https://aerodrome.finance/
2. Conecta la wallet del deployer (tiene los CGC)
3. Necesitas ETH en Base (~$100 recomendado)
4. Sigue las instrucciones del Paso 2.2 arriba

¿Tienes ETH en Base para crear el pool?

---

Made by mbxarts.com The Moon in a Box property

Co-Author: Godez22
