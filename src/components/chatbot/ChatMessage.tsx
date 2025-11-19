"use client";

import { User } from "lucide-react";
import { Message } from "@/types";
import ChatBotCharacter from "./ChatBotCharacter";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "w-8 h-8 bg-primary-600 text-white rounded-full"
            : "w-10 h-10" // ✅ Removed background circle classes
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5" />
        ) : (
          <ChatBotCharacter size={40} className="text-primary-600" animated showBubble={false}/> 
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-sm ${
            isUser
              ? "bg-primary-600 text-white rounded-tr-sm"
              : "bg-white text-gray-900 rounded-tl-sm border border-gray-200"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <span className="text-xs text-gray-500 px-1">
          {message.timestamp.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
