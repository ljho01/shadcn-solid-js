import { describe, it, expect } from 'vitest';
import * as PaginationModule from './pagination';

describe('Pagination', () => {
  it('should export all components', () => {
    expect(PaginationModule.Pagination).toBeDefined();
    expect(PaginationModule.PaginationContent).toBeDefined();
    expect(PaginationModule.PaginationItem).toBeDefined();
    expect(PaginationModule.PaginationLink).toBeDefined();
    expect(PaginationModule.PaginationPrevious).toBeDefined();
    expect(PaginationModule.PaginationNext).toBeDefined();
    expect(PaginationModule.PaginationEllipsis).toBeDefined();
  });
});
