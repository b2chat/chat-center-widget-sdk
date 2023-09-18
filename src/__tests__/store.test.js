const { describe, expect, test, jest } = require("@jest/globals");
const { writable } = require("../utils/store");

describe("writable/readable store", () => {
  test("init flow", () => {
    const store = writable(1, (set) => {
      // rewrite value on Start
      set(2);
    });

    expect(store.get()).toBe(1);

    // trigger Start notifier
    store.subscribe(jest.fn());

    expect(store.get()).toBe(2);
  });

  test("update and read value", () => {
    const store = writable(1);

    expect(store.get()).toBe(1);

    const listener = jest.fn();
    store.subscribe((value) => listener(value));
    store.update((value) => value + 1);

    expect(store.get()).toBe(2);
    expect(listener).toBeCalledWith(2);
  });
});
