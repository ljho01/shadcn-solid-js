import { describe, it, expect } from 'vitest';
import {
  NavigationMenu,
  NavigationMenuSub,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  createNavigationMenuScope,
} from './navigation-menu';

describe('NavigationMenu', () => {
  it('should export all NavigationMenu components', () => {
    expect(NavigationMenu).toBeDefined();
    expect(NavigationMenuSub).toBeDefined();
    expect(NavigationMenuList).toBeDefined();
    expect(NavigationMenuItem).toBeDefined();
    expect(NavigationMenuTrigger).toBeDefined();
    expect(NavigationMenuContent).toBeDefined();
    expect(NavigationMenuLink).toBeDefined();
    expect(NavigationMenuIndicator).toBeDefined();
    expect(NavigationMenuViewport).toBeDefined();
  });

  it('should export createNavigationMenuScope', () => {
    expect(createNavigationMenuScope).toBeDefined();
    expect(typeof createNavigationMenuScope).toBe('function');
  });
});
