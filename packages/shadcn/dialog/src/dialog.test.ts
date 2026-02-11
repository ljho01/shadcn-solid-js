import { describe, it, expect } from 'vitest';
import * as dialog from './index';

describe('dialog', () => {
  it('should export all components', () => {
    expect(dialog.Dialog).toBeDefined();
    expect(dialog.DialogTrigger).toBeDefined();
    expect(dialog.DialogPortal).toBeDefined();
    expect(dialog.DialogClose).toBeDefined();
    expect(dialog.DialogOverlay).toBeDefined();
    expect(dialog.DialogContent).toBeDefined();
    expect(dialog.DialogHeader).toBeDefined();
    expect(dialog.DialogFooter).toBeDefined();
    expect(dialog.DialogTitle).toBeDefined();
    expect(dialog.DialogDescription).toBeDefined();
  });
});
