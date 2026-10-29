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
    '@platform/ai-model',
    '@platform/semantic-engine',
  ],
  // Standalone output is only wanted inside Docker builds; `next start` is used locally.
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Ship the local ONNX model + tokenizer with the traced server output, plus
  // onnxruntime-node's full bin/ dir: the tracer only sees the .node binding,
  // not the libonnxruntime dylib/so it dlopens via rpath at runtime.
  outputFileTracingIncludes: {
    '/api/ai/**': [
      '../../packages/ai-model/model/**',
      '../../node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/**',
    ],
  },
};

module.exports = nextConfig;
