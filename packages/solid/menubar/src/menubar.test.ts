import { describe, it, expect } from 'vitest';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarPortal,
  MenubarContent,
  MenubarGroup,
  MenubarLabel,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarItemIndicator,
  MenubarSeparator,
  MenubarArrow,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  createMenubarScope,
} from './menubar';

describe('Menubar', () => {
  it('should export all Menubar components', () => {
    expect(Menubar).toBeDefined();
    expect(MenubarMenu).toBeDefined();
    expect(MenubarTrigger).toBeDefined();
    expect(MenubarPortal).toBeDefined();
    expect(MenubarContent).toBeDefined();
    expect(MenubarGroup).toBeDefined();
    expect(MenubarLabel).toBeDefined();
    expect(MenubarItem).toBeDefined();
    expect(MenubarCheckboxItem).toBeDefined();
    expect(MenubarRadioGroup).toBeDefined();
    expect(MenubarRadioItem).toBeDefined();
    expect(MenubarItemIndicator).toBeDefined();
    expect(MenubarSeparator).toBeDefined();
    expect(MenubarArrow).toBeDefined();
    expect(MenubarSub).toBeDefined();
    expect(MenubarSubTrigger).toBeDefined();
    expect(MenubarSubContent).toBeDefined();
  });

  it('should export createMenubarScope', () => {
    expect(createMenubarScope).toBeDefined();
    expect(typeof createMenubarScope).toBe('function');
  });

  it('Menubar should have displayName', () => {
    expect(Menubar.displayName).toBe('Menubar');
  });

  it('MenubarMenu should have displayName', () => {
    expect(MenubarMenu.displayName).toBe('MenubarMenu');
  });

  it('MenubarTrigger should have displayName', () => {
    expect(MenubarTrigger.displayName).toBe('MenubarTrigger');
  });

  it('MenubarContent should have displayName', () => {
    expect(MenubarContent.displayName).toBe('MenubarContent');
  });

  it('MenubarPortal should have displayName', () => {
    expect(MenubarPortal.displayName).toBe('MenubarPortal');
  });

  it('MenubarGroup should have displayName', () => {
    expect(MenubarGroup.displayName).toBe('MenubarGroup');
  });

  it('MenubarLabel should have displayName', () => {
    expect(MenubarLabel.displayName).toBe('MenubarLabel');
  });

  it('MenubarItem should have displayName', () => {
    expect(MenubarItem.displayName).toBe('MenubarItem');
  });

  it('MenubarSeparator should have displayName', () => {
    expect(MenubarSeparator.displayName).toBe('MenubarSeparator');
  });

  it('MenubarSub should have displayName', () => {
    expect(MenubarSub.displayName).toBe('MenubarSub');
  });

  it('MenubarSubTrigger should have displayName', () => {
    expect(MenubarSubTrigger.displayName).toBe('MenubarSubTrigger');
  });

  it('MenubarSubContent should have displayName', () => {
    expect(MenubarSubContent.displayName).toBe('MenubarSubContent');
  });
});
