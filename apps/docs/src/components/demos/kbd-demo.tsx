import { Kbd } from "@shadcn-solid-js/kbd";

export default function KbdDemo() {
  return (
    <div class="flex flex-col items-center gap-4">
      <div class="flex items-center gap-1">
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⌃</Kbd>
      </div>
      <div class="flex items-center gap-1">
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>B</Kbd>
      </div>
    </div>
  );
}
