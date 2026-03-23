/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com'],
        unoptimized: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        serverComponentsExternalPackages: ['pg'],
    },
    // Vercel optimizations
    output: 'standalone',
    poweredByHeader: false,
    compress: true,
};

export default nextConfig;
