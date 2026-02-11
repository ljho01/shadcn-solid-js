import { describe, it, expect } from 'vitest';
import { Presence } from './presence';
import { createStateMachine } from './use-state-machine';
import { createRoot } from 'solid-js';

describe('Presence', () => {
  it('should export Presence component', () => {
    expect(typeof Presence).toBe('function');
  });
});

describe('createStateMachine', () => {
  it('should initialize with the given state', () => {
    createRoot((dispose) => {
      const [state] = createStateMachine('idle', {
        idle: { START: 'running' },
        running: { STOP: 'idle' },
      });
      expect(state()).toBe('idle');
      dispose();
    });
  });

  it('should transition on valid events', () => {
    createRoot((dispose) => {
      const [state, send] = createStateMachine('idle', {
        idle: { START: 'running' },
        running: { STOP: 'idle' },
      });
      
      send('START');
      expect(state()).toBe('running');
      
      send('STOP');
      expect(state()).toBe('idle');
      
      dispose();
    });
  });

  it('should ignore invalid events', () => {
    createRoot((dispose) => {
      const [state, send] = createStateMachine('idle', {
        idle: { START: 'running' },
        running: { STOP: 'idle' },
      });
      
      // STOP is not valid in 'idle' state
      send('STOP');
      expect(state()).toBe('idle');
      
      dispose();
    });
  });
});
