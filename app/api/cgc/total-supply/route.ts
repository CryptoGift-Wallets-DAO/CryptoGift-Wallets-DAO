import { NextResponse } from 'next/server';

// CGC Token details for CoinGecko API
const CGC_TOKEN_CONFIG = {
  token_address: '0x5e3a61b550328f3D8C44f60b3e10a49D3d806175',
  chain_id: 8453, // Base Mainnet
  decimals: 18,
  total_supply: '2000000000000000000000000', // 2M CGC with 18 decimals
  symbol: 'CGC',
  name: 'CryptoGift Coin'
};

export async function GET() {
  try {
    const response = {
      token_address: CGC_TOKEN_CONFIG.token_address,
      chain_id: CGC_TOKEN_CONFIG.chain_id,
      decimals: CGC_TOKEN_CONFIG.decimals,
      total_supply: CGC_TOKEN_CONFIG.total_supply,
      symbol: CGC_TOKEN_CONFIG.symbol,
      name: CGC_TOKEN_CONFIG.name,
      updated_at: new Date().toISOString(),
      blockchain: 'Base',
      contract_verified: true,
      basescan_url: `https://basescan.org/token/${CGC_TOKEN_CONFIG.token_address}`
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30min cache, 1h stale
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error in CGC total supply API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch CGC token data'
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}