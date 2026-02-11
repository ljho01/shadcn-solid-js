import { describe, it, expect } from 'vitest';
import * as BreadcrumbModule from './breadcrumb';

describe('Breadcrumb', () => {
  it('should export all components', () => {
    expect(BreadcrumbModule.Breadcrumb).toBeDefined();
    expect(BreadcrumbModule.BreadcrumbList).toBeDefined();
    expect(BreadcrumbModule.BreadcrumbItem).toBeDefined();
    expect(BreadcrumbModule.BreadcrumbLink).toBeDefined();
    expect(BreadcrumbModule.BreadcrumbPage).toBeDefined();
    expect(BreadcrumbModule.BreadcrumbSeparator).toBeDefined();
    expect(BreadcrumbModule.BreadcrumbEllipsis).toBeDefined();
  });
});
