import {
  type JSX,
  createSignal,
  createEffect,
  onCleanup,
  onMount,
  splitProps,
  Show,
} from "solid-js";
import { composeEventHandlers } from "@radix-solid-js/primitive";
import { createCollection } from "@radix-solid-js/collection";
import { mergeRefs } from "@radix-solid-js/compose-refs";
import { createContextScope, type Scope } from "@radix-solid-js/context";
import { useDirection } from "@radix-solid-js/direction";
import { DismissableLayer } from "@radix-solid-js/dismissable-layer";
import { useFocusGuards } from "@radix-solid-js/focus-guards";
import { FocusScope } from "@radix-solid-js/focus-scope";
import { createId } from "@radix-solid-js/id";
import {
  createPopperScope,
  Popper,
  PopperAnchor,
  PopperContent,
  PopperArrow,
} from "@radix-solid-js/popper";
import { Portal as PortalPrimitive } from "@radix-solid-js/portal";
import { Presence } from "@radix-solid-js/presence";
import {
  Primitive,
  dispatchDiscreteCustomEvent,
} from "@radix-solid-js/primitive-component";
import {
  createRovingFocusGroupScope,
  RovingFocusGroup,
  RovingFocusGroupItem,
} from "@radix-solid-js/roving-focus";
import { hideOthers } from "aria-hidden";

type Direction = "ltr" | "rtl";

const SELECTION_KEYS = ["Enter", " "];
const FIRST_KEYS = ["ArrowDown", "PageUp", "Home"];
const LAST_KEYS = ["ArrowUp", "PageDown", "End"];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
const SUB_OPEN_KEYS: Record<Direction, string[]> = {
  ltr: [...SELECTION_KEYS, "ArrowRight"],
  rtl: [...SELECTION_KEYS, "ArrowLeft"],
};
const SUB_CLOSE_KEYS: Record<Direction, string[]> = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"],
};

/* -------------------------------------------------------------------------------------------------
 * Menu
 * -----------------------------------------------------------------------------------------------*/

const MENU_NAME = "Menu";

type ItemData = { disabled: boolean; textValue: string };
const [Collection, useCollection, createCollectionScope] = createCollection<
  HTMLElement,
  ItemData
>(MENU_NAME);

type ScopedProps<P> = P & { __scopeMenu?: Scope };
const [createMenuContext, createMenuScope] = createContextScope(MENU_NAME, [
  createCollectionScope,
  createPopperScope,
  createRovingFocusGroupScope,
]);
const usePopperScope = createPopperScope();
const useRovingFocusGroupScope = createRovingFocusGroupScope();

type MenuContextValue = {
  open: boolean;
  onOpenChange(open: boolean): void;
  content: HTMLDivElement | null;
  onContentChange(content: HTMLDivElement | null): void;
};

const [MenuProvider, useMenuContext] =
  createMenuContext<MenuContextValue>(MENU_NAME);

type MenuRootContextValue = {
  onClose(): void;
  isUsingKeyboard: boolean;
  onIsUsingKeyboardChange(value: boolean): void;
  dir: Direction;
  modal: boolean;
};

const [MenuRootProvider, useMenuRootContext] =
  createMenuContext<MenuRootContextValue>(MENU_NAME);

interface MenuProps {
  children?: JSX.Element;
  open?: boolean;
  onOpenChange?(open: boolean): void;
  dir?: Direction;
  modal?: boolean;
}

function Menu(props: ScopedProps<MenuProps>) {
  const [local] = splitProps(props, [
    "__scopeMenu",
    "children",
    "open",
    "onOpenChange",
    "dir",
    "modal",
  ]);

  const popperScope = usePopperScope(local.__scopeMenu);
  const [content, setContent] = createSignal<HTMLDivElement | null>(null);
  const [isUsingKeyboard, setIsUsingKeyboard] = createSignal(false);
  const direction = useDirection(local.dir);

  const open = () => local.open ?? false;
  const modal = () => local.modal ?? true;
  const handleOpenChange = (value: boolean) => local.onOpenChange?.(value);

  createEffect(() => {
    const handleKeyDown = () => {
      setIsUsingKeyboard(true);
      document.addEventListener("pointerdown", handlePointer, {
        capture: true,
        once: true,
      });
      document.addEventListener("pointermove", handlePointer, {
        capture: true,
        once: true,
      });
    };
    const handlePointer = () => setIsUsingKeyboard(false);
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("pointerdown", handlePointer, {
        capture: true,
      });
      document.removeEventListener("pointermove", handlePointer, {
        capture: true,
      });
    });
  });

  return (
    <Popper {...popperScope}>
      <MenuProvider
        scope={local.__scopeMenu}
        open={open()}
        onOpenChange={handleOpenChange}
        content={content()}
        onContentChange={setContent}
      >
        <MenuRootProvider
          scope={local.__scopeMenu}
          onClose={() => handleOpenChange(false)}
          isUsingKeyboard={isUsingKeyboard()}
          onIsUsingKeyboardChange={setIsUsingKeyboard}
          dir={direction as unknown as Direction}
          modal={modal()}
        >
          {local.children}
        </MenuRootProvider>
      </MenuProvider>
    </Popper>
  );
}

Menu.displayName = MENU_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuAnchor
 * -----------------------------------------------------------------------------------------------*/

const ANCHOR_NAME = "MenuAnchor";

interface MenuAnchorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  virtualRef?: { getBoundingClientRect(): DOMRect };
  ref?: (el: HTMLElement) => void;
}

