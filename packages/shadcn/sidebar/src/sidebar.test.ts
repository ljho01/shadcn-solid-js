import { describe, it, expect } from 'vitest';
import * as sidebar from './index';

describe('sidebar', () => {
  it('should export all components', () => {
    expect(sidebar.SidebarProvider).toBeDefined();
    expect(sidebar.Sidebar).toBeDefined();
    expect(sidebar.SidebarHeader).toBeDefined();
    expect(sidebar.SidebarContent).toBeDefined();
    expect(sidebar.SidebarFooter).toBeDefined();
    expect(sidebar.SidebarGroup).toBeDefined();
    expect(sidebar.SidebarGroupLabel).toBeDefined();
    expect(sidebar.SidebarGroupContent).toBeDefined();
    expect(sidebar.SidebarMenu).toBeDefined();
    expect(sidebar.SidebarMenuItem).toBeDefined();
    expect(sidebar.SidebarMenuButton).toBeDefined();
    expect(sidebar.SidebarTrigger).toBeDefined();
    expect(sidebar.SidebarInset).toBeDefined();
    expect(sidebar.SidebarRail).toBeDefined();
    expect(sidebar.useSidebar).toBeDefined();
  });
});
