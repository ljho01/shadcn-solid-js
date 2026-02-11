import { describe, it, expect } from 'vitest';
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  createDialogScope,
} from './dialog';

describe('Dialog', () => {
  it('should export all Dialog components', () => {
    expect(Dialog).toBeDefined();
    expect(DialogTrigger).toBeDefined();
    expect(DialogPortal).toBeDefined();
    expect(DialogOverlay).toBeDefined();
    expect(DialogContent).toBeDefined();
    expect(DialogTitle).toBeDefined();
    expect(DialogDescription).toBeDefined();
    expect(DialogClose).toBeDefined();
  });

  it('should export createDialogScope', () => {
    expect(createDialogScope).toBeDefined();
    expect(typeof createDialogScope).toBe('function');
  });

  it('Dialog should have displayName', () => {
    expect(Dialog.displayName).toBe('Dialog');
  });

  it('DialogTrigger should have displayName', () => {
    expect(DialogTrigger.displayName).toBe('DialogTrigger');
  });

  it('DialogContent should have displayName', () => {
    expect(DialogContent.displayName).toBe('DialogContent');
  });
});
