import { NodePath } from "@babel/core";
import {
  WidgetMessage,
  WidgetMessageEventType,
  WidgetMessageListener,
  Unsubscriber,
} from "./types";

const isWidgetMessage = (
  event: MessageEvent<any>
): event is MessageEvent<WidgetMessage> => event.data?.WIDGET_MESSAGE;

export class WidgetMessagePort extends window.EventTarget {
  private messagePorts: { port: Window; origin: string }[] = [];

  constructor(private window: Window & typeof globalThis) {
    super();
    this.connect();
  }

  connect() {
    this.window.addEventListener("message", this.windowMessageHandler);
  }

  disconnect() {
    this.window.removeEventListener("message", this.windowMessageHandler);
    this.messagePorts = [];
  }

  private windowMessageHandler = (event: MessageEvent) => {
    if (isWidgetMessage(event)) {
      const { data, source, origin } = event;

      const widgetEvent = new this.window.CustomEvent(data.eventType, {
        detail: data,
      });

      Object.defineProperties(widgetEvent, {
        source: { value: source, enumerable: true },
        origin: { value: origin, enumerable: true },
      });

      debugIncoming(data, origin);
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
      try {
        debugOutgoing(message, origin);
        port.postMessage(message, origin);
      } catch (error) {
        console.log(error);
      }
    });
  };
}

export const getWidgetMessagePort = (() => {
  let instance: WidgetMessagePort;

  return () => {
    return (instance ??= new WidgetMessagePort(window));
  };
})();

function debugEnabled() {
  try {
    return window.localStorage.getItem("widget-debug") === "1";
  } catch {
    return false;
  }
}

function noop() {}

const debugIncoming = debugEnabled()
  ? (data: WidgetMessage, origin: string) => {
      const message = `[widget] < ${data.eventType} from ${origin} ${data.key}`;

      if (data.args) console.log(message, ...data.args);
      else if (data.value) console.log(message, data.value);
    }
  : noop;

const debugOutgoing = debugEnabled()
  ? (data: WidgetMessage, origin: string) => {
      const message = `[widget] > ${data.eventType} to   ${origin} ${data.key}`;

      if (data.args) console.log(message, ...data.args);
      else if (data.value) console.log(message, data.value);
    }
  : noop;

/*
 * This allows to MessagesPort messages to debug purposes
 * use `$widgetDebug = true` to enable debug messages
 */
Object.defineProperty(window, "$widgetDebug", {
  configurable: true,
  get: debugEnabled,
  set(enable) {
    try {
      window.localStorage.setItem("widget-debug", enable ? "1" : "");
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  },
});
