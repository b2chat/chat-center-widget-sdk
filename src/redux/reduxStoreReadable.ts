import type { Store } from "redux";
import { EqualFn, Readable, readable, strictEquals } from "../utils/store";

export type Selector<S, T = unknown> = (state: S) => T;

export const reduxStoreReadable = <S, T>(
  store: Store<S>,
  selector: Selector<S, T>,
  equalFn: EqualFn<T> = strictEquals
): Readable<T> => {
  const initialValue = selector(store.getState());

  return readable(
    initialValue,
    (set) => {
      const unsubscribeFromRedux = store.subscribe(() => {
        const nextValue = selector(store.getState());

        set(nextValue);
      });

      return unsubscribeFromRedux;
    },
    equalFn
  );
};
