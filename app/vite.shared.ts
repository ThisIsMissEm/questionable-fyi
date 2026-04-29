/**
 * Single source of truth for frontend module aliases.
 * Imported by both `vite.config.ts` and `vitest.config.ts`.
 *
 * This lives in its own file (not a named export from vite.config.ts) so the
 * test runner can read aliases without triggering AdonisJS / Inertia plugin
 * instantiation at the top of vite.config.ts.
 */
export const resolve = {
  alias: {
    '~/': `${import.meta.dirname}/inertia/`,
    '@': `${import.meta.dirname}/inertia/lib`,
    '@generated': `${import.meta.dirname}/.adonisjs/client/`,
    '@lexicons': `${import.meta.dirname}/app/lexicons/`,
  },
}
