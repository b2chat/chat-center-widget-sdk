import { Stop, Subscriber, Unsubscriber, eventEmitter } from "./eventEmitter";

export type { Stop, Subscriber, Unsubscriber };

export interface Readable<T = unknown> {
  subscribe: (run: Subscriber<T>) => Unsubscriber;
  get: () => T;
}

export interface Writable<T = unknown> extends Readable<T> {
  set: (value: T) => void;
  update: (fn: Updater<T>) => void;
}

export type EqualFn<T> = (currentValue: T, nextValue: T) => boolean;

export const strictEquals = <T>(currentValue: T, nextValue: T) =>
  currentValue === nextValue;

export type StartStopNotifier<T> = (
  set: (value: T) => void,
  update: (fn: Updater<T>) => void
) => void | Stop;

export type Updater<T> = (value: T) => T;

export const writable = <T>(
  initialValue: T,
  start?: StartStopNotifier<T>,
  equalFn: EqualFn<T> = strictEquals
): Writable<T> => {
  const emitter = eventEmitter<T>(() => start?.(set, update));

  let currentValue = initialValue;

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

  return {
    get,
    set,
    update,
    subscribe,
  };
};

export const readable = <T>(
  initialValue: T,
  start?: StartStopNotifier<T>,
  equalFn: EqualFn<T> = strictEquals
): Readable<T> => writable(initialValue, start, equalFn);
