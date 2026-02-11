import { describe, it, expect } from 'vitest';
import * as TableModule from './table';

describe('Table', () => {
  it('should export all components', () => {
    expect(TableModule.Table).toBeDefined();
    expect(TableModule.TableHeader).toBeDefined();
    expect(TableModule.TableBody).toBeDefined();
    expect(TableModule.TableFooter).toBeDefined();
    expect(TableModule.TableHead).toBeDefined();
    expect(TableModule.TableRow).toBeDefined();
    expect(TableModule.TableCell).toBeDefined();
    expect(TableModule.TableCaption).toBeDefined();
  });
});
