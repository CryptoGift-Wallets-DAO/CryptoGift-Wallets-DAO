// import { withSentryConfig } from '@sentry/nextjs'; // Temporarily disabled for development

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // output: 'standalone', // Removed for Vercel compatibility
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Environment variables - Use consistent NEXT_PUBLIC_ prefixes
  env: {
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '8453', // Base mainnet
    NEXT_PUBLIC_ARAGON_DAO_ADDRESS: process.env.NEXT_PUBLIC_ARAGON_DAO_ADDRESS || process.env.ARAGON_DAO_ADDRESS,
    NEXT_PUBLIC_VAULT_ADDRESS: process.env.NEXT_PUBLIC_VAULT_ADDRESS || process.env.VAULT_ADDRESS,
  },

  // Webpack configuration for Web3
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Fix pino-pretty warning by excluding it from bundle
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
    };

    // Ensure TypeScript path mapping works correctly
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts'],
      '.jsx': ['.jsx', '.tsx'],
    };
    
    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

// Sentry configuration temporarily disabled for development debugging
// TODO: Re-enable Sentry once dependencies are resolved
export default nextConfig;

// Original Sentry configuration (commented out):
/*
export default withSentryConfig(nextConfig, {
  org: "cryptogift-wallets",
  project: "cryptogift-dao", 
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
*/