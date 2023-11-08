import { Unsubscribe } from "redux";
import uniqueKey from "../utils/uniqueKey";
import type { WidgetMessagePort } from "./WidgetMessagePort";

export function callFunction<Args extends any[], R>(
  port: WidgetMessagePort,
  fnName: string,
  ...args: Args
) {
  return new Promise<R>((resolve) => {
    const key = uniqueKey();

    port.onMessage(`result/${fnName}`, (event) => resolve(event.detail.value), {
      once: true,
    });

    port.postMessage({ eventType: `call/${fnName}`, args, key });
  });
}

export const PromiseCancelled = Symbol("PromiseCancelled");

export function callAsync<Args extends any[], R>(
  port: WidgetMessagePort,
  fnName: string,
  ...args: Args
) {
  return new Promise<R>((resolve, reject) => {
    const subscriptions: Unsubscribe[] = [];
    const cleanup = () => subscriptions.forEach((unsub) => unsub());
    const key = uniqueKey();

    subscriptions.push(
      port.onMessage(`result/${fnName}`, (event) => {
        cleanup();
        resolve(event.detail.value);
      })
    );

    subscriptions.push(
      port.onMessage(`cancelled/${fnName}`, () => {
        cleanup();
        reject(PromiseCancelled);
      })
    );

    port.postMessage({ eventType: `call/${fnName}`, args, key });
  });
}
