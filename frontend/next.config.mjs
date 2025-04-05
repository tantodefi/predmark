/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.universalprofile.cloud', 'lukso.network', 'universalprofile.cloud'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
