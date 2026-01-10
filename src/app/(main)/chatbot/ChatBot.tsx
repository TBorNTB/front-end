"use client";

import { useState } from "react";
import ChatWindow from "./_components/ChatWindow";
import ChatBotCharacter from "./_components/ChatBotCharacter";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      {/* Floating Chat Button - Enhanced */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {/* Tooltip */}
          {isHovered && (
            <div className="animate-fade-in bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
              SSG 챗봇에게 물어보기
            </div>
          )}
          
          {/* Chat Button */}
          <button
            onClick={toggleChat}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-16 h-16 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white shadow-lg hover:shadow-2xl transition-all duration-300 ease-out hover:scale-110 active:scale-95 flex items-center justify-center group"
            aria-label="Open chat"
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 rounded-full bg-primary-400 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
            
            <div className="relative z-10 flex items-center justify-center">
              <ChatBotCharacter size={48} className="text-white group-hover:scale-110 transition-transform duration-300" animated />
            </div>
            
            {/* Status indicators */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
            <div className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-bounce opacity-75"></div>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          onClose={handleMinimize}
          isMinimized={isMinimized}
        />
      )}
      
      {/* Global styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
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
    </>
  );
};

export default ChatBot;

