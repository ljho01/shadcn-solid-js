import { describe, it, expect } from 'vitest';
import * as resizable from './index';

describe('resizable', () => {
  it('should export all components', () => {
    expect(resizable.ResizablePanelGroup).toBeDefined();
    expect(resizable.ResizablePanel).toBeDefined();
    expect(resizable.ResizableHandle).toBeDefined();
  });
});
