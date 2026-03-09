import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    angular(),
    tsconfigPaths()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: { // coverage configuration
      provider: 'v8',
      include: ['src/**/*.ts'], // Analyze all TypeScript files in src/
      exclude: [
        'src/**/*.spec.ts',     // Don't calculate coverage for test files
        'src/test-setup.ts',    // Don't calculate coverage for the setup file
        'src/main.ts',          // Usually ignored as it just bootstraps the app
        'src/**/*.config.ts'    // Ignore config files
      ],
      reporter: ['text', 'html', 'lcov'] // Generate terminal output, HTML report, and lcov for IDE
    }
  }
});
