import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Avatar', () => {
  it('should export Avatar components', () => {
    expect(Avatar).toBeDefined();
    expect(AvatarImage).toBeDefined();
    expect(AvatarFallback).toBeDefined();
  });

  it('should render Avatar without errors', () => {
    createRoot((dispose) => {
      const el = Avatar({});
      expect(el).toBeDefined();
      dispose();
    });
  });
});
