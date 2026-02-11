import {
  type JSX,
  createSignal,
  createEffect,
  createContext,
  useContext,
  onMount,
  onCleanup,
  splitProps,
} from 'solid-js';
import { isServer } from 'solid-js/web';
import { clamp } from '@radix-solid-js/number';

/* -------------------------------------------------------------------------------------------------
 * Input validation
 * -----------------------------------------------------------------------------------------------*/

type InputValidationType = 'alpha' | 'numeric' | 'alphanumeric' | 'none';

const INPUT_VALIDATION_MAP = {
  numeric: { regexp: /[^\d]/g, pattern: '\\d{1}', inputMode: 'numeric' as const },
  alpha: { regexp: /[^a-zA-Z]/g, pattern: '[a-zA-Z]{1}', inputMode: 'text' as const },
  alphanumeric: { regexp: /[^a-zA-Z0-9]/g, pattern: '[a-zA-Z0-9]{1}', inputMode: 'text' as const },
  none: null,
};

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface OTPContextValue {
  value: () => string[];
  disabled: () => boolean;
  readOnly: () => boolean;
  autoComplete: () => string;
  placeholder: () => string | undefined;
  type: () => 'text' | 'password';
  validationType: () => InputValidationType;
  sanitizeValue: () => ((v: string) => string) | undefined;
  registerInput: (el: HTMLInputElement) => void;
  unregisterInput: (el: HTMLInputElement) => void;
  getInputs: () => HTMLInputElement[];
  dispatch: (action: UpdateAction) => void;
  attemptSubmit: () => void;
  setHiddenInputRef: (el: HTMLInputElement) => void;
}

type UpdateAction =
  | { type: 'SET_CHAR'; char: string; index: number }
  | { type: 'CLEAR_CHAR'; index: number; reason: 'Backspace' | 'Delete' | 'Cut' }
  | { type: 'CLEAR' }
  | { type: 'PASTE'; value: string };

const OTPContext = createContext<OTPContextValue>();

function useOTP(name: string) {
  const ctx = useContext(OTPContext);
  if (!ctx) throw new Error(`\`${name}\` must be used within \`OneTimePasswordField\``);
  return ctx;
}

/* -------------------------------------------------------------------------------------------------
 * OneTimePasswordField (Root)
 * -----------------------------------------------------------------------------------------------*/

interface OneTimePasswordFieldProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: JSX.Element;
  autoComplete?: 'off' | 'one-time-code';
  autoFocus?: boolean;
  autoSubmit?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  orientation?: 'horizontal' | 'vertical';
  validationType?: InputValidationType;
  sanitizeValue?: (value: string) => string;
  placeholder?: string;
  type?: 'text' | 'password';
  name?: string;
  form?: string;
  dir?: 'ltr' | 'rtl';
  ref?: (el: HTMLDivElement) => void;
}

