/**
 * 🪙 Total Supply API Endpoint
 *
 * CoinGecko-compliant endpoint for CGC token total supply
 * Returns total supply in CGC units (no decimals)
 *
 * Endpoint: GET /api/token/total-supply
 * Response: { "total_supply": "2000000" }
 *
 * Contract: 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175 (Base Mainnet)
 * Total Supply: 2,000,000 CGC (fixed supply, no minting)
 *
 * Made by mbxarts.com The Moon in a Box property
 */

import { NextResponse } from 'next/server';

// CGC Token Total Supply (fixed, immutable)
const TOTAL_SUPPLY = '2000000';

/**
 * GET handler for total supply endpoint
 * @returns {Promise<NextResponse>} JSON response with total supply
 */
export async function GET() {
  try {
    // Return total supply in CoinGecko-compliant format
    return NextResponse.json(
      {
        total_supply: TOTAL_SUPPLY
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('[Total Supply API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch total supply'
      },
      { status: 500 }
    );
  }
}
