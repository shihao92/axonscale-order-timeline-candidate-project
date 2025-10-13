import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    // Only run tests located under src/tests to avoid duplicate or legacy test files
    include: ['src/tests/**/*.{test,spec}.{ts,tsx}']
  }
});
