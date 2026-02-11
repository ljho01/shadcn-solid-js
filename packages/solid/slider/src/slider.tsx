import {
  type JSX,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  createMemo,
  Show,
} from 'solid-js';
import { composeEventHandlers } from '@radix-solid/primitive';
import { createCollection } from '@radix-solid/collection';
import { mergeRefs } from '@radix-solid/compose-refs';
import { createContextScope, type Scope } from '@radix-solid/context';
import { useDirection, type Direction } from '@radix-solid/direction';
import { Primitive } from '@radix-solid/primitive-component';
import { createControllableSignal } from '@radix-solid/use-controllable-state';
import { createElementSize } from '@radix-solid/use-size';
import { clamp } from '@radix-solid/number';

/* -------------------------------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------------------------------*/

const PAGE_KEYS = ['PageUp', 'PageDown'];
const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const BACK_KEYS: Record<Direction, string[]> = {
  ltr: ['ArrowDown', 'Home', 'ArrowLeft', 'PageDown'],
  rtl: ['ArrowDown', 'Home', 'ArrowRight', 'PageDown'],
};

/* -------------------------------------------------------------------------------------------------
 * Collection
 * -----------------------------------------------------------------------------------------------*/

const [Collection, , createCollectionScope] = createCollection<HTMLSpanElement>('Slider');

/* -------------------------------------------------------------------------------------------------
 * SliderContext
 * -----------------------------------------------------------------------------------------------*/

const SLIDER_NAME = 'Slider';

type ScopedProps<P> = P & { __scopeSlider?: Scope };
const [createSliderContext, createSliderScope] = createContextScope(
  SLIDER_NAME,
  [createCollectionScope]
);

type SliderContextValue = {
  disabled: boolean;
  min: number;
  max: number;
  values: number[];
  valueIndexToChange: number;
  thumbs: Set<HTMLElement>;
  orientation: SliderOrientation;
};

const [SliderProvider, useSliderContext] =
  createSliderContext<SliderContextValue>(SLIDER_NAME);

type SliderOrientation = 'horizontal' | 'vertical';

/* -------------------------------------------------------------------------------------------------
 * SliderOrientationContext
 * -----------------------------------------------------------------------------------------------*/

type SliderOrientationContextValue = {
  startEdge: 'left' | 'right' | 'bottom';
  endEdge: 'right' | 'left' | 'top';
  size: 'width' | 'height';
  direction: number; // 1 for ltr, -1 for rtl
  slideDirection: 'from-left' | 'from-right' | 'from-bottom';
};

const [SliderOrientationProvider, useSliderOrientationContext] =
  createSliderContext<SliderOrientationContextValue>('SliderOrientation');

/* -------------------------------------------------------------------------------------------------
 * Slider (Root)
 * -----------------------------------------------------------------------------------------------*/

interface SliderProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  name?: string;
  disabled?: boolean;
  orientation?: SliderOrientation;
  dir?: Direction;
  min?: number;
  max?: number;
  step?: number;
  minStepsBetweenThumbs?: number;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  inverted?: boolean;
  ref?: (el: HTMLSpanElement) => void;
}

