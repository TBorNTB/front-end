"use client";

import { useState, useRef, useEffect } from "react";
import { X, Minimize2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Message } from "@/types";
import ChatBotCharacter from "./ChatBotCharacter";
import { queryRAG } from "../../../../lib/api/services/chatbot-service";
import toast from "react-hot-toast";

interface ChatWindowProps {
  onClose: () => void;
  isMinimized: boolean;
}

const ChatWindow = ({ onClose, isMinimized }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요! SSG에 대해 궁금한 것이 있으신가요? SSG와 관련된 정보를 물어보시면 도와드리겠습니다.",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call RAG API
      const answer = await queryRAG(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("RAG API 오류:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "죄송합니다. 답변을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("답변을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] h-[calc(100vh-8rem)] max-h-[calc(100vh-3rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-slide-up md:w-96 md:h-[650px] md:max-h-[650px] backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 text-white px-5 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
            <div className="relative">
              <ChatBotCharacter size={40} className="text-white" showBubble={false} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            </div>
          <div>
            <h3 className="font-bold text-sm">SSG 챗봇</h3>
            <p className="text-xs text-white/85">어떻게 도와드릴까요?</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Minimize chat"
            title="최소화"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Close chat"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gradient-to-b from-gray-50 to-white chat-scrollbar"
        style={{ scrollbarWidth: "thin" }}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 animate-fade-in">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <ChatBotCharacter size={40} className="text-primary-600" animated />
            </div>
            <div className="flex-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-3xl rounded-tl-sm px-5 py-4 shadow-sm border border-gray-200 backdrop-blur-sm">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
        <ChatInput onSend={handleSendMessage} />
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
          background: rgba(58, 77, 161, 0.3);
          border-radius: 3px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(58, 77, 161, 0.5);
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

export default ChatWindow;
