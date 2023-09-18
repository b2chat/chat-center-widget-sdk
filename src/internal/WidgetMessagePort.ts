import {
  WidgetMessage,
  WidgetMessageEventType,
  WidgetMessageListener,
  Unsubscriber,
} from "../types";

const isWidgetMessage = (
  event: MessageEvent<any>
): event is MessageEvent<WidgetMessage> => event.data?.WIDGET_MESSAGE;

export class WidgetMessagePort extends window.EventTarget {
  private messagePorts: { port: Window; origin: string }[] = [];

  constructor(private win: Window & typeof globalThis) {
    super();
    this.connect();
  }

  connect() {
    this.win.addEventListener("message", this.windowMessageHandler);
  }

  disconnect() {
    this.win.removeEventListener("message", this.windowMessageHandler);
    this.messagePorts = [];
  }

  private windowMessageHandler = (event: MessageEvent) => {
    if (isWidgetMessage(event)) {
      const { data, source, origin } = event;

      const widgetEvent = new this.win.CustomEvent(data.eventType, {
        detail: data,
      });

      Object.defineProperties(widgetEvent, {
        source: { value: source, enumerable: true },
        origin: { value: origin, enumerable: true },
      });

      console.log(
        `[widget-message] < ${data.eventType} from ${origin} ${data.key}`
      );
      this.dispatchEvent(widgetEvent);
    }
  };

  onMessage = <T extends WidgetMessageEventType>(
    eventType: T,
    listener: WidgetMessageListener<T>,
    options?: { once: boolean }
  ): Unsubscriber => {
    this.addEventListener(eventType, listener, options);

    const unsubscribe = () => {
      this.removeEventListener(eventType, listener);
    };

    return unsubscribe;
  };

  addMessagePort = (port: Window, origin: string) => {
    const { messagePorts, removeMessagePort } = this;

    removeMessagePort(port);
    messagePorts.push({ port, origin });
  };

  removeMessagePort = (port: Window) => {
    const { messagePorts } = this;

    const index = messagePorts.findIndex((other) => other.port === port);

    if (index !== -1) {
      messagePorts.splice(index, 1);
    }
  };

  postMessage = (
    message: WidgetMessage,
    options?: { port: Window; origin: string }
  ) => {
    const { messagePorts } = this;

    Object.defineProperties(message, {
      WIDGET_MESSAGE: {
        value: true,
        enumerable: true,
      },
    });

    const ports = options ? [options] : messagePorts;

    ports.forEach(({ port, origin }) => {
      console.log(
        `[widget-message] > ${message.eventType} to ${origin} ${message.key}`
      );
      port.postMessage(message, origin);
    });
  };
}

export const getWidgetMessagePort = (() => {
  let instance: WidgetMessagePort;

  return () => {
    return (instance ??= new WidgetMessagePort(window));
  };
})();
