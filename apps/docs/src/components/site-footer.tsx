import { siteConfig } from '~/lib/config';

export function SiteFooter() {
  return (
    <footer class="group-has-[.section-soft]/body:bg-surface/40 dark:group-has-[.section-soft]/body:bg-surface/40 dark:bg-transparent">
      <div class="container-wrapper px-4 xl:px-6">
        <div class="flex h-(--footer-height) items-center justify-between">
          <div class="text-muted-foreground w-full px-1 text-center text-xs leading-loose sm:text-sm">
            Built with{' '}
            <a
              href="https://www.solidjs.com"
              target="_blank"
              rel="noreferrer"
              class="font-medium underline underline-offset-4"
            >
              SolidJS
            </a>
            . Ported from{' '}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noreferrer"
              class="font-medium underline underline-offset-4"
            >
              shadcn/ui
            </a>
            . The source code is available on{' '}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              class="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </div>
        </div>
      </div>
    </footer>
  );
}
