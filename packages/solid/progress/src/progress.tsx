import { splitProps } from 'solid-js';
import { createContextScope } from '@radix-solid-js/context';
import { Primitive, type PrimitiveProps } from '@radix-solid-js/primitive-component';

import type { Scope } from '@radix-solid-js/context';

/* -------------------------------------------------------------------------------------------------
 * Progress
 * -----------------------------------------------------------------------------------------------*/

const PROGRESS_NAME = 'Progress';
const DEFAULT_MAX = 100;

const [createProgressContext, createProgressScope] = createContextScope(PROGRESS_NAME);

type ProgressState = 'indeterminate' | 'complete' | 'loading';
type ProgressContextValue = { value: number | null; max: number };
const [ProgressProvider, useProgressContext] =
  createProgressContext<ProgressContextValue>(PROGRESS_NAME);

interface ProgressProps extends PrimitiveProps<'div'> {
  value?: number | null | undefined;
  max?: number;
  getValueLabel?(value: number, max: number): string;
  __scopeProgress?: Scope;
}

function Progress(props: ProgressProps) {
  const [local, rest] = splitProps(props, [
    '__scopeProgress',
    'value',
    'max',
    'getValueLabel',
  ]);

  const maxValue = () => {
    const m = local.max;
    if ((m || m === 0) && !isValidMaxNumber(m)) {
      console.error(getInvalidMaxError(`${m}`, 'Progress'));
    }
    return isValidMaxNumber(m) ? m : DEFAULT_MAX;
  };

  const value = () => {
    const v = local.value ?? null;
    if (v !== null && !isValidValueNumber(v, maxValue())) {
      console.error(getInvalidValueError(`${v}`, 'Progress'));
    }
    return isValidValueNumber(v, maxValue()) ? v : null;
  };

  const getValueLabel = () => local.getValueLabel ?? defaultGetValueLabel;

  const valueLabel = () => {
    const v = value();
    return isNumber(v) ? getValueLabel()(v, maxValue()) : undefined;
  };

  return (
    <ProgressProvider scope={local.__scopeProgress} value={value()!} max={maxValue()}>
      <Primitive.div
        aria-valuemax={maxValue()}
        aria-valuemin={0}
        aria-valuenow={isNumber(value()) ? value()! : undefined}
        aria-valuetext={valueLabel()}
        role="progressbar"
        data-state={getProgressState(value(), maxValue())}
        data-value={value() ?? undefined}
        data-max={maxValue()}
        {...rest}
      />
    </ProgressProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ProgressIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = 'ProgressIndicator';

interface ProgressIndicatorProps extends PrimitiveProps<'div'> {
  __scopeProgress?: Scope;
}

function ProgressIndicator(props: ProgressIndicatorProps) {
  const [local, rest] = splitProps(props, ['__scopeProgress']);
  const context = useProgressContext(INDICATOR_NAME, local.__scopeProgress);
  return (
    <Primitive.div
      data-state={getProgressState(context.value, context.max)}
      data-value={context.value ?? undefined}
      data-max={context.max}
      {...rest}
    />
  );
}

/* ---------------------------------------------------------------------------------------------- */

function defaultGetValueLabel(value: number, max: number) {
  return `${Math.round((value / max) * 100)}%`;
}

function getProgressState(value: number | undefined | null, maxValue: number): ProgressState {
  return value == null ? 'indeterminate' : value === maxValue ? 'complete' : 'loading';
}

function isNumber(value: any): value is number {
  return typeof value === 'number';
}

function isValidMaxNumber(max: any): max is number {
  return isNumber(max) && !isNaN(max) && max > 0;
}

function isValidValueNumber(value: any, max: number): value is number {
  return isNumber(value) && !isNaN(value) && value <= max && value >= 0;
}

function getInvalidMaxError(propValue: string, componentName: string) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
}

function getInvalidValueError(propValue: string, componentName: string) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}

const Root = Progress;
const Indicator = ProgressIndicator;

export {
  createProgressScope,
  Progress,
  ProgressIndicator,
  Root,
  Indicator,
};
export type { ProgressProps, ProgressIndicatorProps };
