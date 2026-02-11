import {
  type JSX,
  type Accessor,
  createSignal,
  createEffect,
  onCleanup,
  splitProps,
  batch,
} from 'solid-js';
import { composeEventHandlers } from '@radix-solid/primitive';
import { mergeRefs } from '@radix-solid/compose-refs';
import { createContextScope } from '@radix-solid/context';
import { createId } from '@radix-solid/id';
import { createControllableSignal } from '@radix-solid/use-controllable-state';
import { Primitive, type PrimitiveProps } from '@radix-solid/primitive-component';

import type { Scope } from '@radix-solid/context';

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleField
 * -----------------------------------------------------------------------------------------------*/

const PASSWORD_TOGGLE_FIELD_NAME = 'PasswordToggleField';

type ScopedProps<P> = P & { __scopePasswordToggleField?: Scope };

type InternalFocusState = {
  clickTriggered: boolean;
  selectionStart: number | null;
  selectionEnd: number | null;
};

const INITIAL_FOCUS_STATE: InternalFocusState = {
  clickTriggered: false,
  selectionStart: null,
  selectionEnd: null,
};

interface PasswordToggleFieldContextValue {
  inputId: Accessor<string>;
  inputRef: Accessor<HTMLInputElement | null>;
  setInputRef: (el: HTMLInputElement | null) => void;
  visible: Accessor<boolean>;
  setVisible: (value: boolean | ((prev: boolean) => boolean)) => void;
  syncInputId: (providedId: string | number | undefined) => void;
  focusState: InternalFocusState;
}

const [createPasswordToggleFieldContext, createPasswordToggleFieldScope] =
  createContextScope(PASSWORD_TOGGLE_FIELD_NAME);

const [PasswordToggleFieldProvider, usePasswordToggleFieldContext] =
  createPasswordToggleFieldContext<PasswordToggleFieldContextValue>(PASSWORD_TOGGLE_FIELD_NAME);

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleField (Root)
 * -----------------------------------------------------------------------------------------------*/

interface PasswordToggleFieldProps {
  id?: string;
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  children?: JSX.Element;
  __scopePasswordToggleField?: Scope;
}

