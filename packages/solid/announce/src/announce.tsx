import { type JSX, createSignal, createEffect, onMount, onCleanup, splitProps } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Primitive } from '@radix-solid-js/primitive-component';
import { mergeRefs } from '@radix-solid-js/compose-refs';

type RegionType = 'polite' | 'assertive' | 'off';
type RegionRole = 'status' | 'alert' | 'log' | 'none';

const ROLES: { [key in RegionType]: RegionRole } = {
  polite: 'status',
  assertive: 'alert',
  off: 'none',
};

const listenerMap = new Map<Element, number>();

interface AnnounceProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'aria-atomic' | 'aria-relevant' | 'children' | 'role' | 'type' | 'ref'> {
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  children: JSX.Element;
  regionIdentifier?: string;
  role?: RegionRole;
  type?: RegionType;
  ref?: (el: HTMLElement) => void;
}

function Announce(inProps: AnnounceProps) {
  const [local, rest] = splitProps(inProps, [
    'aria-atomic', 'aria-relevant', 'children', 'type', 'role', 'regionIdentifier', 'ref',
  ]);

  const type = () => local.type ?? 'polite';
  const role = () => local.role ?? ROLES[type()];
  const ariaAtomic = () => ['true', true].includes(local['aria-atomic'] as any);

  let ownerDocument = document;
  const [region, setRegion] = createSignal<HTMLElement>();

  const getOrCreateRegion = () => {
    const config = { type: type(), role: role(), atomic: ariaAtomic(), id: local.regionIdentifier };
    const selector = buildSelector(config);
    const existing = ownerDocument.querySelector(selector);
    if (existing) return existing as HTMLElement;
    return buildLiveRegionElement(ownerDocument, config);
  };

  onMount(() => {
    setRegion(getOrCreateRegion());
  });

  createEffect(() => {
    const regionEl = getOrCreateRegion();
    if (!regionEl) return;

    function updateOnVisibilityChange() {
      regionEl.setAttribute('role', ownerDocument.hidden ? 'none' : role());
      regionEl.setAttribute('aria-live', ownerDocument.hidden ? 'off' : type());
    }

    if (!listenerMap.get(regionEl)) {
      ownerDocument.addEventListener('visibilitychange', updateOnVisibilityChange);
      listenerMap.set(regionEl, 1);
    } else {
      listenerMap.set(regionEl, (listenerMap.get(regionEl) ?? 0) + 1);
    }

    onCleanup(() => {
      const count = listenerMap.get(regionEl) ?? 0;
      listenerMap.set(regionEl, count - 1);
      if (count === 1) {
        ownerDocument.removeEventListener('visibilitychange', updateOnVisibilityChange);
      }
    });
  });

  return (
    <>
      <Primitive.div
        {...rest}
        ref={mergeRefs(local.ref, (node: HTMLElement) => {
          if (node) ownerDocument = node.ownerDocument;
        })}
      >
        {local.children}
      </Primitive.div>
      {region() && (
        <Portal mount={region()}>
          <div>{local.children}</div>
        </Portal>
      )}
    </>
  );
}

type LiveRegionOptions = {
  type: string;
  role: string;
  atomic?: boolean;
  id?: string;
};

function buildLiveRegionElement(ownerDocument: Document, { type, role, atomic, id }: LiveRegionOptions) {
  const el = ownerDocument.createElement('div');
  el.setAttribute(getLiveRegionPartDataAttr(id), '');
  el.setAttribute('style', 'position: absolute; top: -1px; width: 1px; height: 1px; overflow: hidden;');
  ownerDocument.body.appendChild(el);
  el.setAttribute('aria-live', type);
  el.setAttribute('aria-atomic', String(atomic || false));
  el.setAttribute('role', role);
  return el;
}

function buildSelector({ type, role, atomic, id }: LiveRegionOptions) {
  return `[${getLiveRegionPartDataAttr(id)}]${[
    ['aria-live', type], ['aria-atomic', atomic], ['role', role],
  ].filter(([, val]) => !!val).map(([attr, val]) => `[${attr}=${val}]`).join('')}`;
}

function getLiveRegionPartDataAttr(id?: string) {
  return 'data-radix-announce-region' + (id ? `-${id}` : '');
}

export { Announce };
export type { AnnounceProps };
