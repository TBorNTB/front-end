"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import ChatBotCharacter from "./ChatBotCharacter";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Chat Button - Notion Style */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white rounded-full shadow-2xl hover:shadow-[0_20px_50px_rgba(58,77,161,0.5)] transition-all duration-300 flex items-center justify-center group animate-bounce-subtle hover:scale-110 md:w-16 md:h-16 border-4 border-white/30"
          aria-label="Open chat"
        >
          <div className="relative">
            <ChatBotCharacter size={44} className="text-white md:w-11 md:h-11 w-14 h-14 group-hover:scale-110 transition-transform drop-shadow-lg" animated />
            {/* Sparkle effects */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-80"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-200 rounded-full animate-pulse opacity-60"></div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          onClose={handleMinimize}
          isMinimized={isMinimized}
        />
      )}
    </>
  );
};

export default ChatBot;

