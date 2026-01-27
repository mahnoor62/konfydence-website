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
        source: '/comasy',
        destination: '/scenario-lab',
        permanent: true,
      },
      {
        source: '/comasy/:path*',
        destination: '/scenario-lab/:path*',
        permanent: true,
      },
      {
        source: '/comasi',
        destination: '/scenario-lab',
        permanent: true,
      },
      {
        source: '/comasi/:path*',
        destination: '/scenario-lab/:path*',
        permanent: true,
      },
      {
        source: '/CoMaSi',
        destination: '/scenario-lab',
        permanent: true,
      },
      {
        source: '/CoMaSi/:path*',
        destination: '/scenario-lab/:path*',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/scenario-lab',
        destination: '/CoMaSi',
      },
      {
        source: '/scenario-lab/:path*',
        destination: '/CoMaSi/:path*',
      },
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
