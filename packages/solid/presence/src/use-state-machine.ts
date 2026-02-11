import { createSignal } from 'solid-js';

type Machine<S> = { [k: string]: { [k: string]: S } };
type MachineState<T> = keyof T;
type MachineEvent<T> = keyof UnionToIntersection<T[keyof T]>;

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any
  ? R
  : never;

/**
 * Simple state machine using SolidJS signals.
 * Replaces React's useReducer-based state machine.
 */
export function createStateMachine<M>(
  initialState: MachineState<M>,
  machine: M & Machine<MachineState<M>>
): [() => MachineState<M>, (event: MachineEvent<M>) => void] {
  const [state, setState] = createSignal<MachineState<M>>(initialState);

  const send = (event: MachineEvent<M>) => {
    const currentState = state();
    const nextState = (machine[currentState] as any)?.[event];
    if (nextState !== undefined) {
      setState(() => nextState as MachineState<M>);
    }
  };

  return [state, send];
}
