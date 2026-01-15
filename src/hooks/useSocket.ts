"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  WebSocketOutgoingMessage,
  WebSocketIncomingMessage,
  ChatMessage,
} from "@/types/chat-websocket";

interface UseSocketOptions {
  roomId: string;
  username?: string;
  nickname?: string;
  onMessage?: (message: ChatMessage) => void;
  onUserJoined?: (message: WebSocketIncomingMessage) => void;
  onUserLeft?: (message: WebSocketIncomingMessage) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

/**
 * 쿠키에서 accessToken 추출
 */
const getAccessToken = (): string | null => {
  if (typeof document === "undefined") {
    console.log("📱 Document is undefined (SSR)");
    return null;
  }

  try {
    console.log("🔍 Looking for accessToken in cookies...");
    console.log("📋 All cookies:", document.cookie);

    const cookies = document.cookie.split(";");
    console.log("📋 Parsed cookies count:", cookies.length);

    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split("=");
      console.log(`  - Cookie: "${key}" = "${value?.substring(0, 20)}..."`);

      if (key === "accessToken" && value) {
        const decoded = decodeURIComponent(value);
        console.log("✅ accessToken found, length:", decoded.length);
        return decoded;
      }
    }

    console.error("❌ accessToken not found in cookies");
    return null;
  } catch (error) {
    console.error("❌ Error extracting token:", error);
    return null;
  }
};

export const useSocket = ({
  roomId,
  username = "",
  nickname = "",
  onMessage,
  onUserJoined,
  onUserLeft,
  onError,
  onConnected,
  onDisconnected,
}: UseSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * Socket.IO 연결
   */
  const connect = useCallback(() => {
    // 이미 연결되어 있으면 반환
    if (socketRef.current?.connected) {
      console.log("✅ Socket already connected");
      return;
    }

    if (isConnecting) {
      console.log("⏳ Socket connection in progress");
      return;
    }

    setIsConnecting(true);

    try {
      // Step 1: 토큰 가져오기
      const token = getAccessToken();

      if (!token) {
        console.error("❌ Access token not found in cookies");
        setIsConnecting(false);
        onError?.(new Error("인증 토큰을 찾을 수 없습니다"));
        return;
      }

      console.log("✅ Token found, length:", token.length);

      // Step 2: Socket.IO 생성 (Authorization 헤더로 토큰 전송)
      console.log(
        "🔗 Connecting to Socket.IO:",
        "http://api.sejongssg.kr/user-service"
      );
      console.log("🔐 Authorization header: Bearer [token]");

      socketRef.current = io("http://api.sejongssg.kr/user-service", {
        auth: {
          token: `Bearer ${token}`,
        },
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Step 3: 연결 성공
      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected successfully");
        setIsConnected(true);
        setIsConnecting(false);
        onConnected?.();

        // JOIN 메시지 전송
        const joinMessage: WebSocketOutgoingMessage = {
          type: "JOIN",
          roomId,
          content: "",
          imageUrl: "",
        };

        socketRef.current?.emit("message", joinMessage);
        console.log("📤 JOIN message sent for room:", roomId);
      });

      // Step 4: 메시지 수신
      socketRef.current.on("message", (data: WebSocketIncomingMessage) => {
        try {
          console.log("📩 Message received:", data.type);

          if (data.type === "JOIN") {
            console.log("👤 User joined:", data.nickname);
            onUserJoined?.(data);
          } else if (data.type === "CHAT") {
            const chatMessage: ChatMessage = {
              id: `${data.createdAt}-${data.username}`,
              sender: data.username,
              senderName: data.nickname,
              content: data.content,
              imageUrl: data.imageUrl,
              timestamp: new Date(data.createdAt),
              isOwn: data.username === username,
              type: "CHAT",
            };
            onMessage?.(chatMessage);
          } else if (data.type === "CLOSE") {
            console.log("👤 User left:", data.nickname);
            onUserLeft?.(data);
          }
        } catch (error) {
          console.error("❌ Failed to process message:", error);
          onError?.(new Error("메시지 처리 실패"));
        }
      });

      // Step 5: 에러 처리
      socketRef.current.on("connect_error", (error: Error) => {
        console.error("❌ Socket connection error:", error);
        setIsConnecting(false);
        onError?.(new Error(`Socket 연결 오류: ${error.message}`));
      });

      // Step 6: 연결 종료
      socketRef.current.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnected?.();
      });
    } catch (error) {
      console.error("❌ Failed to create Socket:", error);
      setIsConnecting(false);
      onError?.(
        new Error(
          `Socket 생성 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
        )
      );
    }
  }, [roomId, username, onMessage, onUserJoined, onUserLeft, onError, onConnected, onDisconnected, isConnecting]);

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback(
    (content: string, imageUrl: string = "") => {
      if (!socketRef.current?.connected) {
        console.error("❌ Socket is not connected");
        onError?.(new Error("Socket이 연결되지 않았습니다"));
        return;
      }

      const message: WebSocketOutgoingMessage = {
        type: "CHAT",
        roomId,
        content,
        imageUrl,
      };

      socketRef.current.emit("message", message);
      console.log("📤 Message sent:", content);
    },
    [roomId, onError]
  );

  /**
   * 방 나가기 (CLOSE 메시지 전송 후 연결 종료)
   */
  const disconnect = useCallback(() => {
    if (socketRef.current?.connected) {
      const closeMessage: WebSocketOutgoingMessage = {
        type: "CLOSE",
        roomId,
        content: "",
        imageUrl: "",
      };

      socketRef.current.emit("message", closeMessage);
      console.log("📤 CLOSE message sent for room:", roomId);
      socketRef.current.disconnect();
    }
  }, [roomId]);

  /**
   * 컴포넌트 마운트 시 연결, 언마운트 시 종료
   */
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [roomId, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    sendMessage,
    disconnect,
  };
};
