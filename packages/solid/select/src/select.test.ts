import { describe, it, expect } from 'vitest';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectSeparator,
  SelectArrow,
  createSelectScope,
} from './select';

describe('Select', () => {
  it('should export all Select components', () => {
    expect(Select).toBeDefined();
    expect(SelectTrigger).toBeDefined();
    expect(SelectValue).toBeDefined();
    expect(SelectIcon).toBeDefined();
    expect(SelectPortal).toBeDefined();
    expect(SelectContent).toBeDefined();
    expect(SelectViewport).toBeDefined();
    expect(SelectGroup).toBeDefined();
    expect(SelectLabel).toBeDefined();
    expect(SelectItem).toBeDefined();
    expect(SelectItemText).toBeDefined();
    expect(SelectItemIndicator).toBeDefined();
    expect(SelectScrollUpButton).toBeDefined();
    expect(SelectScrollDownButton).toBeDefined();
    expect(SelectSeparator).toBeDefined();
    expect(SelectArrow).toBeDefined();
  });

  it('should export createSelectScope', () => {
    expect(createSelectScope).toBeDefined();
    expect(typeof createSelectScope).toBe('function');
  });
});
