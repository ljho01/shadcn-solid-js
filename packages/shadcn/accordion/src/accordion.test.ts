import { describe, it, expect } from 'vitest';
import * as accordion from './index';

describe('accordion', () => {
  it('should export all components', () => {
    expect(accordion.Accordion).toBeDefined();
    expect(accordion.AccordionItem).toBeDefined();
    expect(accordion.AccordionTrigger).toBeDefined();
    expect(accordion.AccordionContent).toBeDefined();
  });
});
