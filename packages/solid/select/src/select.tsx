import {
  type JSX,
  type Accessor,
  createSignal,
  createEffect,
  createContext as solidCreateContext,
  useContext as solidUseContext,
  onMount,
  onCleanup,
  splitProps,
  Show,
} from 'solid-js';
import { Portal as SolidPortal } from 'solid-js/web';
import { composeEventHandlers } from '@radix-solid/primitive';
import { mergeRefs, type Ref } from '@radix-solid/compose-refs';
import { useDirection, type Direction } from '@radix-solid/direction';
import { createId } from '@radix-solid/id';
import {
  createPopperScope,
  Popper,
  PopperAnchor,
  PopperContent,
  PopperArrow,
} from '@radix-solid/popper';
import { createControllableSignal } from '@radix-solid/use-controllable-state';
import { VisuallyHidden } from '@radix-solid/visually-hidden';

/* -------------------------------------------------------------------------------------------------
 * Constants & Helpers
 * -----------------------------------------------------------------------------------------------*/

const SELECT_NAME = 'Select';
const TRIGGER_NAME = 'SelectTrigger';
const VALUE_NAME = 'SelectValue';
const ICON_NAME = 'SelectIcon';
const PORTAL_NAME = 'SelectPortal';
const CONTENT_NAME = 'SelectContent';
const VIEWPORT_NAME = 'SelectViewport';
const GROUP_NAME = 'SelectGroup';
const LABEL_NAME = 'SelectLabel';
const ITEM_NAME = 'SelectItem';
const ITEM_TEXT_NAME = 'SelectItemText';
const ITEM_INDICATOR_NAME = 'SelectItemIndicator';
const SCROLL_UP_BUTTON_NAME = 'SelectScrollUpButton';
const SCROLL_DOWN_BUTTON_NAME = 'SelectScrollDownButton';
const SEPARATOR_NAME = 'SelectSeparator';
const ARROW_NAME = 'SelectArrow';

function shouldShowPlaceholder(value?: string) {
  return value === undefined || value === '' || value === null;
}

function getOpenState(open: boolean) {
  return open ? 'open' : 'closed';
}

function getDataState(checked: boolean) {
  return checked ? 'checked' : 'unchecked';
}

/* -------------------------------------------------------------------------------------------------
 * Contexts — using direct SolidJS createContext with accessor functions
 * SolidJS needs accessor functions in context for reactivity to work properly.
 * -----------------------------------------------------------------------------------------------*/

type Scope = any;
type ScopedProps<P> = P & { __scopeSelect?: Scope };

const usePopperScope = createPopperScope();

/* --- Select Root Context --- */

interface SelectContextValue {
  triggerRef: Accessor<HTMLButtonElement | null>;
  onTriggerRefChange: (el: HTMLButtonElement | null) => void;
  valueNodeRef: Accessor<HTMLSpanElement | null>;
  onValueNodeRefChange: (el: HTMLSpanElement | null) => void;
  valueNodeHasChildren: Accessor<boolean>;
  onValueNodeHasChildrenChange: (hasChildren: boolean) => void;
  contentId: string;
  value: Accessor<string>;
  onValueChange: (value: string) => void;
  open: Accessor<boolean>;
  onOpenChange: (open: boolean) => void;
  dir: Direction;
  required: boolean;
  disabled: boolean;
  name?: string;
  // Text label of the currently selected item
  selectedText: Accessor<string>;
  onSelectedTextChange: (text: string) => void;
}

const SelectContext = solidCreateContext<SelectContextValue | undefined>(undefined);

function useSelectContext(consumerName: string, _scope?: Scope): SelectContextValue {
  const context = solidUseContext(SelectContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${SELECT_NAME}\``);
  }
  return context;
}

/* --- Content Context --- */

interface SelectContentContextValue {
  contentRef: Accessor<HTMLDivElement | null>;
  onContentRefChange: (el: HTMLDivElement | null) => void;
  viewportRef: Accessor<HTMLDivElement | null>;
  onViewportRefChange: (el: HTMLDivElement | null) => void;
  itemRefMap: Map<string, HTMLDivElement>;
  onItemLeave: () => void;
  itemTextRefMap: Map<string, HTMLSpanElement>;
  focusSelectedItem: () => void;
  selectedItem: Accessor<HTMLDivElement | null>;
  onSelectedItemChange: (el: HTMLDivElement | null) => void;
  selectedItemText: Accessor<HTMLSpanElement | null>;
  onSelectedItemTextChange: (el: HTMLSpanElement | null) => void;
  isPositioned: Accessor<boolean>;
  onIsPositionedChange: (positioned: boolean) => void;
  searchRef: string;
}

