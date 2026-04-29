import { defineConfig } from 'vitest/config'
import { resolve } from './vite.shared.ts'

/**
 * Vitest config kept separate from `vite.config.ts` so test runs don't
 * instantiate the AdonisJS / Inertia Vite plugins. Aliases come from the
 * shared `vite-aliases.ts` module so they only need to be defined once.
 */
export default defineConfig({
  resolve,
  test: {
    environment: 'node',
    include: ['inertia/**/*.test.ts', 'inertia/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['inertia/lib/richtext/**/*.{ts,tsx}'],
      exclude: ['inertia/lib/richtext/__fixtures__/**'],
    },
  },
})
