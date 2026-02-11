import { describe, it, expect } from 'vitest';
import * as menubar from './index';

describe('menubar', () => {
  it('should export all components', () => {
    expect(menubar.Menubar).toBeDefined();
    expect(menubar.MenubarMenu).toBeDefined();
    expect(menubar.MenubarTrigger).toBeDefined();
    expect(menubar.MenubarContent).toBeDefined();
    expect(menubar.MenubarItem).toBeDefined();
    expect(menubar.MenubarSeparator).toBeDefined();
    expect(menubar.MenubarLabel).toBeDefined();
    expect(menubar.MenubarCheckboxItem).toBeDefined();
    expect(menubar.MenubarRadioGroup).toBeDefined();
    expect(menubar.MenubarRadioItem).toBeDefined();
    expect(menubar.MenubarSub).toBeDefined();
    expect(menubar.MenubarSubTrigger).toBeDefined();
    expect(menubar.MenubarSubContent).toBeDefined();
  });
});
