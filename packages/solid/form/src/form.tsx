import { type JSX, splitProps, createSignal, createEffect, onCleanup, Show } from 'solid-js';
import { composeEventHandlers } from '@radix-solid-js/primitive';
import { mergeRefs } from '@radix-solid-js/compose-refs';
import { createContextScope } from '@radix-solid-js/context';
import { createId } from '@radix-solid-js/id';
import { Label as LabelPrimitive, type LabelProps } from '@radix-solid-js/label';
import { Primitive, type PrimitiveProps } from '@radix-solid-js/primitive-component';

import type { Scope } from '@radix-solid-js/context';

type ScopedProps<P> = P & { __scopeForm?: Scope };
const [createFormContext, createFormScope] = createContextScope('Form');

/* -------------------------------------------------------------------------------------------------
 * Form
 * -----------------------------------------------------------------------------------------------*/

const FORM_NAME = 'Form';

type ValidityMap = { [fieldName: string]: ValidityState | undefined };
type CustomMatcherEntriesMap = { [fieldName: string]: CustomMatcherEntry[] };
type CustomErrorsMap = { [fieldName: string]: Record<string, boolean> };

type ValidationContextValue = {
  getFieldValidity(fieldName: string): ValidityState | undefined;
  onFieldValidityChange(fieldName: string, validity: ValidityState): void;

  getFieldCustomMatcherEntries(fieldName: string): CustomMatcherEntry[];
  onFieldCustomMatcherEntryAdd(fieldName: string, matcherEntry: CustomMatcherEntry): void;
  onFieldCustomMatcherEntryRemove(fieldName: string, matcherEntryId: string): void;

  getFieldCustomErrors(fieldName: string): Record<string, boolean>;
  onFieldCustomErrorsChange(fieldName: string, errors: Record<string, boolean>): void;

  onFieldValiditionClear(fieldName: string): void;
};
const [ValidationProvider, useValidationContext] =
  createFormContext<ValidationContextValue>(FORM_NAME);

type MessageIdsMap = { [fieldName: string]: Set<string> };

type AriaDescriptionContextValue = {
  onFieldMessageIdAdd(fieldName: string, id: string): void;
  onFieldMessageIdRemove(fieldName: string, id: string): void;
  getFieldDescription(fieldName: string): string | undefined;
};
const [AriaDescriptionProvider, useAriaDescriptionContext] =
  createFormContext<AriaDescriptionContextValue>(FORM_NAME);

interface FormProps extends PrimitiveProps<'form'> {
  onClearServerErrors?(): void;
}

