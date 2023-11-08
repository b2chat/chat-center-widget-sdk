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

export function registerAsync<Fn extends (...args: any[]) => any>(
  port: WidgetMessagePort,
  fnName: string,
  handler: Fn
) {
  const pendingCalls = new Map<Window, AbortController>();

  return port.onMessage(`call/${fnName}`, async (event) => {
    const {
      source,
      origin,
      detail: { key, args },
    } = event;

    pendingCalls.get(source)?.abort();

    const controller = new AbortController();
    controller.signal.onabort = () => {
      pendingCalls.delete(source);
      port.postMessage(
        { eventType: `cancelled/${fnName}`, key },
        { port: source, origin }
      );
    };

    pendingCalls.set(source, controller);

    const value = await handler(...args, controller.signal);

    if (!controller.signal.aborted) {
      port.postMessage(
        { eventType: `result/${fnName}`, value, key },
        { port: source, origin }
      );
    }
  });
}