const SelectContentContext = solidCreateContext<SelectContentContextValue | undefined>(undefined);

function useSelectContentContext(consumerName: string, _scope?: Scope): SelectContentContextValue {
  const context = solidUseContext(SelectContentContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${CONTENT_NAME}\``);
  }
  return context;
}

/* --- Item Context --- */

interface SelectItemContextValue {
  value: string;
  disabled: boolean;
  textId: string;
  isSelected: Accessor<boolean>;
  onItemTextChange: (el: HTMLSpanElement | null) => void;
}

const SelectItemContext = solidCreateContext<SelectItemContextValue | undefined>(undefined);

function useSelectItemContext(consumerName: string, _scope?: Scope): SelectItemContextValue {
  const context = solidUseContext(SelectItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

/* -------------------------------------------------------------------------------------------------
 * createSelectScope (compatibility export)
 * -----------------------------------------------------------------------------------------------*/

function createSelectScope() {
  const popperScope = createPopperScope();
  return function useSelectScope(scope: Scope) {
    return popperScope(scope);
  };
}

/* -------------------------------------------------------------------------------------------------
 * Select (Root)
 * -----------------------------------------------------------------------------------------------*/

interface SelectProps {
  children?: JSX.Element;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dir?: Direction;
  name?: string;
  disabled?: boolean;
  required?: boolean;
}

function Select(props: ScopedProps<SelectProps>) {
  const [local] = splitProps(props, [
    '__scopeSelect',
    'children',
    'value',
    'defaultValue',
    'onValueChange',
    'open',
    'defaultOpen',
    'onOpenChange',
    'dir',
    'name',
    'disabled',
    'required',
  ]);

  const popperScope = usePopperScope(local.__scopeSelect);
  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement | null>(null);
  const [valueNodeRef, setValueNodeRef] = createSignal<HTMLSpanElement | null>(null);
  const [valueNodeHasChildren, setValueNodeHasChildren] = createSignal(false);
  const [selectedText, setSelectedText] = createSignal('');
  const contentId = createId();
  const direction = useDirection(local.dir);

  const [value, setValue] = createControllableSignal({
    prop: () => local.value,
    defaultProp: local.defaultValue ?? '',
    onChange: (v: string) => local.onValueChange?.(v),
  });

  const [open, setOpen] = createControllableSignal({
    prop: () => local.open,
    defaultProp: local.defaultOpen ?? false,
    onChange: (v: boolean) => local.onOpenChange?.(v),
  });

  // Build context value with accessor functions for reactivity
  const contextValue: SelectContextValue = {
    triggerRef,
    onTriggerRefChange: setTriggerRef,
    valueNodeRef,
    onValueNodeRefChange: setValueNodeRef,
    valueNodeHasChildren,
    onValueNodeHasChildrenChange: setValueNodeHasChildren,
    contentId,
    value,           // Accessor<string>
    onValueChange: setValue,
    open,            // Accessor<boolean>
    onOpenChange: setOpen,
    dir: direction,
    required: local.required ?? false,
    disabled: local.disabled ?? false,
    name: local.name,
    selectedText,
    onSelectedTextChange: setSelectedText,
  };

  return (
    <Popper {...popperScope}>
      <SelectContext.Provider value={contextValue}>
        {local.children}
      </SelectContext.Provider>
    </Popper>
  );
}

Select.displayName = SELECT_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectTrigger
 * -----------------------------------------------------------------------------------------------*/

interface SelectTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLElement>;
}

function SelectTrigger(inProps: ScopedProps<SelectTriggerProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref', 'disabled', 'children']);
  const context = useSelectContext(TRIGGER_NAME, local.__scopeSelect);
  const popperScope = usePopperScope(local.__scopeSelect);
  const isDisabled = () => context.disabled || local.disabled;

  const handleOpen = () => {
    if (!isDisabled()) {
      context.onOpenChange(true);
    }
  };

  // Use PopperAnchor as wrapper — no display:contents so floating-ui can measure it
  return (
    <PopperAnchor {...popperScope}>
      <button
        type="button"
        role="combobox"
        aria-controls={context.contentId}
        aria-expanded={context.open()}
        aria-required={context.required}
        aria-autocomplete="none"
        dir={context.dir}
        data-state={getOpenState(context.open())}
        data-disabled={isDisabled() ? '' : undefined}
        data-placeholder={shouldShowPlaceholder(context.value()) ? '' : undefined}
        disabled={isDisabled()}
        {...rest}
        ref={mergeRefs(local.ref, (el: HTMLElement) =>
          context.onTriggerRefChange(el as HTMLButtonElement),
        )}
        onClick={composeEventHandlers(rest.onClick as any, (event: MouseEvent) => {
          (event.currentTarget as HTMLElement)?.focus();
          if (!context.open()) {
            handleOpen();
          } else {
            context.onOpenChange(false);
          }
        })}
        onPointerDown={composeEventHandlers(rest.onPointerDown as any, (event: PointerEvent) => {
          if (event.button === 0 && event.ctrlKey === false) {
            const target = event.target as HTMLElement;
            if (target.hasPointerCapture(event.pointerId)) {
              target.releasePointerCapture(event.pointerId);
            }
          }
        })}
        onKeyDown={composeEventHandlers(rest.onKeyDown as any, (event: KeyboardEvent) => {
          const isTypingAhead = event.key.length === 1;
          if (isTypingAhead) return;

          if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            handleOpen();
          }
        })}
      >
        {local.children}
      </button>
    </PopperAnchor>
  );
}

SelectTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectValue
 * -----------------------------------------------------------------------------------------------*/

interface SelectValueProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLElement>;
  placeholder?: JSX.Element;
}

function SelectValue(inProps: ScopedProps<SelectValueProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref', 'placeholder', 'children']);
  const context = useSelectContext(VALUE_NAME, local.__scopeSelect);

  const showPlaceholder = () => shouldShowPlaceholder(context.value());

  // Track whether children are provided for native select rendering
  createEffect(() => {
    const hasChildren = !!local.children;
    context.onValueNodeHasChildrenChange(hasChildren);
  });

  return (
    <span
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) =>
        context.onValueNodeRefChange(el as HTMLSpanElement),
      )}
      style={{
        "pointer-events": 'none',
        ...(typeof rest.style === 'object' ? rest.style : {}),
      }}
    >
      <Show when={!showPlaceholder()} fallback={local.placeholder}>
        <Show when={!local.children} fallback={local.children}>
          {context.selectedText()}
        </Show>
      </Show>
    </span>
  );
}

SelectValue.displayName = VALUE_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectIcon
 * -----------------------------------------------------------------------------------------------*/

interface SelectIconProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLElement>;
}

function SelectIcon(inProps: ScopedProps<SelectIconProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref', 'children']);

  return (
    <span aria-hidden {...rest} ref={local.ref}>
      <Show when={local.children} fallback={'▼'}>
        {local.children}
      </Show>
    </span>
  );
}

SelectIcon.displayName = ICON_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectPortal
 * -----------------------------------------------------------------------------------------------*/

interface SelectPortalProps {
  children?: JSX.Element;
  container?: Element | DocumentFragment | null;
}

function SelectPortal(props: ScopedProps<SelectPortalProps>) {
  const [local] = splitProps(props, ['__scopeSelect', 'children', 'container']);
  const [mounted, setMounted] = createSignal(false);

  onMount(() => setMounted(true));

  return (
    <Show when={mounted()}>
      <SolidPortal mount={(local.container as Node) || document.body}>
        {local.children}
      </SolidPortal>
    </Show>
  );
}

SelectPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectContent
 * -----------------------------------------------------------------------------------------------*/

interface SelectContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLElement>;
  position?: 'item-aligned' | 'popper';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Element | Element[] | null;
  collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
  arrowPadding?: number;
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
}

function SelectContent(inProps: ScopedProps<SelectContentProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref']);
  const context = useSelectContext(CONTENT_NAME, local.__scopeSelect);

  return (
    <Show when={context.open()}>
      <SelectContentImpl
        {...rest}
        __scopeSelect={local.__scopeSelect}
        ref={local.ref}
      />
    </Show>
  );
}

SelectContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectContentImpl
 * -----------------------------------------------------------------------------------------------*/

interface SelectContentImplProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLElement>;
  position?: 'item-aligned' | 'popper';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Element | Element[] | null;
  collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
  arrowPadding?: number;
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
}