function Slider(inProps: ScopedProps<SliderProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeSlider',
    'name',
    'disabled',
    'orientation',
    'dir',
    'min',
    'max',
    'step',
    'minStepsBetweenThumbs',
    'value',
    'defaultValue',
    'onValueChange',
    'onValueCommit',
    'inverted',
    'ref',
    'children',
    'style',
  ]);

  const direction = useDirection(local.dir);
  const min = () => local.min ?? 0;
  const max = () => local.max ?? 100;
  const step = () => local.step ?? 1;
  const orientation = () => local.orientation ?? 'horizontal';
  const disabled = () => local.disabled ?? false;
  const minStepsBetweenThumbs = () => local.minStepsBetweenThumbs ?? 0;
  const inverted = () => local.inverted ?? false;

  const thumbs = new Set<HTMLElement>();
  const [valueIndexToChange, setValueIndexToChange] = createSignal(0);
  const [valuesBeforeSlideStartRef, setValuesBeforeSlideStartRef] = createSignal<number[]>([]);

  const [values, setValues] = createControllableSignal({
    prop: () => local.value,
    defaultProp: local.defaultValue ?? [min()],
    onChange: (value) => local.onValueChange?.(value),
  });

  const handleSlideStart = (value: number) => {
    const closestIndex = getClosestValueIndex(values() ?? [], value);
    updateValues(value, closestIndex);
  };

  const handleSlideMove = (value: number) => {
    updateValues(value, valueIndexToChange());
  };

  const handleSlideEnd = () => {
    const prevValue = valuesBeforeSlideStartRef();
    const currentValues = values() ?? [];
    const hasChanged = String(prevValue) !== String(currentValues);
    if (hasChanged) {
      local.onValueCommit?.(currentValues);
    }
  };

  const updateValues = (value: number, atIndex: number, _options?: { commit?: boolean }) => {
    const decimalCount = getDecimalCount(step());
    const snapToStep = roundValue(Math.round((value - min()) / step()) * step() + min(), decimalCount);
    const nextValue = clamp(snapToStep, [min(), max()]);

    setValues((prev = []) => {
      const nextValues = getNextSortedValues(prev, nextValue, atIndex);
      if (hasMinStepsBetweenValues(nextValues, minStepsBetweenThumbs() * step())) {
        setValueIndexToChange(nextValues.indexOf(nextValue));
        return String(nextValues) === String(prev) ? prev : nextValues;
      }
      return prev;
    });
  };

  const isHorizontal = () => orientation() === 'horizontal';

  // Orientation-specific context values
  const orientationContextH = createMemo((): SliderOrientationContextValue => ({
    startEdge: direction === 'ltr' ? 'left' : 'right',
    endEdge: direction === 'ltr' ? 'right' : 'left',
    direction: (direction === 'ltr' ? (inverted() ? -1 : 1) : (inverted() ? 1 : -1)),
    size: 'width',
    slideDirection: direction === 'ltr' ? (inverted() ? 'from-right' : 'from-left') : (inverted() ? 'from-left' : 'from-right'),
  }));

  const orientationContextV = createMemo((): SliderOrientationContextValue => ({
    startEdge: 'bottom',
    endEdge: 'top',
    direction: inverted() ? 1 : -1,
    size: 'height',
    slideDirection: inverted() ? 'from-bottom' : 'from-bottom',
  }));

  const orientationContext = () => isHorizontal() ? orientationContextH() : orientationContextV();

  return (
    <Collection.Provider scope={local.__scopeSlider}>
      <SliderProvider
        scope={local.__scopeSlider}
        disabled={disabled()}
        min={min()}
        max={max()}
        values={values() ?? []}
        valueIndexToChange={valueIndexToChange()}
        thumbs={thumbs}
        orientation={orientation()}
      >
        <SliderOrientationProvider
          scope={local.__scopeSlider}
          {...orientationContext()}
        >
          <Collection.Slot scope={local.__scopeSlider}>
            <SliderImpl
              aria-disabled={disabled()}
              data-disabled={disabled() ? '' : undefined}
              {...rest}
              __scopeSlider={local.__scopeSlider}
              ref={local.ref}
              min={min()}
              max={max()}
              inverted={inverted()}
              orientation={orientation()}
              dir={direction}
              onSlideStart={disabled() ? undefined : (value) => {
                setValuesBeforeSlideStartRef(values() ?? []);
                handleSlideStart(value);
              }}
              onSlideMove={disabled() ? undefined : handleSlideMove}
              onSlideEnd={disabled() ? undefined : handleSlideEnd}
              onHomeKeyDown={() => !disabled() && updateValues(min(), 0, { commit: true })}
              onEndKeyDown={() => !disabled() && updateValues(max(), (values() ?? []).length - 1, { commit: true })}
              onStepKeyDown={({ event, direction: stepDirection }) => {
                if (disabled()) return;
                const isPageKey = PAGE_KEYS.includes(event.key);
                const isSkipKey = isPageKey || (event.shiftKey && ARROW_KEYS.includes(event.key));
                const multiplier = isSkipKey ? 10 : 1;
                const atIndex = valueIndexToChange();
                const currentValue = (values() ?? [])[atIndex] ?? 0;
                const stepInDirection = step() * multiplier * stepDirection;
                updateValues(currentValue + stepInDirection, atIndex, { commit: true });
              }}
              style={{
                ...(typeof local.style === 'object' ? local.style : {}),
              }}
            >
              {local.children}
            </SliderImpl>
          </Collection.Slot>
        </SliderOrientationProvider>
      </SliderProvider>
    </Collection.Provider>
  );
}

