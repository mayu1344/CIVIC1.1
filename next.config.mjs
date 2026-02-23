/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    basePath: '/CIVIC1.1',
    assetPrefix: '/CIVIC1.1/',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Skip problematic pages during static export
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
};

export default nextConfig;
