const { describe, test, expect, jest } = require("@jest/globals");
const { registerFunction } = require("../internal/registerFunction");
const { callFunction } = require("../internal/callFunction");
const { parentAndWidgetMock } = require("../__utils__/parentAndWidgetMock");

const { windowPort, widgetPort } = parentAndWidgetMock();

describe("register a function between Window and a Widget", () => {
  test("register/call function", async () => {
    /**
     * This test simulate a call to a function registered in B2ChatCenterApp
     * and invoke it from a Widget through postMessage
     */

    // Register a function in the Window scope
    const increment = jest.fn((value) => value + 1);
    registerFunction(windowPort, "increment", increment);

    // This will call the `increment' function through postMessage
    const result = await callFunction(widgetPort, "increment", 1);

    expect(result).toBe(2);
    expect(increment).toBeCalledWith(1);
    expect(increment).toReturnWith(2);
  });
});
