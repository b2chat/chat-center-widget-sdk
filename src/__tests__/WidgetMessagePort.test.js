const { test, expect, describe, afterEach, jest } = require("@jest/globals");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("", {});
globalThis.window = dom.window;

const { WidgetMessagePort } = require("../internal/WidgetMessagePort");

const getWidgetMessageEvent = (data = {}) => {
  return new window.MessageEvent("message", {
    data: { WIDGET_MESSAGE: true, key: 0, ...data },
  });
};

describe("widgetMessagePort class", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("append listener for window:message event", () => {
    jest.spyOn(window, "addEventListener");

    new WidgetMessagePort(window);

    expect(window.addEventListener).toHaveBeenCalled();
  });

  test(`listen subscribe/[eventName] events`, async () => {
    const wmp = new WidgetMessagePort(window);
    const fn = jest.fn(console.log);

    wmp.onMessage("subscribe/foo", fn);

    window.dispatchEvent(getWidgetMessageEvent({ eventType: "subscribe/foo" }));

    expect(fn).toHaveBeenCalled();
  });

  test("listen usubscribe/[eventName] events", async () => {
    const wmp = new WidgetMessagePort(window);
    const fn = jest.fn();

    wmp.onMessage("unsubscribe/foo", fn);

    window.dispatchEvent(
      getWidgetMessageEvent({ eventType: "unsubscribe/foo" })
    );

    expect(fn).toHaveBeenCalled();
  });

  test("listen event/[eventName] events", async () => {
    const wmp = new WidgetMessagePort(window);
    const fn = jest.fn();

    wmp.onMessage("event/foo", fn);

    window.dispatchEvent(getWidgetMessageEvent({ eventType: "event/foo" }));

    expect(fn).toHaveBeenCalled();
  });

  test("listen call/[eventName] events", async () => {
    const wmp = new WidgetMessagePort(window);
    const fn = jest.fn();

    wmp.onMessage("call/foo", fn);

    window.dispatchEvent(getWidgetMessageEvent({ eventType: "call/foo" }));

    expect(fn).toHaveBeenCalled();
  });
});
