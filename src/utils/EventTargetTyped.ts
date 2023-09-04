/** @see {@link EventTarget} for documentation details */
export interface IEventTargetTyped<EventMap extends Record<string, Event>> {
  /**
   * @see {@link EventTarget.prototype.addEventListener} for documentation details
   */
  addEventListener<Type extends keyof EventMap>(
    type: Type,
    callback: EventListenerTyped<EventMap[Type]> | null,
    options?: AddEventListenerOptions | boolean
  ): void;

  /** @see {@link EventTarget.prototype.dispatchEvent} for documentation details */
  dispatchEvent<Type extends keyof EventMap>(event: EventMap[Type]): boolean;

  /** @see {@link EventTarget.prototype.removeEventListener} for documentation details */
  removeEventListener<Type extends keyof EventMap>(
    type: Type,
    callback: EventListenerTyped<EventMap[Type]> | null,
    options?: EventListenerOptions | boolean
  ): void;
}

export const EventTargetTyped = EventTarget as {
  new <EventMap extends Record<string, Event>>(): IEventTargetTyped<EventMap>;
  prototype: EventTarget;
};

export interface EventListenerFunctionTyped<E extends Event> {
  (event: E): void;
}

export interface EventListenerObjectTyped<E extends Event> {
  handleEvent(event: E): void;
}

export type EventListenerTyped<E extends Event = Event> =
  | EventListenerFunctionTyped<E>
  | EventListenerObjectTyped<E>;

export function createCustomEvent<T>(
  type: string,
  detail?: T,
  options?: EventInit
): CustomEvent<T> {
  return new CustomEvent(type, { detail, ...options });
}

export function when<EventMap extends Record<string, Event>>(
  target: IEventTargetTyped<EventMap>,
  type: keyof EventMap,
  predicate: () => boolean,
  options?: Omit<AddEventListenerOptions, 'once'> | boolean | null
) {
  return new Promise<void>(resolve => {
    if (predicate()) resolve();

    target.addEventListener(
      type,
      () => {
        if (predicate()) resolve();
      },
      { ...getAddEventListenerOptionsObject(options), once: true }
    );
  });
}

export function getAddEventListenerOptionsObject(
  options?: AddEventListenerOptions | boolean | null
): AddEventListenerOptions {
  if (!options) return {};

  if (typeof options === 'boolean') return { capture: options };

  return options;
}

export function callEventListener(
  cb: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | EventListenerFunctionTyped<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | EventListenerObjectTyped<any>
    | undefined
    | null,
  event: Event
) {
  if (!cb) return;

  if (typeof cb === 'function') cb(event);
  else cb.handleEvent(event);
}
