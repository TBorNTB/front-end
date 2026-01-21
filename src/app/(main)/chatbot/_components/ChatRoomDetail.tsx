"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Minimize2, Search, Phone, Monitor, MoreVertical, ArrowLeft, Plus, Smile, Paperclip, Send } from "lucide-react";
import toast from "react-hot-toast";
import ChatInput from "./ChatInput";
import { useChatWebSocket, WebSocketServerMessage } from "@/hooks/useChatWebSocket";
import { getRoomChatHistory, ChatHistoryItem, leaveChatRoom, markChatRoomAsRead } from "@/lib/api/services/chat-services";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ChatRoomDetailProps {
  roomId: string;
  roomName: string;
  roomType: "1:1" | "group";
  memberCount?: number;
  members?: Array<{ username: string; nickname: string; realName: string; thumbnailUrl?: string | null }>;
  onClose: () => void;
  onBack: () => void;
  initialPosition?: { x: number; y: number };
}

interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  senderThumbnailUrl?: string | null;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  kind?: "chat" | "system";
}

const isJoinMarker = (content?: string | null): boolean => {
  const trimmed = (content ?? "").trim();
  // 신규 마커(요구사항): %%입장%%, 서버 반환: $$입장$$
  if (trimmed === "%%입장%%" || trimmed === "$$입장$$") return true;
  // 기존 히스토리 호환
  if (trimmed === "입장했습니다." || trimmed === "입장했습니다" || trimmed === "입장") return true;
  return false;
};

const buildJoinSystemText = (nickname: string): string => {
  const name = nickname.trim() || "알 수 없는 사용자";
  return `${name}님이 채팅방에 들어왔습니다.`;
};

