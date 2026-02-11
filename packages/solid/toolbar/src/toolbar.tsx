import { type JSX, splitProps } from 'solid-js';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { createContextScope, type Scope } from '@radix-solid-js/context';
import {
  RovingFocusGroup,
  RovingFocusGroupItem,
  createRovingFocusGroupScope,
} from '@radix-solid-js/roving-focus';
import { Separator as SeparatorPrimitive, type SeparatorProps } from '@radix-solid-js/separator';
import {
  ToggleGroup as ToggleGroupPrimitive,
  ToggleGroupItem as ToggleGroupItemPrimitive,
  createToggleGroupScope,
  type ToggleGroupSingleProps,
  type ToggleGroupMultipleProps,
  type ToggleGroupItemProps,
} from '@radix-solid-js/toggle-group';
import { useDirection } from '@radix-solid-js/direction';
import { Primitive, type PrimitiveProps } from '@radix-solid-js/primitive-component';

/* -------------------------------------------------------------------------------------------------
 * Toolbar
 * -----------------------------------------------------------------------------------------------*/

const TOOLBAR_NAME = 'Toolbar';

type ScopedProps<P> = P & { __scopeToolbar?: Scope };
const [createToolbarContext, createToolbarScope] = createContextScope(TOOLBAR_NAME, [
  createRovingFocusGroupScope,
  createToggleGroupScope,
]);
const useRovingFocusGroupScope = createRovingFocusGroupScope();
const useToggleGroupScope = createToggleGroupScope();

type ToolbarContextValue = {
  orientation: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
};
const [ToolbarProvider, useToolbarContext] =
  createToolbarContext<ToolbarContextValue>(TOOLBAR_NAME);

interface ToolbarProps extends PrimitiveProps<'div'> {
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
  dir?: 'ltr' | 'rtl';
}

function Toolbar(inProps: ScopedProps<ToolbarProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeToolbar',
    'orientation',
    'dir',
    'loop',
    'ref',
  ]);

  const orientation = () => local.orientation ?? 'horizontal';
  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeToolbar);
  const direction = useDirection(local.dir);

  return (
    <ToolbarProvider scope={local.__scopeToolbar} orientation={orientation()} dir={direction}>
      <RovingFocusGroup
        asChild
        {...rovingFocusGroupScope}
        orientation={orientation()}
        dir={direction}
        loop={local.loop ?? true}
      >
        <Primitive.div
          role="toolbar"
          aria-orientation={orientation()}
          dir={direction}
          {...rest}
          ref={local.ref}
        />
      </RovingFocusGroup>
    </ToolbarProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToolbarSeparator
 * -----------------------------------------------------------------------------------------------*/

const SEPARATOR_NAME = 'ToolbarSeparator';

interface ToolbarSeparatorProps extends SeparatorProps {}

function ToolbarSeparator(inProps: ScopedProps<ToolbarSeparatorProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeToolbar']);
  const context = useToolbarContext(SEPARATOR_NAME, local.__scopeToolbar);

  return (
    <SeparatorPrimitive
      orientation={context.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToolbarButton
 * -----------------------------------------------------------------------------------------------*/

interface ToolbarButtonProps extends PrimitiveProps<'button'> {}

function ToolbarButton(inProps: ScopedProps<ToolbarButtonProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeToolbar', 'ref']);
  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeToolbar);

  return (
    <RovingFocusGroupItem asChild {...rovingFocusGroupScope} focusable={!rest.disabled}>
      <Primitive.button type="button" {...rest} ref={local.ref} />
    </RovingFocusGroupItem>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToolbarLink
 * -----------------------------------------------------------------------------------------------*/

interface ToolbarLinkProps extends PrimitiveProps<'a'> {
  onKeyDown?: JSX.EventHandlerUnion<HTMLAnchorElement, KeyboardEvent>;
}

function ToolbarLink(inProps: ScopedProps<ToolbarLinkProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeToolbar', 'ref', 'onKeyDown']);
  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeToolbar);

  return (
    <RovingFocusGroupItem asChild {...rovingFocusGroupScope} focusable>
      <Primitive.a
        {...rest}
        ref={local.ref}
        onKeyDown={composeEventHandlers(local.onKeyDown as any, (event: KeyboardEvent) => {
          if (event.key === ' ') (event.currentTarget as HTMLElement).click();
        })}
      />
    </RovingFocusGroupItem>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToolbarToggleGroup
 * -----------------------------------------------------------------------------------------------*/

const TOGGLE_GROUP_NAME = 'ToolbarToggleGroup';

interface ToolbarToggleGroupSingleProps extends Extract<ToggleGroupSingleProps, { type: 'single' }> {
  type: 'single';
}
interface ToolbarToggleGroupMultipleProps extends Extract<ToggleGroupMultipleProps, { type: 'multiple' }> {
  type: 'multiple';
}

function ToolbarToggleGroup(
  inProps: ScopedProps<ToolbarToggleGroupSingleProps | ToolbarToggleGroupMultipleProps>
) {
  const [local, rest] = splitProps(inProps, ['__scopeToolbar']);
  const context = useToolbarContext(TOGGLE_GROUP_NAME, local.__scopeToolbar);
  const toggleGroupScope = useToggleGroupScope(local.__scopeToolbar);

  return (
    <ToggleGroupPrimitive
      data-orientation={context.orientation}
      dir={context.dir}
      {...toggleGroupScope}
      {...(rest as any)}
      rovingFocus={false}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * ToolbarToggleItem
 * -----------------------------------------------------------------------------------------------*/

interface ToolbarToggleItemProps extends ToggleGroupItemProps {}

function ToolbarToggleItem(inProps: ScopedProps<ToolbarToggleItemProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeToolbar']);
  const toggleGroupScope = useToggleGroupScope(local.__scopeToolbar);
  const scope = { __scopeToolbar: local.__scopeToolbar };

  return (
    <ToolbarButton asChild {...scope}>
      <ToggleGroupItemPrimitive {...toggleGroupScope} {...rest} />
    </ToolbarButton>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = Toolbar;
const Separator = ToolbarSeparator;
const Button = ToolbarButton;
const Link = ToolbarLink;
const ToggleGroup = ToolbarToggleGroup;
const ToggleItem = ToolbarToggleItem;

export {
  createToolbarScope,
  //
  Toolbar,
  ToolbarSeparator,
  ToolbarButton,
  ToolbarLink,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  //
  Root,
  Separator,
  Button,
  Link,
  ToggleGroup,
  ToggleItem,
};
export type {
  ToolbarProps,
  ToolbarSeparatorProps,
  ToolbarButtonProps,
  ToolbarLinkProps,
  ToolbarToggleGroupSingleProps,
  ToolbarToggleGroupMultipleProps,
  ToolbarToggleItemProps,
};
