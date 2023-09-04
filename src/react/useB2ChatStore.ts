import {
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { B2ChatStore, getB2ChatStore } from "../B2ChatStore";
import { Unsubscriber, EventEmitter } from "../utils/eventEmitter";
import { Readable } from "../utils/store";

export type B2ChatState = {
  [key in keyof B2ChatStore["state"]]: B2ChatStore["state"][key] extends Readable<
    infer T
  >
    ? T
    : never;
} & { [key: string]: any };

type UseB2ChatStoreOptions = {
  [key in keyof B2ChatStore["events"]]?: (
    event: B2ChatStore["events"][key] extends EventEmitter<infer T> ? T : never
  ) => void;
};

const useB2ChatStore = (options?: UseB2ChatStoreOptions) => {
  const store = useMemo(getB2ChatStore, []);

  const reRender = useReRender();

  useEffect(() => {
    const subscriptions: Unsubscriber[] = [];

    options &&
      Object.entries(options).forEach(([name, handler]) => {
        if (store.events[name]) {
          const emitter: EventEmitter = store.events[name];

          subscriptions.push(emitter.subscribe(handler));
        }
      });

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const [state, setState] = useState(
    () =>
      new Proxy({} as B2ChatState, {
        get(target, propName: string) {
          const property: Readable = store.state[propName];

          if (property) {
            return (target[propName] = property.get());
          }
        },
      })
  );

  useEffect(() => {
    const subscriptions: Record<string, Unsubscriber> = {};

    const nextState = new Proxy({} as B2ChatState, {
      get(target, propName: string) {
        const property: Readable = store.state[propName];

        if (property) {
          subscriptions[propName] ??= property.subscribe((value) => {
            target[propName] = value;
            reRender();
          });

          return target[propName];
        }
      },
    });

    setState(nextState);

    return () => {
      Object.values(subscriptions).forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return { ...store.methods, state };
};

export default useB2ChatStore;

export const useReRender = () => {
  const [, reRender] = useReducer((v) => v + 1, 0);

  return reRender;
};
