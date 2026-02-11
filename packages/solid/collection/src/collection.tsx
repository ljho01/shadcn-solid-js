import { createContext, useContext, type JSX, onMount, onCleanup } from 'solid-js';
import { isServer } from 'solid-js/web';

/* -------------------------------------------------------------------------------------------------
 * createCollection
 *
 * Creates a collection system for tracking DOM items and their data.
 * This is a simplified SolidJS version of the React collection pattern.
 * 
 * Instead of using React's useRef + Map + DOM queries, we use:
 * - SolidJS Context for sharing state
 * - Signals for reactive item tracking
 * - Direct DOM queries (querySelectorAll) for ordering
 * -----------------------------------------------------------------------------------------------*/

interface CollectionProps {
  children: JSX.Element;
  scope?: any;
}

interface BaseItemData {
  id?: string;
}

function createCollection<ItemElement extends HTMLElement, ItemData extends {} = {}>(name: string) {
  type AllItemData = ItemData & BaseItemData;

  const ITEM_DATA_ATTR = 'data-radix-collection-item';

  // Context type
  interface CollectionContextValue {
    collectionRef: (el: HTMLElement) => void;
    itemMap: Map<ItemElement, { ref: ItemElement } & AllItemData>;
  }

  const CollectionContext = createContext<CollectionContextValue>();

  /* ----- CollectionProvider ----- */
  function CollectionProvider(props: { children: JSX.Element; scope?: any }) {
    const itemMap = new Map<ItemElement, { ref: ItemElement } & AllItemData>();
    let collectionEl: HTMLElement | null = null;
    void collectionEl; // retained for future use (querying item order)

    const contextValue: CollectionContextValue = {
      collectionRef: (el: HTMLElement) => {
        collectionEl = el;
      },
      itemMap,
    };

    return (
      <CollectionContext.Provider value={contextValue}>
        {props.children}
      </CollectionContext.Provider>
    );
  }

  /* ----- CollectionSlot ----- */
  function CollectionSlot(props: CollectionProps) {
    const context = useContext(CollectionContext);
    // On the server, context may be missing if Collection.Provider is rendered
    // inside the same component. Render children directly since DOM tracking
    // is client-only anyway.
    if (!context) {
      if (isServer) {
        return <>{props.children}</>;
      }
      throw new Error(`${name}CollectionSlot must be used within ${name}CollectionProvider`);
    }

    let ref!: HTMLElement;

    onMount(() => {
      if (ref) {
        context.collectionRef(ref);
      }
    });

    return (
      <div ref={(el) => { ref = el; context.collectionRef(el); }} style={{ display: 'contents' }}>
        {props.children}
      </div>
    );
  }

  /* ----- CollectionItemSlot ----- */
  function CollectionItemSlot(props: AllItemData & { children: JSX.Element; scope?: any }) {
    const context = useContext(CollectionContext);
    if (!context && !isServer) throw new Error(`${name}CollectionItemSlot must be used within ${name}CollectionProvider`);

    let itemRef!: ItemElement;

    onMount(() => {
      if (itemRef && context) {
        const { children, scope, ...itemData } = props as any;
        context.itemMap.set(itemRef, { ref: itemRef, ...itemData } as { ref: ItemElement } & AllItemData);
      }
    });

    onCleanup(() => {
      if (itemRef && context) {
        context.itemMap.delete(itemRef);
      }
    });

    return (
      <span
        ref={(el) => { itemRef = el as unknown as ItemElement; }}
        {...{ [ITEM_DATA_ATTR]: '' }}
        style={{ display: 'contents' }}
      >
        {props.children}
      </span>
    );
  }

  /* ----- useCollection ----- */
  function useCollection(_scope?: any) {
    const context = useContext(CollectionContext);
    // On the server, some components (e.g. RovingFocusGroup) call useCollection
    // during setup before their own Collection.Provider is rendered.
    // Since getItems() is only used in event handlers (which don't fire during SSR),
    // we can safely return a no-op getter on the server.
    if (!context) {
      if (isServer) {
        return () => [] as ({ ref: ItemElement } & AllItemData)[];
      }
      throw new Error(`${name}CollectionConsumer must be used within ${name}CollectionProvider`);
    }

    const getItems = () => {
      const items = Array.from(context.itemMap.values());
      // Sort by DOM order
      items.sort((a, b) => {
        if (!a.ref || !b.ref) return 0;
        const position = b.ref.compareDocumentPosition(a.ref);
        return position & Node.DOCUMENT_POSITION_PRECEDING ? -1 : 1;
      });
      return items;
    };

    return getItems;
  }

  /* ----- createCollectionScope (stub for scope compatibility) ----- */
  function createCollectionScope() {
    return function useScope(_scope: any) {
      return {};
    };
  }
  createCollectionScope.scopeName = name + 'Collection';

  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection,
    createCollectionScope,
  ] as const;
}

export { createCollection };
export type { CollectionProps };
