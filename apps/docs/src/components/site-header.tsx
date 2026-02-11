import { Link } from '@tanstack/solid-router';
import { siteConfig } from '~/lib/config';
import { Icons } from '~/components/icons';
import { MainNav } from '~/components/main-nav';
import { MobileNav } from '~/components/mobile-nav';
import { ModeSwitcher } from '~/components/mode-switcher';

export function SiteHeader() {
  return (
    <header class="bg-background sticky top-0 z-50 w-full">
      <div class="container-wrapper px-6">
        <div class="flex h-(--header-height) items-center **:data-[slot=separator]:h-4!">
          {/* Mobile Nav */}
          <MobileNav class="flex lg:hidden" />

          {/* Logo */}
          <Link
            to="/"
            class="hidden size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent lg:flex"
          >
            <Icons.logo class="size-5" />
            <span class="sr-only">{siteConfig.name}</span>
          </Link>

          {/* Desktop Nav */}
          <MainNav items={[...siteConfig.navItems]} class="hidden lg:flex" />

          {/* Right side */}
          <div class="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            {/* Separator */}
            <div data-slot="separator" class="mx-2 hidden h-4 w-px bg-border lg:block" />

            {/* GitHub */}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="GitHub"
            >
              <Icons.gitHub class="size-4" />
            </a>

            {/* Separator */}
            <div data-slot="separator" class="h-4 w-px bg-border" />

            {/* Mode Switcher */}
            <ModeSwitcher />

            {/* Separator */}
            <div data-slot="separator" class="mr-2 h-4 w-px bg-border" />

            {/* Get Started Button */}
            <Link
              to="/docs/components"
              class="hidden h-[31px] items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:inline-flex"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
