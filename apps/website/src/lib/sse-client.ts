/**
 * SSE Client Utility
 *
 * Wraps the native EventSource API with reconnection logic and typed events.
 * Used by React hooks and OBS overlay pages to receive real-time streaming events.
 *
 * @example
 *   import { createSSEConnection } from "@/lib/sse-client";
 *
 *   const conn = createSSEConnection("123456789", (eventType, data) => {
 *     if (eventType === "stream.chat") console.log("Chat:", data);
 *     if (eventType === "stream.alert") console.log("Alert:", data);
 *   });
 *
 *   // Later: conn.close();
 */

export type SSEEventType =
  | "connected"
  | "stream.chat"
  | "stream.alert"
  | "stream.status"
  | "activity"
  | "supporter.update"
  | "error"
  | "shutdown";

export interface SSEMessage<T = unknown> {
  type: SSEEventType;
  data: T;
  timestamp: number;
}

export type SSEEventHandler = (eventType: SSEEventType, data: unknown) => void;

export interface SSEConnection {
  close: () => void;
  isConnected: () => boolean;
  getReconnectAttempts: () => number;
}

export interface SSEClientOptions {
  /** Max reconnect attempts before giving up (default: Infinity) */
  maxReconnectAttempts?: number;
  /** Base reconnect delay in ms (default: 1000) */
  reconnectBaseDelay?: number;
  /** Max reconnect delay in ms (default: 30000) */
  reconnectMaxDelay?: number;
  /** Custom URL builder (default: uses /api/stream/{guildId}/events) */
  buildUrl?: (guildId: string) => string;
}

/** Event types to listen for */
const EVENT_TYPES: SSEEventType[] = [
  "stream.chat",
  "stream.alert",
  "stream.status",
  "activity",
  "supporter.update",
  "error",
  "shutdown",
];

/**
 * Create an SSE connection to receive real-time events for a guild.
 *
 * The connection automatically reconnects on failure with exponential backoff.
 * Call `close()` to disconnect permanently.
 */
export function createSSEConnection(
  guildId: string,
  onEvent: SSEEventHandler,
  options: SSEClientOptions = {},
): SSEConnection {
  const {
    maxReconnectAttempts = Infinity,
    reconnectBaseDelay = 1000,
    reconnectMaxDelay = 30000,
    buildUrl,
  } = options;

  let eventSource: EventSource | null = null;
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;
  let connected = false;

  // Store listener references for cleanup
  let listeners: { type: string; handler: EventListener }[] = [];
  let messageHandler: ((e: MessageEvent) => void) | null = null;

  const url = buildUrl
    ? buildUrl(guildId)
    : `/api/stream/${guildId}/events`;

  /** Remove all event listeners from the current EventSource */
  function removeListeners() {
    if (!eventSource) return;
    for (const { type, handler } of listeners) {
      eventSource.removeEventListener(type, handler);
    }
    listeners = [];
    if (messageHandler) {
      eventSource.removeEventListener("message", messageHandler as EventListener);
      messageHandler = null;
    }
  }

  function connect() {
    if (closed) return;

    // Clean up previous connection
    removeListeners();
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      connected = true;
      reconnectAttempts = 0;
      onEvent("connected", { guildId, reconnected: reconnectAttempts > 0 });
    };

    // Listen for all known event types and store references for cleanup
    for (const eventType of EVENT_TYPES) {
      const handler = ((e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          onEvent(eventType, data);
        } catch {
          // Ignore malformed data
        }
      }) as EventListener;
      eventSource.addEventListener(eventType, handler);
      listeners.push({ type: eventType, handler });
    }

    // Generic message handler (for events without explicit type)
    messageHandler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(data.type ?? "message", data);
      } catch {
        // Ignore malformed data
      }
    };
    eventSource.addEventListener("message", messageHandler as EventListener);

    eventSource.onerror = () => {
      connected = false;
      removeListeners();
      eventSource?.close();
      eventSource = null;

      if (closed) return;
      if (reconnectAttempts >= maxReconnectAttempts) {
        onEvent("error", {
          error: "max_reconnect_attempts",
          attempts: reconnectAttempts,
        });
        return;
      }

      // Clear any existing timer before setting a new one
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        reconnectBaseDelay * Math.pow(2, reconnectAttempts) +
          Math.random() * 1000,
        reconnectMaxDelay,
      );
      reconnectAttempts++;

      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    };
  }

  connect();

  return {
    close() {
      closed = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      removeListeners();
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      connected = false;
    },
    isConnected() {
      return connected;
    },
    getReconnectAttempts() {
      return reconnectAttempts;
    },
  };
}
