import { Input } from "@shadcn-solid-js/input";

export default function InputGroupDemo() {
  return (
    <div class="w-full max-w-sm space-y-3">
      <div class="flex">
        <span class="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
          https://
        </span>
        <Input class="rounded-l-none" placeholder="example.com" />
      </div>
      <div class="flex">
        <Input class="rounded-r-none" placeholder="Search..." />
        <button class="inline-flex items-center rounded-r-md border border-l-0 bg-primary px-4 text-sm text-primary-foreground">
          Search
        </button>
      </div>
    </div>
  );
}
