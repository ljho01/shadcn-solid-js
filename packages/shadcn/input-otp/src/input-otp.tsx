import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
} from "solid-js";
import * as OTPFieldPrimitive from "@radix-solid/one-time-password-field";
import { cn } from "@shadcn-solid/utils";

/* -------------------------------------------------------------------------------------------------
 * InputOTP — Root wrapper
 * -----------------------------------------------------------------------------------------------*/

interface InputOTPProps extends ComponentProps<typeof OTPFieldPrimitive.Root> {
  class?: string;
  containerClass?: string;
}

const InputOTP: Component<InputOTPProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "containerClass"]);
  return (
    <OTPFieldPrimitive.Root
      data-slot="input-otp"
      class={cn("flex items-center has-disabled:opacity-50", local.class)}
      {...rest}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * InputOTPGroup — Groups input slots together
 * -----------------------------------------------------------------------------------------------*/

interface InputOTPGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: (el: HTMLDivElement) => void;
}

const InputOTPGroup: Component<InputOTPGroupProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="input-otp-group"
      class={cn(
        "has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive flex items-center rounded-lg has-aria-invalid:ring-3",
        local.class
      )}
      {...rest}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * InputOTPSlot — Individual OTP slot with styling
 * -----------------------------------------------------------------------------------------------*/

interface InputOTPSlotProps extends ComponentProps<
  typeof OTPFieldPrimitive.Input
> {
  class?: string;
}

const InputOTPSlot: Component<InputOTPSlotProps> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <OTPFieldPrimitive.Input
      data-slot="input-otp-slot"
      class={cn(
        "dark:bg-input/30 border-input data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive relative flex size-8 items-center justify-center border-y border-r text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg data-[active=true]:z-10 data-[active=true]:ring-3",
        local.class
      )}
      {...rest}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * InputOTPSeparator — Separator between groups
 * -----------------------------------------------------------------------------------------------*/

interface InputOTPSeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {}

const InputOTPSeparator: Component<InputOTPSeparatorProps> = (props) => {
  return (
    <div
      data-slot="input-otp-separator"
      class="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-minus"
      >
        <path d="M5 12h14" />
      </svg>
    </div>
  );
};

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
export type {
  InputOTPProps,
  InputOTPGroupProps,
  InputOTPSlotProps,
  InputOTPSeparatorProps,
};

// Re-export HiddenInput from primitive for form usage
export { OneTimePasswordFieldHiddenInput as InputOTPHiddenInput } from "@radix-solid/one-time-password-field";
