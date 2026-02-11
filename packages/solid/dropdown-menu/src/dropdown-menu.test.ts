import { describe, it, expect } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuArrow,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  createDropdownMenuScope,
} from './dropdown-menu';

describe('DropdownMenu', () => {
  it('should export all DropdownMenu components', () => {
    expect(DropdownMenu).toBeDefined();
    expect(DropdownMenuTrigger).toBeDefined();
    expect(DropdownMenuPortal).toBeDefined();
    expect(DropdownMenuContent).toBeDefined();
    expect(DropdownMenuGroup).toBeDefined();
    expect(DropdownMenuLabel).toBeDefined();
    expect(DropdownMenuItem).toBeDefined();
    expect(DropdownMenuCheckboxItem).toBeDefined();
    expect(DropdownMenuRadioGroup).toBeDefined();
    expect(DropdownMenuRadioItem).toBeDefined();
    expect(DropdownMenuItemIndicator).toBeDefined();
    expect(DropdownMenuSeparator).toBeDefined();
    expect(DropdownMenuArrow).toBeDefined();
    expect(DropdownMenuSub).toBeDefined();
    expect(DropdownMenuSubTrigger).toBeDefined();
    expect(DropdownMenuSubContent).toBeDefined();
  });

  it('should export createDropdownMenuScope', () => {
    expect(createDropdownMenuScope).toBeDefined();
    expect(typeof createDropdownMenuScope).toBe('function');
  });

  it('DropdownMenu should have displayName', () => {
    expect(DropdownMenu.displayName).toBe('DropdownMenu');
  });

  it('DropdownMenuTrigger should have displayName', () => {
    expect(DropdownMenuTrigger.displayName).toBe('DropdownMenuTrigger');
  });

  it('DropdownMenuContent should have displayName', () => {
    expect(DropdownMenuContent.displayName).toBe('DropdownMenuContent');
  });

  it('DropdownMenuPortal should have displayName', () => {
    expect(DropdownMenuPortal.displayName).toBe('DropdownMenuPortal');
  });

  it('DropdownMenuGroup should have displayName', () => {
    expect(DropdownMenuGroup.displayName).toBe('DropdownMenuGroup');
  });

  it('DropdownMenuLabel should have displayName', () => {
    expect(DropdownMenuLabel.displayName).toBe('DropdownMenuLabel');
  });

  it('DropdownMenuItem should have displayName', () => {
    expect(DropdownMenuItem.displayName).toBe('DropdownMenuItem');
  });

  it('DropdownMenuSeparator should have displayName', () => {
    expect(DropdownMenuSeparator.displayName).toBe('DropdownMenuSeparator');
  });
});