function SelectContentImpl(inProps: ScopedProps<SelectContentImplProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeSelect',
    'ref',
    'position',
    'side',
    'sideOffset',
    'align',
    'alignOffset',
    'avoidCollisions',
    'collisionBoundary',
    'collisionPadding',
    'arrowPadding',
    'sticky',
    'hideWhenDetached',
  ]);

  const context = useSelectContext(CONTENT_NAME, local.__scopeSelect);
  const [contentRef, setContentRef] = createSignal<HTMLDivElement | null>(null);
  const [viewportRef, setViewportRef] = createSignal<HTMLDivElement | null>(null);
  const [selectedItem, setSelectedItem] = createSignal<HTMLDivElement | null>(null);
  const [selectedItemText, setSelectedItemText] = createSignal<HTMLSpanElement | null>(null);
  const [isPositioned, setIsPositioned] = createSignal(false);
  const itemRefMap = new Map<string, HTMLDivElement>();
  const itemTextRefMap = new Map<string, HTMLSpanElement>();
  let searchRef = '';

  const position = () => local.position ?? 'item-aligned';

  // Focus the selected item when opening
  const focusSelectedItem = () => {
    const viewport = viewportRef();
    if (viewport) {
      const selected = selectedItem();
      if (selected) {
        selected.focus({ preventScroll: true });
      } else {
        const firstItem = viewport.querySelector('[role="option"]:not([data-disabled])') as HTMLElement | null;
        firstItem?.focus({ preventScroll: true });
      }
    }
  };

  // Handle typeahead search
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;
  const handleTypeaheadSearch = (key: string) => {
    searchRef += key;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { searchRef = ''; }, 1000);

    const viewport = viewportRef();
    if (!viewport) return;

    const items = Array.from(viewport.querySelectorAll('[role="option"]:not([data-disabled])')) as HTMLElement[];
    const currentItem = document.activeElement as HTMLElement;
    const currentIndex = items.indexOf(currentItem);

    const orderedItems = [
      ...items.slice(currentIndex + 1),
      ...items.slice(0, currentIndex + 1),
    ];

    const matchingItem = orderedItems.find((item) => {
      const text = item.textContent?.toLowerCase() ?? '';
      return text.startsWith(searchRef.toLowerCase());
    });

    if (matchingItem) {
      matchingItem.focus({ preventScroll: true });
      matchingItem.scrollIntoView({ block: 'nearest' });
    }
  };

  // Keyboard navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const viewport = viewportRef();
      if (!viewport) return;

      const items = Array.from(viewport.querySelectorAll('[role="option"]:not([data-disabled])')) as HTMLElement[];
      if (items.length === 0) return;

      const currentItem = document.activeElement as HTMLElement;
      const currentIndex = items.indexOf(currentItem);

      let nextIndex: number;
      switch (event.key) {
        case 'ArrowUp':
          nextIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowDown':
          nextIndex = Math.min(items.length - 1, currentIndex + 1);
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = items.length - 1;
          break;
        default:
          nextIndex = currentIndex;
      }

      const nextItem = items[nextIndex];
      if (nextItem) {
        nextItem.focus({ preventScroll: true });
        nextItem.scrollIntoView({ block: 'nearest' });
      }
    } else if (event.key === 'Escape') {
      context.onOpenChange(false);
    } else if (!isModifierKey && event.key.length === 1) {
      handleTypeaheadSearch(event.key);
    }
  };

  // Auto-focus on mount
  createEffect(() => {
    if (isPositioned()) {
      focusSelectedItem();
    }
  });

  const contentContextValue: SelectContentContextValue = {
    contentRef,
    onContentRefChange: setContentRef,
    viewportRef,
    onViewportRefChange: setViewportRef,
    itemRefMap,
    onItemLeave: () => {
      const viewport = viewportRef();
      viewport?.focus({ preventScroll: true });
    },
    itemTextRefMap,
    focusSelectedItem,
    selectedItem,
    onSelectedItemChange: setSelectedItem,
    selectedItemText,
    onSelectedItemTextChange: setSelectedItemText,
    isPositioned,
    onIsPositionedChange: setIsPositioned,
    searchRef,
  };

  // Close on outside click
  const handlePointerDownOutside = (event: PointerEvent) => {
    const trigger = context.triggerRef();
    if (trigger && trigger.contains(event.target as Node)) {
      return; // Don't close if clicking the trigger
    }
    context.onOpenChange(false);
  };

  // Close on escape
  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      context.onOpenChange(false);
      context.triggerRef()?.focus({ preventScroll: true });
    }
  };

  // Setup dismiss handlers
  onMount(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const content = contentRef();
      if (content && !content.contains(event.target as Node)) {
        handlePointerDownOutside(event);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscapeKeyDown);

    onCleanup(() => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscapeKeyDown);
    });
  });

  return (
    <SelectContentContext.Provider value={contentContextValue}>
      <Show
        when={position() === 'popper'}
        fallback={
          <SelectItemAlignedContent
            {...rest}
            __scopeSelect={local.__scopeSelect}
            ref={mergeRefs(local.ref, (el: HTMLElement) => setContentRef(el as HTMLDivElement))}
            onKeyDown={composeEventHandlers(rest.onKeyDown as any, handleKeyDown)}
            onPlaced={() => setIsPositioned(true)}
          />
        }
      >
        <SelectPopperContent
          {...rest}
          __scopeSelect={local.__scopeSelect}
          ref={mergeRefs(local.ref, (el: HTMLElement) => setContentRef(el as HTMLDivElement))}
          onKeyDown={composeEventHandlers(rest.onKeyDown as any, handleKeyDown)}
          side={local.side}
          sideOffset={local.sideOffset}
          align={local.align}
          alignOffset={local.alignOffset}
          avoidCollisions={local.avoidCollisions}
          collisionBoundary={local.collisionBoundary}
          collisionPadding={local.collisionPadding}
          arrowPadding={local.arrowPadding}
          sticky={local.sticky}
          hideWhenDetached={local.hideWhenDetached}
          onPlaced={() => setIsPositioned(true)}
        />
      </Show>
      <BubbleSelect
        name={context.name}
        value={context.value()}
        required={context.required}
        disabled={context.disabled}
      />
    </SelectContentContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * SelectItemAlignedContent (position="item-aligned")
 * -----------------------------------------------------------------------------------------------*/

interface SelectItemAlignedContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLElement>;
  onPlaced?: () => void;
}

