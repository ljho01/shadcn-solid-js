import { describe, it, expect } from 'vitest';
import { composeEventHandlers, canUseDOM, getOwnerDocument, getOwnerWindow, getActiveElement, isFrame } from './primitive';

describe('composeEventHandlers', () => {
  it('should call both handlers in order', () => {
    const calls: string[] = [];
    const handler1 = () => calls.push('first');
    const handler2 = () => calls.push('second');
    const composed = composeEventHandlers(handler1, handler2);

    composed({ defaultPrevented: false });
    expect(calls).toEqual(['first', 'second']);
  });

  it('should not call our handler if defaultPrevented', () => {
    const calls: string[] = [];
    const handler1 = () => calls.push('first');
    const handler2 = () => calls.push('second');
    const composed = composeEventHandlers(handler1, handler2);

    composed({ defaultPrevented: true });
    expect(calls).toEqual(['first']);
  });

  it('should call our handler even if defaultPrevented when checkForDefaultPrevented is false', () => {
    const calls: string[] = [];
    const handler1 = () => calls.push('first');
    const handler2 = () => calls.push('second');
    const composed = composeEventHandlers(handler1, handler2, {
      checkForDefaultPrevented: false,
    });

    composed({ defaultPrevented: true });
    expect(calls).toEqual(['first', 'second']);
  });

  it('should handle undefined handlers gracefully', () => {
    const handler = () => {};
    const composed1 = composeEventHandlers(undefined, handler);
    const composed2 = composeEventHandlers(handler, undefined);

    expect(() => composed1({ defaultPrevented: false })).not.toThrow();
    expect(() => composed2({ defaultPrevented: false })).not.toThrow();
  });
});

describe('canUseDOM', () => {
  it('should be a boolean', () => {
    expect(typeof canUseDOM).toBe('boolean');
  });
});

describe('isFrame', () => {
  it('should return true for IFRAME elements', () => {
    const iframe = document.createElement('iframe');
    expect(isFrame(iframe)).toBe(true);
  });

  it('should return false for non-IFRAME elements', () => {
    const div = document.createElement('div');
    expect(isFrame(div)).toBe(false);
  });
});

describe('getOwnerDocument', () => {
  it('should return the document for a given element', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect(getOwnerDocument(div)).toBe(document);
    document.body.removeChild(div);
  });

  it('should return global document for null', () => {
    expect(getOwnerDocument(null)).toBe(document);
  });
});

describe('getOwnerWindow', () => {
  it('should return the window for a given element', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect(getOwnerWindow(div)).toBe(window);
    document.body.removeChild(div);
  });
});

describe('getActiveElement', () => {
  it('should return the active element', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();
    expect(getActiveElement(document.body)).toBe(button);
    document.body.removeChild(button);
  });
});
