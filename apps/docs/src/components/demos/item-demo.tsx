import { For } from "solid-js";

const items = [
  {
    title: "Design System Update",
    desc: "Component library v2.0 plan",
    time: "2h ago",
  },
  {
    title: "API Documentation",
    desc: "REST API endpoint documentation",
    time: "4h ago",
  },
  { title: "Bug Fix", desc: "Login page layout issue", time: "Yesterday" },
];

export default function ItemDemo() {
  return (
    <div class="w-full max-w-sm divide-y rounded-lg border">
      <For each={items}>
        {(item) => (
          <div class="flex items-start gap-3 p-4">
            <div class="mt-0.5 size-2 rounded-full bg-primary" />
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium leading-none">{item.title}</p>
              <p class="text-sm text-muted-foreground">{item.desc}</p>
            </div>
            <span class="text-xs text-muted-foreground">{item.time}</span>
          </div>
        )}
      </For>
    </div>
  );
}
