const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@platform/ui',
    '@platform/db',
    '@platform/validation',
    '@platform/types',
    '@platform/utils',
    '@platform/api-client',
  ],
  // Standalone output is only wanted inside Docker builds; `next start` is used locally.
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

module.exports = nextConfig;
