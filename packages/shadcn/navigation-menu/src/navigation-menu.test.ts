import { describe, it, expect } from 'vitest';
import * as navigationMenu from './index';

describe('navigation-menu', () => {
  it('should export all components', () => {
    expect(navigationMenu.NavigationMenu).toBeDefined();
    expect(navigationMenu.NavigationMenuList).toBeDefined();
    expect(navigationMenu.NavigationMenuItem).toBeDefined();
    expect(navigationMenu.NavigationMenuContent).toBeDefined();
    expect(navigationMenu.NavigationMenuTrigger).toBeDefined();
    expect(navigationMenu.NavigationMenuLink).toBeDefined();
    expect(navigationMenu.NavigationMenuIndicator).toBeDefined();
    expect(navigationMenu.NavigationMenuViewport).toBeDefined();
  });
});