function MenuAnchor(inProps: ScopedProps<MenuAnchorProps>) {
  const [local, rest] = splitProps(inProps, ["__scopeMenu", "ref"]);
  const popperScope = usePopperScope(local.__scopeMenu);
  return <PopperAnchor {...popperScope} {...rest} ref={local.ref} />;
}

MenuAnchor.displayName = ANCHOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = "MenuPortal";

type PortalContextValue = { forceMount?: true };
const [PortalProvider, usePortalContext] =
  createMenuContext<PortalContextValue>(PORTAL_NAME, {
    forceMount: undefined,
  });

interface MenuPortalProps {
  children?: JSX.Element;
  container?: Element | DocumentFragment | null;
  forceMount?: true;
}

function MenuPortal(props: ScopedProps<MenuPortalProps>) {
  const [local] = splitProps(props, [
    "__scopeMenu",
    "forceMount",
    "children",
    "container",
  ]);
  const context = useMenuContext(PORTAL_NAME, local.__scopeMenu);
  return (
    <PortalProvider scope={local.__scopeMenu} forceMount={local.forceMount}>
      <Presence present={local.forceMount || context.open}>
        <PortalPrimitive container={local.container}>
          {local.children}
        </PortalPrimitive>
      </Presence>
    </PortalProvider>
  );
}

MenuPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "MenuContent";

type MenuContentContextValue = {
  onItemEnter(event: PointerEvent): void;
  onItemLeave(event: PointerEvent): void;
  onTriggerLeave(event: PointerEvent): void;
  searchRef: string;
  onSearchChange(value: string): void;
  pointerGraceTimerRef: number;
  onPointerGraceTimerChange(value: number): void;
  onPointerGraceIntentChange(intent: GraceIntent | null): void;
};

const [MenuContentProvider, useMenuContentContext] =
  createMenuContext<MenuContentContextValue>(CONTENT_NAME);

interface MenuContentProps extends MenuContentImplProps {
  forceMount?: true;
}

function MenuContent(inProps: ScopedProps<MenuContentProps>) {
  const [local, rest] = splitProps(inProps, ["__scopeMenu", "forceMount"]);
  const portalContext = usePortalContext(CONTENT_NAME, local.__scopeMenu);
  const context = useMenuContext(CONTENT_NAME, local.__scopeMenu);
  const rootContext = useMenuRootContext(CONTENT_NAME, local.__scopeMenu);
  const forceMount = () => local.forceMount ?? portalContext.forceMount;

  return (
    <Collection.Provider scope={local.__scopeMenu}>
      <Presence present={forceMount() || context.open}>
        <Collection.Slot scope={local.__scopeMenu}>
          <Show
            when={rootContext.modal}
            fallback={
              <MenuRootContentNonModal
                {...rest}
                __scopeMenu={local.__scopeMenu}
              />
            }
          >
            <MenuRootContentModal {...rest} __scopeMenu={local.__scopeMenu} />
          </Show>
        </Collection.Slot>
      </Presence>
    </Collection.Provider>
  );
}

MenuContent.displayName = CONTENT_NAME;

/* ---------------------------------------------------------------------------------------------- */

interface MenuRootContentTypeProps extends Omit<
  MenuContentImplProps,
  | "onOpenAutoFocus"
  | "onDismiss"
  | "disableOutsidePointerEvents"
  | "disableOutsideScroll"
  | "trapFocus"
> {}

function MenuRootContentModal(inProps: ScopedProps<MenuRootContentTypeProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeMenu",
    "ref",
    "onFocusOutside",
  ]);
  const context = useMenuContext(CONTENT_NAME, local.__scopeMenu);
  let contentRef: HTMLDivElement | undefined;

  // Hide everything from ARIA except the MenuContent
  createEffect(() => {
    if (contentRef) {
      const cleanup = hideOthers(contentRef);
      onCleanup(() => cleanup?.());
    }
  });

  return (
    <MenuContentImpl
      {...rest}
      __scopeMenu={local.__scopeMenu}
      ref={mergeRefs(local.ref, (el: HTMLElement) => {
        contentRef = el as HTMLDivElement;
      })}
      trapFocus={context.open}
      disableOutsidePointerEvents={context.open}
      disableOutsideScroll
      onFocusOutside={composeEventHandlers(local.onFocusOutside, (event: any) =>
        event.preventDefault()
      )}
      onDismiss={() => context.onOpenChange(false)}
    />
  );
}

function MenuRootContentNonModal(
  inProps: ScopedProps<MenuRootContentTypeProps>
) {
  const [local, rest] = splitProps(inProps, ["__scopeMenu"]);
  const context = useMenuContext(CONTENT_NAME, local.__scopeMenu);
  return (
    <MenuContentImpl
      {...rest}
      __scopeMenu={local.__scopeMenu}
      trapFocus={false}
      disableOutsidePointerEvents={false}
      disableOutsideScroll={false}
      onDismiss={() => context.onOpenChange(false)}
    />
  );
}

/* ---------------------------------------------------------------------------------------------- */

interface MenuContentImplProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Element | Element[] | null;
  collisionPadding?:
    | number
    | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  arrowPadding?: number;
  sticky?: "partial" | "always";
  hideWhenDetached?: boolean;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
  disableOutsidePointerEvents?: boolean;
  disableOutsideScroll?: boolean;
  trapFocus?: boolean;
  loop?: boolean;
  onEntryFocus?: (event: Event) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: any) => void;
  onFocusOutside?: (event: any) => void;
  onInteractOutside?: (event: any) => void;
  onDismiss?: () => void;
}

