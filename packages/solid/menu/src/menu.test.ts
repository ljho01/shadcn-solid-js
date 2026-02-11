import { describe, it, expect } from 'vitest';
import {
  Menu,
  MenuAnchor,
  MenuPortal,
  MenuContent,
  MenuGroup,
  MenuLabel,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuItemIndicator,
  MenuSeparator,
  MenuArrow,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  createMenuScope,
} from './menu';

describe('Menu', () => {
  it('should export all Menu components', () => {
    expect(Menu).toBeDefined();
    expect(MenuAnchor).toBeDefined();
    expect(MenuPortal).toBeDefined();
    expect(MenuContent).toBeDefined();
    expect(MenuGroup).toBeDefined();
    expect(MenuLabel).toBeDefined();
    expect(MenuItem).toBeDefined();
    expect(MenuCheckboxItem).toBeDefined();
    expect(MenuRadioGroup).toBeDefined();
    expect(MenuRadioItem).toBeDefined();
    expect(MenuItemIndicator).toBeDefined();
    expect(MenuSeparator).toBeDefined();
    expect(MenuArrow).toBeDefined();
    expect(MenuSub).toBeDefined();
    expect(MenuSubTrigger).toBeDefined();
    expect(MenuSubContent).toBeDefined();
  });

  it('should export createMenuScope', () => {
    expect(createMenuScope).toBeDefined();
    expect(typeof createMenuScope).toBe('function');
  });
});
