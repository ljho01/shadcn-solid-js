import { createFileRoute, Link } from "@tanstack/solid-router";
import { Show, Suspense, createMemo, type Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { components } from "~/lib/components";
import { CodeBlock, ComponentPreview } from "~/components/code-block";
import { getDemo } from "~/components/demos";

export const Route = createFileRoute("/docs/$slug")({
  component: ComponentDocPage,
});

function ComponentDocPage() {
  const params = Route.useParams();
  const component = createMemo(() =>
    components.find((c) => c.slug === params().slug)
  );

  // Find prev/next components
  const currentIndex = createMemo(() =>
    components.findIndex((c) => c.slug === params().slug)
  );
  const prevComponent = createMemo(() =>
    currentIndex() > 0 ? components[currentIndex() - 1] : null
  );
  const nextComponent = createMemo(() =>
    currentIndex() < components.length - 1
      ? components[currentIndex() + 1]
      : null
  );

  return (
    <Show when={component()} fallback={<NotFound slug={params().slug} />}>
      {(comp) => (
        <div class="space-y-10">
          {/* Breadcrumb */}
          <div class="flex items-center gap-1 text-sm text-muted-foreground">
            <Link to="/" class="hover:text-foreground transition-colors">
              Docs
            </Link>
            <svg
              class="size-3.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span class="text-foreground font-medium">{comp().name}</span>
          </div>

          {/* Title */}
          <div class="space-y-2">
            <h1 class="scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl">
              {comp().name}
            </h1>
            <p class="text-lg text-muted-foreground">{comp().description}</p>
          </div>

          {/* Preview */}
          <ComponentPreview>
            <LiveDemo slug={comp().slug} name={comp().name} />
          </ComponentPreview>

          {/* Installation */}
          <div class="space-y-4">
            <h2 class="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
              Installation
            </h2>
            <div class="space-y-3">
              <p class="text-sm text-muted-foreground">
                Install the component using the CLI (recommended):
              </p>
              <CodeBlock code={`npx shadcn-solid@latest add ${comp().slug}`} />
              <details class="group">
                <summary class="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground list-none flex items-center gap-1">
                  <svg
                    class="size-4 transition-transform group-open:rotate-90"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  Or install as a package
                </summary>
                <div class="mt-3 pl-5">
                  <CodeBlock code={`bun add @shadcn-solid-js/${comp().slug}`} />
                </div>
              </details>
            </div>
          </div>

          {/* Usage */}
          <div class="space-y-4">
            <h2 class="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
              Usage
            </h2>
            <CodeBlock code={getUsageCode(comp().slug, comp().name)} />
          </div>

          {/* API Reference */}
          <div class="space-y-4">
            <h2 class="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight">
              API Reference
            </h2>
            <h3 class="scroll-m-20 text-xl font-semibold tracking-tight">
              {comp().name}
            </h3>
            <div class="my-6 w-full overflow-y-auto">
              <table class="w-full">
                <thead>
                  <tr class="m-0 border-t p-0 even:bg-muted">
                    <th class="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                      Prop
                    </th>
                    <th class="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                      Type
                    </th>
                    <th class="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                      Default
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="m-0 border-t p-0 even:bg-muted">
                    <td class="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        class
                      </code>
                    </td>
                    <td class="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        string
                      </code>
                    </td>
                    <td class="border px-4 py-2 text-left text-muted-foreground [&[align=center]]:text-center [&[align=right]]:text-right">
                      -
                    </td>
                  </tr>
                  <tr class="m-0 border-t p-0 even:bg-muted">
                    <td class="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        children
                      </code>
                    </td>
                    <td class="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        JSX.Element
                      </code>
                    </td>
                    <td class="border px-4 py-2 text-left text-muted-foreground [&[align=center]]:text-center [&[align=right]]:text-right">
                      -
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Prev/Next Navigation */}
          <div class="flex items-center justify-between border-t pt-6">
            <Show when={prevComponent()}>
              {(prev) => (
                <Link
                  to="/docs/$slug"
                  params={{ slug: prev().slug }}
                  class="group inline-flex flex-col items-start gap-1"
                >
                  <span class="text-xs text-muted-foreground">Previous</span>
                  <span class="text-sm font-medium group-hover:underline">
                    {prev().name}
                  </span>
                </Link>
              )}
            </Show>
            <div />
            <Show when={nextComponent()}>
              {(next) => (
                <Link
                  to="/docs/$slug"
                  params={{ slug: next().slug }}
                  class="group inline-flex flex-col items-end gap-1"
                >
                  <span class="text-xs text-muted-foreground">Next</span>
                  <span class="text-sm font-medium group-hover:underline">
                    {next().name}
                  </span>
                </Link>
              )}
            </Show>
          </div>
        </div>
      )}
    </Show>
  );
}

function NotFound(props: { slug: string }) {
  return (
    <div class="flex flex-col items-center justify-center gap-4 py-24">
      <h1 class="text-4xl font-bold">404</h1>
      <p class="text-muted-foreground">Component "{props.slug}" not found.</p>
    </div>
  );
}

function LiveDemo(props: { slug: string; name: string }) {
  const demo = createMemo(() => getDemo(props.slug));

  return (
    <Show
      when={demo()}
      fallback={
        <div class="flex flex-col items-center gap-2 py-4 text-center">
          <p class="text-sm text-muted-foreground">Preview coming soon.</p>
        </div>
      }
    >
      {(DemoComponent) => (
        <Suspense
          fallback={
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <svg
                class="size-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </div>
          }
        >
          <Dynamic component={DemoComponent()} />
        </Suspense>
      )}
    </Show>
  );
}

function getUsageCode(slug: string, name: string): string {
  const importName = name.replace(/\s+/g, "");

  const usageCodes: Record<string, string> = {
    button: `import { Button } from '@shadcn-solid-js/button'

export function MyComponent() {
  return <Button variant="outline">Button</Button>
}`,
    card: `import {
  Card, CardHeader, CardTitle,
  CardDescription, CardContent, CardFooter,
} from '@shadcn-solid-js/card'

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  )
}`,
    dialog: `import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription,
} from '@shadcn-solid-js/dialog'
import { Button } from '@shadcn-solid-js/button'

export function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            Dialog description goes here.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}`,
    input: `import { Input } from '@shadcn-solid-js/input'

export function MyComponent() {
  return <Input type="email" placeholder="Email" />
}`,
    tabs: `import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@shadcn-solid-js/tabs'

export function MyComponent() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings.</TabsContent>
      <TabsContent value="password">Change password.</TabsContent>
    </Tabs>
  )
}`,
  };

  return (
    usageCodes[slug] ??
    `import { ${importName} } from '@shadcn-solid-js/${slug}'

export function MyComponent() {
  return <${importName} />
}`
  );
}
