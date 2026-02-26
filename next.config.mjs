/** @type {import('next').NextConfig} */
const nextConfig = {
    // Temporarily disable static export for development
    // output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    basePath: process.env.NODE_ENV === 'production' && process.env.STATIC_EXPORT === 'true' ? '/CIVIC1.1' : '',
    assetPrefix: process.env.NODE_ENV === 'production' && process.env.STATIC_EXPORT === 'true' ? '/CIVIC1.1/' : '',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
};

export default nextConfig;
