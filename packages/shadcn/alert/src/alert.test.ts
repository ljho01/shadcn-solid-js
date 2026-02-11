import { describe, it, expect } from 'vitest';
import * as AlertModule from './alert';

describe('Alert', () => {
  it('should export all components', () => {
    expect(AlertModule.Alert).toBeDefined();
    expect(AlertModule.AlertTitle).toBeDefined();
    expect(AlertModule.AlertDescription).toBeDefined();
    expect(AlertModule.alertVariants).toBeDefined();
  });

  it('should generate correct variant classes', () => {
    const defaultClasses = AlertModule.alertVariants({ variant: 'default' });
    expect(defaultClasses).toContain('bg-card');

    const destructiveClasses = AlertModule.alertVariants({ variant: 'destructive' });
    expect(destructiveClasses).toContain('text-destructive');
  });
});
