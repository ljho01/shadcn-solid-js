export const siteConfig = {
  name: 'shadcn-solid',
  url: 'https://shadcn-solid.dev',
  description:
    'Radix 프리미티브와 Tailwind CSS로 만든 아름다운 SolidJS 컴포넌트. 커스터마이즈하고, 확장하고, 직접 빌드하세요. 오픈소스. 오픈코드.',
  links: {
    twitter: 'https://twitter.com/shadcn',
    github: 'https://github.com/your-org/shadcn-solid-js',
  },
  navItems: [
    { href: '/docs/components', label: 'Docs' },
    { href: '/docs/components', label: 'Components' },
  ],
} as const;

export const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b',
} as const;