function MenuContentImpl(inProps: ScopedProps<MenuContentImplProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeMenu",
    "ref",
    "loop",
    "trapFocus",
    "onOpenAutoFocus",
    "onCloseAutoFocus",
    "disableOutsidePointerEvents",
    "disableOutsideScroll",
    "onEntryFocus",
    "onEscapeKeyDown",
    "onPointerDownOutside",
    "onFocusOutside",
    "onInteractOutside",
    "onDismiss",
    "side",
    "sideOffset",
    "align",
    "alignOffset",
    "avoidCollisions",
    "collisionBoundary",
    "collisionPadding",
    "arrowPadding",
    "sticky",
    "hideWhenDetached",
    "style",
    "onKeyDown",
    "onBlur",
    "onPointerMove",
  ]);

  const context = useMenuContext(CONTENT_NAME, local.__scopeMenu);
  const rootContext = useMenuRootContext(CONTENT_NAME, local.__scopeMenu);
  const popperScope = usePopperScope(local.__scopeMenu);
  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeMenu);
  const getItems = useCollection(local.__scopeMenu);

  const [currentItemId, setCurrentItemId] = createSignal<string | null>(null);
  let contentRef: HTMLDivElement | undefined;
  let timerRef = 0;
  let searchRef = "";
  let pointerGraceTimerRef = 0;
  let pointerGraceIntentRef: GraceIntent | null = null;
  let pointerDirRef: Side = "right";
  let lastPointerXRef = 0;

  // Prevent body scroll when disableOutsideScroll is true (e.g., modal context menus)
  createEffect(() => {
    if (local.disableOutsideScroll) {
      const body = document.body;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      const originalOverflow = body.style.overflow;
      const originalPaddingRight = body.style.paddingRight;

      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }

      onCleanup(() => {
        body.style.overflow = originalOverflow;
        body.style.paddingRight = originalPaddingRight;
      });
    }
  });

  const handleTypeaheadSearch = (key: string) => {
    const search = searchRef + key;
    const items = getItems().filter((item: any) => !item.disabled);
    const currentItem = document.activeElement;
    const currentMatch = items.find(
      (item: any) => item.ref === currentItem
    )?.textValue;
    const values = items.map((item: any) => item.textValue);
    const nextMatch = getNextMatch(values, search, currentMatch);
    const newItem = items.find(
      (item: any) => item.textValue === nextMatch
    )?.ref;

    // Reset searchRef 1 second after it was last updated
    (function updateSearch(value: string) {
      searchRef = value;
      window.clearTimeout(timerRef);
      if (value !== "")
        timerRef = window.setTimeout(() => updateSearch(""), 1000);
    })(search);

    if (newItem) {
      setTimeout(() => (newItem as HTMLElement).focus());
    }
  };

  onCleanup(() => window.clearTimeout(timerRef));

  // Make sure the whole tree has focus guards
  useFocusGuards();

  const isPointerMovingToSubmenu = (event: PointerEvent) => {
    const isMovingTowards = pointerDirRef === pointerGraceIntentRef?.side;
    return (
      isMovingTowards &&
      isPointerInGraceArea(event, pointerGraceIntentRef?.area)
    );
  };

  return (
    <MenuContentProvider
      scope={local.__scopeMenu}
      searchRef={searchRef}
      onSearchChange={(value: string) => {
        searchRef = value;
      }}
      onItemEnter={(event) => {
        if (isPointerMovingToSubmenu(event)) event.preventDefault();
      }}
      onItemLeave={(event) => {
        if (isPointerMovingToSubmenu(event)) return;
        contentRef?.focus();
        setCurrentItemId(null);
      }}
      onTriggerLeave={(event) => {
        if (isPointerMovingToSubmenu(event)) event.preventDefault();
      }}
      pointerGraceTimerRef={pointerGraceTimerRef}
      onPointerGraceTimerChange={(value: number) => {
        pointerGraceTimerRef = value;
      }}
      onPointerGraceIntentChange={(intent) => {
        pointerGraceIntentRef = intent;
      }}
    >
      <FocusScope
        trapped={local.trapFocus}
        onMountAutoFocus={composeEventHandlers(
          local.onOpenAutoFocus,
          (event: Event) => {
            // when opening, explicitly focus the content area only and leave
            // `onEntryFocus` in control of focusing first item
            event.preventDefault();
            contentRef?.focus({ preventScroll: true });
          }
        )}
        onUnmountAutoFocus={local.onCloseAutoFocus}
      >
        <DismissableLayer
          asChild
          disableOutsidePointerEvents={local.disableOutsidePointerEvents}
          onEscapeKeyDown={local.onEscapeKeyDown}
          onPointerDownOutside={local.onPointerDownOutside}
          onFocusOutside={local.onFocusOutside}
          onInteractOutside={local.onInteractOutside}
          onDismiss={local.onDismiss}
        >
          <RovingFocusGroup
            asChild
            {...rovingFocusGroupScope}
            dir={rootContext.dir}
            orientation="vertical"
            loop={local.loop ?? false}
            currentTabStopId={currentItemId()}
            onCurrentTabStopIdChange={setCurrentItemId}
            onEntryFocus={composeEventHandlers(
              local.onEntryFocus,
              (event: Event) => {
                // only focus first item when using keyboard
                if (!rootContext.isUsingKeyboard) event.preventDefault();
              }
            )}
            preventScrollOnEntryFocus
          >
            <PopperContent
              role="menu"
              aria-orientation="vertical"
              data-state={getOpenState(context.open)}
              data-radix-menu-content=""
              dir={rootContext.dir}
              {...popperScope}
              {...rest}
              ref={mergeRefs(local.ref, (el: HTMLElement) => {
                contentRef = el as HTMLDivElement;
                context.onContentChange(el as HTMLDivElement);
              })}
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
              style={
                {
                  outline: "none",
                  ...(typeof local.style === "object" ? local.style : {}),
                  "--radix-menu-content-transform-origin":
                    "var(--radix-popper-transform-origin)",
                  "--radix-menu-content-available-width":
                    "var(--radix-popper-available-width)",
                  "--radix-menu-content-available-height":
                    "var(--radix-popper-available-height)",
                  "--radix-menu-trigger-width":
                    "var(--radix-popper-anchor-width)",
                  "--radix-menu-trigger-height":
                    "var(--radix-popper-anchor-height)",
                } as JSX.CSSProperties
              }
              onKeyDown={composeEventHandlers(
                local.onKeyDown as any,
                (event: KeyboardEvent) => {
                  // submenu key events bubble through portals. We only care about keys in this menu.
                  const target = event.target as HTMLElement;
                  const isKeyDownInside =
                    target.closest("[data-radix-menu-content]") ===
                    event.currentTarget;
                  const isModifierKey =
                    event.ctrlKey || event.altKey || event.metaKey;
                  const isCharacterKey = event.key.length === 1;
                  if (isKeyDownInside) {
                    // menus should not be navigated using tab key so we prevent it
                    if (event.key === "Tab") event.preventDefault();
                    if (!isModifierKey && isCharacterKey)
                      handleTypeaheadSearch(event.key);
                  }
                  // focus first/last item based on key pressed
                  const content = contentRef;
                  if (event.target !== content) return;
                  if (!FIRST_LAST_KEYS.includes(event.key)) return;
                  event.preventDefault();
                  const items = getItems().filter(
                    (item: any) => !item.disabled
                  );
                  const candidateNodes = items.map((item: any) => item.ref);
                  if (LAST_KEYS.includes(event.key)) candidateNodes.reverse();
                  focusFirst(candidateNodes);
                }
              )}
              onBlur={composeEventHandlers(
                local.onBlur as any,
                (event: FocusEvent) => {
                  // clear search buffer when leaving the menu
                  if (
                    !(event.currentTarget as HTMLElement).contains(
                      event.target as Node
                    )
                  ) {
                    window.clearTimeout(timerRef);
                    searchRef = "";
                  }
                }
              )}
              onPointerMove={composeEventHandlers(
                local.onPointerMove as any,
                whenMouse((event: PointerEvent) => {
                  const target = event.target as HTMLElement;
                  const pointerXHasChanged = lastPointerXRef !== event.clientX;

                  if (
                    (event.currentTarget as HTMLElement).contains(target) &&
                    pointerXHasChanged
                  ) {
                    const newDir =
                      event.clientX > lastPointerXRef ? "right" : "left";
                    pointerDirRef = newDir;
                    lastPointerXRef = event.clientX;
                  }
                })
              )}
            />
          </RovingFocusGroup>
        </DismissableLayer>
      </FocusScope>
    </MenuContentProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * MenuGroup
 * -----------------------------------------------------------------------------------------------*/

const GROUP_NAME = "MenuGroup";

interface MenuGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
}

