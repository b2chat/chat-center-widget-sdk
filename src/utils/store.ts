import { Stop, Subscriber, Unsubscriber, eventEmitter } from "./eventEmitter";

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

export interface Writable<T = unknown> extends Readable<T> {
  set: (value: T) => void;
  update: (fn: Updater<T>) => void;
}

export type EqualFn<T> = (currentValue: T, nextValue: T) => boolean;

export const strictEquals = <T>(currentValue: T, nextValue: T) =>
  currentValue === nextValue;

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
  equalFn: EqualFn<T> = strictEquals
): Writable<T> => {
  let currentValue = initialValue;

  const emitter = eventEmitter<T>(() => start?.(set, update));

  const get = () => currentValue;

  const set = (nextValue: T) => {
    if (!equalFn(currentValue, nextValue)) {
      currentValue = nextValue!;
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
    get,
    set,
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
  equalFn: EqualFn<T> = strictEquals
): Readable<T> => writable(initialValue, start, equalFn);
