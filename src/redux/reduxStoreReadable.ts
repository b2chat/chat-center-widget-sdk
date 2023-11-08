import type { Store } from "redux";
import { Readable, readable } from "../utils/store";

type Selector<S, T = any> = (state: S) => T;

const id: Selector<any> = (value) => value;

export const reduxStoreReadable = <S, T>(
  store: Store<S>,
  selector: Selector<S, T>,
  dependencies: Selector<S>[] = []
): Readable<T> => {
  let currentState = store.getState();

  let depsEvaluated = Array(dependencies.length);

  const initialValue = selector(currentState);

  return readable(initialValue, (set) => {
    const unsubscribeFromRedux = store.subscribe(() => {
      currentState = store.getState();

      let changed = dependencies.length === 0;
      for (let i = 0; i < dependencies.length; i++) {
        const nextValue = dependencies[i](currentState);

        if (depsEvaluated[i] !== nextValue) changed = true;

        depsEvaluated[i] = nextValue;
      }
      if (changed) set(selector(currentState));
    });

    return unsubscribeFromRedux;
  });
};
