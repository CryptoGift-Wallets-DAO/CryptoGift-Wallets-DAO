/**
 * Discord Signature Verification
 *
 * Verifies that incoming requests are actually from Discord
 * Required for Interactions Endpoint security
 */

import { webcrypto } from 'crypto'

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY

/**
 * Verify Discord request signature
 *
 * Discord signs all interaction requests with Ed25519.
 * We must verify the signature before processing.
 */
export async function verifyDiscordSignature(
  body: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  if (!DISCORD_PUBLIC_KEY) {
    console.error('[Discord] DISCORD_PUBLIC_KEY not configured')
    return false
  }

  try {
    // Prepare the message to verify
    const message = timestamp + body

    // Convert hex strings to Uint8Array
    const signatureBytes = hexToUint8Array(signature)
    const publicKeyBytes = hexToUint8Array(DISCORD_PUBLIC_KEY)
    const messageBytes = new TextEncoder().encode(message)

    // Import the public key
    const cryptoKey = await webcrypto.subtle.importKey(
      'raw',
      publicKeyBytes,
      {
        name: 'Ed25519',
        namedCurve: 'Ed25519',
      },
      false,
      ['verify']
    )

    // Verify the signature
    const isValid = await webcrypto.subtle.verify(
      'Ed25519',
      cryptoKey,
      signatureBytes,
      messageBytes
    )

    return isValid
  } catch (error) {
    console.error('[Discord] Signature verification error:', error)
    return false
  }
}

/**
 * Alternative verification using tweetnacl (fallback)
 */
export async function verifyDiscordSignatureNacl(
  body: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  if (!DISCORD_PUBLIC_KEY) {
    console.error('[Discord] DISCORD_PUBLIC_KEY not configured')
    return false
  }

  try {
    // Dynamic import to avoid bundling issues
    const nacl = await import('tweetnacl')

    const message = timestamp + body
    const signatureBytes = hexToUint8Array(signature)
    const publicKeyBytes = hexToUint8Array(DISCORD_PUBLIC_KEY)
    const messageBytes = new TextEncoder().encode(message)

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
  } catch (error) {
    console.error('[Discord] NaCl verification error:', error)
    return false
  }
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
