## @b2chatorg/chat-center-widget-sdk

This is small lib that allows interoperabilty with [B2Chat Console](https://app.b2chat.io/agent/chat])

## Getting start

- [Installation](#Installation)
- [Usage](#Usage)

## [Core](#Core)

- [EventEmitter](#EventEmitter)
- [Writable](#Writable)
- [Readable](#Readable)
- [React hook useAsyncFunction](#React%20Hook%20UseAsyncFunction)

## [B2ChatStore](#B2ChatStore)

- [Properties](#Properties)
  - [activeChat](#activeChat:%20Readable<Chat>)
  - [agentInfo](#agentInfo:%20Readable<AgentInfo>)
  - [departments](#departments:%20Readable<Department[]>)
  - [inputMessageContent](#inputMessageContent:%20InputMessageContent)
- [Events](#Events)
  - [chatClosed](#chatClosed)
- [Methods](#Methods)
  - [findChat](#findChat)
  - [getTags](#getTags)
  - [assignedTags](#assignedTags)
  - [assignTags](#assignTags)
  - [unassignTags](#unassignTags)
  - [setInputMessageContent](#setInputMessageContent)
  - [updateChatInfo](#updateChatInfo)
  - [getContactInfoProperties](#getContactInfoProperties)
  - [getUUID](#getUUID)
  - [sendMessage](#sendMessage)
  - [findContact](#findContact)
  - [Types](#Types)

<br>
<br>

# Installation

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

# Core

These are utils that are available for public usage and are the core of this SDK.

## EventEmitter [➡️]()

```ts
import { eventEmitter } from "@b2chatorg/chat-center-widget-sdk/dist/utils/eventEmitter";

const eventEmitter: <T>(start?: StartStopNotifier<T>) => EventEmitter<T>;
```

A function that create a minimal **EventEmitter** to dispatch a single event type. It is an object with `dispatch` and `subscribe` methods.

#### `subscribe`, `dispatch` Methods

```ts
// start: StartStopNotifier
const emitter = eventEmitter<string>();

const unsubscribe = emitter.subscribe((event) => console.log(event));

emitter.dispatch("hello"); // logs 'hello'

unsubscribe(); // unsubscribe

emitter.dispatch("world"); // does nothing
```

#### `start/stop` Lifecycle

`start` is executed just before the first subscription, it could returns a `stop` callback that will be executed by the emitter after the last unsubscription.

```ts
// `start` callback
const emitter = eventEmitter<string>((dispatch) => {
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

# Writable

```ts
export const writable = <T>(
  initialValue: T,
  start?: StartStopNotifier<T>,
  equalFn: EqualFn<T> = strictEquals
) => Writable<T>;
```

It creates a mutable value **observable**

### Usage

#### `subscribe`, `get`, `set` and `update`

```ts
import { writable } from "@b2chatorg/chat-center-widget-sdk/dist/utils/store";

const count = writable<number>(0);

const unsub = count.subscribe((value) => console.log(value));

count.set(2); // logs '1'
console.log(count.get()); // logs '1'

count.update((current) => current + 1); // increments count and logs '2'

unsub(); // unobserve count
```

#### `when(predicate)`

It waits for condition to be fulfill

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

# Readable

```ts
export const readable = <T>(
  initialValue: T,
  start?: StartStopNotifier<T>,
  equalFn: EqualFn<T> = strictEquals
): Readable<T> => writable(initialValue, start, equalFn);
```

Similar to a `Writable` but it is a **non-mutable observable**

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

# React Hook `UseAsyncFunction`

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

This is a React hook to manage async calls, it takes a async `fn` and optionally an `initialResult` to use as initial value for result prop

### Usage

```tsx
import useAsyncFunction from "@b2chatorg/chat-center-widget-sdk/dist/react/useAsyncFunction";

const doLogin = async (user: string) => {
  await new Promise(r => setTimeout(r, 2000)); // wait 2 seg

  if (user === "david") return { user };

  throw new Error("Unknown user");
};

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

```

</br>

# B2ChatStore

**B2ChatStore** is simply a set of _properties_, _events_ and _methods_ that allow subscribe, listen or take actions inside the B2Chat console. It is agnostic to any **UI** library but there are some pretty easy utils to work with React.

**JS** vanilla

```ts
import { getB2ChatStore } from "@b2chatorg/chat-center-widget-sdk";

/// get b2chat store instance
const store = getB2ChatStore();

// subscribe to new changes
const unsub = store.state.activeChat.subscribe((chat) => {
  console.log(chat);
});

// stop receive changes
unsub();

const result = await store.methods.findChat({ contactName: "foo" }); // find a chat in the current tray
```

With **React** library

```tsx
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

# Properties

## `activeChat: Readable<Chat>`

It contains the Chat actually selected by the agent.

### Example

```tsx
const { state } = getB2ChatStore();
state.activeChat.subscribe((activeChat) => {
  console.log(activeChat.chatId);
});

// or with React
const App = () => {
  const { state } = useB2ChatStore();
  return <div>{state.activeChat.chatId}</div>;
};
```

## `agentInfo: Readable<AgentInfo>`

It has the basic information about the agent and the departments which it belongs.
If you want to search for an specific chat use : [findChat](#findChat:%20)

### Example

```tsx
const { state } = getB2ChatStore();
state.agentInfo.subscribe((agentInfo) => {
  console.log(agentInfo.username);
});

// or with React
const App = () => {
  const { state } = useB2ChatStore();
  return <div>{state.agentInfo.username}</div>;
};
```

## `departments: Readable<Department[]>`

It has the list the all posible departments for this merchant

### Example

```tsx
const { state } = getB2ChatStore();
state.departments.subscribe((departments) => {
  departments.forEach((item) => console.log(item.tagName));
});

// or with React
const App = () => {
  const { state } = useB2ChatStore();
  return (
    <>
      {state.departments.map((item) => (
        <div>{item.tagName}</div>
      ))}
    </>
  );
};
```

## `inputMessageContent: InputMessageContent`

It has the console input message. See [setInputMessageContent]() to modify its value

### Example

```tsx
const { state } = getB2ChatStore();
state.inputMessageContent.subscribe((content) => {
  console.log(content.chatId, content.text);
});

// or with React
const App = () => {
  const { state } = useB2ChatStore();
  return <div>{state.inputMessageContent.text}</div>;
};
```

<br>

# Events

## `onChatClosed: Emitter`

event emitted when a chat is closed wether by agent or contact

# Methods

## `findChat: (query: FindChatQuery) => Promise<FindChatResponse>`

Find a chat by name, chatId or tags.

> The query can be omitted to traverse through all chats

```ts
const { methods } = getB2ChatStore();
const response = await findChat({ contactName: "jean", limit: 10 });
console.log(response.data);
```

## Types

All types related to B2Chat are available at:

```ts
import {...} from "@b2chatorg/chat-center-widget-sdk/dist/types";
```

Please take a look to all types.
