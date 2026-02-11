import {
  type Component,
  type ComponentProps,
  type JSX,
  splitProps,
  createSignal,
  onMount,
  onCleanup,
  Show,
} from "solid-js";
import { isServer } from "solid-js/web";
import { Toaster as SolidSonner } from "solid-sonner";

type ToasterProps = ComponentProps<typeof SolidSonner>;

const Toaster: Component<ToasterProps> = (props) => {
  const [local, rest] = splitProps(props, ["theme", "style"]);

  const [mounted, setMounted] = createSignal(false);
  const [resolvedTheme, setResolvedTheme] = createSignal<"light" | "dark">(
    "light"
  );

  onMount(() => {
    if (isServer) return;

    setMounted(true);

    // Detect initial theme from <html> class
    const detect = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setResolvedTheme(isDark ? "dark" : "light");
    };
    detect();

    // Watch for class changes on <html> to detect theme switches
    const observer = new MutationObserver(detect);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    onCleanup(() => observer.disconnect());
  });

  return (
    <Show when={mounted()}>
      <SolidSonner
        theme={local.theme ?? resolvedTheme()}
        class="toaster group"
        toastOptions={{
          classes: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-medium",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-medium",
          },
        }}
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
            ...(typeof local.style === "object" ? local.style : {}),
          } as JSX.CSSProperties
        }
        {...rest}
      />
    </Show>
  );
};

export { Toaster };
export type { ToasterProps };
