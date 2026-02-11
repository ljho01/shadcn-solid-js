import { type JSX, children as resolveChildren, splitProps } from "solid-js";
import { isServer } from "solid-js/web";

/* -------------------------------------------------------------------------------------------------
 * Slot
 * -----------------------------------------------------------------------------------------------*/

interface SlotProps extends JSX.HTMLAttributes<HTMLElement> {
  ref?: (el: HTMLElement) => void;
  children?: JSX.Element;
}

/**
 * Slot renders its child element directly, merging the Slot's props into the child's props.
 * This enables the "asChild" pattern from Radix UI in SolidJS.
 *
 * In SolidJS, we can't use React.cloneElement. Instead, we resolve children and
 * render them via Dynamic, or we accept a render function.
 *
 * @example
 * ```tsx
 * // Usage with asChild:
 * const Button = (props) => {
 *   const Comp = props.asChild ? Slot : 'button';
 *   return <Comp {...rest}>{props.children}</Comp>;
 * };
 *
 * <Button asChild>
 *   <a href="/link">Click me</a>
 * </Button>
 * ```
 */
function Slot(props: SlotProps) {
  // IMPORTANT: Use the same code path for both SSR and client.
  // The isServer early-return was previously causing hydration key mismatches
  // because the server produced a different component tree structure
  // (direct return) vs the client (resolveChildren + IIFE wrapper).
  const resolved = resolveChildren(() => props.children);

  return (() => {
    const child = resolved();

    // On the server or when child is not a DOM element, return as-is.
    // Props merging via DOM manipulation only works client-side.
    if (
      isServer ||
      !(typeof HTMLElement !== "undefined" && child instanceof HTMLElement)
    ) {
      return child;
    }

    // Client-side: merge our props onto the child DOM element
    const [local, rest] = splitProps(props, ["children", "ref"]);

    // Apply slot props to the child element
    for (const [key, value] of Object.entries(rest)) {
      // Skip undefined and null values — don't set meaningless attributes
      if (value === undefined || value === null) continue;

      if (key.startsWith("on") && typeof value === "function") {
        // Determine if this is a capture-phase handler (e.g., onFocusCapture → focus, capture: true)
        let eventName: string;
        let useCapture = false;
        const rawName = key.slice(2); // Remove 'on' prefix
        if (rawName.endsWith("Capture")) {
          eventName = rawName.slice(0, -7).toLowerCase(); // Remove 'Capture' suffix
          useCapture = true;
        } else {
          eventName = rawName.toLowerCase();
        }

        const propKey = key.toLowerCase();
        const existing = (child as any)[propKey];
        if (existing && !useCapture) {
          // Chain with existing handler (only for bubble phase)
          (child as any)[propKey] = (...args: any[]) => {
            (value as Function)(...args);
            existing(...args);
          };
        } else {
          child.addEventListener(eventName, value as EventListener, useCapture);
        }
      } else if (key === "class" || key === "className") {
        const existingClass = child.getAttribute("class") || "";
        child.setAttribute(
          "class",
          [existingClass, value].filter(Boolean).join(" ")
        );
      } else if (key === "style" && typeof value === "object") {
        Object.assign(child.style, value);
      } else if (key !== "ref") {
        // Handle boolean HTML attributes (disabled, hidden, readonly, required, etc.)
        // In HTML, the mere presence of these attributes means "true" regardless of value.
        // So disabled="false" still disables the element!
        if (value === false) {
          child.removeAttribute(key);
        } else if (value === true) {
          child.setAttribute(key, "");
        } else {
          child.setAttribute(key, String(value));
        }
      }
    }

    // Handle refs
    if (local.ref) {
      (local.ref as (el: HTMLElement) => void)(child);
    }

    return child;
  })();
}

/* -------------------------------------------------------------------------------------------------
 * Slottable
 * -----------------------------------------------------------------------------------------------*/

const SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");

interface SlottableProps {
  children: JSX.Element;
}

interface SlottableComponent {
  (props: SlottableProps): JSX.Element;
  __radixId: symbol;
}

const Slottable: SlottableComponent = ((props: SlottableProps) => {
  return props.children;
}) as SlottableComponent;

Slottable.__radixId = SLOTTABLE_IDENTIFIER;

/* -------------------------------------------------------------------------------------------------
 * mergeSlotProps - internal utility for merging slot + child props
 * -----------------------------------------------------------------------------------------------*/

type AnyProps = Record<string, any>;

function mergeSlotProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const overrideProps = { ...childProps };

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "class" || propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(" ");
    }
  }

  return { ...slotProps, ...overrideProps };
}

export { Slot, Slottable, mergeSlotProps };
export type { SlotProps };