function OneTimePasswordField(inProps: OneTimePasswordFieldProps) {
  const [local, rest] = splitProps(inProps, [
    'children',
    'autoComplete',
    'autoFocus',
    'autoSubmit',
    'defaultValue',
    'value',
    'onValueChange',
    'disabled',
    'readOnly',
    'orientation',
    'validationType',
    'sanitizeValue',
    'placeholder',
    'type',
    'name',
    'form',
    'dir',
    'ref',
  ]);

  // State: use controlled or uncontrolled pattern
  const isControlled = () => local.value !== undefined;

  const [internalValue, setInternalValue] = createSignal(local.defaultValue ?? '');

  const currentValue = () => isControlled() ? (local.value ?? '') : internalValue();

  const setValue = (newVal: string) => {
    if (!isControlled()) {
      setInternalValue(newVal);
    }
    local.onValueChange?.(newVal);
  };

  // Sync controlled value to internal when it changes
  createEffect(() => {
    if (isControlled() && local.value !== undefined) {
      setInternalValue(local.value);
    }
  });

  const valueArray = () => currentValue().split('');

  // Input registry
  const inputSet = new Set<HTMLInputElement>();
  const registerInput = (el: HTMLInputElement) => inputSet.add(el);
  const unregisterInput = (el: HTMLInputElement) => inputSet.delete(el);

  const getInputs = (): HTMLInputElement[] => {
    const arr = Array.from(inputSet);
    if (arr.length <= 1) return arr;
    arr.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    return arr;
  };

  // Hidden input ref
  let hiddenInputRef: HTMLInputElement | undefined;
  const setHiddenInputRef = (el: HTMLInputElement) => { hiddenInputRef = el; };

  // Sanitize
  const sanitize = (input: string): string => {
    const stripped = input.replace(/\s/g, '');
    const vType = local.validationType ?? 'numeric';
    if (vType === 'none') {
      return local.sanitizeValue ? local.sanitizeValue(stripped) : stripped;
    }
    const config = INPUT_VALIDATION_MAP[vType];
    return config ? stripped.replace(config.regexp, '') : stripped;
  };

  // Focus helper
  const focusInputAt = (idx: number) => {
    const inputs = getInputs();
    const el = inputs[idx];
    if (!el) return;
    if (el.ownerDocument.activeElement === el) {
      requestAnimationFrame(() => el.select?.());
    } else {
      el.focus();
    }
  };

  // Submit
  const attemptSubmit = () => {
    if (!local.autoSubmit) return;
    const inputs = getInputs();
    const val = valueArray();
    if (val.length >= inputs.length && val.every((c) => c !== '')) {
      const formEl = hiddenInputRef?.form
        ?? (local.form ? document.getElementById(local.form) : null);
      if (formEl && formEl.tagName === 'FORM') {
        const f = formEl as HTMLFormElement;
        typeof f.requestSubmit === 'function' ? f.requestSubmit() : f.submit();
      }
    }
  };

  // Dispatch
  const dispatch = (action: UpdateAction) => {
    const inputs = getInputs();
    const cur = valueArray();

    switch (action.type) {
      case 'SET_CHAR': {
        const newVal = [...cur];
        while (newVal.length <= action.index) newVal.push('');
        newVal[action.index] = action.char;
        setValue(newVal.join(''));
        const next = action.index + 1;
        if (next < inputs.length) {
          focusInputAt(next);
        } else {
          attemptSubmit();
        }
        break;
      }
      case 'CLEAR_CHAR': {
        const newVal = [...cur];
        if (action.index < newVal.length) newVal[action.index] = '';
        setValue(newVal.join('').replace(/\s+$/, ''));
        if (action.reason === 'Backspace' && action.index > 0) {
          focusInputAt(action.index - 1);
        }
        break;
      }
      case 'CLEAR': {
        setValue('');
        focusInputAt(0);
        break;
      }
      case 'PASTE': {
        const sanitized = sanitize(action.value);
        if (!sanitized) return;
        const chars = sanitized.split('').slice(0, inputs.length);
        while (chars.length < inputs.length) chars.push('');
        setValue(chars.join('').replace(/\s+$/, ''));
        const focusIdx = Math.min(sanitized.length, inputs.length - 1);
        focusInputAt(focusIdx);
        if (sanitized.length >= inputs.length) attemptSubmit();
        break;
      }
    }
  };

  // Paste handler on root
  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();
    dispatch({ type: 'PASTE', value: event.clipboardData?.getData('Text') ?? '' });
  };

  // Auto focus
  onMount(() => {
    if (local.autoFocus) {
      requestAnimationFrame(() => focusInputAt(0));
    }
  });

  // Form reset
  createEffect(() => {
    if (isServer) return;
    if (!hiddenInputRef?.form) return;
    const form = hiddenInputRef.form;
    const onReset = () => dispatch({ type: 'CLEAR' });
    form.addEventListener('reset', onReset);
    onCleanup(() => form.removeEventListener('reset', onReset));
  });

  const contextValue: OTPContextValue = {
    value: valueArray,
    disabled: () => local.disabled ?? false,
    readOnly: () => local.readOnly ?? false,
    autoComplete: () => local.autoComplete ?? 'one-time-code',
    placeholder: () => local.placeholder,
    type: () => local.type ?? 'text',
    validationType: () => local.validationType ?? 'numeric',
    sanitizeValue: () => local.sanitizeValue,
    registerInput,
    unregisterInput,
    getInputs,
    dispatch,
    attemptSubmit,
    setHiddenInputRef,
  };

  return (
    <OTPContext.Provider value={contextValue}>
      <div
        role="group"
        dir={local.dir}
        data-orientation={local.orientation ?? 'horizontal'}
        data-disabled={local.disabled ? '' : undefined}
        {...rest}
        ref={local.ref}
        onPaste={handlePaste}
      >
        {local.children}
      </div>
    </OTPContext.Provider>
  );
}

