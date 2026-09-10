"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createSSEConnection,
  type SSEEventType,
  type SSEConnection,
  type SSEClientOptions,
} from "@/lib/sse-client";

export interface UseSSEReturn {
  /** Whether the SSE connection is currently active */
  isConnected: boolean;
  /** The last event received (type + data) */
  lastEvent: { type: SSEEventType; data: unknown } | null;
  /** Number of reconnection attempts */
  reconnectAttempts: number;
  /** Manually disconnect */
  disconnect: () => void;
  /** Manually reconnect */
  reconnect: () => void;
}

/**
 * React hook for receiving real-time SSE events for a guild.
 *
 * Automatically connects on mount and disconnects on unmount.
 * Reconnects on failure with exponential backoff.
 *
 * @param guildId - Discord guild ID (null to disable connection)
 * @param onEvent - Optional callback for each event
 * @param options - Optional SSE client options (e.g., custom URL builder)
 *
 * @example
 *   const { isConnected, lastEvent } = useSSE(guildId, (type, data) => {
 *     if (type === "stream.chat") setMessages(prev => [...prev, data]);
 *   });
 */
export function useSSE(
  guildId: string | null,
  onEvent?: (eventType: SSEEventType, data: unknown) => void,
  options?: SSEClientOptions,
): UseSSEReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{
    type: SSEEventType;
    data: unknown;
  } | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connRef = useRef<SSEConnection | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    if (!guildId) return;

    // Close existing connection
    connRef.current?.close();

    const conn = createSSEConnection(guildId, (eventType, data) => {
      setIsConnected(eventType === "connected");
      setLastEvent({ type: eventType, data });
      setReconnectAttempts(conn.getReconnectAttempts());
      onEventRef.current?.(eventType, data);
    }, optionsRef.current);

    connRef.current = conn;
  }, [guildId]);

  useEffect(() => {
    if (!guildId) {
      setIsConnected(false);
      return;
    }

    connect();

    return () => {
      connRef.current?.close();
      connRef.current = null;
      setIsConnected(false);
    };
  }, [guildId, connect]);

  const disconnect = useCallback(() => {
    connRef.current?.close();
    connRef.current = null;
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  return {
    isConnected,
    lastEvent,
    reconnectAttempts,
    disconnect,
    reconnect,
  };
}
