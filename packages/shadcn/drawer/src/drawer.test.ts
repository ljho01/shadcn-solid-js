import { describe, it, expect } from 'vitest';
import * as drawer from './index';

describe('drawer', () => {
  it('should export all components', () => {
    expect(drawer.Drawer).toBeDefined();
    expect(drawer.DrawerTrigger).toBeDefined();
    expect(drawer.DrawerPortal).toBeDefined();
    expect(drawer.DrawerClose).toBeDefined();
    expect(drawer.DrawerOverlay).toBeDefined();
    expect(drawer.DrawerContent).toBeDefined();
    expect(drawer.DrawerHeader).toBeDefined();
    expect(drawer.DrawerFooter).toBeDefined();
    expect(drawer.DrawerTitle).toBeDefined();
    expect(drawer.DrawerDescription).toBeDefined();
  });
});
