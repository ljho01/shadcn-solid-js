import { describe, it, expect } from 'vitest';
import * as ButtonModule from './button';

describe('Button', () => {
  it('should export all components', () => {
    expect(ButtonModule.Button).toBeDefined();
    expect(ButtonModule.buttonVariants).toBeDefined();
  });

  it('should generate correct variant classes', () => {
    const defaultClasses = ButtonModule.buttonVariants({ variant: 'default', size: 'default' });
    expect(defaultClasses).toContain('bg-primary');

    const destructiveClasses = ButtonModule.buttonVariants({ variant: 'destructive' });
    expect(destructiveClasses).toContain('bg-destructive');

    const outlineClasses = ButtonModule.buttonVariants({ variant: 'outline' });
    expect(outlineClasses).toContain('border');

    const secondaryClasses = ButtonModule.buttonVariants({ variant: 'secondary' });
    expect(secondaryClasses).toContain('bg-secondary');

    const ghostClasses = ButtonModule.buttonVariants({ variant: 'ghost' });
    expect(ghostClasses).toContain('hover:bg-muted');

    const linkClasses = ButtonModule.buttonVariants({ variant: 'link' });
    expect(linkClasses).toContain('hover:underline');
  });

  it('should generate correct size classes', () => {
    const smClasses = ButtonModule.buttonVariants({ size: 'sm' });
    expect(smClasses).toContain('h-7');

    const lgClasses = ButtonModule.buttonVariants({ size: 'lg' });
    expect(lgClasses).toContain('h-9');

    const iconClasses = ButtonModule.buttonVariants({ size: 'icon' });
    expect(iconClasses).toContain('size-8');
  });
});
