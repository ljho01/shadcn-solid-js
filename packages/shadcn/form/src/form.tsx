import {
  type Component,
  type ComponentProps,
  type JSX,
  createContext,
  createUniqueId,
  splitProps,
  useContext,
} from "solid-js";
import * as FormPrimitive from "@radix-solid/form";
import { Label } from "@shadcn-solid/label";
import { cn } from "@shadcn-solid/utils";

const Form = FormPrimitive.Root;

/* --------------------------------- Context -------------------------------- */

interface FormFieldContextValue {
  name: string;
}

const FormFieldContext = createContext<FormFieldContextValue>();

interface FormItemContextValue {
  id: string;
}

const FormItemContext = createContext<FormItemContextValue>();

function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  if (!fieldContext) {
    throw new Error("useFormField must be used within a <FormField>");
  }
  const id = itemContext?.id ?? "";
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  };
}

/* ------------------------------- FormField -------------------------------- */

interface FormFieldProps {
  name: string;
  children: JSX.Element;
}

const FormField: Component<FormFieldProps> = (props) => {
  const [local] = splitProps(props, ["name", "children"]);
  return (
    <FormFieldContext.Provider value={{ name: local.name }}>
      {local.children}
    </FormFieldContext.Provider>
  );
};

/* ------------------------------- FormItem --------------------------------- */

const FormItem: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  const id = createUniqueId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        class={cn("grid gap-2", local.class)}
        {...rest}
      />
    </FormItemContext.Provider>
  );
};

/* ------------------------------- FormLabel -------------------------------- */

const FormLabel: Component<ComponentProps<typeof Label>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  const field = useFormField();
  return (
    <Label
      data-slot="form-label"
      class={cn("data-[error=true]:text-destructive", local.class)}
      for={field.formItemId}
      {...rest}
    />
  );
};

/* ------------------------------ FormControl ------------------------------- */

const FormControl: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  const field = useFormField();
  return (
    <div
      data-slot="form-control"
      id={field.formItemId}
      aria-describedby={`${field.formDescriptionId} ${field.formMessageId}`}
      class={cn(local.class)}
      {...rest}
    />
  );
};

/* ----------------------------- FormDescription ---------------------------- */

const FormDescription: Component<JSX.HTMLAttributes<HTMLParagraphElement>> = (
  props
) => {
  const [local, rest] = splitProps(props, ["class"]);
  const field = useFormField();
  return (
    <p
      data-slot="form-description"
      id={field.formDescriptionId}
      class={cn("text-muted-foreground text-sm", local.class)}
      {...rest}
    />
  );
};

/* ------------------------------- FormMessage ------------------------------- */

interface FormMessageProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  children?: JSX.Element;
}

const FormMessage: Component<FormMessageProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  const field = useFormField();
  return (
    <p
      data-slot="form-message"
      id={field.formMessageId}
      class={cn("text-destructive text-sm", local.class)}
      {...rest}
    >
      {local.children}
    </p>
  );
};

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
};
export type { FormFieldProps, FormMessageProps };
