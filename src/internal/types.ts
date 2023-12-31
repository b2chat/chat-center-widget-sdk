export type WidgetMessage = (
  | {
      eventType: `subscribe/${string}`;
      key: string;
    }
  | {
      eventType: `unsubscribe/${string}`;
      key: string;
    }
  | {
      eventType: `event/${string}`;
      value: any;
      key: string;
    }
  | {
      eventType: `call/${string}`;
      transfer?: Transferable;
      args: any[];
      key: string;
    }
  | {
      eventType: `cancelled/${string}`;
      key: string;
    }
  | {
      eventType: `result/${string}`;
      value: any;
      key: string;
    }
  | {
      eventType: `error/${string}`;
      error: any;
      key: string;
    }
) & {
  [key: string]: any;
};

export type WidgetMessageEventType = WidgetMessage["eventType"];

export type WidgetMessageEventMap = {
  [T in WidgetMessageEventType]: WidgetMessageEvent<T>;
};

export type WidgetMessageListener<T extends WidgetMessageEventType> = (
  event: WidgetMessageEvent<T>
) => void;

export type WidgetMessageEvent<
  T extends WidgetMessageEventType = WidgetMessageEventType
> = CustomEvent<Extract<WidgetMessage, { eventType: T }>> & {
  source: Window;
  origin: string;
};

export type Unsubscriber = () => void;
