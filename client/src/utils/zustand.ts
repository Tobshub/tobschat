import { SetStateAction, useCallback } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type EqualityFn<T> = (left: T | null | undefined, right: T | null | undefined) => boolean;

// eslint-disable-next-line @typescript-eslint/ban-types
const isFunction = (fn: unknown): fn is Function => typeof fn === "function";

/**
 * Create a global state
 *
 * It returns a set of functions
 * - `use`: Works like React.useState. "Registers" the component as a listener on that key
 * - `get`: retrieves a key without a re-render
 * - `set`: sets a key. Causes re-renders on any listeners
 * - `getAll`: retrieves the entire state (all keys) as an object without a re-render
 * - `reset`: resets the state back to its initial value
 *
 * @example
 * import { createStore } from 'create-store';
 *
 * const store = createStore({ count: 0 });
 *
 * const Component = () => {
 *   const [count, setCount] = store.use('count');
 *   ...
 * };
 */
export const createGlobalStore = <State extends object>(initialState: State, store_name?: string, store_storage?: Storage) => {
  const store = create<State>()(
    persist(() => structuredClone(initialState), {
      name: store_name ?? "tobschat-global-store",
      storage: createJSONStorage(() => store_storage ?? sessionStorage),
      partialize: (state) => ({ ...state }),
    })
  );

  const setter = <T extends keyof State>(key: T, value: SetStateAction<State[T]>) => {
    if (isFunction(value)) {
      store.setState((prevValue) => ({ [key]: value(prevValue[key]) } as unknown as Partial<State>));
    } else {
      store.setState({ [key]: value } as unknown as Partial<State>);
    }
  };
  return {
    /** Works like React.useState. "Registers" the component as a listener on that key. */
    use<K extends keyof State>(
      key: K,
      defaultValue?: State[K],
      equalityFn?: EqualityFn<State[K]>
    ): [State[K], (value: SetStateAction<State[K]>) => void] {
      // If state isn't defined for a given defaultValue, set it.
      if (defaultValue !== undefined && !(key in store.getState())) {
        setter(key, defaultValue);
      }
      const result = store((state) => state[key], equalityFn);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const keySetter = useCallback((value: SetStateAction<State[K]>) => setter(key, value), [key]);
      return [result, keySetter];
    },

    /** Listens on the entire state, causing a re-render when anything in the state changes. */
    useAll: () => store((state) => state),

    /** Deletes a `key` from state, causing a re-render for anything listening. */
    delete<K extends keyof State>(key: K) {
      store.setState((prevState) => {
        const { [key]: _, ...rest } = prevState;
        return rest as State; // TODO(acorn1010): Why can't this be Omit<State, K>?
      }, true);
    },

    /** Retrieves the current `key` value. Does _not_ listen on state changes (meaning no re-renders). */
    get<K extends keyof State>(key: K) {
      return store.getState()[key];
    },

    /** Retrieves the entire state. Does _not_ listen on state changes (meaning no re-renders). */
    getAll: () => store.getState(),

    /** Returns `true` if `key` is in the state. */
    has<K extends keyof State>(key: K) {
      return key in store.getState();
    },

    /** Sets a `key`, triggering a re-render for all listeners. */
    set: setter,

    /** Sets the entire state, removing any keys that aren't present in `state`. */
    setAll: (state: State) => store.setState(state, true),

    /** Updates the keys in `state`, leaving any keys / values not in `state` unchanged. */
    update: (state: Partial<State>) => store.setState(state, false),

    /** Resets the entire state back to its initial state when the store was created. */
    reset: () => store.setState(structuredClone(initialState), true),
  };
};

/**
 * Returns a wrapped `store` that can't be modified. Useful when you want to
 * control who is able to write to a store.
 */
export function createReadonlyStore<T extends ReturnType<typeof createGlobalStore>>(store: T) {
  type State = ReturnType<T["getAll"]>;
  return {
    get: store.get,
    getAll: store.getAll,
    use: <K extends keyof State>(key: K, equalityFn?: EqualityFn<State[K]>) =>
      (store.use as any)(key, undefined, equalityFn)[0] as State[K] | undefined | null,
    useAll: store.useAll,
  };
}

