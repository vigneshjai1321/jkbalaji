import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// SWC is required so Vitest emits decorator metadata (NestJS DI relies on it).
export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    coverage: { provider: 'v8', reportsDirectory: './coverage' },
  },
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
