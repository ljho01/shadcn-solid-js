import { describe, it, expect } from 'vitest';
import * as sheet from './index';

describe('sheet', () => {
  it('should export all components', () => {
    expect(sheet.Sheet).toBeDefined();
    expect(sheet.SheetTrigger).toBeDefined();
    expect(sheet.SheetClose).toBeDefined();
    expect(sheet.SheetPortal).toBeDefined();
    expect(sheet.SheetOverlay).toBeDefined();
    expect(sheet.SheetContent).toBeDefined();
    expect(sheet.SheetHeader).toBeDefined();
    expect(sheet.SheetFooter).toBeDefined();
    expect(sheet.SheetTitle).toBeDefined();
    expect(sheet.SheetDescription).toBeDefined();
    expect(sheet.sheetContentVariants).toBeDefined();
  });

  it('should generate correct side variant classes', () => {
    const rightClasses = sheet.sheetContentVariants({ side: 'right' });
    expect(rightClasses).toContain('right-0');

    const leftClasses = sheet.sheetContentVariants({ side: 'left' });
    expect(leftClasses).toContain('left-0');

    const topClasses = sheet.sheetContentVariants({ side: 'top' });
    expect(topClasses).toContain('top-0');

    const bottomClasses = sheet.sheetContentVariants({ side: 'bottom' });
    expect(bottomClasses).toContain('bottom-0');
  });
});
