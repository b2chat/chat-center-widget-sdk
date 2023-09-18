import { Readable, readable } from "../utils/store";
import uniqueKey from "../utils/uniqueKey";
import { WidgetMessagePort } from "./WidgetMessagePort";

export function bindProperty<T>(
  port: WidgetMessagePort,
  propName: string,
  initialValue: T
): Readable<T> {
  return readable(initialValue, (set) => {
    const key = uniqueKey();

    const unsubscribeFromPort = port.onMessage(`event/${propName}`, (event) => {
      const { detail } = event;

      if (detail.key === key) set(detail.value);
    });

    port.postMessage({ eventType: `subscribe/${propName}`, key });

    return () => {
      unsubscribeFromPort();
      port.postMessage({ eventType: `unsubscribe/${propName}`, key });
    };
  });
}
