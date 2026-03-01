import { useCallback, useEffect, useRef, useState } from "react";

import { useInterval } from "~/hooks/use-interval";

const SESSION_KEY = "viewer-session-id";
const HEARTBEAT_INTERVAL = 15_000;

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function usePieceViewer(pieceId: string) {
  const [viewerCount, setViewerCount] = useState(0);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  const sendHeartbeat = useCallback(async () => {
    if (!sessionIdRef.current) return;

    try {
      const res = await fetch("/api/viewers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pieceId,
          sessionId: sessionIdRef.current,
          action: "heartbeat",
        }),
      });
      const data = await res.json();
      if (typeof data.count === "number") {
        setViewerCount(data.count);
      }
    } catch {
      // silent degradation
    }
  }, [pieceId]);

  // Initial heartbeat
  useEffect(() => {
    sendHeartbeat();
  }, [sendHeartbeat]);

  // Recurring heartbeat
  useInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

  // Cleanup on unmount / navigation
  useEffect(() => {
    const currentPieceId = pieceId;
    const currentSessionId = sessionIdRef.current;

    return () => {
      if (!currentSessionId) return;
      const body = JSON.stringify({
        pieceId: currentPieceId,
        sessionId: currentSessionId,
        action: "leave",
      });
      navigator.sendBeacon(
        "/api/viewers",
        new Blob([body], { type: "application/json" })
      );
    };
  }, [pieceId]);

  return { viewerCount };
}