function MenuGroup(inProps: ScopedProps<MenuGroupProps>) {
  const [local, rest] = splitProps(inProps, ["__scopeMenu", "ref"]);
  return <Primitive.div role="group" {...rest} ref={local.ref} />;
}

MenuGroup.displayName = GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuLabel
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = "MenuLabel";

interface MenuLabelProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
}

function MenuLabel(inProps: ScopedProps<MenuLabelProps>) {
  const [local, rest] = splitProps(inProps, ["__scopeMenu", "ref"]);
  return <Primitive.div {...rest} ref={local.ref} />;
}

MenuLabel.displayName = LABEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = "MenuItem";
const ITEM_SELECT = "menu.itemSelect";

interface MenuItemProps extends Omit<MenuItemImplProps, "onSelect"> {
  onSelect?: (event: Event) => void;
}

function MenuItem(inProps: ScopedProps<MenuItemProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeMenu",
    "disabled",
    "onSelect",
    "ref",
    "onClick",
    "onPointerDown",
    "onPointerUp",
    "onKeyDown",
  ]);
  const rootContext = useMenuRootContext(ITEM_NAME, local.__scopeMenu);
  const contentContext = useMenuContentContext(ITEM_NAME, local.__scopeMenu);
  let itemRef: HTMLDivElement | undefined;
  let isPointerDownRef = false;
  const disabled = () => local.disabled ?? false;

  const handleSelect = () => {
    const menuItem = itemRef;
    if (!disabled() && menuItem) {
      const itemSelectEvent = new CustomEvent(ITEM_SELECT, {
        bubbles: true,
        cancelable: true,
      });
      menuItem.addEventListener(
        ITEM_SELECT,
        (event) => local.onSelect?.(event),
        { once: true }
      );
      dispatchDiscreteCustomEvent(menuItem, itemSelectEvent);
      if (itemSelectEvent.defaultPrevented) {
        isPointerDownRef = false;
      } else {
        rootContext.onClose();
      }
    }
  };

  return (
    <MenuItemImpl
      {...rest}
      __scopeMenu={local.__scopeMenu}
      ref={mergeRefs(local.ref, (el: HTMLElement) => {
        itemRef = el as HTMLDivElement;
      })}
      disabled={disabled()}
      onClick={composeEventHandlers(local.onClick as any, handleSelect)}
      onPointerDown={composeEventHandlers(local.onPointerDown as any, () => {
        isPointerDownRef = true;
      })}
      onPointerUp={composeEventHandlers(
        local.onPointerUp as any,
        (event: PointerEvent) => {
          if (!isPointerDownRef) (event.currentTarget as HTMLElement)?.click();
        }
      )}
      onKeyDown={composeEventHandlers(
        local.onKeyDown as any,
        (event: KeyboardEvent) => {
          const isTypingAhead = contentContext.searchRef !== "";
          if (disabled() || (isTypingAhead && event.key === " ")) return;
          if (SELECTION_KEYS.includes(event.key)) {
            (event.currentTarget as HTMLElement).click();
            event.preventDefault();
          }
        }
      )}
    />
  );
}

