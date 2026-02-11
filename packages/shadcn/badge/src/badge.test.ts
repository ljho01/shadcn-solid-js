import { describe, it, expect } from 'vitest';
import * as BadgeModule from './badge';

describe('Badge', () => {
  it('should export all components', () => {
    expect(BadgeModule.Badge).toBeDefined();
    expect(BadgeModule.badgeVariants).toBeDefined();
  });

  it('should generate correct variant classes', () => {
    const defaultClasses = BadgeModule.badgeVariants({ variant: 'default' });
    expect(defaultClasses).toContain('bg-primary');

    const secondaryClasses = BadgeModule.badgeVariants({ variant: 'secondary' });
    expect(secondaryClasses).toContain('bg-secondary');

    const destructiveClasses = BadgeModule.badgeVariants({ variant: 'destructive' });
    expect(destructiveClasses).toContain('bg-destructive');

    const outlineClasses = BadgeModule.badgeVariants({ variant: 'outline' });
    expect(outlineClasses).toContain('text-foreground');
  });
});
