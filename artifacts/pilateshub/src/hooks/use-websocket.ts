import { useCallback, useEffect, useRef, useState } from "react";

type MessageHandler = (data: any) => void;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef<Map<string, MessageHandler[]>>(new Map());
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem("pilateshub-token");
    if (!token) return; // No token — skip WebSocket (demo mode)

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send token after connection to avoid leaking JWT in URL/logs
        ws.send(JSON.stringify({ type: "auth", token }));
        setConnected(true);
      };

      ws.onerror = () => {
        // Silently handle connection errors (server might not support WS)
        ws.close();
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        // Only reconnect if we have a token
        if (localStorage.getItem("pilateshub-token")) {
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handlers = handlersRef.current.get(data.type) || [];
          handlers.forEach((h) => h(data));
        } catch {
          // ignore malformed messages
        }
      };
    } catch {
      // WebSocket construction failed — ignore
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const on = useCallback((type: string, handler: MessageHandler) => {
    const handlers = handlersRef.current.get(type) || [];
    handlers.push(handler);
    handlersRef.current.set(type, handlers);
    return () => {
      const h = handlersRef.current.get(type) || [];
      handlersRef.current.set(
        type,
        h.filter((fn) => fn !== handler),
      );
    };
  }, []);

  return { connected, send, on };
}