Slider.displayName = SLIDER_NAME;

/* -------------------------------------------------------------------------------------------------
 * SliderImpl
 * -----------------------------------------------------------------------------------------------*/

interface SliderImplProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  min: number;
  max: number;
  inverted: boolean;
  orientation: SliderOrientation;
  dir: Direction;
  onSlideStart?: (value: number) => void;
  onSlideMove?: (value: number) => void;
  onSlideEnd?: () => void;
  onHomeKeyDown?: () => void;
  onEndKeyDown?: () => void;
  onStepKeyDown?: (args: { event: KeyboardEvent; direction: number }) => void;
  ref?: (el: HTMLSpanElement) => void;
}

function SliderImpl(inProps: ScopedProps<SliderImplProps>) {
  const [local, rest] = splitProps(inProps, [
    '__scopeSlider',
    'min',
    'max',
    'inverted',
    'orientation',
    'dir',
    'onSlideStart',
    'onSlideMove',
    'onSlideEnd',
    'onHomeKeyDown',
    'onEndKeyDown',
    'onStepKeyDown',
    'ref',
    'children',
  ]);

  let sliderRef!: HTMLSpanElement;
  const isHorizontal = () => local.orientation === 'horizontal';

  const getValueFromPointer = (pointerPosition: number): number => {
    const rect = sliderRef.getBoundingClientRect();
    const input: [number, number] = isHorizontal()
      ? [rect.left, rect.right]
      : [rect.bottom, rect.top];
    const output: [number, number] = local.inverted
      ? [local.max, local.min]
      : [local.min, local.max];

    // For rtl horizontal, reverse the input range
    if (isHorizontal() && local.dir === 'rtl') {
      input.reverse();
    }

    const value = linearScale(input, output)(pointerPosition);
    return clamp(value, [local.min, local.max]);
  };

  const handlePointerDown = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    target.setPointerCapture(event.pointerId);
    event.preventDefault();

    // If click is on thumb, don't do slide start from track
    if (target.hasAttribute('data-radix-slider-thumb')) return;

    const value = getValueFromPointer(
      isHorizontal() ? event.clientX : event.clientY
    );
    local.onSlideStart?.(value);
  };

  const handlePointerMove = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      const value = getValueFromPointer(
        isHorizontal() ? event.clientX : event.clientY
      );
      local.onSlideMove?.(value);
    }
  };

  const handlePointerUp = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
      local.onSlideEnd?.();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Home') {
      local.onHomeKeyDown?.();
      event.preventDefault();
    } else if (event.key === 'End') {
      local.onEndKeyDown?.();
      event.preventDefault();
    } else if ([...PAGE_KEYS, ...ARROW_KEYS].includes(event.key)) {
      let stepDirection = 0;
      const isBackKey = BACK_KEYS[local.dir].includes(event.key);
      if (isBackKey) {
        stepDirection = -1;
      } else {
        stepDirection = 1;
      }
      if (stepDirection !== 0) {
        local.onStepKeyDown?.({ event, direction: stepDirection });
        event.preventDefault();
      }
    }
  };

  return (
    <Primitive.span
      {...rest}
      ref={mergeRefs(local.ref, (el: HTMLElement) => { sliderRef = el as HTMLSpanElement; })}
      data-orientation={local.orientation}
      onKeyDown={composeEventHandlers(rest.onKeyDown as any, handleKeyDown as any)}
      onPointerDown={composeEventHandlers(rest.onPointerDown as any, handlePointerDown as any)}
      onPointerMove={composeEventHandlers(rest.onPointerMove as any, handlePointerMove as any)}
      onPointerUp={composeEventHandlers(rest.onPointerUp as any, handlePointerUp as any)}
    >
      {local.children}
    </Primitive.span>
  );
}

