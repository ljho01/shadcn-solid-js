import { Link } from '@tanstack/solid-router';

export function Announcement() {
  return (
    <Link
      to="/docs/components"
      class="bg-muted inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium leading-none transition-colors hover:bg-accent"
    >
      SolidJS + Radix + Tailwind CSS v4
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-3"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </Link>
  );
}
