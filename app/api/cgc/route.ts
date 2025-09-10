import { NextResponse } from 'next/server';

// Simple CGC Token API for CoinGecko
export async function GET() {
  try {
    const response = {
      token_address: '0x5e3a61b550328f3D8C44f60b3e10a49D3d806175',
      chain_id: 8453,
      decimals: 18,
      total_supply: '2000000000000000000000000',
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}