function SelectItemAlignedContent(inProps: ScopedProps<SelectItemAlignedContentProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref', 'onPlaced']);
  const context = useSelectContext(CONTENT_NAME, local.__scopeSelect);

  onMount(() => {
    local.onPlaced?.();
  });

  return (
    <div
      role="listbox"
      data-state={getOpenState(context.open())}
      dir={context.dir}
      {...rest}
      ref={local.ref}
      style={{
        display: 'flex',
        'flex-direction': 'column',
        outline: 'none',
        'box-sizing': 'border-box',
        position: 'fixed',
        'z-index': 2147483647,
        'max-height': '100vh',
        ...(typeof rest.style === 'object' ? rest.style : {}),
      }}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * SelectPopperContent (position="popper")
 * -----------------------------------------------------------------------------------------------*/

interface SelectPopperContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLElement>;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Element | Element[] | null;
  collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
  arrowPadding?: number;
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
  onPlaced?: () => void;
}

function SelectPopperContent(inProps: ScopedProps<SelectPopperContentProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeSelect',
    'ref',
    'side',
    'sideOffset',
    'align',
    'alignOffset',
    'avoidCollisions',
    'collisionBoundary',
    'collisionPadding',
    'arrowPadding',
    'sticky',
    'hideWhenDetached',
    'onPlaced',
  ]);

  const context = useSelectContext(CONTENT_NAME, local.__scopeSelect);
  const popperScope = usePopperScope(local.__scopeSelect);

  return (
    <PopperContent
      {...popperScope}
      data-state={getOpenState(context.open())}
      dir={context.dir}
      role="listbox"
      {...rest}
      ref={local.ref}
      side={local.side ?? 'bottom'}
      sideOffset={local.sideOffset ?? 0}
      align={local.align ?? 'start'}
      alignOffset={local.alignOffset}
      avoidCollisions={local.avoidCollisions ?? true}
      collisionBoundary={local.collisionBoundary}
      collisionPadding={local.collisionPadding ?? 10}
      arrowPadding={local.arrowPadding}
      sticky={local.sticky ?? 'partial'}
      hideWhenDetached={local.hideWhenDetached}
      onPlaced={local.onPlaced}
      style={{
        'box-sizing': 'border-box',
        // Make the content a flex column so the viewport's flex:1 can grow
        'display': 'flex',
        'flex-direction': 'column',
        '--radix-select-content-transform-origin': 'var(--radix-popper-transform-origin)',
        '--radix-select-content-available-width': 'var(--radix-popper-available-width)',
        '--radix-select-content-available-height': 'var(--radix-popper-available-height)',
        '--radix-select-trigger-width': 'var(--radix-popper-anchor-width)',
        '--radix-select-trigger-height': 'var(--radix-popper-anchor-height)',
        ...(typeof rest.style === 'object' ? rest.style : {}),
      } as JSX.CSSProperties}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * SelectViewport
 * -----------------------------------------------------------------------------------------------*/

interface SelectViewportProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLElement>;
  nonce?: string;
}

