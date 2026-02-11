import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { Accordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent } from './accordion';

describe('Accordion', () => {
  it('should export all Accordion components', () => {
    expect(Accordion).toBeDefined();
    expect(AccordionItem).toBeDefined();
    expect(AccordionHeader).toBeDefined();
    expect(AccordionTrigger).toBeDefined();
    expect(AccordionContent).toBeDefined();
  });

  it('should render single Accordion without errors', () => {
    createRoot((dispose) => {
      const el = Accordion({ type: 'single' });
      expect(el).toBeDefined();
      dispose();
    });
  });
});
