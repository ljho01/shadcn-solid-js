import { createFileRoute, Link } from '@tanstack/solid-router';
import { Announcement } from '~/components/announcement';
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '~/components/page-header';
import { PageNav } from '~/components/page-nav';
import { ExamplesNav } from '~/components/examples-nav';
import { RootComponents } from '~/components/root-components';

const title = 'The Foundation for your Design System';
const description =
  'A set of beautifully designed components that you can customize, extend, and build on. Start here then make it your own. Open Source. Open Code.';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div class="flex flex-1 flex-col">
      <PageHeader>
        <Announcement />
        <PageHeaderHeading class="max-w-4xl">{title}</PageHeaderHeading>
        <PageHeaderDescription>{description}</PageHeaderDescription>
        <PageActions>
          <Link
            to="/docs/components"
            class="inline-flex h-[31px] items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-none transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            to="/docs/components"
            class="inline-flex h-[31px] items-center justify-center rounded-lg px-4 text-sm font-medium text-foreground shadow-none transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View Components
          </Link>
        </PageActions>
      </PageHeader>
      <PageNav class="hidden md:flex">
        <ExamplesNav class="[&>a:first-child]:text-primary flex-1 overflow-hidden" />
      </PageNav>
      <div class="container-wrapper section-soft flex-1 pb-6">
        <div class="container overflow-hidden">
          <section class="relative hidden md:block">
            <RootComponents />
            <div class="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
          </section>
        </div>
      </div>
    </div>
  );
}
