// Event-source-polyfill 라이브러리의 TypeScript 타입 정의를 위한 코드입니다.
declare module 'event-source-polyfill' {
  export interface EventSourcePolyfillOptions {
    headers?: Record<string, string>;
    heartbeatTimeout?: number;
    retryInterval?: number;
    withCredentials?: boolean;
    lastEventIdQueryParameterName?: string;
  }

  export class EventSourcePolyfill extends EventTarget {
    public static readonly CONNECTING: 0;
    public static readonly OPEN: 1;
    public static readonly CLOSED: 2;

    public readonly CONNECTING: 0;
    public readonly OPEN: 1;
    public readonly CLOSED: 2;

    public readonly readyState: 0 | 1 | 2;
    public readonly url: string;
    public readonly withCredentials: boolean;

    public onopen: ((this: EventSourcePolyfill, event: Event) => any) | null;
    public onmessage: ((this: EventSourcePolyfill, event: MessageEvent) => any) | null;
    public onerror: ((this: EventSourcePolyfill, event: Event) => any) | null;

    constructor(url: string, options?: EventSourcePolyfillOptions);

    public close(): void;
    public addEventListener<K extends keyof EventSourceEventMap>(
      type: K,
      listener: (this: EventSourcePolyfill, ev: EventSourceEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    public addEventListener(
      type: string,
      listener: (this: EventSourcePolyfill, event: Event) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    public removeEventListener<K extends keyof EventSourceEventMap>(
      type: K,
      listener: (this: EventSourcePolyfill, ev: EventSourceEventMap[K]) => any,
      options?: boolean | EventListenerOptions
    ): void;
    public removeEventListener(
      type: string,
      listener: (this: EventSourcePolyfill, event: Event) => any,
      options?: boolean | EventListenerOptions
    ): void;
  }

  export interface EventSourceEventMap {
    error: Event;
    message: MessageEvent;
    open: Event;
  }

  export const EventSource: typeof EventSourcePolyfill;
  export default EventSourcePolyfill;
}

