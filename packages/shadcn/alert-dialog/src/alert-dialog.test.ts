import { describe, it, expect } from 'vitest';
import * as alertDialog from './index';

describe('alert-dialog', () => {
  it('should export all components', () => {
    expect(alertDialog.AlertDialog).toBeDefined();
    expect(alertDialog.AlertDialogTrigger).toBeDefined();
    expect(alertDialog.AlertDialogPortal).toBeDefined();
    expect(alertDialog.AlertDialogOverlay).toBeDefined();
    expect(alertDialog.AlertDialogContent).toBeDefined();
    expect(alertDialog.AlertDialogHeader).toBeDefined();
    expect(alertDialog.AlertDialogFooter).toBeDefined();
    expect(alertDialog.AlertDialogTitle).toBeDefined();
    expect(alertDialog.AlertDialogDescription).toBeDefined();
    expect(alertDialog.AlertDialogAction).toBeDefined();
    expect(alertDialog.AlertDialogCancel).toBeDefined();
  });
});
