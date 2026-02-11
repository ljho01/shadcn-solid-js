import { describe, it, expect } from 'vitest';
import * as contextMenu from './index';

describe('context-menu', () => {
  it('should export all components', () => {
    expect(contextMenu.ContextMenu).toBeDefined();
    expect(contextMenu.ContextMenuTrigger).toBeDefined();
    expect(contextMenu.ContextMenuContent).toBeDefined();
    expect(contextMenu.ContextMenuItem).toBeDefined();
    expect(contextMenu.ContextMenuCheckboxItem).toBeDefined();
    expect(contextMenu.ContextMenuRadioGroup).toBeDefined();
    expect(contextMenu.ContextMenuRadioItem).toBeDefined();
    expect(contextMenu.ContextMenuLabel).toBeDefined();
    expect(contextMenu.ContextMenuSeparator).toBeDefined();
    expect(contextMenu.ContextMenuSub).toBeDefined();
    expect(contextMenu.ContextMenuSubTrigger).toBeDefined();
    expect(contextMenu.ContextMenuSubContent).toBeDefined();
  });
});
