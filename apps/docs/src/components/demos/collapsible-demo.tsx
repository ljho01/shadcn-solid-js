import { createSignal } from "solid-js";
import { Button } from "@shadcn-solid-js/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@shadcn-solid-js/collapsible";

export default function CollapsibleDemo() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <Collapsible
      open={isOpen()}
      onOpenChange={setIsOpen}
      class="flex w-[350px] flex-col gap-2"
    >
      <div class="flex items-center justify-between gap-4 px-4">
        <h4 class="text-sm font-semibold">@peduarte starred 3 repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" class="size-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m7 15 5 5 5-5" />
              <path d="m7 9 5-5 5 5" />
            </svg>
            <span class="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div class="rounded-md border px-4 py-2 font-mono text-sm">
        @radix-ui/primitives
      </div>
      <CollapsibleContent class="flex flex-col gap-2">
        <div class="rounded-md border px-4 py-2 font-mono text-sm">
          @radix-ui/colors
        </div>
        <div class="rounded-md border px-4 py-2 font-mono text-sm">
          @stitches/react
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
