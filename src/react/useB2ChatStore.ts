import { useEffect, useMemo, useReducer, useState } from "react";
import { B2ChatStore, getB2ChatStore } from "../B2ChatStore";
import { Unsubscriber, EventEmitter } from "../utils/eventEmitter";
import { Readable } from "../utils/store";
import useAsyncFunction from "./useAsyncFunction";

export type B2ChatState = {
  [key in keyof B2ChatStore["state"]]: B2ChatStore["state"][key] extends Readable<
    infer T
  >
    ? T
    : never;
};

type UseB2ChatStoreOptions = {
  [key in keyof B2ChatStore["events"]]?: (
    event: B2ChatStore["events"][key] extends EventEmitter<infer T> ? T : never
  ) => void;
};

const useB2ChatStore = (options?: UseB2ChatStoreOptions) => {
  const store = useMemo(getB2ChatStore, []);

  const reRender = useReRender();

  useEffect(() => {
    const subscriptions: Unsubscriber[] = [];

    options &&
      Object.entries(options).forEach(([name, handler]) => {
        if (store.events[name]) {
          const emitter: EventEmitter = store.events[name];

          subscriptions.push(emitter.subscribe(handler));
        }
      });

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const [state, setState] = useState(
    () =>
      new Proxy({} as B2ChatState, {
        get(target, propName: string) {
          const property: Readable = store.state[propName];

          if (property) {
            return (target[propName] = property.get());
          }
        },
      })
  );

  useEffect(() => {
    const subscriptions: Record<string, Unsubscriber> = {};

    // This proxy allows lazy subscriptions to B2ChatStore
    // The subscription to a property will be activated if the user try to read it
    // and will be disconnected on useEffect clean-up callback
    const nextState = new Proxy({} as B2ChatState, {
      get(target, propName: string) {
        const property: Readable = store.state[propName];

        if (property) {
          subscriptions[propName] ??= property.subscribe((value) => {
            target[propName] = value;
            // because the Proxy instance is a stable ref is obligatory
            // to trigger a re-render explicitly to see the prop changes
            reRender();
          });

          return target[propName];
        }
      },
    });

    setState(nextState);

    return () => {
      Object.values(subscriptions).forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const findChat = useAsyncFunction(
    store.methods.findChat,
    findChatInitialValue
  );

  const findContact = useAsyncFunction(
    store.methods.findContact,
    findContactInitialValue
  );

  const updateChatInfo = useAsyncFunction(store.methods.updateChatInfo);

  const getContactInfo = useAsyncFunction(store.methods.getContactInfo);

  const getContactInfoProperties = useAsyncFunction(
    store.methods.getContactInfoProperties
  );

  const sendMessage = useAsyncFunction(store.methods.sendMessage);

  const getChatTags = useAsyncFunction(store.methods.getChatTags);
  const assignChatTag = useAsyncFunction(store.methods.assignChatTag);
  const unassignChatTag = useAsyncFunction(store.methods.unassignChatTag);

  const getContactTags = useAsyncFunction(store.methods.getContactTags);
  const assignContactTag = useAsyncFunction(store.methods.assignContactTag);
  const unassignContactTag = useAsyncFunction(store.methods.unassignContactTag);

  const findChannel = useAsyncFunction(store.methods.findChannel);
  const findTemplate = useAsyncFunction(store.methods.findTemplate);

  const getJWTSecret = useAsyncFunction(store.methods.getJWTSecret);

  return {
    state,
    methods: store.methods,
    ...store.methods,
    findChat,
    getJWTSecret,
    findContact,
    findChannel,
    findTemplate,
    updateChatInfo,
    getContactInfo,
    getContactInfoProperties,
    sendMessage,
    getChatTags,
    assignChatTag,
    unassignChatTag,
    getContactTags,
    assignContactTag,
    unassignContactTag,
  };
};

export default useB2ChatStore;

const findContactInitialValue = {
  data: [],
  query: { limit: 0, name: "", offset: 0 },
  total: 0,
};

const findChatInitialValue = {
  data: [],
  query: { limit: 0, offset: 0 },
  total: 0,
};

const reducer = (current: number) => current + 1;
export const useReRender = () => {
  const [, reRender] = useReducer(reducer, 0);
  return reRender;
};
