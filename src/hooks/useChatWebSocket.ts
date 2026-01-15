"use client";

import { useRef, useCallback, useState } from "react";
import { fetchWithRefresh } from "@/lib/api/fetch-with-refresh";

// 웹소켓 메시지 타입 정의
export interface WebSocketMessage {
  type: "AUTH" | "JOIN" | "CHAT" | "CLOSE";
  token?: string;
  roomId?: string;
  content?: string;
  imageUrl?: string;
}

export interface WebSocketServerMessage {
  type: "JOIN" | "CHAT" | "CLOSE";
  roomId: string;
  username: string;
  nickname: string;
  content?: string;
  imageUrl?: string | null;
  createdAt: string;
  serverId: string;
}

interface UseChatWebSocketOptions {
  onConnected?: () => void;
  onError?: (error: Error) => void;
  onDisconnected?: () => void;
  onMessage?: (message: WebSocketServerMessage) => void;
}

/**
 * 채팅 웹소켓 연결 훅
 * NEXT_PUBLIC_API_URL을 기반으로 ws/wss URL을 구성하여 /user-service/ws/chat 경로로 연결
 * httpOnly 쿠키 기반 인증을 사용 (브라우저에서 accessToken을 읽지 않음)
 */
export const useChatWebSocket = ({
  onConnected,
  onError,
  onDisconnected,
  onMessage,
}: UseChatWebSocketOptions = {}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const sendJsonMessageOnSocket = useCallback(
    (ws: WebSocket, message: WebSocketMessage) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        console.log("📤 WebSocket message sent:", message);
        return;
      }
      console.error("❌ WebSocket is not connected");
      onError?.(new Error("WebSocket이 연결되지 않았습니다"));
    },
    [onError]
  );

  /**
   * JSON 형식의 메시지 전송 (내부 함수)
   */
  const sendJsonMessage = useCallback(
    (message: WebSocketMessage) => {
      if (!wsRef.current) {
        console.error("❌ WebSocket is not connected");
        onError?.(new Error("WebSocket이 연결되지 않았습니다"));
        return;
      }
      sendJsonMessageOnSocket(wsRef.current, message);
    },
    [onError, sendJsonMessageOnSocket]
  );

  /**
   * AUTH 메시지 전송 (연결 직후 자동으로 호출)
   */
  const sendAuthMessage = useCallback(() => {
    const authMessage: WebSocketMessage = { type: "AUTH" };
    sendJsonMessage(authMessage);
  }, [sendJsonMessage]);

  /**
   * JOIN 메시지 전송 (채팅방 입장)
   */
  const sendJoinMessage = useCallback(
    (roomId: string, content?: string) => {
      const joinMessage: WebSocketMessage = {
        type: "JOIN",
        roomId,
        content,
      };
      sendJsonMessage(joinMessage);
      console.log("📤 JOIN message sent:", joinMessage);
    },
    [sendJsonMessage]
  );

  /**
   * CHAT 메시지 전송 (채팅 메시지)
   */
  const sendChatMessage = useCallback(
    (roomId: string, content: string, imageUrl?: string) => {
      const chatMessage: WebSocketMessage = {
        type: "CHAT",
        roomId,
        content,
        imageUrl,
      };
      sendJsonMessage(chatMessage);
      console.log("📤 CHAT message sent:", chatMessage);
    },
    [sendJsonMessage]
  );

  /**
   * CLOSE 메시지 전송 (채팅방 나가기)
   */
  const sendCloseMessage = useCallback(
    (roomId: string, content?: string) => {
      const closeMessage: WebSocketMessage = {
        type: "CLOSE",
        roomId,
        content,
      };
      sendJsonMessage(closeMessage);
      console.log("📤 CLOSE message sent:", closeMessage);
    },
    [sendJsonMessage]
  );

  /**
   * 웹소켓 연결
   */
  const connect = useCallback(async () => {
    // 이미 연결되어 있으면 반환
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("✅ WebSocket already connected");
      return;
    }

    if (isConnecting) {
      console.log("⏳ WebSocket connection in progress");
      return;
    }

    setIsConnecting(true);

    try {
      // Obtain a token for WS auth via server (httpOnly cookies + auto reissue)
      const tokenResponse = await fetchWithRefresh('/api/auth/ws-token', {
        method: 'GET',
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });

      if (!tokenResponse.ok) {
        setIsConnecting(false);
        onError?.(new Error('로그인이 필요합니다.'));
        return;
      }

      const tokenPayload = (await tokenResponse.json().catch(() => null)) as
        | { accessToken?: string }
        | null;
      const token = tokenPayload?.accessToken;
      if (!token) {
        setIsConnecting(false);
        onError?.(new Error('로그인이 필요합니다.'));
        return;
      }

      const rawApiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const apiBase = /^https?:\/\//.test(rawApiBase) ? rawApiBase : `https://${rawApiBase}`;
      const origin = new URL(apiBase).origin;
      const wsProtocol = origin.startsWith("https://") ? "wss://" : "ws://";
      const wsUrl = `${wsProtocol}${origin.replace(/^https?:\/\//, "")}/user-service/ws/chat`;
      console.log("🔗 Connecting to WebSocket:", wsUrl);

      // WebSocket 생성 (쿠키는 자동으로 전송됨)
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // 연결 성공
      ws.onopen = () => {
        // stale socket guard (e.g., duplicate connect attempts)
        if (wsRef.current !== ws) {
          try {
            ws.close();
          } catch {
            // ignore
          }
          return;
        }
        console.log("✅ WebSocket connected successfully");
        setIsConnected(true);
        setIsConnecting(false);
        
        // 연결 후 AUTH 메시지 자동 전송
        sendJsonMessageOnSocket(ws, { type: "AUTH", token });
        onConnected?.();
      };

      // 메시지 수신
      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return;
        console.log("📩 WebSocket message received:", event.data);
        try {
          const parsedMessage = JSON.parse(event.data) as WebSocketServerMessage;
          onMessage?.(parsedMessage);
        } catch (parseError) {
          console.error("❌ Failed to parse message:", parseError);
        }
      };

      // 에러 처리
      ws.onerror = (error) => {
        if (wsRef.current !== ws) return;
        console.error("❌ WebSocket error:", error);
        setIsConnecting(false);
        onError?.(new Error("WebSocket 연결 오류가 발생했습니다"));
      };

      // 연결 종료
      ws.onclose = (event) => {
        if (wsRef.current !== ws) return;
        console.log("❌ WebSocket disconnected", event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnected?.();
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket:", error);
      setIsConnecting(false);
      onError?.(
        new Error(
          `WebSocket 생성 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
        )
      );
    }
  }, [onConnected, onError, onDisconnected, onMessage, isConnecting, sendJsonMessageOnSocket]);

  /**
   * 웹소켓 연결 종료
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  /**
   * 메시지 전송 (레거시 호환)
   */
  const sendMessage = useCallback((message: string | ArrayBuffer | Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
      console.log("📤 WebSocket message sent");
    } else {
      console.error("❌ WebSocket is not connected");
      onError?.(new Error("WebSocket이 연결되지 않았습니다"));
    }
  }, [onError]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
    sendAuthMessage,
    sendJoinMessage,
    sendChatMessage,
    sendCloseMessage,
  };
};