MenuItem.displayName = ITEM_NAME;

/* ---------------------------------------------------------------------------------------------- */

interface MenuItemImplProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
  disabled?: boolean;
  textValue?: string;
}

function MenuItemImpl(inProps: ScopedProps<MenuItemImplProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeMenu",
    "disabled",
    "textValue",
    "ref",
    "onPointerMove",
    "onPointerLeave",
    "onFocus",
    "onBlur",
  ]);

  const contentContext = useMenuContentContext(ITEM_NAME, local.__scopeMenu);
  const rovingFocusGroupScope = useRovingFocusGroupScope(local.__scopeMenu);
  let itemRef: HTMLDivElement | undefined;
  const [isFocused, setIsFocused] = createSignal(false);
  const [textContent, setTextContent] = createSignal("");
  const disabled = () => local.disabled ?? false;

  // get the item's textContent as default strategy for typeahead textValue
  onMount(() => {
    if (itemRef) {
      setTextContent((itemRef.textContent ?? "").trim());
    }
  });

  return (
    <Collection.ItemSlot
      scope={local.__scopeMenu}
      disabled={disabled()}
      textValue={local.textValue ?? textContent()}
    >
      <RovingFocusGroupItem
        asChild
        {...rovingFocusGroupScope}
        focusable={!disabled()}
      >
        <Primitive.div
          role="menuitem"
          data-highlighted={isFocused() ? "" : undefined}
          aria-disabled={disabled() || undefined}
          data-disabled={disabled() ? "" : undefined}
          {...rest}
          ref={mergeRefs(local.ref, (el: HTMLElement) => {
            itemRef = el as HTMLDivElement;
          })}
          onPointerMove={composeEventHandlers(
            local.onPointerMove as any,
            whenMouse((event: PointerEvent) => {
              if (disabled()) {
                contentContext.onItemLeave(event);
              } else {
                contentContext.onItemEnter(event);
                if (!event.defaultPrevented) {
                  const item = event.currentTarget as HTMLElement;
                  item.focus({ preventScroll: true });
                }
              }
            })
          )}
          onPointerLeave={composeEventHandlers(
            local.onPointerLeave as any,
            whenMouse((event: PointerEvent) =>
              contentContext.onItemLeave(event)
            )
          )}
          onFocus={composeEventHandlers(local.onFocus as any, () =>
            setIsFocused(true)
          )}
          onBlur={composeEventHandlers(local.onBlur as any, () =>
            setIsFocused(false)
          )}
        />
      </RovingFocusGroupItem>
    </Collection.ItemSlot>
  );
}

/* -------------------------------------------------------------------------------------------------
 * MenuCheckboxItem
 * -----------------------------------------------------------------------------------------------*/

const CHECKBOX_ITEM_NAME = "MenuCheckboxItem";

type CheckedState = boolean | "indeterminate";

interface MenuCheckboxItemProps extends MenuItemProps {
  checked?: CheckedState;
  onCheckedChange?: (checked: boolean) => void;
}

function MenuCheckboxItem(inProps: ScopedProps<MenuCheckboxItemProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeMenu",
    "checked",
    "onCheckedChange",
    "onSelect",
  ]);
  const checked = () => local.checked ?? false;

  return (
    <ItemIndicatorProvider scope={local.__scopeMenu} checked={checked()}>
      <MenuItem
        role="menuitemcheckbox"
        aria-checked={isIndeterminate(checked()) ? "mixed" : checked() as boolean}
        {...(rest as any)}
        __scopeMenu={local.__scopeMenu}
        data-state={getCheckedState(checked())}
        onSelect={composeEventHandlers(
          local.onSelect,
          () =>
            local.onCheckedChange?.(
              isIndeterminate(checked()) ? true : !checked()
            ),
          { checkForDefaultPrevented: false }
        )}
      />
    </ItemIndicatorProvider>
  );
}

MenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuRadioGroup
 * -----------------------------------------------------------------------------------------------*/

const RADIO_GROUP_NAME = "MenuRadioGroup";

type RadioGroupContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const [RadioGroupProvider, useRadioGroupContext] =
  createMenuContext<RadioGroupContextValue>(RADIO_GROUP_NAME, {
    value: undefined,
    onValueChange: () => {},
  });

interface MenuRadioGroupProps extends MenuGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

function MenuRadioGroup(inProps: ScopedProps<MenuRadioGroupProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeMenu",
    "value",
    "onValueChange",
  ]);
  return (
    <RadioGroupProvider
      scope={local.__scopeMenu}
      value={local.value}
      onValueChange={local.onValueChange}
    >
      <MenuGroup {...rest} __scopeMenu={local.__scopeMenu} />
    </RadioGroupProvider>
  );
}