function SelectViewport(inProps: ScopedProps<SelectViewportProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref', 'nonce']);
  const contentContext = useSelectContentContext(VIEWPORT_NAME, local.__scopeSelect);

  return (
    <>
      <style nonce={local.nonce}>
        {`[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}`}
      </style>
      <div
        data-radix-select-viewport=""
        role="presentation"
        {...rest}
        ref={mergeRefs(local.ref, (el: HTMLElement) =>
          contentContext.onViewportRefChange(el as HTMLDivElement),
        )}
        style={{
          position: 'relative',
          flex: '1',
          overflow: 'auto',
          ...(typeof rest.style === 'object' ? rest.style : {}),
        }}
      />
    </>
  );
}

SelectViewport.displayName = VIEWPORT_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectGroup
 * -----------------------------------------------------------------------------------------------*/

interface SelectGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLElement>;
}

function SelectGroup(inProps: ScopedProps<SelectGroupProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref']);
  const groupId = createId();

  return (
    <div
      role="group"
      aria-labelledby={groupId}
      {...rest}
      ref={local.ref}
    />
  );
}

SelectGroup.displayName = GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectLabel
 * -----------------------------------------------------------------------------------------------*/

interface SelectLabelProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLElement>;
}

function SelectLabel(inProps: ScopedProps<SelectLabelProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref']);

  return (
    <div
      {...rest}
      ref={local.ref}
    />
  );
}

SelectLabel.displayName = LABEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectItem
 * -----------------------------------------------------------------------------------------------*/

interface SelectItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLElement>;
  value: string;
  disabled?: boolean;
  textValue?: string;
}

function SelectItem(inProps: ScopedProps<SelectItemProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeSelect',
    'ref',
    'value',
    'disabled',
    'textValue',
  ]);

  const context = useSelectContext(ITEM_NAME, local.__scopeSelect);
  const contentContext = useSelectContentContext(ITEM_NAME, local.__scopeSelect);
  const textId = createId();

  const isSelected = () => context.value() === local.value;
  const isDisabled = () => local.disabled ?? false;
  const [itemTextNode, setItemTextNode] = createSignal<HTMLSpanElement | null>(null);

  let itemRef!: HTMLDivElement;

  // Track selected item in content context and update selected text
  createEffect(() => {
    if (isSelected()) {
      contentContext.onSelectedItemChange?.(itemRef);
      const textNode = itemTextNode();
      if (textNode) {
        contentContext.onSelectedItemTextChange?.(textNode);
        // Also update selectedText in context for SelectValue display
        context.onSelectedTextChange(textNode.textContent || '');
      }
    }
  });

  const handleSelect = () => {
    if (!isDisabled()) {
      context.onValueChange(local.value);
      // Update selected text from the item text node
      const textNode = itemTextNode();
      if (textNode) {
        context.onSelectedTextChange(textNode.textContent || '');
      }
      context.onOpenChange(false);
    }
  };

  const itemContextValue: SelectItemContextValue = {
    value: local.value,
    disabled: isDisabled(),
    textId,
    isSelected,
    onItemTextChange: (el: HTMLSpanElement | null) => {
      setItemTextNode(el);
      if (el) {
        contentContext.itemTextRefMap.set(local.value, el);
      }
    },
  };

  return (
    <SelectItemContext.Provider value={itemContextValue}>
      <div
        role="option"
        aria-labelledby={textId}
        data-highlighted={undefined}
        aria-selected={isSelected() && true}
        data-state={getDataState(isSelected())}
        aria-disabled={isDisabled() || undefined}
        data-disabled={isDisabled() ? '' : undefined}
        tabIndex={isDisabled() ? undefined : -1}
        {...rest}
        ref={mergeRefs(local.ref, (el: HTMLElement) => {
          itemRef = el as HTMLDivElement;
          contentContext.itemRefMap.set(local.value, el as HTMLDivElement);
        })}
        onFocus={composeEventHandlers(rest.onFocus as any, () => {
          if (itemRef) {
            itemRef.setAttribute('data-highlighted', '');
          }
        })}
        onBlur={composeEventHandlers(rest.onBlur as any, () => {
          if (itemRef) {
            itemRef.removeAttribute('data-highlighted');
          }
        })}
        onClick={composeEventHandlers(rest.onClick as any, handleSelect)}
        onKeyDown={composeEventHandlers(rest.onKeyDown as any, (event: KeyboardEvent) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            handleSelect();
          }
        })}
        onPointerUp={composeEventHandlers(rest.onPointerUp as any, handleSelect)}
        onPointerMove={composeEventHandlers(rest.onPointerMove as any, (event: PointerEvent) => {
          if (isDisabled()) {
            contentContext.onItemLeave();
          } else {
            (event.currentTarget as HTMLElement).focus({ preventScroll: true });
          }
        })}
        onPointerLeave={composeEventHandlers(rest.onPointerLeave as any, (event: PointerEvent) => {
          if (event.currentTarget === document.activeElement) {
            contentContext.onItemLeave();
          }
        })}
      />
    </SelectItemContext.Provider>
  );
}

