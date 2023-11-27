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

    try {
      const value = await handler(...args);

      port.postMessage(
        { eventType: `result/${fnName}`, value, key },
        { port: source, origin }
      );
    } catch (error) {
      const content = error instanceof Error ? error.message : error;

      port.postMessage(
        { eventType: `error/${fnName}`, error: content, key },
        { port: source, origin }
      );
    }
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
    pendingCalls.delete(source);

    const controller = new AbortController();

    try {
      pendingCalls.set(source, controller);
      const value = await handler(...args, controller.signal);

      controller.signal.throwIfAborted();

      pendingCalls.delete(source);
      port.postMessage(
        { eventType: `result/${fnName}`, value, key },
        { port: source, origin }
      );
    } catch (error) {
      pendingCalls.delete(source);

      if (controller.signal.aborted) {
        port.postMessage(
          { eventType: `cancelled/${fnName}`, key },
          { port: source, origin }
        );
      } else {
        const content = error instanceof Error ? error.message : error;
        port.postMessage(
          { eventType: `error/${fnName}`, error: content, key },
          { port: source, origin }
        );
      }
    }
  });
}
