import { bindEvent, bindProperty } from "./internal";
import {
  WidgetMessagePort,
  getWidgetMessagePort,
} from "./internal/WidgetMessagePort";
import { callFunction } from "./internal/callFunction";

getWidgetMessagePort().addMessagePort(window.parent, document.referrer);

export class B2ChatStore {
  port: WidgetMessagePort = getWidgetMessagePort();

  methods = {
    updateContactInfo: (contactInfo: {}): Promise<boolean> =>
      callFunction(this.port, "updateContactInfo", contactInfo),
  };

  events = {
    onChatClosed: bindEvent(this.port, "chatClosed"),
  };

  state = {
    agent: bindProperty(this.port, "agent", {}),
    activeChat: bindProperty(this.port, "activeChat", {}),
    contactInfo: bindProperty(this.port, "contactInfo", {}),
  };
}

export const getB2ChatStore = (() => {
  let instance: B2ChatStore;

  return () => {
    return (instance ??= new B2ChatStore());
  };
})();