MenuRadioGroup.displayName = RADIO_GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuRadioItem
 * -----------------------------------------------------------------------------------------------*/

const RADIO_ITEM_NAME = "MenuRadioItem";

interface MenuRadioItemProps extends MenuItemProps {
  value: string;
}

function MenuRadioItem(inProps: ScopedProps<MenuRadioItemProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeMenu",
    "value",
    "onSelect",
  ]);
  const context = useRadioGroupContext(RADIO_ITEM_NAME, local.__scopeMenu);
  const checked = () => local.value === context.value;

  return (
    <ItemIndicatorProvider scope={local.__scopeMenu} checked={checked()}>
      <MenuItem
        role="menuitemradio"
        aria-checked={checked()}
        {...rest}
        __scopeMenu={local.__scopeMenu}
        data-state={getCheckedState(checked())}
        onSelect={composeEventHandlers(
          local.onSelect,
          () => context.onValueChange?.(local.value),
          { checkForDefaultPrevented: false }
        )}
      />
    </ItemIndicatorProvider>
  );
}

MenuRadioItem.displayName = RADIO_ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuItemIndicator
 * -----------------------------------------------------------------------------------------------*/

const ITEM_INDICATOR_NAME = "MenuItemIndicator";

type ItemIndicatorContextValue = { checked: CheckedState };

const [ItemIndicatorProvider, useItemIndicatorContext] =
  createMenuContext<ItemIndicatorContextValue>(ITEM_INDICATOR_NAME, {
    checked: false,
  });

interface MenuItemIndicatorProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  ref?: (el: HTMLElement) => void;
  forceMount?: true;
}

function MenuItemIndicator(inProps: ScopedProps<MenuItemIndicatorProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeMenu",
    "forceMount",
    "ref",
  ]);
  const indicatorContext = useItemIndicatorContext(
    ITEM_INDICATOR_NAME,
    local.__scopeMenu
  );
  return (
    <Presence
      present={
        local.forceMount ||
        isIndeterminate(indicatorContext.checked) ||
        indicatorContext.checked === true
      }
    >
      <Primitive.span
        {...rest}
        ref={local.ref}
        data-state={getCheckedState(indicatorContext.checked)}
      />
    </Presence>
  );
}

MenuItemIndicator.displayName = ITEM_INDICATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuSeparator
 * -----------------------------------------------------------------------------------------------*/

const SEPARATOR_NAME = "MenuSeparator";

interface MenuSeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLElement) => void;
}

function MenuSeparator(inProps: ScopedProps<MenuSeparatorProps>) {
  const [local, rest] = splitProps(inProps, ["__scopeMenu", "ref"]);
  return (
    <Primitive.div
      role="separator"
      aria-orientation="horizontal"
      {...rest}
      ref={local.ref}
    />
  );
}

MenuSeparator.displayName = SEPARATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = "MenuArrow";

interface MenuArrowProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  ref?: (el: SVGSVGElement) => void;
}

function MenuArrow(inProps: ScopedProps<MenuArrowProps>) {
  const [local, rest] = splitProps(inProps, ["__scopeMenu"]);
  const popperScope = usePopperScope(local.__scopeMenu);
  return <PopperArrow {...popperScope} {...rest} />;
}

MenuArrow.displayName = ARROW_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuSub
 * -----------------------------------------------------------------------------------------------*/

const SUB_NAME = "MenuSub";

type MenuSubContextValue = {
  contentId: string;
  triggerId: string;
  trigger: HTMLDivElement | null;
  onTriggerChange(trigger: HTMLDivElement | null): void;
};

const [MenuSubProvider, useMenuSubContext] =
  createMenuContext<MenuSubContextValue>(SUB_NAME);

interface MenuSubProps {
  children?: JSX.Element;
  open?: boolean;
  onOpenChange?(open: boolean): void;
}

function MenuSub(props: ScopedProps<MenuSubProps>) {
  const [local] = splitProps(props, [
    "__scopeMenu",
    "children",
    "open",
    "onOpenChange",
  ]);

  const parentMenuContext = useMenuContext(SUB_NAME, local.__scopeMenu);
  const popperScope = usePopperScope(local.__scopeMenu);
  const [trigger, setTrigger] = createSignal<HTMLDivElement | null>(null);
  const [content, setContent] = createSignal<HTMLDivElement | null>(null);
  const open = () => local.open ?? false;
  const handleOpenChange = (value: boolean) => local.onOpenChange?.(value);

  // Prevent the parent menu from reopening with open submenus.
  createEffect(() => {
    if (parentMenuContext.open === false) handleOpenChange(false);
    onCleanup(() => handleOpenChange(false));
  });

  return (
    <Popper {...popperScope}>
      <MenuProvider
        scope={local.__scopeMenu}
        open={open()}
        onOpenChange={handleOpenChange}
        content={content()}
        onContentChange={setContent}
      >
        <MenuSubProvider
          scope={local.__scopeMenu}
          contentId={createId()}
          triggerId={createId()}
          trigger={trigger()}
          onTriggerChange={setTrigger}
        >
          {local.children}
        </MenuSubProvider>
      </MenuProvider>
    </Popper>
  );
}

MenuSub.displayName = SUB_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuSubTrigger
 * -----------------------------------------------------------------------------------------------*/

const SUB_TRIGGER_NAME = "MenuSubTrigger";

interface MenuSubTriggerProps extends MenuItemImplProps {}