/* -------------------------------------------------------------------------------------------------
 * SliderTrack
 * -----------------------------------------------------------------------------------------------*/

const TRACK_NAME = 'SliderTrack';

interface SliderTrackProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  ref?: (el: HTMLSpanElement) => void;
}

function SliderTrack(inProps: ScopedProps<SliderTrackProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSlider', 'ref']);
  const context = useSliderContext(TRACK_NAME, local.__scopeSlider);

  return (
    <Primitive.span
      data-disabled={context.disabled ? '' : undefined}
      data-orientation={context.orientation}
      {...rest}
      ref={local.ref}
    />
  );
}

SliderTrack.displayName = TRACK_NAME;

/* -------------------------------------------------------------------------------------------------
 * SliderRange
 * -----------------------------------------------------------------------------------------------*/

const RANGE_NAME = 'SliderRange';

interface SliderRangeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  ref?: (el: HTMLSpanElement) => void;
}

function SliderRange(inProps: ScopedProps<SliderRangeProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSlider', 'ref', 'style']);
  const context = useSliderContext(RANGE_NAME, local.__scopeSlider);
  const orientationCtx = useSliderOrientationContext(RANGE_NAME, local.__scopeSlider);

  const percentages = createMemo(() =>
    context.values.map((value) => convertValueToPercentage(value, context.min, context.max))
  );

  const offsetStart = createMemo(() => {
    return context.values.length > 1 ? Math.min(...percentages()) : 0;
  });

  const offsetEnd = createMemo(() => {
    return 100 - Math.max(...percentages());
  });

  return (
    <Primitive.span
      data-disabled={context.disabled ? '' : undefined}
      data-orientation={context.orientation}
      {...rest}
      ref={local.ref}
      style={{
        ...(typeof local.style === 'object' ? local.style : {}),
        [orientationCtx.startEdge]: `${offsetStart()}%`,
        [orientationCtx.endEdge]: `${offsetEnd()}%`,
      }}
    />
  );
}

SliderRange.displayName = RANGE_NAME;

/* -------------------------------------------------------------------------------------------------
 * SliderThumb
 * -----------------------------------------------------------------------------------------------*/

const THUMB_NAME = 'SliderThumb';

interface SliderThumbProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  name?: string;
  ref?: (el: HTMLSpanElement) => void;
}

