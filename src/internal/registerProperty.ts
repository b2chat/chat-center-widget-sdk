import type { Readable } from "../utils/store";
import type { WidgetMessagePort } from "./WidgetMessagePort";

export function registerProperty<T>(
  port: WidgetMessagePort,
  propName: string,
  property: Readable<T>
) {
  return port.onMessage(`subscribe/${propName}`, (event) => {
    const {
      source,
      origin,
      detail: { key },
    } = event;

    const unsubscribeFromPort = port.onMessage(
      `unsubscribe/${propName}`,
      (unsubscribeEvent) => {
        if (unsubscribeEvent.detail.key === key) {
          unsubscribeFromProp();
          unsubscribeFromPort();
        }
      }
    );

    const unsubscribeFromProp = property.subscribe(
      (value, unsubscribeFromProp) => {
        if (source.closed) {
          unsubscribeFromProp();
          unsubscribeFromPort();
        } else {
          port.postMessage(
            { eventType: `event/${propName}`, value, key },
            { port: source, origin }
          );
        }
      }
    );
  });
}