SelectItem.displayName = ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectItemText
 * -----------------------------------------------------------------------------------------------*/

interface SelectItemTextProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLElement>;
}

function SelectItemText(inProps: ScopedProps<SelectItemTextProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref']);
  const itemContext = useSelectItemContext(ITEM_TEXT_NAME, local.__scopeSelect);

  return (
    <span
      id={itemContext.textId}
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) => {
        itemContext.onItemTextChange(el as HTMLSpanElement);
      })}
    />
  );
}

SelectItemText.displayName = ITEM_TEXT_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectItemIndicator
 * -----------------------------------------------------------------------------------------------*/

interface SelectItemIndicatorProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLElement>;
}

function SelectItemIndicator(inProps: ScopedProps<SelectItemIndicatorProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref']);
  const itemContext = useSelectItemContext(ITEM_INDICATOR_NAME, local.__scopeSelect);

  return (
    <Show when={itemContext.isSelected()}>
      <span aria-hidden {...rest} ref={local.ref} />
    </Show>
  );
}

SelectItemIndicator.displayName = ITEM_INDICATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectScrollUpButton
 * -----------------------------------------------------------------------------------------------*/

interface SelectScrollUpButtonProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLElement>;
}

function SelectScrollUpButton(inProps: ScopedProps<SelectScrollUpButtonProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref']);
  const contentContext = useSelectContentContext(SCROLL_UP_BUTTON_NAME, local.__scopeSelect);
  const [canScrollUp, setCanScrollUp] = createSignal(false);

  createEffect(() => {
    const viewport = contentContext.viewportRef();
    if (!viewport) return;

    const handleScroll = () => {
      setCanScrollUp(viewport.scrollTop > 0);
    };
    handleScroll();
    viewport.addEventListener('scroll', handleScroll);
    onCleanup(() => viewport.removeEventListener('scroll', handleScroll));
  });

  let scrollInterval: ReturnType<typeof setInterval> | undefined;

  const startScrolling = () => {
    const viewport = contentContext.viewportRef();
    if (!viewport) return;
    scrollInterval = setInterval(() => {
      viewport.scrollBy({ top: -4 });
      if (viewport.scrollTop <= 0) {
        clearInterval(scrollInterval);
      }
    }, 16);
  };

  const stopScrolling = () => {
    clearInterval(scrollInterval);
  };

  return (
    <Show when={canScrollUp()}>
      <div
        aria-hidden
        {...rest}
        ref={local.ref}
        style={{
          'flex-shrink': '0',
          ...(typeof rest.style === 'object' ? rest.style : {}),
        }}
        onPointerDown={composeEventHandlers(rest.onPointerDown as any, startScrolling)}
        onPointerUp={stopScrolling}
        onPointerLeave={stopScrolling}
      />
    </Show>
  );
}

SelectScrollUpButton.displayName = SCROLL_UP_BUTTON_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectScrollDownButton
 * -----------------------------------------------------------------------------------------------*/

interface SelectScrollDownButtonProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLElement>;
}

