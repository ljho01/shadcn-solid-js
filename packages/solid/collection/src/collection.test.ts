import { describe, it, expect } from 'vitest';
import { createCollection } from './collection';

describe('createCollection', () => {
  it('should export createCollection function', () => {
    expect(typeof createCollection).toBe('function');
  });

  it('should create collection with correct structure', () => {
    const [Collection, useCollection, createCollectionScope] = createCollection('Test');
    
    expect(typeof Collection.Provider).toBe('function');
    expect(typeof Collection.Slot).toBe('function');
    expect(typeof Collection.ItemSlot).toBe('function');
    expect(typeof useCollection).toBe('function');
    expect(typeof createCollectionScope).toBe('function');
    expect(createCollectionScope.scopeName).toBe('TestCollection');
  });
});
