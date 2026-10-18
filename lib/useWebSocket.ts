'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export type WsMessageType =
  | 'connection_ack'
  | 'price_update'
  | 'trade_closed'
  | 'pong';

export interface WsMessage {
  type: WsMessageType;
  [key: string]: unknown;
}

export interface WsStatus {
  connected: boolean;
  latencyMs: number | null;
}

/**
 * useWebSocket — connects to the TradeDash real-time stream at /ws/stream.
 *
 * - Auto-reconnects with exponential back-off (1s → 2s → 4s … cap 30s)
 * - Keeps latency alive via ping/pong every 10s
 * - onMessage callback is stable (ref-based) — safe to recreate on re-renders
 * - Disconnects cleanly on component unmount
 */
export function useWebSocket(
  onMessage?: (msg: WsMessage) => void
): WsStatus {
  const wsRef        = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingTimeRef  = useRef<number | null>(null);
  const backoffRef   = useRef(1000);
  const onMsgRef     = useRef(onMessage);
  onMsgRef.current   = onMessage;

  const [status, setStatus] = useState<WsStatus>({ connected: false, latencyMs: null });

  const connect = useCallback(() => {
    // Derive WS URL from NEXT_PUBLIC_API_URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsBase = apiUrl.replace(/^http/, 'ws');
    const wsUrl  = `${wsBase}/ws/stream`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      backoffRef.current = 1000; // reset back-off on success
      setStatus((s) => ({ ...s, connected: true }));

      // Start ping every 10s to measure latency
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          pingTimeRef.current = Date.now();
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 10_000);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        if (msg.type === 'pong' && pingTimeRef.current !== null) {
          setStatus((s) => ({ ...s, latencyMs: Date.now() - pingTimeRef.current! }));
          pingTimeRef.current = null;
          return;
        }
        onMsgRef.current?.(msg);
      } catch { /* malformed JSON — ignore */ }
    };

    ws.onclose = () => {
      setStatus({ connected: false, latencyMs: null });
      if (pingRef.current) { clearInterval(pingRef.current); pingRef.current = null; }

      // Exponential back-off reconnect (max 30s)
      reconnectRef.current = setTimeout(() => {
        connect();
        backoffRef.current = Math.min(backoffRef.current * 2, 30_000);
      }, backoffRef.current);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (pingRef.current) clearInterval(pingRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return status;
}
