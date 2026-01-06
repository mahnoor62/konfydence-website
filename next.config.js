// module.exports = {
//   reactStrictMode: false,
//   // output: 'export',
//   compress: true,
//   images: {
//     formats: ['image/avif', 'image/webp'],
//   },
// };

const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/CoMaSi',
        destination: '/comasi',
        permanent: true,
      },
      {
        source: '/CoMaSi/:path*',
        destination: '/comasi/:path*',
        permanent: true,
      },
      {
        source: '/comasy',
        destination: '/comasi',
        permanent: true,
      },
      {
        source: '/comasy/:path*',
        destination: '/comasi/:path*',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/comasi',
        destination: '/CoMaSi',
      },
      {
        source: '/comasi/:path*',
        destination: '/CoMaSi/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
