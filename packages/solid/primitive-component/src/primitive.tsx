import { type JSX, splitProps } from "solid-js";
import { Slot } from "@radix-solid-js/slot";

/* -------------------------------------------------------------------------------------------------
 * Primitive
 *
 * Renders HTML elements with `asChild` support.
 * Uses explicit JSX for each element type instead of Dynamic to ensure proper
 * SSR hydration. Dynamic uses getNextElement() without a template function,
 * which causes hydration failures when any mismatch occurs.
 * -----------------------------------------------------------------------------------------------*/

const NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul",
] as const;

type NodeType = (typeof NODES)[number];

/**
 * Props for a Primitive component. Extends the native element props with `asChild`.
 * We use Omit to remove the native `ref` to avoid intersection type conflicts,
 * then re-add it as a simple callback ref.
 */
type PrimitiveProps<E extends NodeType = "div"> = Omit<
  JSX.IntrinsicElements[E],
  "ref"
> & {
  asChild?: boolean;
  ref?: (el: HTMLElement) => void;
};

type Primitives = {
  [E in NodeType]: (props: PrimitiveProps<E>) => JSX.Element;
};

/**
 * Helper to split out `asChild` prop and handle the Slot case.
 * Returns the remaining props if not asChild, or null if asChild was handled.
 */
function handleAsChild(props: any): JSX.Element | null {
  if (props.asChild) {
    const [, rest] = splitProps(props, ["asChild"]);
    return <Slot {...rest} />;
  }
  return null;
}

/**
 * The Primitive component renders HTML elements with `asChild` support.
 * Each element type uses explicit JSX to ensure SolidJS generates proper
 * template functions for SSR hydration compatibility.
 *
 * @example
 * ```tsx
 * <Primitive.button onClick={handler}>Click me</Primitive.button>
 *
 * // With asChild:
 * <Primitive.button asChild onClick={handler}>
 *   <a href="/link">Click me</a>
 * </Primitive.button>
 * ```
 */
const Primitive: Primitives = {
  a: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <a {...(rest as any)} />;
  },
  button: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <button {...(rest as any)} />;
  },
  div: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <div {...(rest as any)} />;
  },
  form: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <form {...(rest as any)} />;
  },
  h2: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <h2 {...(rest as any)} />;
  },
  h3: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <h3 {...(rest as any)} />;
  },
  img: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <img {...(rest as any)} />;
  },
  input: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <input {...(rest as any)} />;
  },
  label: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <label {...(rest as any)} />;
  },
  li: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <li {...(rest as any)} />;
  },
  nav: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <nav {...(rest as any)} />;
  },
  ol: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <ol {...(rest as any)} />;
  },
  p: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <p {...(rest as any)} />;
  },
  select: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <select {...(rest as any)} />;
  },
  span: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <span {...(rest as any)} />;
  },
  svg: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <svg {...(rest as any)} />;
  },
  ul: (props) => {
    const slotResult = handleAsChild(props);
    if (slotResult) return slotResult;
    const [, rest] = splitProps(props, ["asChild"]);
    return <ul {...(rest as any)} />;
  },
};

/* -------------------------------------------------------------------------------------------------
 * Utils
 * -----------------------------------------------------------------------------------------------*/

/**
 * Dispatches a custom event, flushing synchronously.
 * In SolidJS, we don't need ReactDOM.flushSync since Solid's reactivity
 * is synchronous by default. We simply dispatch the event.
 */
function dispatchDiscreteCustomEvent<E extends CustomEvent>(
  target: E["target"],
  event: E
) {
  if (target) target.dispatchEvent(event);
}

/* -----------------------------------------------------------------------------------------------*/

export { Primitive, dispatchDiscreteCustomEvent };
export type { PrimitiveProps };