OneTimePasswordField.displayName = 'OneTimePasswordField';

/* -------------------------------------------------------------------------------------------------
 * OneTimePasswordFieldInput
 * -----------------------------------------------------------------------------------------------*/

interface OneTimePasswordFieldInputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  ref?: (el: HTMLInputElement) => void;
}

function OneTimePasswordFieldInput(inProps: OneTimePasswordFieldInputProps) {
  const [local, rest] = splitProps(inProps, ['ref']);
  const ctx = useOTP('OneTimePasswordFieldInput');

  let inputRef!: HTMLInputElement;

  // Register
  onMount(() => { if (inputRef) ctx.registerInput(inputRef); });
  onCleanup(() => { if (inputRef) ctx.unregisterInput(inputRef); });

  // Index
  const getIndex = (): number => {
    if (!inputRef) return -1;
    return ctx.getInputs().indexOf(inputRef);
  };

  // Signal for the rendered index (set after mount for aria-label)
  const [renderedIndex, setRenderedIndex] = createSignal(-1);
  onMount(() => { queueMicrotask(() => setRenderedIndex(getIndex())); });

  // Current char value
  const charValue = () => {
    const idx = getIndex();
    return idx >= 0 ? (ctx.value()[idx] ?? '') : '';
  };

  // Is focusable?
  const isFocusable = () => {
    const idx = getIndex();
    if (idx < 0) return true;
    const totalLen = ctx.value().join('').length;
    const inputs = ctx.getInputs();
    const lastSelectable = clamp(totalLen, [0, inputs.length - 1]);
    return idx <= lastSelectable;
  };

  // Validation config
  const valConfig = () => {
    const vt = ctx.validationType();
    return vt === 'none' ? null : INPUT_VALIDATION_MAP[vt];
  };

  // ── KeyDown ──
  const handleKeyDown = (event: KeyboardEvent) => {
    const idx = getIndex();
    if (idx < 0) return;

    if (event.key === 'Backspace') {
      event.preventDefault();
      const ch = ctx.value()[idx] ?? '';
      if (ch !== '') {
        ctx.dispatch({ type: 'CLEAR_CHAR', index: idx, reason: 'Backspace' });
      } else if (idx > 0) {
        ctx.dispatch({ type: 'CLEAR_CHAR', index: idx - 1, reason: 'Backspace' });
      }
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      if ((ctx.value()[idx] ?? '') !== '') {
        ctx.dispatch({ type: 'CLEAR_CHAR', index: idx, reason: 'Delete' });
      }
      return;
    }

    if (event.key === 'Enter') {
      ctx.attemptSubmit();
      return;
    }

    // Arrow key navigation
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (idx > 0) {
        const inputs = ctx.getInputs();
        inputs[idx - 1]?.focus();
      }
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const inputs = ctx.getInputs();
      if (idx < inputs.length - 1) {
        inputs[idx + 1]?.focus();
      }
      return;
    }

    // Printable character
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      const vt = ctx.validationType();
      const sanitized = sanitizeChar(event.key, vt, ctx.sanitizeValue());
      if (sanitized) {
        ctx.dispatch({ type: 'SET_CHAR', char: sanitized, index: idx });
      }
    }
  };

  // Input (for password managers that fill multiple chars)
  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.value.length > 1) {
      event.preventDefault();
      ctx.dispatch({ type: 'PASTE', value: target.value });
    }
  };

  // Focus → select content
  const handleFocus = () => {
    requestAnimationFrame(() => inputRef?.select?.());
  };

  // Pointer down → redirect to last selectable slot
  const handlePointerDown = (event: PointerEvent) => {
    const idx = getIndex();
    const inputs = ctx.getInputs();
    const totalLen = ctx.value().join('').length;
    const lastSelectable = clamp(totalLen, [0, inputs.length - 1]);
    if (idx !== lastSelectable) {
      event.preventDefault();
      inputs[lastSelectable]?.focus();
    }
  };

  // Cut
  const handleCut = (event: ClipboardEvent) => {
    const idx = getIndex();
    if (idx < 0) return;
    const ch = ctx.value()[idx] ?? '';
    if (ch) {
      event.clipboardData?.setData('text/plain', ch);
      event.preventDefault();
      ctx.dispatch({ type: 'CLEAR_CHAR', index: idx, reason: 'Cut' });
    }
  };

  return (
    <input
      ref={(el) => {
        inputRef = el;
        if (typeof local.ref === 'function') local.ref(el);
      }}
      aria-label={`Character ${renderedIndex() + 1}`}
      data-radix-otp-input=""
      data-radix-index={renderedIndex()}
      data-1p-ignore=""
      data-lpignore="true"
      data-protonpass-ignore="true"
      data-bwignore=""
      autocomplete={ctx.autoComplete()}
      inputmode={valConfig()?.inputMode ?? 'text'}
      pattern={valConfig()?.pattern}
      maxlength={1}
      disabled={ctx.disabled()}
      readonly={ctx.readOnly()}
      placeholder={charValue() ? undefined : ctx.placeholder()}
      type={ctx.type()}
      {...rest}
      value={charValue()}
      tabIndex={isFocusable() ? 0 : -1}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      onFocus={handleFocus}
      onPointerDown={handlePointerDown}
      onCut={handleCut}
    />
  );
}

