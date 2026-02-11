import { describe, it, expect } from 'vitest';
import * as CardModule from './card';

describe('Card', () => {
  it('should export all components', () => {
    expect(CardModule.Card).toBeDefined();
    expect(CardModule.CardHeader).toBeDefined();
    expect(CardModule.CardTitle).toBeDefined();
    expect(CardModule.CardDescription).toBeDefined();
    expect(CardModule.CardAction).toBeDefined();
    expect(CardModule.CardContent).toBeDefined();
    expect(CardModule.CardFooter).toBeDefined();
  });
});
