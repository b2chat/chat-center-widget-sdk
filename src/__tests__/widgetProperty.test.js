const { describe, test, expect, jest } = require("@jest/globals");
const { readable, writable, when } = require("../utils/store");
const { registerProperty } = require("../internal/registerProperty");
const { bindProperty } = require("../internal/bindProperty");
const { parentAndWidgetMock } = require("../__utils__/parentAndWidgetMock");

const { windowPort, widgetPort } = parentAndWidgetMock();

describe("register a property between Window and a Widget", () => {
  test("register/bind property", async () => {
    /**
     * This test simulate the communication between B2ChatCenterApp
     * and their Widgets through postMessage
     */

    // Register a property in Window scope
    const propInWindow = writable("hello");
    registerProperty(windowPort, "myProp", propInWindow);

    // This bind a prop registered previously in parent Window
    const propInWidget = bindProperty(widgetPort, "myProp", "none");

    expect(propInWidget.get()).toBe("none");

    //  This will trigger the subscription to myProp and going to wait for the latest value
    await propInWidget.when((value) => value === "hello");

    expect(propInWidget.get()).toBe(propInWindow.get());
  });
});
