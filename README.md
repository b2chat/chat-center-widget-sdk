## @b2chatorg/chat-center-widget-sdk

This is small lib that allows interoperabilty with [B2Chat Console](https://app.b2chat.io/agent/chat])

### Index

- [Installation](#Installation)
- [Usage](#Usage)
- [Utils](#Utils)
  - [EventEmitter](#EventEmitter)
  - [Writable](#Writable)
  - [Readable](#Readable)
  - [useAsyncFunction](#UseAsyncFunction)
- [B2ChatStore](#B2ChatStore)
  - [Properties](#Properties)
  - [Events](#Events)
  - [Methods](#Methods)
  - [Types](#Types)

### Installation

We recommend to use this **React** [template](https://github.com/b2chat/cra-template-b2chat-widget) to bootstrap a widget

But if you prefer use a different UI lib than **React** as **Svelte** or **Vue**, only need to install this package:

```sh
npm install @b2chatorg/chat-center-widget-sdk
```

and start the development server at **3010** port.

### Usage

You can subscribe to properties.

```js
import { getB2ChatStore } from "@b2chatorg/chat-center-widget-sdk";

/// get b2chat store instance
const store = getB2ChatStore();

// subscribe to new changes
const unsub = store.state.activeChat.subscribe((chat) => {
  console.log(chat);
});

// stop receive changes
unsub();
```

You can do the same with React.

```jsx
import { useEffect, useState } from "react";
import { useB2ChatStore } from "@b2chatorg/chat-center-widget-sdk/dist/react";

const App = () => {
  const { state } = useB2ChatStore();

  useEffect(() => { // subscribe to new changes
    console.log(state.activeChat);
  }, [state.activeChat]);

  return (
    <div>{state.activeChat.chatId}<div>
  );
};
```

## Utils

### These are utils that are available for public usage and are the core of this library.

## EventEmitter

```ts
import { eventEmitter } from "@b2chatorg/chat-center-widget-sdk/dist/utils/eventEmitter";

const eventEmitter: <T>(start?: StartStopNotifier<T>) => EventEmitter<T>;
```

A function that create a minimal **EventEmitter** to dispatch events. It gets created as an object with `dispatch` and `subscribe` methods.

**`EventEmitter.subscribe`, `EventEmitter.dispatch`**

```ts
// start: StartStopNotifier
const emitter = eventEmitter<string>();

const unsubscribe = emitter.subscribe((event) => console.log(event));

emitter.dispatch("hello"); // logs 'hello'

unsubscribe(); // unsubscribe

emitter.dispatch("world"); // does nothing
```

**`start: StartStopNotifier`**

`start` is executed just before the first subscription, it could returns a `stop` callback that will be executed after the last unsubscription for cleanup purposes

```ts
const emitter = eventEmitter<string>((dispatch) => {
  // `start` callback
  console.log("first subscriber");

  // `stop` callback
  return () => console.log("no subscribers");
});

emitter.dispatch("hello"); // does nothing

const unsub = emitter.subscribe((event) => {
  console.log(event);
}); // logs `first subscriber`;

emitter.dispatch("hello"); // logs 'hello'

unsub(); // will exec `stop` callback and logs 'no subscribers'
```

## Writable

```ts
export const writable = <T>(
  initialValue: T,
  start?: StartStopNotifier<T>,
  equalFn: EqualFn<T> = strictEquals
) => Writable<T>;
```

It creates a mutable value **observable**

### Example:

```ts
import { writable } from "@b2chatorg/chat-center-widget-sdk/dist/utils/store";

const count = writable<number>(0);

const unsub = count.subscribe((value) => console.log(value));

count.set(2); // logs '1'
console.log(count.get()); // logs '1'

count.update((current) => current + 1); // increments count and logs '2'

unsub(); // unobserve count
```

#### `Writable.when(predicate)`

It waits for condition

```ts
const counter = writable(0, (set, update) => {
  const interval = setInterval(() => {
    update(val => val + 1)
  }, 1000)

  return () => clearInterval(interval)
});

async waitUntil10() {
  await counter.when(val => val === 10)
  console.log('10 reached!')
}

waitUntil10()
```

## Readable

```ts
export const readable = <T>(
  initialValue: T,
  start?: StartStopNotifier<T>,
  equalFn: EqualFn<T> = strictEquals
): Readable<T> => writable(initialValue, start, equalFn);
```

Creates a non-mutable value **observable**

### Example:

```ts
import { readable } from "@b2chatorg/chat-center-widget-sdk/dist/utils/store";

const ticktock = readable("tick", (set, update) => {
  const interval = setInterval(() => {
    update((sound) => (sound == "tick" ? "tock" : "tick"));
  }, 1000);

  return () => clearInterval(interval);
});

const unsub = ticktock.subscribe((value) => console.log(value)); // logs 'tick' or 'tock' each seg

unsub(); // unobserve tictock and stop ticktock
```

### UseAsyncFunction

```ts
const useAsyncFunction = <
  Fn extends (...args: any[]) => Promise<any>,
  E = Error
>(
  fn: Fn,
  initialResult?: Awaited<ReturnType<Fn>>
) => UseAsyncFunctionInstance<Fn, E>;

type UseAsyncFunctionInstance<
  Fn extends (...args: any[]) => Promise<any>,
  E = unknown
> = {
  args: Parameters<Fn> | [];
  result: Awaited<ReturnType<Fn>>;
  error: E;
  isPending: boolean;
  isSuccess: true;
  isError: false;
};
```

This is a React hook to manage async calls, it takes a async `fn` and optionally an `initialResult` to use as first result

### Example:

```tsx
import useAsyncFunction from "@b2chatorg/chat-center-widget-sdk/dist/react/useAsyncFunction";

const App = () => {
  const login = useAsyncFunction(doLogin);

  useEffect(() => {
    login('david')
  }, [])

  return (
    <div>
      {login.isPending & "loading..."}
      {login.isSuccess && (<div>Login success: {login.result.user}<div>)}
      {login.isError && (<div>Login failed: {login.error.message}<div>)}
    </div>
  );
};

const doLogin = async (user: string) => {
  await new Promise(r => setTimeout(r, 2000)); // wait 2 seg

  if (user === "david") {
    return { user };
  }
  throw new Error("Unknown user");
};
```

## B2ChatStore

**B2ChatStore** is simply a set of _properties_, _events_ and _methods_ that enable subscribe, listen or take actions inside the B2Chat console. It is agnostic to any **UI** library but it there are some pretty easy utils to work with React.

**JS** vanilla

```js
import { getB2ChatStore } from "@b2chatorg/chat-center-widget-sdk";

/// get b2chat store instance
const store = getB2ChatStore();

// subscribe to new changes
const unsub = store.state.activeChat.subscribe((chat) => {
  console.log(chat);
});

// stop receive changes
unsub();
```

With **React** library

```jsx
import { useEffect, useState } from "react";
import { useB2ChatStore } from "@b2chatorg/chat-center-widget-sdk/dist/react";

const App = () => {
  const { state } = useB2ChatStore();

  useEffect(() => { // subscribe to new changes
    console.log(state.activeChat);
  }, [state.activeChat]);

  return (
    <div>{state.activeChat.chatId}<div>
  );
};
```

## Types

All types related to B2Chat are available at:

```ts
import {...} from "@b2chatorg/chat-center-widget-sdk/dist/types";
```

Please take a look to all types.
