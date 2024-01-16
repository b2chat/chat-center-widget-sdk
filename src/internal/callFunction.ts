import { Unsubscribe } from "redux";
import uniqueKey from "../utils/uniqueKey";
import type { WidgetMessagePort } from "./WidgetMessagePort";

export const PromiseCancelled = Symbol("PromiseCancelled");

export function callFunction<Args extends any[], R>(
  port: WidgetMessagePort,
  fnName: string,
  ...args: Args
) {
  return new Promise<R>((resolve, reject) => {
    const subscriptions: Unsubscribe[] = [];
    const cleanup = () => {
      const call = (fn: () => any) => fn();
      subscriptions.forEach(call);
    };
    const key = uniqueKey();

    subscriptions.push(
      port.onMessage(`result/${fnName}`, (event) => {
        if (event.detail.key === key) {
          cleanup();
          resolve(event.detail.value);
        }
      })
    );

    subscriptions.push(
      port.onMessage(`cancelled/${fnName}`, (event) => {
        if (event.detail.key === key) {
          cleanup();
          reject(PromiseCancelled);
        }
      })
    );

    subscriptions.push(
      port.onMessage(`error/${fnName}`, (event) => {
        if (event.detail.key === key) {
          cleanup();
          reject(new Error(event.detail.error));
        }
      })
    );

    port.postMessage({ eventType: `call/${fnName}`, args, key });
  });
}
