import { lazy, Suspense, Show, ErrorBoundary, createSignal, onMount } from 'solid-js';
import type { JSX, Component } from 'solid-js';

/**
 * Client-only wrapper: SSR에서는 fallback을 렌더링하고,
 * 클라이언트 하이드레이션 후에 children을 렌더링합니다.
 */
function ClientOnly(props: { fallback?: JSX.Element; children: JSX.Element }) {
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));

  return (
    <Show when={mounted()} fallback={props.fallback}>
      {props.children}
    </Show>
  );
}

function Demo(props: { component: Component }) {
  const placeholder = (<div class="h-8 w-full animate-pulse rounded-md bg-muted" />);

  return (
    <ClientOnly fallback={placeholder}>
      <ErrorBoundary fallback={placeholder}>
        <Suspense fallback={placeholder}>
          <props.component />
        </Suspense>
      </ErrorBoundary>
    </ClientOnly>
  );
}

// Lazy-loaded demo components
const CardDemo = lazy(() => import('./demos/card-demo'));
const InputDemo = lazy(() => import('./demos/input-demo'));
const SelectDemo = lazy(() => import('./demos/select-demo'));
const ButtonDemo = lazy(() => import('./demos/button-demo'));
const BadgeDemo = lazy(() => import('./demos/badge-demo'));
const CheckboxDemo = lazy(() => import('./demos/checkbox-demo'));
const SliderDemo = lazy(() => import('./demos/slider-demo'));
const SwitchDemo = lazy(() => import('./demos/switch-demo'));
const TabsDemo = lazy(() => import('./demos/tabs-demo'));
const AccordionDemo = lazy(() => import('./demos/accordion-demo'));
const AvatarDemo = lazy(() => import('./demos/avatar-demo'));
const DialogDemo = lazy(() => import('./demos/dialog-demo'));
const ToggleGroupDemo = lazy(() => import('./demos/toggle-group-demo'));
const ProgressDemo = lazy(() => import('./demos/progress-demo'));
const SkeletonDemo = lazy(() => import('./demos/skeleton-demo'));

export function RootComponents() {
  return (
    <div class="theme-container mx-auto grid gap-8 py-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6 2xl:gap-8">
      {/* Column 1: Form-like card */}
      <div class="flex flex-col gap-6">
        <Demo component={CardDemo} />
        <div class="w-full rounded-xl border p-6">
          <Demo component={InputDemo} />
        </div>
        <Demo component={SelectDemo} />
      </div>

      {/* Column 2: Small components */}
      <div class="flex flex-col gap-6">
        <Demo component={ButtonDemo} />
        <Demo component={BadgeDemo} />
        <div class="w-full rounded-xl border p-6">
          <div class="flex flex-col gap-6">
            <Demo component={CheckboxDemo} />
            <div class="my-2 h-px bg-border" />
            <Demo component={SliderDemo} />
            <div class="my-2 h-px bg-border" />
            <Demo component={SwitchDemo} />
          </div>
        </div>
      </div>

      {/* Column 3: Content components */}
      <div class="flex flex-col gap-6">
        <Demo component={TabsDemo} />
        <Demo component={AccordionDemo} />
        <Demo component={AvatarDemo} />
      </div>

      {/* Column 4: Interactive components */}
      <div class="order-first flex flex-col gap-6 lg:hidden xl:order-last xl:flex">
        <Demo component={DialogDemo} />
        <Demo component={ToggleGroupDemo} />
        <Demo component={ProgressDemo} />
        <Demo component={SkeletonDemo} />
      </div>
    </div>
  );
}
