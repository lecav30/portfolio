/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        /* remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avataaars.io',
            },
        ], */
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.node/,
            use: 'raw-loader',
        });
        return config;
    },
};

export default nextConfig;
