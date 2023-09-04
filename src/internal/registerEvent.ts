import type { EventEmitter } from "../utils/eventEmitter";
import type { WidgetMessagePort } from "./WidgetMessagePort";

export function registerEvent<T>(
  port: WidgetMessagePort,
  eventName: string,
  emitter: EventEmitter<T>
) {
  return port.onMessage(`subscribe/${eventName}`, (event) => {
    const {
      source,
      origin,
      detail: { key },
    } = event;

    const unsubscribeFromPort = port.onMessage(
      `unsubscribe/${eventName}`,
      (unsubscribeEvent) => {
        if (unsubscribeEvent.detail.key === key) {
          unsubscribeFromEmitter();
          unsubscribeFromPort();
        }
      }
    );

    const unsubscribeFromEmitter = emitter.subscribe(
      (value, unsubscribeFromEmitter) => {
        if (source.closed) {
          unsubscribeFromPort();
          unsubscribeFromEmitter();
        } else {
          port.postMessage(
            { eventType: `event/${eventName}`, value, key },
            { port: source, origin }
          );
        }
      }
    );
  });
}