function PasswordToggleField(props: PasswordToggleFieldProps) {
  const [local] = splitProps(props, [
    '__scopePasswordToggleField',
    'id',
    'visible',
    'defaultVisible',
    'onVisibilityChange',
    'children',
  ]);

  const baseId = createId(local.id);
  const defaultInputId = `${baseId}-input`;
  const [inputIdState, setInputIdState] = createSignal<string | null>(defaultInputId);
  const inputId = () => inputIdState() ?? defaultInputId;

  const syncInputId = (providedId: string | number | undefined) => {
    setInputIdState(providedId != null ? String(providedId) : null);
  };

  const [visible, setVisible] = createControllableSignal<boolean>({
    prop: () => local.visible,
    defaultProp: local.defaultVisible ?? false,
    onChange: local.onVisibilityChange,
    caller: PASSWORD_TOGGLE_FIELD_NAME,
  });

  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null);
  const focusState: InternalFocusState = { ...INITIAL_FOCUS_STATE };

  return (
    <PasswordToggleFieldProvider
      scope={local.__scopePasswordToggleField}
      inputId={inputId}
      inputRef={inputRef}
      setInputRef={setInputRef}
      visible={visible as Accessor<boolean>}
      setVisible={setVisible}
      syncInputId={syncInputId}
      focusState={focusState}
    >
      {local.children}
    </PasswordToggleFieldProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleFieldInput
 * -----------------------------------------------------------------------------------------------*/

const PASSWORD_TOGGLE_FIELD_INPUT_NAME = PASSWORD_TOGGLE_FIELD_NAME + 'Input';

interface PasswordToggleFieldInputOwnProps {
  autocomplete?: 'current-password' | 'new-password';
}

interface PasswordToggleFieldInputProps
  extends PasswordToggleFieldInputOwnProps,
    Omit<PrimitiveProps<'input'>, keyof PasswordToggleFieldInputOwnProps | 'type'> {
  __scopePasswordToggleField?: Scope;
}

function PasswordToggleFieldInput(props: PasswordToggleFieldInputProps) {
  const [local, rest] = splitProps(props, [
    '__scopePasswordToggleField',
    'autocomplete',
    'autoCapitalize',
    'spellcheck',
    'id',
    'ref',
    'onBlur',
  ]);

  const context = usePasswordToggleFieldContext(
    PASSWORD_TOGGLE_FIELD_INPUT_NAME,
    local.__scopePasswordToggleField,
  );

  // Sync provided id to context
  createEffect(() => {
    context.syncInputId(local.id);
  });

  // Reset visibility on form reset/submit
  createEffect(() => {
    const inputElement = context.inputRef();
    const form = inputElement?.form;
    if (!form) return;

    const controller = new AbortController();

    form.addEventListener(
      'reset',
      (event) => {
        if (!event.defaultPrevented) {
          context.setVisible(false);
        }
      },
      { signal: controller.signal },
    );

    form.addEventListener(
      'submit',
      () => {
        // Always reset the visibility on submit regardless of whether the
        // default action is prevented
        context.setVisible(false);
      },
      { signal: controller.signal },
    );

    onCleanup(() => {
      controller.abort();
    });
  });

  return (
    <Primitive.input
      {...rest}
      id={local.id ?? context.inputId()}
      autoCapitalize={local.autoCapitalize ?? 'off'}
      autocomplete={local.autocomplete ?? 'current-password'}
      ref={mergeRefs(local.ref, (el: any) => context.setInputRef(el as HTMLInputElement))}
      spellcheck={local.spellcheck ?? false}
      type={context.visible() ? 'text' : 'password'}
      data-state={getVisibilityState(context.visible())}
      onBlur={composeEventHandlers(
        local.onBlur as JSX.EventHandler<HTMLInputElement, FocusEvent>,
        (event) => {
          const { selectionStart, selectionEnd } = event.currentTarget;
          context.focusState.selectionStart = selectionStart;
          context.focusState.selectionEnd = selectionEnd;
        },
      )}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleFieldToggle
 * -----------------------------------------------------------------------------------------------*/

const PASSWORD_TOGGLE_FIELD_TOGGLE_NAME = PASSWORD_TOGGLE_FIELD_NAME + 'Toggle';

interface PasswordToggleFieldToggleProps extends Omit<PrimitiveProps<'button'>, 'type'> {
  __scopePasswordToggleField?: Scope;
}

function PasswordToggleFieldToggle(props: PasswordToggleFieldToggleProps) {
  const [local, rest] = splitProps(props, [
    '__scopePasswordToggleField',
    'onClick',
    'onPointerDown',
    'onPointerCancel',
    'onPointerUp',
    'children',
    'aria-label',
    'aria-controls',
    'aria-hidden',
    'tabIndex',
    'ref',
  ]);

  const context = usePasswordToggleFieldContext(
    PASSWORD_TOGGLE_FIELD_TOGGLE_NAME,
    local.__scopePasswordToggleField,
  );

  let elementRef: HTMLButtonElement | undefined;

  // Auto-generate aria-label if no text content and no explicit aria-label
  const [internalAriaLabel, setInternalAriaLabel] = createSignal<string | undefined>(undefined);

  createEffect(() => {
    const element = elementRef;
    const ariaLabelProp = local['aria-label'];
    if (!element || ariaLabelProp) {
      setInternalAriaLabel(undefined);
      return;
    }

    const DEFAULT_ARIA_LABEL = context.visible() ? 'Hide password' : 'Show password';

    function checkForInnerTextLabel(textContent: string | undefined | null) {
      const text = textContent ? textContent : undefined;
      setInternalAriaLabel(text ? undefined : DEFAULT_ARIA_LABEL);
    }

    checkForInnerTextLabel(element.textContent);

    const observer = new MutationObserver((entries) => {
      let textContent: string | undefined;
      for (const entry of entries) {
        if (entry.type === 'characterData') {
          if (element.textContent) {
            textContent = element.textContent;
          }
        }
      }
      checkForInnerTextLabel(textContent);
    });
    observer.observe(element, { characterData: true, subtree: true });

    onCleanup(() => {
      observer.disconnect();
    });
  });

  const ariaLabel = () => local['aria-label'] || internalAriaLabel();

  // Reset clickTriggered on global pointerup
  createEffect(() => {
    const ownerWindow = elementRef?.ownerDocument?.defaultView || window;

    let idleCleanup = () => {};
    const reset = () => {
      context.focusState.clickTriggered = false;
    };
    const handlePointerUp = () => {
      idleCleanup = requestIdleCallbackCompat(ownerWindow, reset);
    };

    ownerWindow.addEventListener('pointerup', handlePointerUp);

    onCleanup(() => {
      idleCleanup();
      ownerWindow.removeEventListener('pointerup', handlePointerUp);
    });
  });

  return (
    <Primitive.button
      aria-controls={local['aria-controls'] ?? context.inputId()}
      aria-label={ariaLabel()}
      data-state={getVisibilityState(context.visible())}
      {...rest}
      ref={mergeRefs(local.ref, (el: any) => {
        elementRef = el as HTMLButtonElement;
      })}
      onPointerDown={composeEventHandlers(
        local.onPointerDown as JSX.EventHandler<HTMLButtonElement, PointerEvent>,
        () => {
          context.focusState.clickTriggered = true;
        },
      )}
      on:pointercancel={(event: PointerEvent) => {
        const handler = local.onPointerCancel;
        if (typeof handler === 'function') {
          (handler as any)(event);
        }
        // Always reset focus state on cancellation
        Object.assign(context.focusState, INITIAL_FOCUS_STATE);
      }}
      on:click={(event: MouseEvent) => {
        const handler = local.onClick;
        if (typeof handler === 'function') {
          (handler as any)(event);
        }
        if (event.defaultPrevented) {
          Object.assign(context.focusState, INITIAL_FOCUS_STATE);
          return;
        }

        // Toggle visibility synchronously
        batch(() => {
          context.setVisible((prev) => !prev);
        });

        if (context.focusState.clickTriggered) {
          const input = context.inputRef();
          if (input) {
            const { selectionStart, selectionEnd } = context.focusState;
            input.focus();
            if (selectionStart !== null || selectionEnd !== null) {
              // Wait a tick so that focus has settled, then restore selection position
              requestAnimationFrame(() => {
                if (input.ownerDocument.activeElement === input) {
                  input.selectionStart = selectionStart;
                  input.selectionEnd = selectionEnd;
                }
              });
            }
          }
        }
        Object.assign(context.focusState, INITIAL_FOCUS_STATE);
      }}
      on:pointerup={(event: PointerEvent) => {
        const handler = local.onPointerUp;
        if (typeof handler === 'function') {
          (handler as any)(event);
        }
        // If click handler hasn't been called at this point, it may have been
        // intercepted, in which case we still want to reset our internal state
        setTimeout(() => {
          Object.assign(context.focusState, INITIAL_FOCUS_STATE);
        }, 50);
      }}
      type="button"
    >
      {local.children}
    </Primitive.button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleFieldSlot
 * -----------------------------------------------------------------------------------------------*/

const PASSWORD_TOGGLE_FIELD_SLOT_NAME = PASSWORD_TOGGLE_FIELD_NAME + 'Slot';

interface PasswordToggleFieldSlotDeclarativeProps {
  visible: JSX.Element;
  hidden: JSX.Element;
  __scopePasswordToggleField?: Scope;
}

interface PasswordToggleFieldSlotRenderProps {
  render: (args: { visible: boolean }) => JSX.Element;
  __scopePasswordToggleField?: Scope;
}

type PasswordToggleFieldSlotProps =
  | PasswordToggleFieldSlotDeclarativeProps
  | PasswordToggleFieldSlotRenderProps;

function PasswordToggleFieldSlot(props: PasswordToggleFieldSlotProps) {
  const [local, rest] = splitProps(props as ScopedProps<PasswordToggleFieldSlotProps>, [
    '__scopePasswordToggleField',
  ]);

  const context = usePasswordToggleFieldContext(
    PASSWORD_TOGGLE_FIELD_SLOT_NAME,
    local.__scopePasswordToggleField,
  );

  if ('render' in rest) {
    return <>{(rest as PasswordToggleFieldSlotRenderProps).render({ visible: context.visible() })}</>;
  }

  const declarativeProps = rest as PasswordToggleFieldSlotDeclarativeProps;
  return <>{context.visible() ? declarativeProps.visible : declarativeProps.hidden}</>;
}

/* -------------------------------------------------------------------------------------------------
 * PasswordToggleFieldIcon
 * -----------------------------------------------------------------------------------------------*/

const PASSWORD_TOGGLE_FIELD_ICON_NAME = PASSWORD_TOGGLE_FIELD_NAME + 'Icon';

interface PasswordToggleFieldIconProps extends Omit<PrimitiveProps<'svg'>, 'children'> {
  visible: JSX.Element;
  hidden: JSX.Element;
  __scopePasswordToggleField?: Scope;
}

function PasswordToggleFieldIcon(props: PasswordToggleFieldIconProps) {
  const [local, rest] = splitProps(props, [
    '__scopePasswordToggleField',
    'visible',
    'hidden',
    'ref',
  ]);

  const context = usePasswordToggleFieldContext(
    PASSWORD_TOGGLE_FIELD_ICON_NAME,
    local.__scopePasswordToggleField,
  );

  return (
    <Primitive.svg
      {...rest}
      ref={local.ref}
      aria-hidden
      asChild
      data-state={getVisibilityState(context.visible())}
    >
      {context.visible() ? local.visible : local.hidden}
    </Primitive.svg>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Utils
 * -----------------------------------------------------------------------------------------------*/

function getVisibilityState(visible: boolean): 'visible' | 'hidden' {
  return visible ? 'visible' : 'hidden';
}

function requestIdleCallbackCompat(
  window: Window,
  callback: IdleRequestCallback,
  options?: IdleRequestOptions,
): () => void {
  if ((window as any).requestIdleCallback) {
    const id = window.requestIdleCallback(callback, options);
    return () => {
      window.cancelIdleCallback(id);
    };
  }
  const start = Date.now();
  const id = window.setTimeout(() => {
    const timeRemaining = () => Math.max(0, 50 - (Date.now() - start));
    callback({ didTimeout: false, timeRemaining });
  }, 1);
  return () => {
    window.clearTimeout(id);
  };
}

/* ---------------------------------------------------------------------------------------------- */

const Root = PasswordToggleField;
const Input = PasswordToggleFieldInput;
const Toggle = PasswordToggleFieldToggle;
const Slot = PasswordToggleFieldSlot;
const Icon = PasswordToggleFieldIcon;

export {
  createPasswordToggleFieldScope,
  //
  PasswordToggleField,
  PasswordToggleFieldInput,
  PasswordToggleFieldToggle,
  PasswordToggleFieldSlot,
  PasswordToggleFieldIcon,
  //
  Root,
  Input,
  Toggle,
  Slot,
  Icon,
};
export type {
  PasswordToggleFieldProps,
  PasswordToggleFieldInputProps,
  PasswordToggleFieldToggleProps,
  PasswordToggleFieldSlotProps,
  PasswordToggleFieldIconProps,
};
