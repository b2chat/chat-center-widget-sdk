import { extendImpl, type Extendable } from "../internal/extendable";
import {
  type Stop,
  type Subscriber,
  type Unsubscriber,
  eventEmitter,
} from "./eventEmitter";
export type { Stop, Subscriber, Unsubscriber };

export interface Readable<T = unknown> {
  /**
   * subscribe to value changes
   */
  subscribe: (run: Subscriber<T>) => Unsubscriber;
  /**
   * @returns the current store's value
   */
  get: () => T;
  /**
   * Wait for specific value
   * @param predicate a condition for fulfill the promise
   * @returns the current value
   */
  when: (predicate: (value: T) => boolean) => Promise<T>;
}
export type ReadableExtendable<T = unknown> = Extendable<Readable<T>>;

export interface Writable<T = unknown> extends Omit<Readable<T>, "extend"> {
  set: (value: T) => void;
  update: (fn: Updater<T>) => void;
}
export type WritableExtendable<T = unknown> = Extendable<Writable<T>>;

export type EqualFn<T> = (currentValue: T, nextValue: T) => boolean;

export const safeEqual = <T>(currentValue: T, nextValue: T) =>
  !safeNotEqual(currentValue, nextValue);

export function safeNotEqual(a: any, b: any) {
  return a != a
    ? b == b
    : a !== b || (a && typeof a === "object") || typeof a === "function";
}

/**
 * Start and Stop callback lifecycle of the `Writable` or `Readable` observable
 */
export type StartStopNotifier<T> = (
  set: (value: T) => void,
  update: (fn: Updater<T>) => void
) => void | Stop;

export type Updater<T> = (value: T) => T;

/**
 * Creates a Observable that internally use a `eventEmitter` to store the subscriptions
 * @param initialValue
 * @param start executed just before the first subscription, it could returns a `stop`
 * callback that will be executed after the last unsubscription for cleanup purposes
 * @param equalFn by default strictEquals `===` will be use to detect when the value has changed
 * @returns a writable observable
 */
export const writable = <T>(
  initialValue: T,
  start?: StartStopNotifier<T>,
  equalFn: EqualFn<T> = safeEqual
): WritableExtendable<T> => {
  let currentValue = initialValue;

  const emitter = eventEmitter<T>(() => start?.(set, update));

  const get = () => currentValue;

  const set = (nextValue: T) => {
    if (!equalFn(currentValue, nextValue)) {
      currentValue = nextValue;
      emitter.dispatch(currentValue);
    }
  };

  const update = (fn: Updater<T>) => set(fn(currentValue));

  const subscribe = (run: Subscriber<T>): Unsubscriber => {
    const unsubscriber = emitter.subscribe(run);

    run(currentValue, unsubscriber);

    return unsubscriber;
  };

  const when = (predicate: (value: T) => boolean) =>
    new Promise<T>((resolve) => {
      subscribe((value, unsubscribe) => {
        if (predicate(value)) {
          unsubscribe();
          resolve(value);
        }
      });
    });

  return {
    extend(plugin) {
      return extendImpl(this, plugin);
    },
    set,
    get,
    update,
    subscribe,
    when,
  };
};

/**
 * Creates a Observable that internally use a `eventEmitter` to store the subscriptions
 * @param initialValue
 * @param start executed after the first subscription to init, it could returns a `stop`
 * callback that will be executed after the last unsubscription for cleanup purposes
 * @param equalFn by default `===` will be use to detect when the value has changed
 * @returns a readonly observable
 */
export const readable = <T>(
  initialValue: T,
  start?: StartStopNotifier<T>,
  equalFn: EqualFn<T> = safeEqual
): ReadableExtendable<T> => writable(initialValue, start, equalFn);

export type AsReadable<T> = T extends Writable<infer U>
  ? Readable<U> & Omit<T, "set" | "update">
  : never;

export const asReadable = <T>(store: T) => store as AsReadable<T>;
