import { describe, it, expect } from 'vitest';
import * as dropdownMenu from './index';

describe('dropdown-menu', () => {
  it('should export all components', () => {
    expect(dropdownMenu.DropdownMenu).toBeDefined();
    expect(dropdownMenu.DropdownMenuTrigger).toBeDefined();
    expect(dropdownMenu.DropdownMenuContent).toBeDefined();
    expect(dropdownMenu.DropdownMenuItem).toBeDefined();
    expect(dropdownMenu.DropdownMenuCheckboxItem).toBeDefined();
    expect(dropdownMenu.DropdownMenuRadioGroup).toBeDefined();
    expect(dropdownMenu.DropdownMenuRadioItem).toBeDefined();
    expect(dropdownMenu.DropdownMenuLabel).toBeDefined();
    expect(dropdownMenu.DropdownMenuSeparator).toBeDefined();
    expect(dropdownMenu.DropdownMenuGroup).toBeDefined();
    expect(dropdownMenu.DropdownMenuSub).toBeDefined();
    expect(dropdownMenu.DropdownMenuSubTrigger).toBeDefined();
    expect(dropdownMenu.DropdownMenuSubContent).toBeDefined();
  });
});
