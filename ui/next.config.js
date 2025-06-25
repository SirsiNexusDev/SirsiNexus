/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header
  
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sirsinexus.com',
      },
      {
        protocol: 'https',
        hostname: 'sirsinexus-assets.com',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Allow only specific origins for development
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://sirsinexus.com',
  ],

  // Configure rewrites with security in mind
  async rewrites() {
    return {
      beforeFiles: [
        // Add security checks for your API routes
        {
          source: '/api/:path*',
          has: [
            {
              type: 'header',
              key: 'x-api-key',
            },
          ],
          destination: '/api/:path*',
        },
      ],
      afterFiles: [
        // Redirect insecure requests to secure endpoints
        {
          source: '/api/public/:path*',
          destination: '/api/secure/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
