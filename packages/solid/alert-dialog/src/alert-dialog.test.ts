import { describe, it, expect } from 'vitest';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTitle,
  AlertDialogDescription,
  createAlertDialogScope,
} from './alert-dialog';

describe('AlertDialog', () => {
  it('should export all AlertDialog components', () => {
    expect(AlertDialog).toBeDefined();
    expect(AlertDialogTrigger).toBeDefined();
    expect(AlertDialogPortal).toBeDefined();
    expect(AlertDialogOverlay).toBeDefined();
    expect(AlertDialogContent).toBeDefined();
    expect(AlertDialogAction).toBeDefined();
    expect(AlertDialogCancel).toBeDefined();
    expect(AlertDialogTitle).toBeDefined();
    expect(AlertDialogDescription).toBeDefined();
  });

  it('should export createAlertDialogScope', () => {
    expect(createAlertDialogScope).toBeDefined();
    expect(typeof createAlertDialogScope).toBe('function');
  });

  it('AlertDialog should have displayName', () => {
    expect(AlertDialog.displayName).toBe('AlertDialog');
  });

  it('AlertDialogTrigger should have displayName', () => {
    expect(AlertDialogTrigger.displayName).toBe('AlertDialogTrigger');
  });

  it('AlertDialogContent should have displayName', () => {
    expect(AlertDialogContent.displayName).toBe('AlertDialogContent');
  });

  it('AlertDialogAction should have displayName', () => {
    expect(AlertDialogAction.displayName).toBe('AlertDialogAction');
  });

  it('AlertDialogCancel should have displayName', () => {
    expect(AlertDialogCancel.displayName).toBe('AlertDialogCancel');
  });
});