OneTimePasswordFieldInput.displayName = 'OneTimePasswordFieldInput';

/* -------------------------------------------------------------------------------------------------
 * OneTimePasswordFieldHiddenInput
 * -----------------------------------------------------------------------------------------------*/

interface OneTimePasswordFieldHiddenInputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  ref?: (el: HTMLInputElement) => void;
}

function OneTimePasswordFieldHiddenInput(inProps: OneTimePasswordFieldHiddenInputProps) {
  const [local, rest] = splitProps(inProps, ['ref']);
  const ctx = useOTP('OneTimePasswordFieldHiddenInput');

  return (
    <input
      ref={(el) => {
        ctx.setHiddenInputRef(el);
        if (typeof local.ref === 'function') local.ref(el);
      }}
      value={ctx.value().join('').trim()}
      autocomplete="off"
      autocapitalize="off"
      spellcheck={false}
      {...rest}
      type="hidden"
      readonly
    />
  );
}

OneTimePasswordFieldHiddenInput.displayName = 'OneTimePasswordFieldHiddenInput';

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -----------------------------------------------------------------------------------------------*/

function sanitizeChar(
  char: string,
  validationType: InputValidationType,
  sanitizeValue?: (v: string) => string,
): string {
  if (validationType === 'none') return sanitizeValue ? sanitizeValue(char) : char;
  const config = INPUT_VALIDATION_MAP[validationType];
  return config ? char.replace(config.regexp, '') : char;
}

/* -------------------------------------------------------------------------------------------------
 * Scope stub (for API compatibility with radix-ui meta package)
 * -----------------------------------------------------------------------------------------------*/

function createOneTimePasswordFieldScope() {
  return function useScope(_scope: any) { return {}; };
}
createOneTimePasswordFieldScope.scopeName = 'OneTimePasswordField';

/* -------------------------------------------------------------------------------------------------
 * Aliases & Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = OneTimePasswordField;
const Input = OneTimePasswordFieldInput;
const HiddenInput = OneTimePasswordFieldHiddenInput;

export {
  createOneTimePasswordFieldScope,
  OneTimePasswordField,
  OneTimePasswordFieldInput,
  OneTimePasswordFieldHiddenInput,
  Root,
  Input,
  HiddenInput,
};

export type {
  OneTimePasswordFieldProps,
  OneTimePasswordFieldInputProps,
  OneTimePasswordFieldHiddenInputProps,
  InputValidationType,
};
