/**
 * A ref in SolidJS is either a callback function or undefined.
 * Unlike React, there are no RefObject(s) in Solid.
 */
export type Ref<T> = ((el: T) => void) | undefined;

/**
 * Utility to compose multiple refs together.
 * In SolidJS, refs are simple callback functions, making this much simpler than React.
 *
 * @example
 * ```tsx
 * function MyComponent(props: { ref?: Ref<HTMLDivElement> }) {
 *   let internalRef!: HTMLDivElement;
 *   return <div ref={mergeRefs(props.ref, (el) => (internalRef = el))} />;
 * }
 * ```
 */
export function mergeRefs<T>(...refs: Ref<T>[]): (el: T) => void {
  return (el: T) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(el);
      }
    }
  };
}
