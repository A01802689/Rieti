import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// a zone that is neither UTC nor Mexico City, so a date that depends on the local zone shows up as a failure
process.env.TZ = 'Asia/Tokyo'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
      env: { VITE_API_URL: 'http://api.test' },
      restoreMocks: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        reporter: ['text', 'json-summary'],
        reportsDirectory: 'node_modules/.cache/vitest-coverage',
      },
    },
  }),
)
