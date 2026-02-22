"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, ArrowLeft, Minus } from "lucide-react";

interface ChatMessage {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  isOwn?: boolean;
}

interface ChattingRoomProps {
  roomId: string;
  roomName: string;
  onClose: () => void;
  onMinimize?: () => void;
}

export default function ChattingRoom({
  roomId,
  roomName,
  onClose,
  onMinimize,
}: ChattingRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      author: "김철수",
      content: "안녕하세요! 환영합니다.",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: "2",
      author: "이영희",
      content: "반갑습니다!",
      timestamp: new Date(Date.now() - 3 * 60000),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        author: "You",
        content: inputValue,
        timestamp: new Date(),
        isOwn: true,
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl h-[600px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{roomName}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Minimize chat"
              >
                <Minus className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex flex-col max-w-xs ${
                  message.isOwn ? "items-end" : "items-start"
                }`}
              >
                {!message.isOwn && (
                  <span className="text-xs text-gray-700 mb-1 px-2">
                    {message.author}
                  </span>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.isOwn
                      ? "bg-primary-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <span className="text-xs text-gray-700 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4 rounded-b-xl">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                style={{
                  minHeight: "40px",
                  maxHeight: "100px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(
                    target.scrollHeight,
                    100
                  )}px`;
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
