import {
  createContext as solidCreateContext,
  useContext as solidUseContext,
  splitProps,
  type JSX,
  type Context,
} from 'solid-js';

type Scope<C = any> = { [scopeName: string]: Context<C>[] } | undefined;
type ScopeHook = (scope: Scope) => { [__scopeProp: string]: Scope };
interface CreateScope {
  scopeName: string;
  (): ScopeHook;
}

/**
 * Create a context with a required provider.
 * If no default value is provided, using the context outside a provider will throw.
 */
function createContext<ContextValueType extends object | null>(
  rootComponentName: string,
  defaultContext?: ContextValueType
) {
  const Context = solidCreateContext<ContextValueType | undefined>(defaultContext);

  function Provider(props: ContextValueType & { children: JSX.Element }) {
    // IMPORTANT: Do NOT destructure `children` from props in SolidJS.
    // Destructuring eagerly evaluates children, which means child components
    // would render BEFORE the Provider wraps them, causing context to be missing.
    // Use splitProps to preserve lazy evaluation of children.
    const [local, context] = splitProps(props as any, ['children']);
    return (
      <Context.Provider value={context as ContextValueType}>
        {local.children}
      </Context.Provider>
    );
  }

  function useContext(consumerName: string) {
    const context = solidUseContext(Context);
    if (context) return context;
    if (defaultContext !== undefined) return defaultContext;
    throw new Error(
      `\`${consumerName}\` must be used within \`${rootComponentName}\``
    );
  }

  return [Provider, useContext] as const;
}

/* -------------------------------------------------------------------------------------------------
 * createContextScope
 * -----------------------------------------------------------------------------------------------*/

function createContextScope(
  scopeName: string,
  createContextScopeDeps: CreateScope[] = []
) {
  let defaultContexts: any[] = [];

  function createScopedContext<ContextValueType extends object | null>(
    rootComponentName: string,
    defaultContext?: ContextValueType
  ) {
    const BaseContext = solidCreateContext<ContextValueType | undefined>(
      defaultContext
    );
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];

    function Provider(
      props: ContextValueType & {
        scope: Scope<ContextValueType>;
        children: JSX.Element;
      }
    ) {
      // IMPORTANT: Do NOT destructure `children` from props in SolidJS.
      // Destructuring eagerly evaluates children, causing them to render
      // BEFORE the Provider wraps them, so context lookups fail during SSR.
      // Use splitProps to preserve lazy evaluation of children.
      const [local, context] = splitProps(props as any, ['scope', 'children']);
      const Ctx = local.scope?.[scopeName]?.[index] || BaseContext;
      return (
        <Ctx.Provider value={context as ContextValueType}>
          {local.children}
        </Ctx.Provider>
      );
    }

    function useContext(
      consumerName: string,
      scope: Scope<ContextValueType | undefined>
    ) {
      const Ctx = scope?.[scopeName]?.[index] || BaseContext;
      const context = solidUseContext(Ctx);
      if (context) return context;
      if (defaultContext !== undefined) return defaultContext;
      throw new Error(
        `\`${consumerName}\` must be used within \`${rootComponentName}\``
      );
    }

    return [Provider, useContext] as const;
  }

  const createScope: CreateScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return solidCreateContext(defaultContext);
    });
    return function useScope(scope: Scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return {
        [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts },
      };
    };
  };

  createScope.scopeName = scopeName;
  return [
    createScopedContext,
    composeContextScopes(createScope, ...createContextScopeDeps),
  ] as const;
}

function composeContextScopes(
  ...scopes: [CreateScope, ...CreateScope[]]
): CreateScope {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;

  const createScope: CreateScope = () => {
    const scopeHooks = scopes.map((createScope) => ({
      useScope: createScope(),
      scopeName: createScope.scopeName,
    }));

    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce(
        (nextScopes, { useScope, scopeName }) => {
          const scopeProps = useScope(overrideScopes);
          const currentScope = scopeProps[`__scope${scopeName}`];
          return { ...nextScopes, ...currentScope };
        },
        {}
      );

      return { [`__scope${baseScope.scopeName}`]: nextScopes };
    };
  };

  createScope.scopeName = baseScope.scopeName;
  return createScope;
}

export { createContext, createContextScope };
export type { CreateScope, Scope };