function MenuSubTrigger(inProps: ScopedProps<MenuSubTriggerProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeMenu",
    "ref",
    "onClick",
    "onPointerMove",
    "onPointerLeave",
    "onKeyDown",
  ]);

  const context = useMenuContext(SUB_TRIGGER_NAME, local.__scopeMenu);
  const rootContext = useMenuRootContext(SUB_TRIGGER_NAME, local.__scopeMenu);
  const subContext = useMenuSubContext(SUB_TRIGGER_NAME, local.__scopeMenu);
  const contentContext = useMenuContentContext(
    SUB_TRIGGER_NAME,
    local.__scopeMenu
  );
  let openTimerRef: number | null = null;

  const clearOpenTimer = () => {
    if (openTimerRef) window.clearTimeout(openTimerRef);
    openTimerRef = null;
  };

  onCleanup(() => {
    clearOpenTimer();
    window.clearTimeout(contentContext.pointerGraceTimerRef);
    contentContext.onPointerGraceIntentChange(null);
  });

  return (
    <MenuAnchor __scopeMenu={local.__scopeMenu}>
      <MenuItemImpl
        id={subContext.triggerId}
        aria-haspopup="menu"
        aria-expanded={context.open}
        aria-controls={subContext.contentId}
        data-state={getOpenState(context.open)}
        {...rest}
        __scopeMenu={local.__scopeMenu}
        ref={mergeRefs(local.ref, (el: HTMLElement) =>
          subContext.onTriggerChange(el as HTMLDivElement)
        )}
        onClick={composeEventHandlers(
          local.onClick as any,
          (event: MouseEvent) => {
            if (rest.disabled || event.defaultPrevented) return;
            (event.currentTarget as HTMLElement).focus();
            if (!context.open) context.onOpenChange(true);
          }
        )}
        onPointerMove={composeEventHandlers(
          local.onPointerMove as any,
          whenMouse((event: PointerEvent) => {
            contentContext.onItemEnter(event);
            if (event.defaultPrevented) return;
            if (!rest.disabled && !context.open && !openTimerRef) {
              contentContext.onPointerGraceIntentChange(null);
              openTimerRef = window.setTimeout(() => {
                context.onOpenChange(true);
                clearOpenTimer();
              }, 100);
            }
          })
        )}
        onPointerLeave={composeEventHandlers(
          local.onPointerLeave as any,
          whenMouse((event: PointerEvent) => {
            clearOpenTimer();

            const contentRect = context.content?.getBoundingClientRect();
            if (contentRect) {
              const side = context.content?.dataset.side as Side;
              const rightSide = side === "right";
              const bleed = rightSide ? -5 : +5;
              const contentNearEdge = contentRect[rightSide ? "left" : "right"];
              const contentFarEdge = contentRect[rightSide ? "right" : "left"];

              contentContext.onPointerGraceIntentChange({
                area: [
                  { x: event.clientX + bleed, y: event.clientY },
                  { x: contentNearEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.bottom },
                  { x: contentNearEdge, y: contentRect.bottom },
                ],
                side,
              });

              window.clearTimeout(contentContext.pointerGraceTimerRef);
              contentContext.onPointerGraceTimerChange(
                window.setTimeout(
                  () => contentContext.onPointerGraceIntentChange(null),
                  300
                )
              );
            } else {
              contentContext.onTriggerLeave(event);
              if (event.defaultPrevented) return;
              contentContext.onPointerGraceIntentChange(null);
            }
          })
        )}
        onKeyDown={composeEventHandlers(
          local.onKeyDown as any,
          (event: KeyboardEvent) => {
            const isTypingAhead = contentContext.searchRef !== "";
            if (rest.disabled || (isTypingAhead && event.key === " ")) return;
            if (SUB_OPEN_KEYS[rootContext.dir].includes(event.key)) {
              context.onOpenChange(true);
              context.content?.focus();
              event.preventDefault();
            }
          }
        )}
      />
    </MenuAnchor>
  );
}

MenuSubTrigger.displayName = SUB_TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * MenuSubContent
 * -----------------------------------------------------------------------------------------------*/

const SUB_CONTENT_NAME = "MenuSubContent";

interface MenuSubContentProps extends Omit<
  MenuContentImplProps,
  | "onOpenAutoFocus"
  | "onDismiss"
  | "disableOutsidePointerEvents"
  | "disableOutsideScroll"
  | "trapFocus"
  | "onCloseAutoFocus"
  | "onEntryFocus"
  | "side"
  | "align"
> {
  forceMount?: true;
}

