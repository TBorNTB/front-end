"use client";

import { useState, useRef, useEffect } from "react";
import { X, Minimize2, Search, Phone, Monitor, MoreVertical, ArrowLeft, Plus, Smile, Paperclip, Send } from "lucide-react";
import ChatInput from "./ChatInput";

interface ChatRoomDetailProps {
  roomId: string;
  roomName: string;
  roomType: "1:1" | "group";
  onClose: () => void;
  onBack: () => void;
  initialPosition?: { x: number; y: number };
}

interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

const ChatRoomDetail = ({ roomId, roomName, roomType, onClose, onBack, initialPosition }: ChatRoomDetailProps) => {
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

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "user1",
      senderName: "김철수",
      content: "안녕하세요!",
      timestamp: new Date("2025-01-14T14:30:00"),
      isOwn: false,
    },
    {
      id: "2",
      sender: "me",
      senderName: "나",
      content: "안녕하세요! 반갑습니다.",
      timestamp: new Date("2025-01-14T14:32:00"),
      isOwn: true,
    },
    {
      id: "3",
      sender: "user1",
      senderName: "김철수",
      content: "오늘 날씨가 정말 좋네요.",
      timestamp: new Date("2025-01-14T15:15:00"),
      isOwn: false,
    },
    {
      id: "4",
      sender: "me",
      senderName: "나",
      content: "맞아요! 산책하기 좋은 날씨예요.",
      timestamp: new Date("2025-01-14T15:16:00"),
      isOwn: true,
    },
    {
      id: "5",
      sender: "user1",
      senderName: "김철수",
      content: "다음에 같이 산책하러 가요!",
      timestamp: new Date("2025-01-14T15:20:00"),
      isOwn: false,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "me",
      senderName: "나",
      content: content.trim(),
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "오후" : "오전";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${period} ${displayHours}:${minutes.toString().padStart(2, "0")}`;
  };

  const renderMessage = (message: ChatMessage) => {
    const isOwn = message.isOwn;

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}
      >
        <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
          {!isOwn && (
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
                <p className="text-xs text-white/85">2명</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
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
          >
            <MoreVertical className="w-4 h-4" />
          </button>
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
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gradient-to-b from-gray-50 to-white chat-scrollbar"
        style={{ scrollbarWidth: "thin" }}
      >
        {messages.map((message) => renderMessage(message))}
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

