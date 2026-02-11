import { describe, it, expect } from 'vitest';
import { createContext, createContextScope } from './create-context';

describe('createContext', () => {
  it('should export createContext and createContextScope', () => {
    expect(typeof createContext).toBe('function');
    expect(typeof createContextScope).toBe('function');
  });

  it('should create a context with provider and consumer', () => {
    const [Provider, useContext] = createContext<{ value: string }>('TestComponent');
    expect(typeof Provider).toBe('function');
    expect(typeof useContext).toBe('function');
  });

  it('should throw when used outside provider without default', () => {
    const [, useContext] = createContext<{ value: string }>('TestComponent');
    expect(() => useContext('TestConsumer')).toThrow(
      '`TestConsumer` must be used within `TestComponent`'
    );
  });

  it('should return default context when provided', () => {
    const defaultValue = { value: 'default' };
    const [, useContext] = createContext<{ value: string }>('TestComponent', defaultValue);
    const result = useContext('TestConsumer');
    expect(result).toBe(defaultValue);
  });
});

describe('createContextScope', () => {
  it('should create scoped context and scope creator', () => {
    const [createScopedContext, createScope] = createContextScope('TestScope');
    expect(typeof createScopedContext).toBe('function');
    expect(typeof createScope).toBe('function');
    expect(createScope.scopeName).toBe('TestScope');
  });

  it('should create scoped context with provider and consumer', () => {
    const [createScopedContext] = createContextScope('TestScope');
    const [Provider, useContext] = createScopedContext<{ value: string }>('TestComponent');
    expect(typeof Provider).toBe('function');
    expect(typeof useContext).toBe('function');
  });
});