const ChatRoomDetail = ({ roomId, roomName, roomType, memberCount, members, onClose, onBack, initialPosition }: ChatRoomDetailProps) => {
  const currentUsernameRef = useRef<string | null>(null);
  const pendingOwnMessagesRef = useRef<Array<{ localId: string; content: string; sentAtMs: number }>>([]);
  const lastHistoryCursorRequestedRef = useRef<number | null>(null);
  const isPrependingHistoryRef = useRef(false);
  const pendingScrollAdjustRef = useRef<{ prevScrollHeight: number; prevScrollTop: number } | null>(null);
  const isUserNearBottomRef = useRef(true);
  const initialHistoryLoadedRef = useRef(false);
  const forceScrollToBottomOnOpenRef = useRef(true);
  const lastJoinNoticeRef = useRef<{ key: string; at: number } | null>(null);

  const { user: currentUser } = useCurrentUser();

  useEffect(() => {
    currentUsernameRef.current = currentUser?.username ?? null;
  }, [currentUser?.username]);

  const [position, setPosition] = useState(() => {
    if (initialPosition) {
      return initialPosition;
    }
    // 기본 위치: 화면 오른쪽 하단
    if (typeof window !== 'undefined') {
      return {
        x: window.innerWidth - 400 - 24,
        y: window.innerHeight - 650 - 24,
      };
    }
    return { x: 0, y: 0 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getMemberThumbnailUrl = useCallback(
    (username?: string | null): string | null => {
      if (!username) return null;
      const list = Array.isArray(members) ? members : [];
      const found = list.find((m) => m.username === username);
      const url = (found?.thumbnailUrl ?? "").trim();
      if (url.length === 0 || url === "string" || url === "null" || url === "undefined") return null;
      return url;
    },
    [members]
  );

  // 웹소켓 훅
  const { isConnected, isConnecting, connect, disconnect, sendJoinMessage, sendChatMessage } = useChatWebSocket({
    onConnected: () => {
      console.log("✅ WebSocket connected in ChatRoomDetail");
    },
    onError: (error) => {
      toast.error(`웹소켓 오류: ${error.message}`);
    },
    onMessage: (message: WebSocketServerMessage) => {
      console.log("📨 WebSocket message received in ChatRoomDetail:", message);
      
      // 서버에서 받은 메시지를 화면에 표시
      if (message.type === "CHAT") {
        const currentUsername = currentUsernameRef.current;
        const isOwn = !!currentUsername && message.username === currentUsername;

        // 내가 보낸 메시지는 로컬 optimistic 메시지와 reconcile (중복 표시 방지)
        if (isOwn) {
          setMessages((prev) => {
            const pendingIdx = pendingOwnMessagesRef.current.findIndex(
              (p) => p.content === (message.content ?? "") && Date.now() - p.sentAtMs < 15_000
            );
            if (pendingIdx === -1) return prev;

            const pending = pendingOwnMessagesRef.current[pendingIdx];
            pendingOwnMessagesRef.current.splice(pendingIdx, 1);

            return prev.map((m) =>
              m.id === pending.localId
                ? {
                    ...m,
                    timestamp: new Date(message.createdAt),
                    sender: message.username,
                    senderName: message.nickname,
                  }
                : m
            );
          });
          return;
        }

        const newMessage: ChatMessage = {
          id: `${message.createdAt}-${message.username}`,
          sender: message.username,
          senderName: message.nickname,
          senderThumbnailUrl: getMemberThumbnailUrl(message.username),
          content: message.content || "",
          timestamp: new Date(message.createdAt),
          isOwn: false,
          kind: "chat",
        };
        setMessages((prev) => [...prev, newMessage]);
        return;
      }

      if (message.type === "JOIN" && (message.content ?? "").trim().length > 0) {
        const nickname = (message.nickname ?? "").trim() || (message.username ?? "").trim() || "알 수 없는 사용자";
        const text = isJoinMarker(message.content) ? buildJoinSystemText(nickname) : (message.content ?? "");
        const key = `${message.createdAt}|${message.username}|JOIN`;

        // 중복 JOIN(재연결/개발 StrictMode 등)로 시스템 문구가 여러 번 쌓이는 것 방지
        const last = lastJoinNoticeRef.current;
        if (last && last.key === key && Date.now() - last.at < 10_000) {
          return;
        }
        lastJoinNoticeRef.current = { key, at: Date.now() };

        const newMessage: ChatMessage = {
          id: `system-${message.createdAt}-${message.username}-join`,
          sender: message.username,
          senderName: nickname,
          content: text,
          timestamp: new Date(message.createdAt),
          isOwn: false,
          kind: "system",
        };

        setMessages((prev) => [...prev, newMessage]);
      }
    },
  });

  // 컴포넌트 언마운트 시 연결 정리 (StrictMode 개발환경에서 중복 연결 방지)
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // 방 디테일이 열리면 웹소켓 1회 연결 시도 (실패 시 무한 재시도 방지)
  const hasAttemptedConnectRef = useRef(false);
  useEffect(() => {
    hasAttemptedConnectRef.current = false;
  }, [roomId]);

  useEffect(() => {
    if (hasAttemptedConnectRef.current) return;
    hasAttemptedConnectRef.current = true;
    connect();
  }, [connect, roomId]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyNextCursorId, setHistoryNextCursorId] = useState<number | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasJoinedRef = useRef(false);

  const mergeMessagesUniqueSorted = useCallback((existing: ChatMessage[], incoming: ChatMessage[]) => {
    const map = new Map<string, ChatMessage>();
    const makeKey = (m: ChatMessage) => `${m.sender}|${m.timestamp.toISOString()}|${m.content}`;

    for (const m of existing) map.set(makeKey(m), m);
    for (const m of incoming) map.set(makeKey(m), m);

    return Array.from(map.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleLeaveRoom = useCallback(async () => {
    const confirmed = window.confirm('채팅방을 나갈까요?');
    if (!confirmed) return;

    try {
      setIsMenuOpen(false);
      const res = await leaveChatRoom(roomId);
      toast.success(res.content || '채팅방을 나갔습니다.');
    } catch (e) {
      const err = e as Error;
      toast.error(err.message || '채팅방 나가기에 실패했습니다.');
      return;
    } finally {
      disconnect();
      onClose();
    }
  }, [disconnect, onClose, roomId]);

  const mapHistoryItemToMessage = useCallback(
    (item: ChatHistoryItem): ChatMessage => {
      const currentUsername = currentUsernameRef.current;
      const senderUsername = item.senderUsername;

      if (isJoinMarker(item.message)) {
        return {
          id: `history-system-${item.createdAt}-${senderUsername}-join`,
          sender: senderUsername,
          senderName: item.senderNickname,
          content: buildJoinSystemText(item.senderNickname),
          timestamp: new Date(item.createdAt),
          isOwn: false,
          kind: "system",
        };
      }

      return {
        id: `history-${item.createdAt}-${senderUsername}-${item.message}`,
        sender: senderUsername,
        senderName: item.senderNickname,
        senderThumbnailUrl: (item.senderThumbnailUrl ?? null),
        content: item.message,
        timestamp: new Date(item.createdAt),
        isOwn: !!currentUsername && senderUsername === currentUsername,
        kind: "chat",
      };
    },
    []
  );

  const loadChatHistory = useCallback(
    async (mode: "initial" | "prepend") => {
      if (isHistoryLoading) return;
      if (mode === "prepend" && !hasMoreHistory) return;

      setIsHistoryLoading(true);
      try {
        const cursorId = mode === "prepend" ? historyNextCursorId ?? undefined : undefined;

        if (mode === "prepend") {
          const cursorToRequest = cursorId ?? null;
          if (cursorToRequest === null) return;
          if (lastHistoryCursorRequestedRef.current === cursorToRequest) return;
          lastHistoryCursorRequestedRef.current = cursorToRequest;
        }

        const res = await getRoomChatHistory(roomId, { cursorId, size: 20 });

        const historyMessages = (res.items || []).map(mapHistoryItemToMessage).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setHistoryNextCursorId(res.nextCursorId);
        setHasMoreHistory(!!res.nextCursorId && res.nextCursorId !== 0);

        if (mode === "prepend") {
          const container = chatContainerRef.current;
          if (container) {
            pendingScrollAdjustRef.current = {
              prevScrollHeight: container.scrollHeight,
              prevScrollTop: container.scrollTop,
            };
          }
          isPrependingHistoryRef.current = true;
          setMessages((prev) => mergeMessagesUniqueSorted(prev, historyMessages));
        } else {
          initialHistoryLoadedRef.current = true;
          setMessages((prev) => mergeMessagesUniqueSorted(prev, historyMessages));
        }
      } catch (e) {
        const err = e as Error;
        toast.error(err.message || "채팅 기록을 불러오지 못했습니다.");
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [hasMoreHistory, historyNextCursorId, isHistoryLoading, mapHistoryItemToMessage, mergeMessagesUniqueSorted, roomId]
  );

  const loadChatHistoryRef = useRef(loadChatHistory);
  useEffect(() => {
    loadChatHistoryRef.current = loadChatHistory;
  }, [loadChatHistory]);

  // roomId 변경 시 상태 초기화 및 초기 히스토리 로드
  useEffect(() => {
    setMessages([]);
    pendingOwnMessagesRef.current = [];
    lastHistoryCursorRequestedRef.current = null;
    hasJoinedRef.current = false;
    initialHistoryLoadedRef.current = false;
    forceScrollToBottomOnOpenRef.current = true;
    setHistoryNextCursorId(null);
    setHasMoreHistory(true);
    setIsHistoryLoading(false);

    // 초기 10개 불러오기
    loadChatHistoryRef.current("initial");

    // 방 진입 시 읽음 처리 (비동기, 실패해도 UX는 유지)
    (async () => {
      try {
        const res = await markChatRoomAsRead(roomId);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("chat:roomRead", {
              detail: { roomId: res.roomId, unreadCount: res.unreadCount, lastReadMessageId: res.lastReadMessageId },
            })
          );
        }
      } catch (e) {
        // 무시 (네트워크/권한 문제 등)
        console.warn("Failed to mark room as read", e);
      }
    })();
  }, [roomId]);

  // 채팅방 입장 시 JOIN 메시지 전송
  useEffect(() => {
    if (isConnected && !hasJoinedRef.current) {
      hasJoinedRef.current = true;

      // "입장했습니다."는 이 브라우저에서 해당 방 첫 입장일 때만 전송
      let shouldSendJoinContent = false;
      if (typeof window !== "undefined") {
        const joinKey = `chat:room:first-join:${roomId}`;
        if (!window.localStorage.getItem(joinKey)) {
          shouldSendJoinContent = true;
          window.localStorage.setItem(joinKey, "1");
        }
      }

      sendJoinMessage(roomId, shouldSendJoinContent ? "%%입장%%" : undefined);
    }
  }, [isConnected, roomId, sendJoinMessage]);

  // Scroll behavior: preserve position on history prepend, auto-scroll when near bottom
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    // 방을 열었을 때는 무조건 맨 아래로 고정
    if (forceScrollToBottomOnOpenRef.current) {
      forceScrollToBottomOnOpenRef.current = false;
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      });
      return;
    }

    if (isPrependingHistoryRef.current) {
      const adjust = pendingScrollAdjustRef.current;
      isPrependingHistoryRef.current = false;
      pendingScrollAdjustRef.current = null;
      if (!adjust) return;

      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        const delta = newScrollHeight - adjust.prevScrollHeight;
        container.scrollTop = adjust.prevScrollTop + delta;
      });
      return;
    }

    // 최초 로드 직후에는 바로 맨 아래로
    if (initialHistoryLoadedRef.current && isUserNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleChatScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    isUserNearBottomRef.current = distanceFromBottom < 120;
  }, []);

  // Drag handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && windowRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // 화면 경계 체크
        const maxX = window.innerWidth - windowRef.current.offsetWidth;
        const maxY = window.innerHeight - windowRef.current.offsetHeight;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // 버튼이나 클릭 가능한 요소를 클릭한 경우 드래그 시작하지 않음
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('textarea')) {
      return;
    }
    
    if (headerRef.current && windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    if (!isConnected) {
      toast.error("웹소켓이 연결되지 않았습니다. 잠시 후 다시 시도해주세요.");
      if (!isConnecting) {
        connect();
      }
      return;
    }

    const trimmed = content.trim();
    const localId = Date.now().toString();

    // 로컬에서 즉시 표시(optimistic)
    const newMessage: ChatMessage = {
      id: localId,
      sender: currentUsernameRef.current ?? "me",
      senderName: "나",
      content: trimmed,
      timestamp: new Date(),
      isOwn: true,
      kind: "chat",
    };
    pendingOwnMessagesRef.current.push({ localId, content: trimmed, sentAtMs: Date.now() });
    setMessages((prev) => [...prev, newMessage]);

    // CHAT 메시지 웹소켓으로 전송
    sendChatMessage(roomId, trimmed);
    setInputValue("");
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "오후" : "오전";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${period} ${displayHours}:${minutes.toString().padStart(2, "0")}`;
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    if (message.kind === "system") {
      return (
        <div key={message.id} className="flex justify-center my-3">
          <div className="text-xs text-gray-700 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
            {message.content}
          </div>
        </div>
      );
    }

    const isOwn = message.isOwn;
    const prev = index > 0 ? messages[index - 1] : null;
    const showAvatar =
      !isOwn &&
      message.kind === "chat" &&
      (!prev || prev.kind !== "chat" || prev.sender !== message.sender);

    const thumb = (message.senderThumbnailUrl ?? "").trim();
    const hasThumb = thumb.length > 0 && thumb !== "string" && thumb !== "null" && thumb !== "undefined";
    const initial = (message.senderName ?? message.sender ?? "?").trim().charAt(0) || "?";

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}
      >
        {!isOwn && (
          <div className="w-10 flex-shrink-0 flex justify-center">
            {showAvatar ? (
              hasThumb ? (
                <img
                  src={thumb}
                  alt={message.senderName}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                  {initial}
                </div>
              )
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
        )}

        <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
          {!isOwn && showAvatar && (
            <div className="text-xs text-gray-500 mb-1 px-1">
              {message.senderName}
            </div>
          )}
          <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            <div
              className={`px-4 py-3 rounded-2xl ${
                isOwn
                  ? "bg-purple-600 text-white rounded-br-sm"
                  : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
              } shadow-sm`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            <div className={`text-xs text-gray-500 ${isOwn ? "text-right" : "text-left"}`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={windowRef}
      className="fixed w-[calc(100vw-3rem)] h-[calc(100vh-8rem)] max-h-[calc(100vh-3rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-slide-up md:w-96 md:h-[650px] md:max-h-[650px] backdrop-blur-sm cursor-default"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 60,
      }}
    >
      {/* Header - Draggable */}
      <div
        ref={headerRef}
        onMouseDown={handleMouseDown}
        className={`bg-gradient-to-r from-purple-600 via-purple-600 to-purple-700 text-white px-5 py-4 flex items-center justify-between shadow-md ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
            aria-label="Back to chat rooms"
            title="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {roomType === "group" ? (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold">{roomName.charAt(0)}</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold">{roomName.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">{roomName}</h3>
                {roomType === "group" && (
                  <div className="flex items-center gap-2 mt-0.5">
                    {Array.isArray(members) && members.length > 0 && (
                      <div className="flex -space-x-2">
                        {members.slice(0, 5).map((m) => {
                          const thumb = (m.thumbnailUrl ?? "").trim();
                          const showThumb = thumb.length > 0 && thumb !== "string" && thumb !== "null" && thumb !== "undefined";
                          const initial = (m.nickname ?? m.username ?? "?").trim().charAt(0) || "?";
                          return (
                            <div
                              key={m.username}
                              title={m.realName}
                              className="w-6 h-6 rounded-full border-2 border-white bg-white overflow-hidden flex items-center justify-center text-xs text-gray-600"
                            >
                              {showThumb ? (
                                <img src={thumb} alt={m.nickname} className="w-full h-full object-cover" />
                              ) : (
                                <span>{initial}</span>
                              )}
                            </div>
                          );
                        })}
                        {members.length > 5 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-white/90 overflow-hidden flex items-center justify-center text-[11px] text-gray-700">
                            +{members.length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    {typeof memberCount === "number" && (
                      <p className="text-xs text-white/85">{memberCount}명</p>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" ref={menuRef}>
          <button
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Search"
            title="검색"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Call"
            title="전화"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Screen share"
            title="화면 공유"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="More options"
            title="더보기"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-4 top-16 w-40 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <button
                type="button"
                onClick={handleLeaveRoom}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
              >
                나가기
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ml-1"
            aria-label="Close chat"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pinned Message Banner (optional) */}
      {/* <div className="bg-blue-100 px-4 py-2 flex items-center justify-between border-b border-blue-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">📌</span>
          </div>
          <span className="text-sm text-blue-900">522100116051</span>
        </div>
        <ChevronDown className="w-4 h-4 text-blue-600" />
      </div> */}

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        onScroll={handleChatScroll}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gradient-to-b from-gray-50 to-white chat-scrollbar"
        style={{ scrollbarWidth: "thin" }}
      >
        {hasMoreHistory && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={() => loadChatHistory("prepend")}
              disabled={isHistoryLoading}
              className="text-xs text-gray-700 bg-white/90 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isHistoryLoading ? "불러오는 중..." : "이전 메시지 더보기"}
            </button>
          </div>
        )}
        {isHistoryLoading && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <div className="text-xs text-gray-500 bg-white/80 border border-gray-200 rounded-full px-3 py-1">
              이전 메시지 불러오는 중...
            </div>
          </div>
        )}
        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-1">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Add attachment"
              title="첨부"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Emoji"
              title="이모지"
            >
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Attach file"
              title="파일 첨부"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }
              }}
              placeholder="메시지 입력"
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm bg-white transition-all"
              style={{
                minHeight: "40px",
                maxHeight: "100px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
              }}
            />
          </div>
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
            aria-label="Send message"
          >
            <span>전송</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global styles */}
      <style jsx>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.3);
          border-radius: 3px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.5);
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatRoomDetail;

