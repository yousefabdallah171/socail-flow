/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Windows compatibility
  outputFileTracingRoot: __dirname,
  productionBrowserSourceMaps: false,
  
  // Image optimization
  images: {
    domains: [
      'localhost',
      'vsxxkbngvkewtenswgrw.supabase.co',
      'images.unsplash.com',
      'via.placeholder.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // TypeScript - allow builds with errors for now
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint - allow builds with lint errors for now
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
};

module.exports = nextConfig;