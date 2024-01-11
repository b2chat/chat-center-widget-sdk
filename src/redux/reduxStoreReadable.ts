import type { Store } from "redux";
import { asReadable, writable } from "../utils/store";

type Selector<S, T = any> = (state: S) => T;

export const reduxStoreReadable = <S, T>(
  store: Store<S>,
  selector: Selector<S, T>,
  dependencies: Selector<S>[] = []
) => {
  let currentState = store.getState();
  const initialValue = selector(currentState);

  return asReadable(
    writable<T>(initialValue, (set) => {
      let depsEvaluated = Array(dependencies.length);

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
    }).extend((self) => ({
      selector,
      evaluate: () => self.set(selector(store.getState())),
    }))
  );
};
