import type { WidgetMessagePort } from "./WidgetMessagePort";

export function registerFunction<Fn extends (...args: any[]) => any>(
  port: WidgetMessagePort,
  fnName: string,
  handler: Fn
) {
  return port.onMessage(`call/${fnName}`, async (event) => {
    const {
      source,
      origin,
      detail: { key, args },
    } = event;

    const value = await handler(...args);

    port.postMessage(
      { eventType: `result/${fnName}`, value, key },
      { port: source, origin }
    );
  });
}
