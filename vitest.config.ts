import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    angular(),
    tsconfigPaths()
  ],
  test: {
    globals: true, // This enables global access to expect, describe, etc.
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: { // coverage configuration
      provider: 'v8',
      include: ['src/**/*.ts'], // Analyze all TypeScript files in src/
      exclude: [
        'src/**/*.spec.ts',     // Don't calculate coverage for test files
        '**/*.test-setup.ts',   // Exclude any file ending in .test-setup.ts
        'src/main.ts',          // Usually ignored as it just bootstraps the app
        'src/**/*.config.ts'    // Ignore config files
      ],
      reporter: ['text', 'html', 'lcov'] // Generate terminal output, HTML report, and lcov for IDE
    },

    onConsoleLog(log, type) {
      // Print the raw string exactly as it was logged
      if (type === 'stdout') {
        process.stdout.write(`${log}\n`);
      } else {
        process.stderr.write(`${log}\n`);
      }
      // Return false to tell Vitest NOT to print its own formatted version
      return false;
    }
  }
});