function Form(props: ScopedProps<FormProps>) {
  const [local, rest] = splitProps(props, [
    '__scopeForm',
    'ref',
    'onClearServerErrors',
    'onInvalid',
    'onSubmit',
    'onReset',
  ]);

  const onClearServerErrors = local.onClearServerErrors ?? (() => {});

  // native validity per field
  const [validityMap, setValidityMap] = createSignal<ValidityMap>({});
  const getFieldValidity = (fieldName: string) => validityMap()[fieldName];
  const handleFieldValidityChange = (fieldName: string, validity: ValidityState) => {
    setValidityMap((prev) => ({
      ...prev,
      [fieldName]: { ...(prev[fieldName] ?? {}), ...validity },
    }));
  };
  const handleFieldValiditionClear = (fieldName: string) => {
    setValidityMap((prev) => ({ ...prev, [fieldName]: undefined }));
    setCustomErrorsMap((prev) => ({ ...prev, [fieldName]: {} }));
  };

  // custom matcher entries per field
  const [customMatcherEntriesMap, setCustomMatcherEntriesMap] =
    createSignal<CustomMatcherEntriesMap>({});
  const getFieldCustomMatcherEntries = (fieldName: string) =>
    customMatcherEntriesMap()[fieldName] ?? [];
  const handleFieldCustomMatcherAdd = (fieldName: string, matcherEntry: CustomMatcherEntry) => {
    setCustomMatcherEntriesMap((prev) => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] ?? []), matcherEntry],
    }));
  };
  const handleFieldCustomMatcherRemove = (fieldName: string, matcherEntryId: string) => {
    setCustomMatcherEntriesMap((prev) => ({
      ...prev,
      [fieldName]: (prev[fieldName] ?? []).filter((entry) => entry.id !== matcherEntryId),
    }));
  };

  // custom errors per field
  const [customErrorsMap, setCustomErrorsMap] = createSignal<CustomErrorsMap>({});
  const getFieldCustomErrors = (fieldName: string) => customErrorsMap()[fieldName] ?? {};
  const handleFieldCustomErrorsChange = (fieldName: string, customErrors: Record<string, boolean>) => {
    setCustomErrorsMap((prev) => ({
      ...prev,
      [fieldName]: { ...(prev[fieldName] ?? {}), ...customErrors },
    }));
  };

  // messageIds per field
  const [messageIdsMap, setMessageIdsMap] = createSignal<MessageIdsMap>({});
  const handleFieldMessageIdAdd = (fieldName: string, id: string) => {
    setMessageIdsMap((prev) => {
      const fieldDescriptionIds = new Set(prev[fieldName]).add(id);
      return { ...prev, [fieldName]: fieldDescriptionIds };
    });
  };
  const handleFieldMessageIdRemove = (fieldName: string, id: string) => {
    setMessageIdsMap((prev) => {
      const fieldDescriptionIds = new Set(prev[fieldName]);
      fieldDescriptionIds.delete(id);
      return { ...prev, [fieldName]: fieldDescriptionIds };
    });
  };
  const getFieldDescription = (fieldName: string) =>
    Array.from(messageIdsMap()[fieldName] ?? []).join(' ') || undefined;

  return (
    <ValidationProvider
      scope={local.__scopeForm}
      getFieldValidity={getFieldValidity}
      onFieldValidityChange={handleFieldValidityChange}
      getFieldCustomMatcherEntries={getFieldCustomMatcherEntries}
      onFieldCustomMatcherEntryAdd={handleFieldCustomMatcherAdd}
      onFieldCustomMatcherEntryRemove={handleFieldCustomMatcherRemove}
      getFieldCustomErrors={getFieldCustomErrors}
      onFieldCustomErrorsChange={handleFieldCustomErrorsChange}
      onFieldValiditionClear={handleFieldValiditionClear}
    >
      <AriaDescriptionProvider
        scope={local.__scopeForm}
        onFieldMessageIdAdd={handleFieldMessageIdAdd}
        onFieldMessageIdRemove={handleFieldMessageIdRemove}
        getFieldDescription={getFieldDescription}
      >
        <Primitive.form
          {...rest}
          ref={local.ref}
          // focus first invalid control when the form is submitted
          onInvalid={composeEventHandlers(local.onInvalid as any, (event: Event) => {
            const target = event.currentTarget as HTMLFormElement;
            const firstInvalidControl = getFirstInvalidControl(target);
            if (firstInvalidControl === event.target) firstInvalidControl.focus();
            // prevent default browser UI for form validation
            event.preventDefault();
          })}
          // clear server errors when the form is re-submitted
          onSubmit={composeEventHandlers(local.onSubmit as any, onClearServerErrors as any, {
            checkForDefaultPrevented: false,
          })}
          // clear server errors when the form is reset
          onReset={composeEventHandlers(local.onReset as any, onClearServerErrors as any)}
        />
      </AriaDescriptionProvider>
    </ValidationProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * FormField
 * -----------------------------------------------------------------------------------------------*/

const FIELD_NAME = 'FormField';

type FormFieldContextValue = {
  id: string;
  name: string;
  serverInvalid: boolean;
};
const [FormFieldProvider, useFormFieldContext] =
  createFormContext<FormFieldContextValue>(FIELD_NAME);

interface FormFieldProps extends PrimitiveProps<'div'> {
  name: string;
  serverInvalid?: boolean;
}

function FormField(props: ScopedProps<FormFieldProps>) {
  const [local, rest] = splitProps(props, ['__scopeForm', 'name', 'serverInvalid']);
  const validationContext = useValidationContext(FIELD_NAME, local.__scopeForm);
  const validity = () => validationContext.getFieldValidity(local.name);
  const id = createId();

  return (
    <FormFieldProvider
      scope={local.__scopeForm}
      id={id}
      name={local.name}
      serverInvalid={local.serverInvalid ?? false}
    >
      <Primitive.div
        data-valid={getValidAttribute(validity(), local.serverInvalid ?? false)}
        data-invalid={getInvalidAttribute(validity(), local.serverInvalid ?? false)}
        {...rest}
      />
    </FormFieldProvider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * FormLabel
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = 'FormLabel';

interface FormLabelProps extends LabelProps {}

function FormLabel(props: ScopedProps<FormLabelProps>) {
  const [local, rest] = splitProps(props, ['__scopeForm', 'for']);
  const validationContext = useValidationContext(LABEL_NAME, local.__scopeForm);
  const fieldContext = useFormFieldContext(LABEL_NAME, local.__scopeForm);
  const htmlFor = () => local.for || fieldContext.id;
  const validity = () => validationContext.getFieldValidity(fieldContext.name);

  return (
    <LabelPrimitive
      data-valid={getValidAttribute(validity(), fieldContext.serverInvalid)}
      data-invalid={getInvalidAttribute(validity(), fieldContext.serverInvalid)}
      {...rest}
      for={htmlFor()}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * FormControl
 * -----------------------------------------------------------------------------------------------*/

const CONTROL_NAME = 'FormControl';

interface FormControlProps extends PrimitiveProps<'input'> {}

function FormControl(props: ScopedProps<FormControlProps>) {
  const [local, rest] = splitProps(props, [
    '__scopeForm',
    'ref',
    'name',
    'id',
    'onInvalid',
    'onChange',
  ]);

  const validationContext = useValidationContext(CONTROL_NAME, local.__scopeForm);
  const fieldContext = useFormFieldContext(CONTROL_NAME, local.__scopeForm);
  const ariaDescriptionContext = useAriaDescriptionContext(CONTROL_NAME, local.__scopeForm);

  let controlRef!: HTMLInputElement;
  const name = () => local.name || fieldContext.name;
  const id = () => local.id || fieldContext.id;
  const customMatcherEntries = () => validationContext.getFieldCustomMatcherEntries(name());

  const updateControlValidity = async (control: HTMLInputElement) => {
    //--------------------------------------------------------------------------------------------
    // 1. first, if we have built-in errors we stop here

    if (hasBuiltInError(control.validity)) {
      const controlValidity = validityStateToObject(control.validity);
      validationContext.onFieldValidityChange(name(), controlValidity);
      return;
    }

    //--------------------------------------------------------------------------------------------
    // 2. then gather the form data to give to custom matchers for cross-comparisons

    const formData = control.form ? new FormData(control.form) : new FormData();
    const matcherArgs: CustomMatcherArgs = [control.value, formData];

    //--------------------------------------------------------------------------------------------
    // 3. split sync and async custom matcher entries

    const syncCustomMatcherEntries: Array<SyncCustomMatcherEntry> = [];
    const asyncCustomMatcherEntries: Array<AsyncCustomMatcherEntry> = [];
    customMatcherEntries().forEach((customMatcherEntry) => {
      if (isAsyncCustomMatcherEntry(customMatcherEntry, matcherArgs)) {
        asyncCustomMatcherEntries.push(customMatcherEntry);
      } else if (isSyncCustomMatcherEntry(customMatcherEntry)) {
        syncCustomMatcherEntries.push(customMatcherEntry);
      }
    });

    //--------------------------------------------------------------------------------------------
    // 4. run sync custom matchers and update control validity / internal validity + errors

    const syncCustomErrors = syncCustomMatcherEntries.map(({ id, match }) => {
      return [id, match(...matcherArgs)] as const;
    });
    const syncCustomErrorsById = Object.fromEntries(syncCustomErrors);
    const hasSyncCustomErrors = Object.values(syncCustomErrorsById).some(Boolean);
    const hasCustomError = hasSyncCustomErrors;
    control.setCustomValidity(hasCustomError ? DEFAULT_INVALID_MESSAGE : '');
    const controlValidity = validityStateToObject(control.validity);
    validationContext.onFieldValidityChange(name(), controlValidity);
    validationContext.onFieldCustomErrorsChange(name(), syncCustomErrorsById);

    //--------------------------------------------------------------------------------------------
    // 5. run async custom matchers and update control validity / internal validity + errors

    if (!hasSyncCustomErrors && asyncCustomMatcherEntries.length > 0) {
      const promisedCustomErrors = asyncCustomMatcherEntries.map(({ id, match }) =>
        match(...matcherArgs).then((matches) => [id, matches] as const),
      );
      const asyncCustomErrors = await Promise.all(promisedCustomErrors);
      const asyncCustomErrorsById = Object.fromEntries(asyncCustomErrors);
      const hasAsyncCustomErrors = Object.values(asyncCustomErrorsById).some(Boolean);
      const hasCustomError = hasAsyncCustomErrors;
      control.setCustomValidity(hasCustomError ? DEFAULT_INVALID_MESSAGE : '');
      const controlValidity = validityStateToObject(control.validity);
      validationContext.onFieldValidityChange(name(), controlValidity);
      validationContext.onFieldCustomErrorsChange(name(), asyncCustomErrorsById);
    }
  };

  // Listen to native 'change' event for validation (not Solid's onChange which fires on input)
  createEffect(() => {
    const control = controlRef;
    if (control) {
      const handleChange = () => updateControlValidity(control);
      control.addEventListener('change', handleChange);
      onCleanup(() => control.removeEventListener('change', handleChange));
    }
  });

  const resetControlValidity = () => {
    const control = controlRef;
    if (control) {
      control.setCustomValidity('');
      validationContext.onFieldValiditionClear(name());
    }
  };

  // reset validity and errors when the form is reset
  createEffect(() => {
    const form = controlRef?.form;
    if (form) {
      form.addEventListener('reset', resetControlValidity);
      onCleanup(() => form.removeEventListener('reset', resetControlValidity));
    }
  });

  // focus first invalid control when fields are set as invalid by server
  createEffect(() => {
    const control = controlRef;
    const form = control?.closest('form');
    if (form && fieldContext.serverInvalid) {
      const firstInvalidControl = getFirstInvalidControl(form);
      if (firstInvalidControl === control) firstInvalidControl.focus();
    }
  });

  const validity = () => validationContext.getFieldValidity(name());

  return (
    <Primitive.input
      data-valid={getValidAttribute(validity(), fieldContext.serverInvalid)}
      data-invalid={getInvalidAttribute(validity(), fieldContext.serverInvalid)}
      aria-invalid={fieldContext.serverInvalid ? true : undefined}
      aria-describedby={ariaDescriptionContext.getFieldDescription(name())}
      // disable default browser behaviour of showing built-in error message on hover
      title=""
      {...rest}
      ref={mergeRefs(local.ref, (el) => (controlRef = el as HTMLInputElement))}
      id={id()}
      name={name()}
      onInvalid={composeEventHandlers(local.onInvalid as any, (event: Event) => {
        const control = event.currentTarget as HTMLInputElement;
        updateControlValidity(control);
      })}
      onChange={composeEventHandlers(local.onChange as any, () => {
        // reset validity when user changes value
        resetControlValidity();
      })}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * FormMessage
 * -----------------------------------------------------------------------------------------------*/

const _validityMatchers = [
  'badInput',
  'patternMismatch',
  'rangeOverflow',
  'rangeUnderflow',
  'stepMismatch',
  'tooLong',
  'tooShort',
  'typeMismatch',
  'valid',
  'valueMissing',
] as const;
type ValidityMatcher = (typeof _validityMatchers)[number];

const DEFAULT_INVALID_MESSAGE = 'This value is not valid';
const DEFAULT_BUILT_IN_MESSAGES: Record<ValidityMatcher, string | undefined> = {
  badInput: DEFAULT_INVALID_MESSAGE,
  patternMismatch: 'This value does not match the required pattern',
  rangeOverflow: 'This value is too large',
  rangeUnderflow: 'This value is too small',
  stepMismatch: 'This value does not match the required step',
  tooLong: 'This value is too long',
  tooShort: 'This value is too short',
  typeMismatch: 'This value does not match the required type',
  valid: undefined,
  valueMissing: 'This value is missing',
};

const MESSAGE_NAME = 'FormMessage';

interface FormMessageProps extends Omit<FormMessageImplProps, 'name'> {
  match?: ValidityMatcher | CustomMatcher;
  forceMatch?: boolean;
  name?: string;
}

function FormMessage(props: ScopedProps<FormMessageProps>) {
  const [local, rest] = splitProps(props, ['__scopeForm', 'match', 'name', 'forceMatch', 'children']);
  const fieldContext = useFormFieldContext(MESSAGE_NAME, local.__scopeForm);
  const name = () => local.name ?? fieldContext.name;

  if (local.match === undefined) {
    return (
      <FormMessageImpl {...rest} __scopeForm={local.__scopeForm} name={name()}>
        {local.children || DEFAULT_INVALID_MESSAGE}
      </FormMessageImpl>
    );
  } else if (typeof local.match === 'function') {
    return (
      <FormCustomMessage
        match={local.match}
        forceMatch={local.forceMatch}
        {...rest}
        __scopeForm={local.__scopeForm}
        name={name()}
      >
        {local.children}
      </FormCustomMessage>
    );
  } else {
    return (
      <FormBuiltInMessage
        match={local.match}
        forceMatch={local.forceMatch}
        {...rest}
        __scopeForm={local.__scopeForm}
        name={name()}
      >
        {local.children}
      </FormBuiltInMessage>
    );
  }
}

/* -------------------------------------------------------------------------------------------------
 * FormBuiltInMessage
 * -----------------------------------------------------------------------------------------------*/

interface FormBuiltInMessageProps extends FormMessageImplProps {
  match: ValidityMatcher;
  forceMatch?: boolean;
  name: string;
}

function FormBuiltInMessage(props: ScopedProps<FormBuiltInMessageProps>) {
  const [local, rest] = splitProps(props, ['__scopeForm', 'match', 'forceMatch', 'name', 'children']);
  const validationContext = useValidationContext(MESSAGE_NAME, local.__scopeForm);
  const validity = () => validationContext.getFieldValidity(local.name);
  const matches = () => local.forceMatch || validity()?.[local.match];

  return (
    <Show when={matches()}>
      <FormMessageImpl {...rest} __scopeForm={local.__scopeForm} name={local.name}>
        {local.children ?? DEFAULT_BUILT_IN_MESSAGES[local.match]}
      </FormMessageImpl>
    </Show>
  );
}

/* -------------------------------------------------------------------------------------------------
 * FormCustomMessage
 * -----------------------------------------------------------------------------------------------*/

interface FormCustomMessageProps extends FormMessageImplProps {
  match: CustomMatcher;
  forceMatch?: boolean;
  name: string;
}

function FormCustomMessage(props: ScopedProps<FormCustomMessageProps>) {
  const [local, rest] = splitProps(props, [
    '__scopeForm',
    'match',
    'forceMatch',
    'name',
    'id',
    'ref',
    'children',
  ]);
  const validationContext = useValidationContext(MESSAGE_NAME, local.__scopeForm);

  const _id = createId();
  const id = () => local.id ?? _id;

  // Register / unregister the custom matcher entry
  createEffect(() => {
    const customMatcherEntry: CustomMatcherEntry = { id: id(), match: local.match };
    validationContext.onFieldCustomMatcherEntryAdd(local.name, customMatcherEntry);
    onCleanup(() => validationContext.onFieldCustomMatcherEntryRemove(local.name, customMatcherEntry.id));
  });

  const validity = () => validationContext.getFieldValidity(local.name);
  const customErrors = () => validationContext.getFieldCustomErrors(local.name);
  const hasMatchingCustomError = () => customErrors()[id()];
  const matches = () =>
    local.forceMatch || (validity() && !hasBuiltInError(validity()!) && hasMatchingCustomError());

  return (
    <Show when={matches()}>
      <FormMessageImpl
        id={id()}
        ref={local.ref}
        {...rest}
        __scopeForm={local.__scopeForm}
        name={local.name}
      >
        {local.children ?? DEFAULT_INVALID_MESSAGE}
      </FormMessageImpl>
    </Show>
  );
}

/* -------------------------------------------------------------------------------------------------
 * FormMessageImpl
 * -----------------------------------------------------------------------------------------------*/

interface FormMessageImplProps extends PrimitiveProps<'span'> {
  name: string;
}

function FormMessageImpl(props: ScopedProps<FormMessageImplProps>) {
  const [local, rest] = splitProps(props, ['__scopeForm', 'id', 'name']);
  const ariaDescriptionContext = useAriaDescriptionContext(MESSAGE_NAME, local.__scopeForm);
  const _id = createId();
  const id = () => local.id ?? _id;

  // Register / unregister the message ID for aria-describedby
  createEffect(() => {
    ariaDescriptionContext.onFieldMessageIdAdd(local.name, id());
    onCleanup(() => ariaDescriptionContext.onFieldMessageIdRemove(local.name, id()));
  });

  return <Primitive.span id={id()} {...rest} />;
}

/* -------------------------------------------------------------------------------------------------
 * FormValidityState
 * -----------------------------------------------------------------------------------------------*/

const VALIDITY_STATE_NAME = 'FormValidityState';

interface FormValidityStateProps {
  children(validity: ValidityState | undefined): JSX.Element;
  name?: string;
}

function FormValidityState(props: ScopedProps<FormValidityStateProps>) {
  const [local] = splitProps(props, ['__scopeForm', 'name', 'children']);
  const validationContext = useValidationContext(VALIDITY_STATE_NAME, local.__scopeForm);
  const fieldContext = useFormFieldContext(VALIDITY_STATE_NAME, local.__scopeForm);
  const name = () => local.name ?? fieldContext.name;
  const validity = () => validationContext.getFieldValidity(name());
  return <>{local.children(validity())}</>;
}

/* -------------------------------------------------------------------------------------------------
 * FormSubmit
 * -----------------------------------------------------------------------------------------------*/

interface FormSubmitProps extends PrimitiveProps<'button'> {}

function FormSubmit(props: ScopedProps<FormSubmitProps>) {
  const [, rest] = splitProps(props, ['__scopeForm']);
  return <Primitive.button type="submit" {...rest} />;
}

/* -------------------------------------------------------------------------------------------------
 * Helper types and functions
 * -----------------------------------------------------------------------------------------------*/

type ValidityStateKey = keyof ValidityState;
type SyncCustomMatcher = (value: string, formData: FormData) => boolean;
type AsyncCustomMatcher = (value: string, formData: FormData) => Promise<boolean>;
type CustomMatcher = SyncCustomMatcher | AsyncCustomMatcher;
type CustomMatcherEntry = { id: string; match: CustomMatcher };
type SyncCustomMatcherEntry = { id: string; match: SyncCustomMatcher };
type AsyncCustomMatcherEntry = { id: string; match: AsyncCustomMatcher };
type CustomMatcherArgs = [string, FormData];

function validityStateToObject(validity: ValidityState) {
  const object: any = {};
  for (const key in validity) {
    object[key] = validity[key as ValidityStateKey];
  }
  return object as Record<ValidityStateKey, boolean>;
}

function isHTMLElement(element: any): element is HTMLElement {
  return element instanceof HTMLElement;
}

function isFormControl(element: any): element is { validity: ValidityState } {
  return 'validity' in element;
}

function isInvalid(control: HTMLElement) {
  return (
    isFormControl(control) &&
    (control.validity.valid === false || control.getAttribute('aria-invalid') === 'true')
  );
}

function getFirstInvalidControl(form: HTMLFormElement): HTMLElement | undefined {
  const elements = form.elements;
  const [firstInvalidControl] = Array.from(elements).filter(isHTMLElement).filter(isInvalid);
  return firstInvalidControl;
}

function isAsyncCustomMatcherEntry(
  entry: CustomMatcherEntry,
  args: CustomMatcherArgs,
): entry is AsyncCustomMatcherEntry {
  return entry.match.constructor.name === 'AsyncFunction' || returnsPromise(entry.match, args);
}

function isSyncCustomMatcherEntry(entry: CustomMatcherEntry): entry is SyncCustomMatcherEntry {
  return entry.match.constructor.name === 'Function';
}

function returnsPromise(func: Function, args: Array<unknown>) {
  return func(...args) instanceof Promise;
}

function hasBuiltInError(validity: ValidityState) {
  let error = false;
  for (const validityKey in validity) {
    const key = validityKey as ValidityStateKey;
    if (key !== 'valid' && key !== 'customError' && validity[key]) {
      error = true;
      break;
    }
  }
  return error;
}

function getValidAttribute(validity: ValidityState | undefined, serverInvalid: boolean) {
  if (validity?.valid === true && !serverInvalid) return true;
  return undefined;
}

function getInvalidAttribute(validity: ValidityState | undefined, serverInvalid: boolean) {
  if (validity?.valid === false || serverInvalid) return true;
  return undefined;
}

/* -------------------------------------------------------------------------------------------------
 * Aliases
 * -----------------------------------------------------------------------------------------------*/

const Root = Form;
const Field = FormField;
const Label = FormLabel;
const Control = FormControl;
const Message = FormMessage;
const ValidityState = FormValidityState;
const Submit = FormSubmit;

export {
  createFormScope,
  //
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormValidityState,
  FormSubmit,
  //
  Root,
  Field,
  Label,
  Control,
  Message,
  ValidityState,
  Submit,
};

export type {
  FormProps,
  FormFieldProps,
  FormLabelProps,
  FormControlProps,
  FormMessageProps,
  FormValidityStateProps,
  FormSubmitProps,
};
