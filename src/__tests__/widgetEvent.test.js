const { describe, test, expect, jest } = require("@jest/globals");
const { registerEvent } = require("../internal/registerEvent");
const { bindEvent } = require("../internal/bindEvent");
const { parentAndWidgetMock } = require("../__utils__/parentAndWidgetMock");

const { windowPort, widgetPort } = parentAndWidgetMock();

const { WidgetMessagePort } = require("../internal/WidgetMessagePort");
const { eventEmitter } = require("../utils/eventEmitter");

describe("register a event listener between Window and a Widget", () => {
  test("register/emit event", async () => {
    /**
     * This test simulate a event sent from B2ChatCenterApp to a Widget
     */

    const emitterInWindow = eventEmitter();

    // Register a eventEmitter that will be available for the widgets
    registerEvent(windowPort, "greeting", emitterInWindow);

    const listener = jest.fn();

    // This will call the `increment' function through postMessage
    const emitterInWidget = bindEvent(widgetPort, "greeting");
    emitterInWidget.subscribe((value, unsubscribe) => {
      listener(value);
      unsubscribe();
    });

    // trigger a greeting event
    emitterInWindow.dispatch("hello");

    expect(listener).toBeCalledWith("hello");
  });
});
