import { createSignal } from "solid-js";
import { Combobox } from "@shadcn-solid-js/combobox";

const frameworks = [
  { value: "next.js", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt.js", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
];

export default function ComboboxDemo() {
  const [value, setValue] = createSignal("");

  return (
    <Combobox
      options={frameworks}
      value={value()}
      onValueChange={setValue}
      placeholder="Select framework..."
    />
  );
}
