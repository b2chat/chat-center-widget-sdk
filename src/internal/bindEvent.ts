import { eventEmitter } from "../utils/eventEmitter";
import uniqueKey from "../utils/uniqueKey";
import type { WidgetMessagePort } from "./WidgetMessagePort";

export function bindEvent<T>(port: WidgetMessagePort, eventName: string) {
  return eventEmitter<T>((dispatch) => {
    const key = uniqueKey();

    port.postMessage({ eventType: `subscribe/${eventName}`, key });

    const unsubscribeFromPort = port.onMessage(
      `event/${eventName}`,
      (event) => {
        const { detail } = event;

        if (key === detail.key) dispatch(detail.value);
      }
    );

    return () => {
      port.postMessage({ eventType: `unsubscribe/${eventName}`, key });
      unsubscribeFromPort();
    };
  });
}