function SelectScrollDownButton(inProps: ScopedProps<SelectScrollDownButtonProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref']);
  const contentContext = useSelectContentContext(SCROLL_DOWN_BUTTON_NAME, local.__scopeSelect);
  const [canScrollDown, setCanScrollDown] = createSignal(false);

  createEffect(() => {
    const viewport = contentContext.viewportRef();
    if (!viewport) return;

    const handleScroll = () => {
      const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
      setCanScrollDown(viewport.scrollTop < maxScrollTop);
    };
    handleScroll();
    viewport.addEventListener('scroll', handleScroll);
    onCleanup(() => viewport.removeEventListener('scroll', handleScroll));
  });

  let scrollInterval: ReturnType<typeof setInterval> | undefined;

  const startScrolling = () => {
    const viewport = contentContext.viewportRef();
    if (!viewport) return;
    scrollInterval = setInterval(() => {
      const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
      viewport.scrollBy({ top: 4 });
      if (viewport.scrollTop >= maxScrollTop) {
        clearInterval(scrollInterval);
      }
    }, 16);
  };

  const stopScrolling = () => {
    clearInterval(scrollInterval);
  };

  return (
    <Show when={canScrollDown()}>
      <div
        aria-hidden
        {...rest}
        ref={local.ref}
        style={{
          'flex-shrink': '0',
          ...(typeof rest.style === 'object' ? rest.style : {}),
        }}
        onPointerDown={composeEventHandlers(rest.onPointerDown as any, startScrolling)}
        onPointerUp={stopScrolling}
        onPointerLeave={stopScrolling}
      />
    </Show>
  );
}

SelectScrollDownButton.displayName = SCROLL_DOWN_BUTTON_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectSeparator
 * -----------------------------------------------------------------------------------------------*/

interface SelectSeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLElement>;
}

function SelectSeparator(inProps: ScopedProps<SelectSeparatorProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect', 'ref']);
  return <div aria-hidden {...rest} ref={local.ref} />;
}

SelectSeparator.displayName = SEPARATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectArrow
 * -----------------------------------------------------------------------------------------------*/

interface SelectArrowProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  ref?: Ref<SVGSVGElement>;
}

function SelectArrow(inProps: ScopedProps<SelectArrowProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSelect']);
  const popperScope = usePopperScope(local.__scopeSelect);
  const context = useSelectContext(ARROW_NAME, local.__scopeSelect);

  return (
    <Show when={context.open()}>
      <PopperArrow {...popperScope} {...rest} />
    </Show>
  );
}

SelectArrow.displayName = ARROW_NAME;

/* -------------------------------------------------------------------------------------------------
 * BubbleSelect (Internal)
 * Hidden native <select> for form compatibility
 * -----------------------------------------------------------------------------------------------*/

interface BubbleSelectProps {
  name?: string;
  value: string;
  required: boolean;
  disabled: boolean;
}

function BubbleSelect(props: BubbleSelectProps) {
  return (
    <Show when={props.name}>
      <VisuallyHidden aria-hidden>
        <select
          name={props.name}
          value={props.value}
          required={props.required}
          disabled={props.disabled}
          tabIndex={-1}
          onChange={() => {}}
        >
          <option value="" />
          <Show when={props.value}>
            <option value={props.value}>{props.value}</option>
          </Show>
        </select>
      </VisuallyHidden>
    </Show>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = Select;
const Trigger = SelectTrigger;
const Value = SelectValue;
const Icon = SelectIcon;
const PortalExport = SelectPortal;
const Content = SelectContent;
const Viewport = SelectViewport;
const Group = SelectGroup;
const Label = SelectLabel;
const Item = SelectItem;
const ItemText = SelectItemText;
const ItemIndicator = SelectItemIndicator;
const ScrollUpButton = SelectScrollUpButton;
const ScrollDownButton = SelectScrollDownButton;
const Separator = SelectSeparator;
const Arrow = SelectArrow;

export {
  createSelectScope,
  //
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectSeparator,
  SelectArrow,
  //
  Root,
  Trigger,
  Value,
  Icon,
  PortalExport as Portal,
  Content,
  Viewport,
  Group,
  Label,
  Item,
  ItemText,
  ItemIndicator,
  ScrollUpButton,
  ScrollDownButton,
  Separator,
  Arrow,
};

export type {
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectIconProps,
  SelectPortalProps,
  SelectContentProps,
  SelectViewportProps,
  SelectGroupProps,
  SelectLabelProps,
  SelectItemProps,
  SelectItemTextProps,
  SelectItemIndicatorProps,
  SelectScrollUpButtonProps,
  SelectScrollDownButtonProps,
  SelectSeparatorProps,
  SelectArrowProps,
};
