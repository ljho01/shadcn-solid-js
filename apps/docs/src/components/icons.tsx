import type { JSX } from 'solid-js';
import { splitProps, mergeProps } from 'solid-js';
import { cn } from '~/lib/utils';

type IconProps = JSX.SvgSVGAttributes<SVGSVGElement>;

function Logo(props: IconProps) {
  const [local, rest] = splitProps(props, ['class']);
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class={cn('size-5', local.class)}
      {...rest}
    >
      <rect width="256" height="256" rx="60" fill="currentColor" />
      <path
        d="M208 128L128 208"
        stroke="white"
        stroke-width="40"
        stroke-linecap="round"
        class="dark:stroke-black"
      />
      <path
        d="M192 40L40 192"
        stroke="white"
        stroke-width="40"
        stroke-linecap="round"
        class="dark:stroke-black"
      />
    </svg>
  );
}

function GitHub(props: IconProps) {
  const [local, rest] = splitProps(props, ['class']);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      class={cn('size-4', local.class)}
      {...rest}
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function Twitter(props: IconProps) {
  const [local, rest] = splitProps(props, ['class']);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      class={cn('size-3', local.class)}
      {...rest}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SolidJS(props: IconProps) {
  const [local, rest] = splitProps(props, ['class']);
  return (
    <svg
      viewBox="0 0 166 155.3"
      class={cn('size-4', local.class)}
      {...rest}
    >
      <defs>
        <linearGradient id="a" x1="27.5" x2="152" y1="3" y2="63.5" gradientUnits="userSpaceOnUse">
          <stop offset=".1" stop-color="#76b3e1" />
          <stop offset=".3" stop-color="#dcf2fd" />
          <stop offset="1" stop-color="#76b3e1" />
        </linearGradient>
        <linearGradient id="b" x1="95.8" x2="74" y1="32.6" y2="105.2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#76b3e1" />
          <stop offset=".5" stop-color="#4377bb" />
          <stop offset="1" stop-color="#1f3b77" />
        </linearGradient>
        <linearGradient id="c" x1="18.4" x2="144.3" y1="64.2" y2="149.8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#315aa9" />
          <stop offset=".5" stop-color="#518ac8" />
          <stop offset="1" stop-color="#315aa9" />
        </linearGradient>
        <linearGradient id="d" x1="75.2" x2="24.4" y1="74.5" y2="260.8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#4377bb" />
          <stop offset=".5" stop-color="#1a336b" />
          <stop offset="1" stop-color="#1a336b" />
        </linearGradient>
      </defs>
      <path fill="#76b3e1" d="M163 35S110-4 69 5l-3 1c-6 2-11 5-14 9l-2 3-15 26 26 5c11 7 25 10 38 7l46 9 18-30z" />
      <path fill="url(#a)" d="M163 35S110-4 69 5l-3 1c-6 2-11 5-14 9l-2 3-15 26 26 5c11 7 25 10 38 7l46 9 18-30z" opacity=".3" />
      <path fill="#518ac8" d="M52 35l-4 1c-17 5-22 21-13 35 10 13 31 20 48 15l62-21S92 26 52 35z" />
      <path fill="url(#b)" d="M52 35l-4 1c-17 5-22 21-13 35 10 13 31 20 48 15l62-21S92 26 52 35z" opacity=".3" />
      <path fill="url(#c)" d="M134 80a45 45 0 00-48-15L24 85 4 120l112 19 20-36c4-7 3-15-2-23z" />
      <path fill="url(#d)" d="M114 115a45 45 0 00-48-15L4 120s53 40 94 30l3-1c17-5 23-21 13-34z" />
    </svg>
  );
}

export const Icons = {
  logo: Logo,
  gitHub: GitHub,
  twitter: Twitter,
  solidJS: SolidJS,
};
