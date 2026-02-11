import { type JSX, createSignal, createEffect, onCleanup, splitProps } from 'solid-js';
import { mergeRefs } from '@radix-solid-js/compose-refs';
import { Primitive } from '@radix-solid-js/primitive-component';

const AUTOFOCUS_ON_MOUNT = 'focusScope.autoFocusOnMount';
const AUTOFOCUS_ON_UNMOUNT = 'focusScope.autoFocusOnUnmount';
const EVENT_OPTIONS = { bubbles: false, cancelable: true };

type FocusableTarget = HTMLElement | { focus(): void };

/* -------------------------------------------------------------------------------------------------
 * FocusScope
 * -----------------------------------------------------------------------------------------------*/

interface FocusScopeProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** When true, tabbing from last item will focus first and vice versa */
  loop?: boolean;
  /** When true, focus cannot escape the scope */
  trapped?: boolean;
  /** Event handler called when auto-focusing on mount */
  onMountAutoFocus?: (event: Event) => void;
  /** Event handler called when auto-focusing on unmount */
  onUnmountAutoFocus?: (event: Event) => void;
  ref?: (el: HTMLDivElement) => void;
}

function FocusScope(inProps: FocusScopeProps) {
  const [local, rest] = splitProps(inProps, [
    'loop', 'trapped', 'onMountAutoFocus', 'onUnmountAutoFocus', 'ref',
  ]);

  const loop = () => local.loop ?? false;
  const trapped = () => local.trapped ?? false;

  const [container, setContainer] = createSignal<HTMLElement | null>(null);
  let lastFocusedElementRef: HTMLElement | null = null;

  const focusScope = {
    paused: false,
    pause() { this.paused = true; },
    resume() { this.paused = false; },
  };

  // Focus trapping
  createEffect(() => {
    if (!trapped()) return;
    const el = container();
    if (!el) return;

    function handleFocusIn(event: FocusEvent) {
      if (focusScope.paused || !el) return;
      const target = event.target as HTMLElement | null;
      if (el.contains(target)) {
        lastFocusedElementRef = target;
      } else {
        focus(lastFocusedElementRef, { select: true });
      }
    }

    function handleFocusOut(event: FocusEvent) {
      if (focusScope.paused || !el) return;
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      if (relatedTarget === null) return;
      if (!el.contains(relatedTarget)) {
        focus(lastFocusedElementRef, { select: true });
      }
    }

    function handleMutations(mutations: MutationRecord[]) {
      const focusedElement = document.activeElement as HTMLElement | null;
      if (focusedElement !== document.body) return;
      for (const mutation of mutations) {
        if (mutation.removedNodes.length > 0) focus(el);
      }
    }

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    const mutationObserver = new MutationObserver(handleMutations);
    if (el) mutationObserver.observe(el, { childList: true, subtree: true });

    onCleanup(() => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      mutationObserver.disconnect();
    });
  });

  // Auto focus on mount/unmount
  createEffect(() => {
    const el = container();
    if (!el) return;

    focusScopesStack.add(focusScope);
    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    const hasFocusedCandidate = el.contains(previouslyFocusedElement);

    if (!hasFocusedCandidate) {
      const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
      el.addEventListener(AUTOFOCUS_ON_MOUNT, local.onMountAutoFocus as EventListener || (() => {}));
      el.dispatchEvent(mountEvent);
      if (!mountEvent.defaultPrevented) {
        focusFirst(removeLinks(getTabbableCandidates(el)), { select: true });
        if (document.activeElement === previouslyFocusedElement) {
          focus(el);
        }
      }
    }

    onCleanup(() => {
      el.removeEventListener(AUTOFOCUS_ON_MOUNT, local.onMountAutoFocus as EventListener || (() => {}));
      setTimeout(() => {
        const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
        const handler = local.onUnmountAutoFocus as EventListener || (() => {});
        el.addEventListener(AUTOFOCUS_ON_UNMOUNT, handler);
        el.dispatchEvent(unmountEvent);
        if (!unmountEvent.defaultPrevented) {
          focus(previouslyFocusedElement ?? document.body, { select: true });
        }
        el.removeEventListener(AUTOFOCUS_ON_UNMOUNT, handler);
        focusScopesStack.remove(focusScope);
      }, 0);
    });
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!loop() && !trapped()) return;
    if (focusScope.paused) return;

    const isTabKey = event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey;
    const focusedElement = document.activeElement as HTMLElement | null;

    if (isTabKey && focusedElement) {
      const el = event.currentTarget as HTMLElement;
      const [first, last] = getTabbableEdges(el);
      const hasTabbableElementsInside = first && last;

      if (!hasTabbableElementsInside) {
        if (focusedElement === el) event.preventDefault();
      } else {
        if (!event.shiftKey && focusedElement === last) {
          event.preventDefault();
          if (loop()) focus(first, { select: true });
        } else if (event.shiftKey && focusedElement === first) {
          event.preventDefault();
          if (loop()) focus(last, { select: true });
        }
      }
    }
  };

  return (
    <Primitive.div
      tabIndex={-1}
      {...rest}
      ref={mergeRefs(local.ref as any, (node: HTMLElement) => setContainer(node))}
      onKeyDown={handleKeyDown}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Utils
 * -----------------------------------------------------------------------------------------------*/

function focusFirst(candidates: HTMLElement[], { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}

function getTabbableEdges(container: HTMLElement) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last] as const;
}

function getTabbableCandidates(container: HTMLElement) {
  const nodes: HTMLElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: any) => {
      const isHiddenInput = node.tagName === 'INPUT' && node.type === 'hidden';
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
  return nodes;
}

function findVisible(elements: HTMLElement[], container: HTMLElement) {
  for (const element of elements) {
    if (!isHidden(element, { upTo: container })) return element;
  }
}

function isHidden(node: HTMLElement, { upTo }: { upTo?: HTMLElement }) {
  if (getComputedStyle(node).visibility === 'hidden') return true;
  while (node) {
    if (upTo !== undefined && node === upTo) return false;
    if (getComputedStyle(node).display === 'none') return true;
    node = node.parentElement as HTMLElement;
  }
  return false;
}

function isSelectableInput(element: any): element is FocusableTarget & { select: () => void } {
  return element instanceof HTMLInputElement && 'select' in element;
}

function focus(element?: FocusableTarget | null, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = document.activeElement;
    element.focus({ preventScroll: true });
    if (element !== previouslyFocusedElement && isSelectableInput(element) && select) element.select();
  }
}

type FocusScopeAPI = { paused: boolean; pause(): void; resume(): void };
const focusScopesStack = createFocusScopesStack();

function createFocusScopesStack() {
  let stack: FocusScopeAPI[] = [];
  return {
    add(focusScope: FocusScopeAPI) {
      const activeFocusScope = stack[0];
      if (focusScope !== activeFocusScope) activeFocusScope?.pause();
      stack = stack.filter((s) => s !== focusScope);
      stack.unshift(focusScope);
    },
    remove(focusScope: FocusScopeAPI) {
      stack = stack.filter((s) => s !== focusScope);
      stack[0]?.resume();
    },
  };
}

function removeLinks(items: HTMLElement[]) {
  return items.filter((item) => item.tagName !== 'A');
}

export { FocusScope };
export type { FocusScopeProps };