function SliderThumb(inProps: ScopedProps<SliderThumbProps>) {
  const [local, rest] = splitProps(inProps, ['__scopeSlider', 'name', 'ref', 'style']);
  const context = useSliderContext(THUMB_NAME, local.__scopeSlider);
  const orientationCtx = useSliderOrientationContext(THUMB_NAME, local.__scopeSlider);

  let thumbRef!: HTMLSpanElement;
  const [thumbIndex, setThumbIndex] = createSignal(0);

  // Register this thumb with the collection
  onMount(() => {
    context.thumbs.add(thumbRef);
    // Determine index by DOM order
    const allThumbs = Array.from(context.thumbs);
    setThumbIndex(allThumbs.indexOf(thumbRef));
  });

  onCleanup(() => {
    context.thumbs.delete(thumbRef);
  });

  const value = createMemo(() => context.values[thumbIndex()] ?? 0);
  const percent = createMemo(() =>
    convertValueToPercentage(value(), context.min, context.max)
  );
  const label = () => getLabel(thumbIndex(), context.values.length);

  const size = createElementSize(() => thumbRef);
  const orientationSize = () => size()?.[orientationCtx.size] ?? 20;

  return (
    <span
      style={{
        transform: 'var(--radix-slider-thumb-transform)',
        position: 'absolute',
        [orientationCtx.startEdge]: `calc(${percent()}% + ${orientationSize() / 2}px * ${1 - 2 * percent() / 100})`,
      }}
    >
      <Collection.ItemSlot scope={local.__scopeSlider}>
        <Primitive.span
          role="slider"
          aria-label={rest['aria-label'] || label()}
          aria-valuemin={context.min}
          aria-valuenow={value()}
          aria-valuemax={context.max}
          aria-orientation={context.orientation}
          data-orientation={context.orientation}
          data-disabled={context.disabled ? '' : undefined}
          data-radix-slider-thumb=""
          tabIndex={context.disabled ? undefined : 0}
          {...rest}
          ref={mergeRefs(local.ref, (el: HTMLElement) => { thumbRef = el as HTMLSpanElement; })}
          style={{
            ...(typeof local.style === 'object' ? local.style : {}),
          }}
          onFocus={composeEventHandlers(rest.onFocus as any, () => {
            // Focus changes active thumb index
            const allThumbs = Array.from(context.thumbs);
            const idx = allThumbs.indexOf(thumbRef);
            if (idx !== -1) {
              // The slider needs to know which thumb is active for keyboard nav
            }
          })}
        />
      </Collection.ItemSlot>
      {/* Hidden input for form submission */}
      <Show when={local.name}>
        <BubbleInput
          name={local.name!}
          value={value()}
        />
      </Show>
    </span>
  );
}

SliderThumb.displayName = THUMB_NAME;

/* -------------------------------------------------------------------------------------------------
 * BubbleInput (hidden input for form integration)
 * -----------------------------------------------------------------------------------------------*/

interface BubbleInputProps {
  name: string;
  value: number;
}

function BubbleInput(props: BubbleInputProps) {
  return (
    <input
      type="hidden"
      name={props.name}
      value={props.value}
      style={{ display: 'none' }}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Utility functions
 * -----------------------------------------------------------------------------------------------*/

function linearScale(input: readonly [number, number], output: readonly [number, number]) {
  return (value: number) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}

function convertValueToPercentage(value: number, min: number, max: number): number {
  const maxSteps = max - min;
  const percentPerStep = 100 / maxSteps;
  const percentage = percentPerStep * (value - min);
  return clamp(percentage, [0, 100]);
}

function getClosestValueIndex(values: number[], nextValue: number): number {
  if (values.length === 1) return 0;
  const distances = values.map((value) => Math.abs(value - nextValue));
  const closestDistance = Math.min(...distances);
  return distances.indexOf(closestDistance);
}

function getNextSortedValues(prevValues: number[], nextValue: number, atIndex: number): number[] {
  const nextValues = [...prevValues];
  nextValues[atIndex] = nextValue;
  return nextValues.sort((a, b) => a - b);
}

function hasMinStepsBetweenValues(values: number[], minStepsBetween: number): boolean {
  if (minStepsBetween > 0) {
    const valuesCopy = [...values];
    valuesCopy.sort((a, b) => a - b);
    return valuesCopy.every((value, index) => {
      if (index === 0) return true;
      return value - valuesCopy[index - 1]! >= minStepsBetween;
    });
  }
  return true;
}

function getLabel(index: number, totalValues: number): string {
  if (totalValues > 2) {
    return `Value ${index + 1} of ${totalValues}`;
  } else if (totalValues === 2) {
    return ['Minimum', 'Maximum'][index]!;
  }
  return '';
}

function getDecimalCount(value: number): number {
  return (String(value).split('.')[1] || '').length;
}

function roundValue(value: number, decimalCount: number): number {
  const rounder = Math.pow(10, decimalCount);
  return Math.round(value * rounder) / rounder;
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

const Root = Slider;
const Track = SliderTrack;
const Range = SliderRange;
const Thumb = SliderThumb;

export {
  createSliderScope,
  Slider,
  SliderTrack,
  SliderRange,
  SliderThumb,
  Root,
  Track,
  Range,
  Thumb,
};
export type {
  SliderProps,
  SliderTrackProps,
  SliderRangeProps,
  SliderThumbProps,
};
