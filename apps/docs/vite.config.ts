import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import viteSolid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const root = path.resolve(__dirname, '../..');

// Helper to create alias for @shadcn-solid-js/* packages -> source
function shadcn(name: string) {
  return { [`@shadcn-solid-js/${name}`]: path.resolve(root, `packages/shadcn/${name}/src`) };
}

// Helper to create alias for @radix-solid-js/* packages -> source
function radix(name: string, dir: 'core' | 'solid' = 'solid') {
  return { [`@radix-solid-js/${name}`]: path.resolve(root, `packages/${dir}/${name}/src`) };
}

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({ ignoreConfigErrors: true }),
    tanstackStart(),
    // solid's vite plugin must come after start's vite plugin
    viteSolid({ ssr: true }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Core packages
      ...radix('primitive', 'core'),
      ...radix('number', 'core'),
      ...radix('rect', 'core'),
      // Solid utility packages
      ...radix('compose-refs'),
      ...radix('context'),
      ...radix('direction'),
      ...radix('focus-guards'),
      ...radix('use-previous'),
      ...radix('use-escape-keydown'),
      ...radix('use-size'),
      ...radix('use-rect'),
      ...radix('use-controllable-state'),
      // Foundation packages
      ...radix('slot'),
      '@radix-solid-js/primitive-component': path.resolve(root, 'packages/solid/primitive-component/src'),
      ...radix('presence'),
      ...radix('visually-hidden'),
      ...radix('arrow'),
      ...radix('portal'),
      ...radix('collection'),
      ...radix('focus-scope'),
      ...radix('dismissable-layer'),
      ...radix('roving-focus'),
      ...radix('popper'),
      ...radix('announce'),
      // Phase 4
      ...radix('id'),
      ...radix('label'),
      ...radix('separator'),
      ...radix('aspect-ratio'),
      ...radix('accessible-icon'),
      ...radix('progress'),
      ...radix('toggle'),
      ...radix('avatar'),
      ...radix('switch'),
      ...radix('checkbox'),
      ...radix('collapsible'),
      // Phase 5
      ...radix('toggle-group'),
      ...radix('radio-group'),
      ...radix('accordion'),
      ...radix('tabs'),
      ...radix('toolbar'),
      ...radix('scroll-area'),
      ...radix('slider'),
      ...radix('tooltip'),
      // Phase 6
      ...radix('dialog'),
      ...radix('alert-dialog'),
      ...radix('popover'),
      ...radix('hover-card'),
      ...radix('toast'),
      ...radix('navigation-menu'),
      ...radix('form'),
      ...radix('menu'),
      ...radix('dropdown-menu'),
      ...radix('context-menu'),
      ...radix('menubar'),
      ...radix('select'),
      ...radix('use-effect-event'),
      ...radix('one-time-password-field'),
      ...radix('password-toggle-field'),
      // shadcn components
      ...shadcn('utils'),
      ...shadcn('button'),
      ...shadcn('card'),
      ...shadcn('input'),
      ...shadcn('textarea'),
      ...shadcn('badge'),
      ...shadcn('breadcrumb'),
      ...shadcn('alert'),
      ...shadcn('skeleton'),
      ...shadcn('spinner'),
      ...shadcn('table'),
      ...shadcn('kbd'),
      ...shadcn('pagination'),
      ...shadcn('label'),
      ...shadcn('separator'),
      ...shadcn('dialog'),
      ...shadcn('alert-dialog'),
      ...shadcn('accordion'),
      ...shadcn('checkbox'),
      ...shadcn('collapsible'),
      ...shadcn('context-menu'),
      ...shadcn('dropdown-menu'),
      ...shadcn('hover-card'),
      ...shadcn('menubar'),
      ...shadcn('navigation-menu'),
      ...shadcn('popover'),
      ...shadcn('progress'),
      ...shadcn('radio-group'),
      ...shadcn('scroll-area'),
      ...shadcn('select'),
      ...shadcn('slider'),
      ...shadcn('switch'),
      ...shadcn('tabs'),
      ...shadcn('toggle'),
      ...shadcn('toggle-group'),
      ...shadcn('tooltip'),
      ...shadcn('sheet'),
      ...shadcn('form'),
      ...shadcn('field'),
      ...shadcn('input-group'),
      ...shadcn('button-group'),
      ...shadcn('native-select'),
      ...shadcn('empty'),
      ...shadcn('item'),
      ...shadcn('aspect-ratio'),
      ...shadcn('avatar'),
      ...shadcn('input-otp'),
      ...shadcn('combobox'),
      ...shadcn('drawer'),
      ...shadcn('sidebar'),
      ...shadcn('sonner'),
      ...shadcn('command'),
      ...shadcn('calendar'),
      ...shadcn('carousel'),
      ...shadcn('chart'),
      ...shadcn('resizable'),
    },
    conditions: ['solid', 'development', 'browser'],
  },
  ssr: {
    noExternal: ['solid-sonner'],
    resolve: {
      conditions: ['solid', 'development', 'node'],
    },
  },
});