function MenuSubContent(inProps: ScopedProps<MenuSubContentProps>) {
  const [local, rest] = splitProps(inProps, [
    "__scopeMenu",
    "forceMount",
    "ref",
    "onFocusOutside",
    "onEscapeKeyDown",
    "onKeyDown",
  ]);

  const portalContext = usePortalContext(CONTENT_NAME, local.__scopeMenu);
  const context = useMenuContext(CONTENT_NAME, local.__scopeMenu);
  const rootContext = useMenuRootContext(CONTENT_NAME, local.__scopeMenu);
  const subContext = useMenuSubContext(SUB_CONTENT_NAME, local.__scopeMenu);
  const forceMount = () => local.forceMount ?? portalContext.forceMount;
  let contentRef: HTMLDivElement | undefined;

  return (
    <Collection.Provider scope={local.__scopeMenu}>
      <Presence present={forceMount() || context.open}>
        <Collection.Slot scope={local.__scopeMenu}>
          <MenuContentImpl
            id={subContext.contentId}
            aria-labelledby={subContext.triggerId}
            {...rest}
            __scopeMenu={local.__scopeMenu}
            ref={mergeRefs(local.ref, (el: HTMLElement) => {
              contentRef = el as HTMLDivElement;
            })}
            align="start"
            side={rootContext.dir === "rtl" ? "left" : "right"}
            disableOutsidePointerEvents={false}
            disableOutsideScroll={false}
            trapFocus={false}
            onOpenAutoFocus={(event: Event) => {
              // when opening a submenu, focus content for keyboard users only
              if (rootContext.isUsingKeyboard) contentRef?.focus();
              event.preventDefault();
            }}
            onCloseAutoFocus={(event: Event) => event.preventDefault()}
            onFocusOutside={composeEventHandlers(
              local.onFocusOutside,
              (event: any) => {
                if (event.target !== subContext.trigger)
                  context.onOpenChange(false);
              }
            )}
            onEscapeKeyDown={composeEventHandlers(
              local.onEscapeKeyDown,
              (event: KeyboardEvent) => {
                rootContext.onClose();
                event.preventDefault();
              }
            )}
            onKeyDown={composeEventHandlers(
              local.onKeyDown as any,
              (event: KeyboardEvent) => {
                const isKeyDownInside = (
                  event.currentTarget as HTMLElement
                ).contains(event.target as HTMLElement);
                const isCloseKey = SUB_CLOSE_KEYS[rootContext.dir].includes(
                  event.key
                );
                if (isKeyDownInside && isCloseKey) {
                  context.onOpenChange(false);
                  subContext.trigger?.focus();
                  event.preventDefault();
                }
              }
            )}
          />
        </Collection.Slot>
      </Presence>
    </Collection.Provider>
  );
}

MenuSubContent.displayName = SUB_CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * Utility functions
 * -----------------------------------------------------------------------------------------------*/

function getOpenState(open: boolean) {
  return open ? "open" : "closed";
}

function isIndeterminate(checked?: CheckedState): checked is "indeterminate" {
  return checked === "indeterminate";
}

function getCheckedState(checked: CheckedState) {
  return isIndeterminate(checked)
    ? "indeterminate"
    : checked
      ? "checked"
      : "unchecked";
}

function focusFirst(candidates: HTMLElement[]) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus();
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}

/**
 * Wraps an array around itself at a given start index
 * Example: `wrapArray(['a', 'b', 'c', 'd'], 2) === ['c', 'd', 'a', 'b']`
 */
function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>(
    (_, index) => array[(startIndex + index) % array.length]!
  );
}

/**
 * Typeahead matching logic. Takes in all the values, the search and the current match,
 * and returns the next match (or undefined).
 */
function getNextMatch(values: string[], search: string, currentMatch?: string) {
  const isRepeated =
    search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0]! : search;
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrappedValues = wrapArray(values, Math.max(currentMatchIndex, 0));
  const excludeCurrentMatch = normalizedSearch.length === 1;
  if (excludeCurrentMatch)
    wrappedValues = wrappedValues.filter((v) => v !== currentMatch);
  const nextMatch = wrappedValues.find((value) =>
    value.toLowerCase().startsWith(normalizedSearch.toLowerCase())
  );
  return nextMatch !== currentMatch ? nextMatch : undefined;
}

type Point = { x: number; y: number };
type Polygon = Point[];
type Side = "left" | "right";
type GraceIntent = { area: Polygon; side: Side };

/**
 * Determine if a point is inside of a polygon.
 * Based on https://github.com/substack/point-in-polygon
 */
function isPointInPolygon(point: Point, polygon: Polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const ii = polygon[i]!;
    const jj = polygon[j]!;
    const xi = ii.x;
    const yi = ii.y;
    const xj = jj.x;
    const yj = jj.y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

function isPointerInGraceArea(event: PointerEvent, area?: Polygon) {
  if (!area) return false;
  const cursorPos = { x: event.clientX, y: event.clientY };
  return isPointInPolygon(cursorPos, area);
}

function whenMouse<E extends PointerEvent>(
  handler: (event: E) => void
): (event: E) => void {
  return (event) =>
    event.pointerType === "mouse" ? handler(event) : undefined;
}

/* -------------------------------------------------------------------------------------------------
 * Aliases
 * -----------------------------------------------------------------------------------------------*/

const Root = Menu;
const Anchor = MenuAnchor;
const PortalExport = MenuPortal;
const Content = MenuContent;
const Group = MenuGroup;
const Label = MenuLabel;
const Item = MenuItem;
const CheckboxItem = MenuCheckboxItem;
const RadioGroup = MenuRadioGroup;
const RadioItem = MenuRadioItem;
const ItemIndicator = MenuItemIndicator;
const Separator = MenuSeparator;
const Arrow = MenuArrow;
const Sub = MenuSub;
const SubTrigger = MenuSubTrigger;
const SubContent = MenuSubContent;

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

export {
  createMenuScope,
  //
  Menu,
  MenuAnchor,
  MenuPortal,
  MenuContent,
  MenuGroup,
  MenuLabel,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuItemIndicator,
  MenuSeparator,
  MenuArrow,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  //
  Root,
  Anchor,
  PortalExport as Portal,
  Content,
  Group,
  Label,
  Item,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  ItemIndicator,
  Separator,
  Arrow,
  Sub,
  SubTrigger,
  SubContent,
};
export type {
  MenuProps,
  MenuAnchorProps,
  MenuPortalProps,
  MenuContentProps,
  MenuGroupProps,
  MenuLabelProps,
  MenuItemProps,
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuItemIndicatorProps,
  MenuSeparatorProps,
  MenuArrowProps,
  MenuSubProps,
  MenuSubTriggerProps,
  MenuSubContentProps,
};
