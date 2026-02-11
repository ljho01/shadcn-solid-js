import { createContext, useContext, type JSX } from 'solid-js';

type Direction = 'ltr' | 'rtl';

const DirectionContext = createContext<Direction | undefined>(undefined);

interface DirectionProviderProps {
  children?: JSX.Element;
  dir: Direction;
}

function DirectionProvider(props: DirectionProviderProps) {
  return (
    <DirectionContext.Provider value={props.dir}>
      {props.children}
    </DirectionContext.Provider>
  );
}

function useDirection(localDir?: Direction): Direction {
  const globalDir = useContext(DirectionContext);
  return localDir || globalDir || 'ltr';
}

const Provider = DirectionProvider;

export { useDirection, Provider, DirectionProvider };
export type { Direction };
