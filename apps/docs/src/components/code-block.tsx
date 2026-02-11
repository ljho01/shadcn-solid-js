import { createSignal, splitProps, type JSX, Show } from 'solid-js';
import { cn } from '~/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  class?: string;
}

export function CodeBlock(props: CodeBlockProps) {
  const [local] = splitProps(props, ['code', 'language', 'class']);
  const [copied, setCopied] = createSignal(false);

  const copy = async () => {
    await navigator.clipboard.writeText(local.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div class={cn('relative', local.class)}>
      <pre data-code class="relative rounded-xl bg-[#09090b] text-[#fafafa]">
        <button
          class="absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
          onClick={copy}
          aria-label="복사"
        >
          <Show when={copied()} fallback={
            <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          }>
            <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </Show>
        </button>
        <code class="block overflow-x-auto p-4 text-[13px] leading-relaxed font-mono">{local.code}</code>
      </pre>
    </div>
  );
}

interface ComponentPreviewProps {
  children: JSX.Element;
  class?: string;
}

export function ComponentPreview(props: ComponentPreviewProps) {
  const [local] = splitProps(props, ['children', 'class']);

  return (
    <div class={cn('rounded-xl border', local.class)}>
      <div class="flex items-center border-b px-4">
        <div class="flex h-10 items-center">
          <span class="text-sm font-medium">Preview</span>
        </div>
      </div>
      <div class="flex min-h-[350px] w-full items-center justify-center p-10">
        {local.children}
      </div>
    </div>
  );
}
