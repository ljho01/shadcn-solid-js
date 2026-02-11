import { Spinner } from "@shadcn-solid-js/spinner";

export default function SpinnerDemo() {
  return (
    <div class="flex items-center gap-4">
      <Spinner class="size-4" />
      <Spinner class="size-6" />
      <Spinner class="size-8" />
    </div>
  );
}
