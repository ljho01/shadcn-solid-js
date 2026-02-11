import { describe, it, expect } from 'vitest';
import * as avatar from './index';

describe('avatar', () => {
  it('should export all components', () => {
    expect(avatar.Avatar).toBeDefined();
    expect(avatar.AvatarImage).toBeDefined();
    expect(avatar.AvatarFallback).toBeDefined();
  });
});
