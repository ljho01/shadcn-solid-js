import { describe, it, expect } from 'vitest';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuItemIndicator,
  ContextMenuSeparator,
  ContextMenuArrow,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  createContextMenuScope,
} from './context-menu';

describe('ContextMenu', () => {
  it('should export all ContextMenu components', () => {
    expect(ContextMenu).toBeDefined();
    expect(ContextMenuTrigger).toBeDefined();
    expect(ContextMenuPortal).toBeDefined();
    expect(ContextMenuContent).toBeDefined();
    expect(ContextMenuGroup).toBeDefined();
    expect(ContextMenuLabel).toBeDefined();
    expect(ContextMenuItem).toBeDefined();
    expect(ContextMenuCheckboxItem).toBeDefined();
    expect(ContextMenuRadioGroup).toBeDefined();
    expect(ContextMenuRadioItem).toBeDefined();
    expect(ContextMenuItemIndicator).toBeDefined();
    expect(ContextMenuSeparator).toBeDefined();
    expect(ContextMenuArrow).toBeDefined();
    expect(ContextMenuSub).toBeDefined();
    expect(ContextMenuSubTrigger).toBeDefined();
    expect(ContextMenuSubContent).toBeDefined();
  });

  it('should export createContextMenuScope', () => {
    expect(createContextMenuScope).toBeDefined();
    expect(typeof createContextMenuScope).toBe('function');
  });

  it('ContextMenu should have displayName', () => {
    expect(ContextMenu.displayName).toBe('ContextMenu');
  });

  it('ContextMenuTrigger should have displayName', () => {
    expect(ContextMenuTrigger.displayName).toBe('ContextMenuTrigger');
  });

  it('ContextMenuContent should have displayName', () => {
    expect(ContextMenuContent.displayName).toBe('ContextMenuContent');
  });

  it('ContextMenuPortal should have displayName', () => {
    expect(ContextMenuPortal.displayName).toBe('ContextMenuPortal');
  });

  it('ContextMenuGroup should have displayName', () => {
    expect(ContextMenuGroup.displayName).toBe('ContextMenuGroup');
  });

  it('ContextMenuLabel should have displayName', () => {
    expect(ContextMenuLabel.displayName).toBe('ContextMenuLabel');
  });

  it('ContextMenuItem should have displayName', () => {
    expect(ContextMenuItem.displayName).toBe('ContextMenuItem');
  });

  it('ContextMenuSeparator should have displayName', () => {
    expect(ContextMenuSeparator.displayName).toBe('ContextMenuSeparator');
  });

  it('ContextMenuSub should have displayName', () => {
    expect(ContextMenuSub.displayName).toBe('ContextMenuSub');
  });
});
