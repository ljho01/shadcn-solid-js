import { type JSX, splitProps } from 'solid-js';
import { composeEventHandlers } from '@radix-solid/primitive';
import { createCollection } from '@radix-solid/collection';
import { createContextScope } from '@radix-solid/context';
import { useDirection } from '@radix-solid/direction';
import { createId } from '@radix-solid/id';
import { Primitive, type PrimitiveProps } from '@radix-solid/primitive-component';
import { createControllableSignal } from '@radix-solid/use-controllable-state';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  createCollapsibleScope,
} from '@radix-solid/collapsible';

import type { Scope } from '@radix-solid/context';

type Direction = 'ltr' | 'rtl';

/* -------------------------------------------------------------------------------------------------
 * Accordion
 * -----------------------------------------------------------------------------------------------*/

const ACCORDION_NAME = 'Accordion';
const ACCORDION_KEYS = ['Home', 'End', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];

type AccordionTriggerElement = HTMLButtonElement;

const [Collection, useCollection, createCollectionScope] =
  createCollection<AccordionTriggerElement>(ACCORDION_NAME);

type ScopedProps<P> = P & { __scopeAccordion?: Scope };

const [createAccordionContext, createAccordionScope] = createContextScope(ACCORDION_NAME, [
  createCollectionScope,
  createCollapsibleScope,
]);

const useCollapsibleScope = createCollapsibleScope();

/* -------------------------------------------------------------------------------------------------
 * AccordionValueContext
 * -----------------------------------------------------------------------------------------------*/

type AccordionValueContextValue = {
  value: string[];
  onItemOpen(value: string): void;
  onItemClose(value: string): void;
};

const [AccordionValueProvider, useAccordionValueContext] =
  createAccordionContext<AccordionValueContextValue>(ACCORDION_NAME);

/* -------------------------------------------------------------------------------------------------
 * AccordionCollapsibleContext
 * -----------------------------------------------------------------------------------------------*/

const [AccordionCollapsibleProvider, useAccordionCollapsibleContext] = createAccordionContext(
  ACCORDION_NAME,
  { collapsible: false },
);

/* -------------------------------------------------------------------------------------------------
 * AccordionImplContext
 * -----------------------------------------------------------------------------------------------*/

type AccordionImplContextValue = {
  disabled?: boolean;
  direction: Direction;
  orientation: 'horizontal' | 'vertical';
};

const [AccordionImplProvider, useAccordionContext] =
  createAccordionContext<AccordionImplContextValue>(ACCORDION_NAME);

/* -------------------------------------------------------------------------------------------------
 * AccordionItemContext
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'AccordionItem';

type AccordionItemContextValue = {
  open?: boolean;
  disabled?: boolean;
  triggerId: string;
};

const [AccordionItemProvider, useAccordionItemContext] =
  createAccordionContext<AccordionItemContextValue>(ITEM_NAME);

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

interface AccordionImplProps extends PrimitiveProps<'div'> {
  /**
   * Whether or not an accordion is disabled from user interaction.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * The layout in which the Accordion operates.
   * @default vertical
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * The language read direction.
   */
  dir?: Direction;
}

interface AccordionImplSingleProps extends AccordionImplProps {
  /**
   * The controlled stateful value of the accordion item whose content is expanded.
   */
  value?: string;
  /**
   * The value of the item whose content is expanded when the accordion is initially rendered.
   * Use `defaultValue` if you do not need to control the state of an accordion.
   */
  defaultValue?: string;
  /**
   * The callback that fires when the state of the accordion changes.
   */
  onValueChange?(value: string): void;
  /**
   * Whether an accordion item can be collapsed after it has been opened.
   * @default false
   */
  collapsible?: boolean;
}

interface AccordionImplMultipleProps extends AccordionImplProps {
  /**
   * The controlled stateful value of the accordion items whose contents are expanded.
   */
  value?: string[];
  /**
   * The value of the items whose contents are expanded when the accordion is initially rendered.
   * Use `defaultValue` if you do not need to control the state of an accordion.
   */
  defaultValue?: string[];
  /**
   * The callback that fires when the state of the accordion changes.
   */
  onValueChange?(value: string[]): void;
}

