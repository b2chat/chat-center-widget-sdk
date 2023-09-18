const { describe, test, expect, jest } = require("@jest/globals");
const { eventEmitter } = require("../utils/eventEmitter");

describe("eventEmitter module", () => {
  test("check startStop notifier", () => {
    const start = jest.fn();
    const stop = jest.fn();

    const emitter = eventEmitter(() => {
      start();
      return stop;
    });

    // Start/Stop should not be trigger when subs > 0
    expect(start).toBeCalledTimes(0);
    expect(stop).toBeCalledTimes(0);

    const subs = [emitter.subscribe(jest.fn()), emitter.subscribe(jest.fn())];

    // Start should be triggered
    expect(start).toBeCalledTimes(1);
    expect(stop).toBeCalledTimes(0);

    subs.forEach((unsub) => unsub());

    // Stop should be triggered when subs === 0
    expect(start).toBeCalledTimes(1);
    expect(stop).toBeCalledTimes(1);
  });

  test("subscribe and unsubscribe", () => {
    const emitter = eventEmitter((dispatch) => {
      dispatch("foo");
    });

    const listener = jest.fn();

    const unsub = emitter.subscribe(listener);

    expect(listener).toHaveBeenCalledWith("foo", unsub);

    unsub();

    expect(listener).toBeCalledTimes(1);
  });
});
