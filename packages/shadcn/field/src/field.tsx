import {
  type Component,
  type JSX,
  createContext,
  createUniqueId,
  splitProps,
  useContext,
} from "solid-js";
import { cn } from "@shadcn-solid-js/utils";

/* --------------------------------- Context -------------------------------- */

interface FieldContextValue {
  id: string;
}

const FieldContext = createContext<FieldContextValue>();

function useFieldContext() {
  const ctx = useContext(FieldContext);
  if (!ctx) {
    throw new Error("Field components must be used within a <Field>");
  }
  return ctx;
}

/* ---------------------------------- Field --------------------------------- */

const Field: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  const id = createUniqueId();
  return (
    <FieldContext.Provider value={{ id }}>
      <div
        data-slot="field"
        class={cn(
          "data-[invalid=true]:text-destructive gap-2 group/field flex w-full",
          local.class
        )}
        {...rest}
      />
    </FieldContext.Provider>
  );
};

/* ------------------------------- FieldLabel ------------------------------- */

const FieldLabel: Component<JSX.LabelHTMLAttributes<HTMLLabelElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  const ctx = useFieldContext();
  return (
    <label
      data-slot="field-label"
      for={ctx.id}
      class={cn(
        "has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:border-primary/30 dark:has-[[data-state=checked]]:border-primary/20 dark:has-[[data-state=checked]]:bg-primary/10 group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        local.class
      )}
      {...rest}
    />
  );
};

/* ----------------------------- FieldControl ------------------------------- */

const FieldControl: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  const ctx = useFieldContext();
  return (
    <div
      data-slot="field-control"
      id={ctx.id}
      class={cn(local.class)}
      {...rest}
    />
  );
};

/* ----------------------------- FieldDescription --------------------------- */

const FieldDescription: Component<JSX.HTMLAttributes<HTMLParagraphElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  const ctx = useFieldContext();
  return (
    <p
      data-slot="field-description"
      id={`${ctx.id}-description`}
      class={cn(
        "text-muted-foreground text-left text-sm leading-normal font-normal [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        local.class
      )}
      {...rest}
    />
  );
};

/* ------------------------------ FieldMessage ------------------------------- */

const FieldMessage: Component<JSX.HTMLAttributes<HTMLParagraphElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  const ctx = useFieldContext();
  return (
    <p
      data-slot="field-message"
      id={`${ctx.id}-message`}
      class={cn("text-destructive text-sm font-normal", local.class)}
      {...rest}
    />
  );
};

export { Field, FieldLabel, FieldControl, FieldDescription, FieldMessage };
