import uniqueKey from "../utils/uniqueKey";
import type { WidgetMessagePort } from "./WidgetMessagePort";

export function callFunction<Args extends any[], R>(
  port: WidgetMessagePort,
  fnName: string,
  ...args: Args
) {
  return new Promise<R>((resolve) => {
    const key = uniqueKey();

    port.postMessage({ eventType: `call/${fnName}`, args, key });

    port.onMessage(`result/${fnName}`, (event) => resolve(event.detail.value), {
      once: true,
    });
  });
}