interface AccordionSingleProps extends AccordionImplSingleProps {
  type: 'single';
}

interface AccordionMultipleProps extends AccordionImplMultipleProps {
  type: 'multiple';
}

/* -------------------------------------------------------------------------------------------------
 * Accordion
 * -----------------------------------------------------------------------------------------------*/

function Accordion(props: ScopedProps<AccordionSingleProps | AccordionMultipleProps>) {
  const [local, rest] = splitProps(props, ['type', '__scopeAccordion']);

  return (
    <Collection.Provider scope={local.__scopeAccordion}>
      {local.type === 'multiple' ? (
        <AccordionImplMultiple
          {...(rest as unknown as ScopedProps<AccordionImplMultipleProps>)}
          __scopeAccordion={local.__scopeAccordion}
        />
      ) : (
        <AccordionImplSingle
          {...(rest as unknown as ScopedProps<AccordionImplSingleProps>)}
          __scopeAccordion={local.__scopeAccordion}
        />
      )}
    </Collection.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AccordionImplSingle
 * -----------------------------------------------------------------------------------------------*/

function AccordionImplSingle(props: ScopedProps<AccordionImplSingleProps>) {
  const [local, rest] = splitProps(props, [
    '__scopeAccordion',
    'value',
    'defaultValue',
    'onValueChange',
    'collapsible',
  ]);

  const [value, setValue] = createControllableSignal({
    prop: () => local.value,
    defaultProp: local.defaultValue ?? '',
    onChange: local.onValueChange,
    caller: ACCORDION_NAME,
  });

  return (
    <AccordionValueProvider
      scope={local.__scopeAccordion}
      value={value() ? [value() as string] : []}
      onItemOpen={setValue}
      onItemClose={() => {
        if (local.collapsible) setValue('');
      }}
    >
      <AccordionCollapsibleProvider
        scope={local.__scopeAccordion}
        collapsible={local.collapsible ?? false}
      >
        <AccordionImpl {...rest} __scopeAccordion={local.__scopeAccordion} />
      </AccordionCollapsibleProvider>
    </AccordionValueProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AccordionImplMultiple
 * -----------------------------------------------------------------------------------------------*/

function AccordionImplMultiple(props: ScopedProps<AccordionImplMultipleProps>) {
  const [local, rest] = splitProps(props, [
    '__scopeAccordion',
    'value',
    'defaultValue',
    'onValueChange',
  ]);

  const [value, setValue] = createControllableSignal({
    prop: () => local.value,
    defaultProp: local.defaultValue ?? ([] as string[]),
    onChange: local.onValueChange,
    caller: ACCORDION_NAME,
  });

  const handleItemOpen = (itemValue: string) => {
    setValue((prevValue = []) => [...prevValue, itemValue]);
  };

  const handleItemClose = (itemValue: string) => {
    setValue((prevValue = []) => prevValue.filter((v) => v !== itemValue));
  };

  return (
    <AccordionValueProvider
      scope={local.__scopeAccordion}
      value={value() as string[]}
      onItemOpen={handleItemOpen}
      onItemClose={handleItemClose}
    >
      <AccordionCollapsibleProvider scope={local.__scopeAccordion} collapsible={true}>
        <AccordionImpl {...rest} __scopeAccordion={local.__scopeAccordion} />
      </AccordionCollapsibleProvider>
    </AccordionValueProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AccordionImpl
 * -----------------------------------------------------------------------------------------------*/

function AccordionImpl(props: ScopedProps<AccordionImplProps>) {
  const [local, rest] = splitProps(props, [
    '__scopeAccordion',
    'disabled',
    'dir',
    'orientation',
    'onKeyDown',
    'ref',
  ]);

  const getItems = useCollection(local.__scopeAccordion);
  const direction = useDirection(local.dir);
  const isDirectionLTR = direction === 'ltr';
  const orientation = local.orientation ?? 'vertical';

  const handleKeyDown = composeEventHandlers<KeyboardEvent>(
    local.onKeyDown as ((event: KeyboardEvent) => void) | undefined,
    (event) => {
      if (!ACCORDION_KEYS.includes(event.key)) return;

      const target = event.target as HTMLElement;
      const items = getItems();

      // Get trigger buttons from collection items.
      // Each collection item's ref is a wrapper <span>, the actual <button> is inside.
      const triggerButtons = items
        .map((item) => {
          const ref = item.ref as HTMLElement;
          if (ref instanceof HTMLButtonElement) return ref;
          return ref.querySelector('button') as HTMLButtonElement | null;
        })
        .filter(
          (btn): btn is HTMLButtonElement => btn !== null && !btn.disabled
        );

      const triggerIndex = triggerButtons.findIndex((btn) => btn === target);
      const triggerCount = triggerButtons.length;

      if (triggerIndex === -1) return;

      // Prevents page scroll while user is navigating
      event.preventDefault();

      let nextIndex = triggerIndex;
      const homeIndex = 0;
      const endIndex = triggerCount - 1;

      const moveNext = () => {
        nextIndex = triggerIndex + 1;
        if (nextIndex > endIndex) {
          nextIndex = homeIndex;
        }
      };

      const movePrev = () => {
        nextIndex = triggerIndex - 1;
        if (nextIndex < homeIndex) {
          nextIndex = endIndex;
        }
      };

      switch (event.key) {
        case 'Home':
          nextIndex = homeIndex;
          break;
        case 'End':
          nextIndex = endIndex;
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal') {
            if (isDirectionLTR) {
              moveNext();
            } else {
              movePrev();
            }
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical') {
            moveNext();
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal') {
            if (isDirectionLTR) {
              movePrev();
            } else {
              moveNext();
            }
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical') {
            movePrev();
          }
          break;
      }

      const clampedIndex = nextIndex % triggerCount;
      triggerButtons[clampedIndex]?.focus();
    }
  );

  return (
    <AccordionImplProvider
      scope={local.__scopeAccordion}
      disabled={local.disabled}
      direction={direction as Direction}
      orientation={orientation}
    >
      <Collection.Slot scope={local.__scopeAccordion}>
        <Primitive.div
          {...rest}
          data-orientation={orientation}
          ref={local.ref}
          onKeyDown={local.disabled ? undefined : handleKeyDown}
        />
      </Collection.Slot>
    </AccordionImplProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AccordionItem
 * -----------------------------------------------------------------------------------------------*/

interface AccordionItemProps extends PrimitiveProps<'div'> {
  /**
   * Whether or not an accordion item is disabled from user interaction.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * A string value for the accordion item. All items within an accordion should use a unique value.
   */
  value: string;
}

/**
 * `AccordionItem` contains all of the parts of a collapsible section inside of an `Accordion`.
 */
function AccordionItem(props: ScopedProps<AccordionItemProps>) {
  const [local, rest] = splitProps(props, [
    '__scopeAccordion',
    'value',
    'disabled',
  ]);

  const accordionContext = useAccordionContext(ITEM_NAME, local.__scopeAccordion);
  const valueContext = useAccordionValueContext(ITEM_NAME, local.__scopeAccordion);
  const collapsibleScope = useCollapsibleScope(local.__scopeAccordion);
  const triggerId = createId();
  const open = () => (local.value && valueContext.value.includes(local.value)) || false;
  const disabled = () => accordionContext.disabled || local.disabled;

  return (
    <AccordionItemProvider
      scope={local.__scopeAccordion}
      open={open()}
      disabled={disabled()}
      triggerId={triggerId}
    >
      <Collapsible
        data-orientation={accordionContext.orientation}
        data-state={getState(open())}
        {...collapsibleScope}
        {...rest}
        disabled={disabled()}
        open={open()}
        onOpenChange={(isOpen: boolean) => {
          if (isOpen) {
            valueContext.onItemOpen(local.value);
          } else {
            valueContext.onItemClose(local.value);
          }
        }}
      />
    </AccordionItemProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AccordionHeader
 * -----------------------------------------------------------------------------------------------*/

const HEADER_NAME = 'AccordionHeader';

interface AccordionHeaderProps extends PrimitiveProps<'h3'> {}

/**
 * `AccordionHeader` contains the content for the parts of an `AccordionItem` that will be visible
 * whether or not its content is collapsed.
 */
function AccordionHeader(props: ScopedProps<AccordionHeaderProps>) {
  const [local, rest] = splitProps(props, ['__scopeAccordion']);
  const accordionContext = useAccordionContext(ACCORDION_NAME, local.__scopeAccordion);
  const itemContext = useAccordionItemContext(HEADER_NAME, local.__scopeAccordion);

  return (
    <Primitive.h3
      data-orientation={accordionContext.orientation}
      data-state={getState(itemContext.open)}
      data-disabled={itemContext.disabled ? '' : undefined}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * AccordionTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'AccordionTrigger';

interface AccordionTriggerProps extends PrimitiveProps<'button'> {}

/**
 * `AccordionTrigger` is the trigger that toggles the collapsed state of an `AccordionItem`. It
 * should always be nested inside of an `AccordionHeader`.
 */
function AccordionTrigger(props: ScopedProps<AccordionTriggerProps>) {
  const [local, rest] = splitProps(props, ['__scopeAccordion']);
  const accordionContext = useAccordionContext(ACCORDION_NAME, local.__scopeAccordion);
  const itemContext = useAccordionItemContext(TRIGGER_NAME, local.__scopeAccordion);
  const collapsibleContext = useAccordionCollapsibleContext(TRIGGER_NAME, local.__scopeAccordion);
  const collapsibleScope = useCollapsibleScope(local.__scopeAccordion);

  return (
    <Collection.ItemSlot scope={local.__scopeAccordion}>
      <CollapsibleTrigger
        aria-disabled={
          (itemContext.open && !collapsibleContext.collapsible) || undefined
        }
        data-orientation={accordionContext.orientation}
        id={itemContext.triggerId}
        {...collapsibleScope}
        {...rest}
      />
    </Collection.ItemSlot>
  );
}

/* -------------------------------------------------------------------------------------------------
 * AccordionContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'AccordionContent';

interface AccordionContentProps extends PrimitiveProps<'div'> {
  /**
   * Used to force mounting when more control is needed. Useful when controlling animation
   * with SolidJS animation libraries.
   */
  forceMount?: true;
}

/**
 * `AccordionContent` contains the collapsible content for an `AccordionItem`.
 */
function AccordionContent(props: ScopedProps<AccordionContentProps>) {
  const [local, rest] = splitProps(props, ['__scopeAccordion', 'style']);
  const accordionContext = useAccordionContext(ACCORDION_NAME, local.__scopeAccordion);
  const itemContext = useAccordionItemContext(CONTENT_NAME, local.__scopeAccordion);
  const collapsibleScope = useCollapsibleScope(local.__scopeAccordion);

  return (
    <CollapsibleContent
      role="region"
      aria-labelledby={itemContext.triggerId}
      data-orientation={accordionContext.orientation}
      {...collapsibleScope}
      {...rest}
      style={
        {
          '--radix-accordion-content-height': 'var(--radix-collapsible-content-height)',
          '--radix-accordion-content-width': 'var(--radix-collapsible-content-width)',
          ...(typeof local.style === 'object' ? local.style : {}),
        } as JSX.CSSProperties
      }
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Utils
 * -----------------------------------------------------------------------------------------------*/

function getState(open?: boolean) {
  return open ? 'open' : 'closed';
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = Accordion;
const Item = AccordionItem;
const Header = AccordionHeader;
const Trigger = AccordionTrigger;
const Content = AccordionContent;

export {
  createAccordionScope,
  //
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  //
  Root,
  Item,
  Header,
  Trigger,
  Content,
};
export type {
  AccordionSingleProps,
  AccordionMultipleProps,
  AccordionItemProps,
  AccordionHeaderProps,
  AccordionTriggerProps,
  AccordionContentProps,
};
