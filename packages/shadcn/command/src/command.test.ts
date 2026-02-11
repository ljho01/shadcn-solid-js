import { describe, it, expect } from 'vitest';
import * as command from './index';

describe('command', () => {
  it('should export all components', () => {
    expect(command.Command).toBeDefined();
    expect(command.CommandInput).toBeDefined();
    expect(command.CommandList).toBeDefined();
    expect(command.CommandEmpty).toBeDefined();
    expect(command.CommandGroup).toBeDefined();
    expect(command.CommandItem).toBeDefined();
    expect(command.CommandSeparator).toBeDefined();
    expect(command.CommandDialog).toBeDefined();
  });
});
