import { Unsubscriber } from "../internal/types";

export type Subscriber<T> = (value: T, unsubscribe: Unsubscriber) => void;

export { Unsubscriber };

export interface EventEmitter<T = unknown> {
  dispatch: (value: T) => void;
  subscribe: (run: Subscriber<T>) => Unsubscriber;
}

/**
 * Start and Stop callback lifecycle of `eventEmitter`
 */
export type StartStopNotifier<T> = (
  dispatcher: (value: T) => void
) => void | Stop;

/**
 * This will be called after the last unsubscription for cleanup purposes
 */
export type Stop = () => void;

/**
 * Creates a minimalist EventEmitter for a single event name
 * @param start Executed after the first subscription, it could returns a `stop`
 * callback that will be executed after the last unsubscription just cleanup purposes
 */
export const eventEmitter = <T>(
  start?: StartStopNotifier<T>
): EventEmitter<T> => {
  const subscribers = new Map<Subscriber<T>, Unsubscriber>();

  let stop: Stop | void;

  const subscribe = (run: Subscriber<T>): Unsubscriber => {
    const unsubscriber = () => {
      subscribers.delete(run);

      if (subscribers.size === 0) stop?.();
    };

    subscribers.set(run, unsubscriber);

    if (subscribers.size === 1) {
      stop = start?.(dispatch);
    }

    return unsubscriber;
  };

  const dispatch = (value: T) => {
    subscribers.forEach((unsubscriber, run) => run(value, unsubscriber));
  };

  return { subscribe, dispatch };
};
