import { createSignal, type Accessor } from 'solid-js';

type Machine<S> = { [k: string]: { [k: string]: S } };
type MachineState<T> = keyof T;
type MachineEvent<T> = keyof UnionToIntersection<T[keyof T]>;

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any
  ? R
  : never;

export function createStateMachine<M>(
  initialState: MachineState<M>,
  machine: M & Machine<MachineState<M>>
): [Accessor<MachineState<M>>, (event: MachineEvent<M>) => void] {
  const [state, setState] = createSignal<MachineState<M>>(initialState);

  const send = (event: MachineEvent<M>) => {
    setState((current) => {
      const nextState = (machine[current] as any)?.[event];
      return nextState ?? current;
    });
  };

  return [state, send];
}
