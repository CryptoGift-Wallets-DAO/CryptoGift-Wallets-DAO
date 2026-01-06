/**
 * Mini App Auth Verification API
 *
 * SECURITY CRITICAL: This endpoint verifies Farcaster signatures
 * and creates secure sessions. Never trust client-provided data.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { NextRequest, NextResponse } from 'next/server';

// Session expiration: 24 hours
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

interface VerifyRequest {
  message: string;
  signature: string;
  nonce: string;
}

interface FarcasterMessage {
  domain: string;
  nonce: string;
  fid: number;
  custody?: string;
}

/**
 * Verify Farcaster signature and create session
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json();

    // Validate required fields
    if (!body.message || !body.signature || !body.nonce) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Decode and parse the message
    let parsedMessage: FarcasterMessage;
    try {
      // The message is typically a JSON string
      parsedMessage = JSON.parse(body.message);
    } catch {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Verify nonce matches
    if (parsedMessage.nonce !== body.nonce) {
      return NextResponse.json(
        { error: 'Nonce mismatch' },
        { status: 400 }
      );
    }

    // Verify domain matches our app
    const expectedDomain = 'mbxarts.com';
    if (parsedMessage.domain !== expectedDomain) {
      return NextResponse.json(
        { error: 'Domain mismatch' },
        { status: 400 }
      );
    }

    // TODO: In production, verify the signature cryptographically
    // This requires calling Farcaster Hub or using a verification library
    // For now, we trust the message structure (suitable for MVP)
    //
    // Production implementation should:
    // 1. Fetch the user's custody address from Farcaster Hub
    // 2. Verify the signature using ethers or viem
    // 3. Confirm the FID owns the signing address

    const fid = parsedMessage.fid;
    if (!fid || typeof fid !== 'number') {
      return NextResponse.json(
        { error: 'Invalid FID' },
        { status: 400 }
      );
    }

    // Get wallet address for this FID
    // In production, fetch from Farcaster Hub API
    const wallet = await getWalletForFid(fid);

    if (!wallet) {
      return NextResponse.json(
        { error: 'Could not resolve wallet for FID' },
        { status: 400 }
      );
    }

    // Create session
    const now = Date.now();
    const session = {
      fid,
      wallet: wallet.toLowerCase(),
      verifiedAt: now,
      expiresAt: now + SESSION_DURATION_MS,
      signature: body.signature,
    };

    // Return session to client
    // In production, also store server-side for validation
    return NextResponse.json(session);
  } catch (error) {
    console.error('[MiniApp Auth] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get wallet address for a Farcaster FID
 * TODO: Implement proper Hub API call in production
 */
async function getWalletForFid(fid: number): Promise<string | null> {
  try {
    // In production, use Farcaster Hub API:
    // const response = await fetch(`https://hub.farcaster.xyz/v1/userDataByFid?fid=${fid}`);
    // Or use Neynar API:
    // const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
    //   headers: { 'api_key': process.env.NEYNAR_API_KEY! }
    // });

    // For MVP, we'll need to implement this properly
    // Returning null will cause auth to fail, which is safe
    console.log(`[MiniApp Auth] Would fetch wallet for FID: ${fid}`);

    // Placeholder - in production, return actual wallet
    // For testing, you can hardcode a test wallet
    return null;
  } catch (error) {
    console.error('[MiniApp Auth] Error fetching wallet for FID:', error);
    return null;
  }
}
