import { defineConfig, type Options } from 'tsup';
import * as solidPlugin from 'esbuild-plugin-solid';

/**
 * Shared tsup config for all @radix-solid/* and @shadcn-solid/* packages.
 * Import and spread this in each package's tsup.config.ts.
 */
export function createTsupConfig(overrides?: Partial<Options>): ReturnType<typeof defineConfig> {
  return defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    external: ['solid-js', 'solid-js/web', 'solid-js/store'],
    esbuildPlugins: [
      solidPlugin.default({
        solid: { generate: 'dom', hydratable: true },
      }),
    ],
    ...overrides,
  });
}
