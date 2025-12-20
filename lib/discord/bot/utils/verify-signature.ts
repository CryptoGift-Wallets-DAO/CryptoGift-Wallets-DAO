/**
 * Discord Signature Verification
 *
 * Verifies that incoming requests are actually from Discord
 * Required for Interactions Endpoint security
 *
 * Uses tweetnacl for Ed25519 verification (works in Edge Runtime)
 */

import nacl from 'tweetnacl'

// Lazy load public key to avoid build-time errors
function getPublicKey(): string | null {
  const key = process.env.DISCORD_PUBLIC_KEY
  if (!key) {
    console.error('[Discord] DISCORD_PUBLIC_KEY not configured')
    return null
  }
  return key
}

/**
 * Verify Discord request signature using tweetnacl
 *
 * Discord signs all interaction requests with Ed25519.
 * We must verify the signature before processing.
 */
export async function verifyDiscordSignature(
  body: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  const publicKey = getPublicKey()
  if (!publicKey) {
    return false
  }

  try {
    const message = timestamp + body
    const signatureBytes = hexToUint8Array(signature)
    const publicKeyBytes = hexToUint8Array(publicKey)
    const messageBytes = new TextEncoder().encode(message)

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)

    if (!isValid) {
      console.error('[Discord] Signature verification failed')
    }

    return isValid
  } catch (error) {
    console.error('[Discord] Signature verification error:', error)
    return false
  }
}

/**
 * Alias for backward compatibility
 */
export async function verifyDiscordSignatureNacl(
  body: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  return verifyDiscordSignature(body, signature, timestamp)
}

/**
 * Convert hex string to Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g)
  if (!matches) {
    throw new Error('Invalid hex string')
  }
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)))
}

/**
 * Verify request headers have required Discord fields
 */
export function hasRequiredHeaders(headers: Headers): boolean {
  const signature = headers.get('x-signature-ed25519')
  const timestamp = headers.get('x-signature-timestamp')
  return !!signature && !!timestamp
}

/**
 * Get signature and timestamp from headers
 */
export function getSignatureHeaders(headers: Headers): {
  signature: string | null
  timestamp: string | null
} {
  return {
    signature: headers.get('x-signature-ed25519'),
    timestamp: headers.get('x-signature-timestamp'),
  }
}
