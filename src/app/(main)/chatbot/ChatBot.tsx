"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import ChatWindow from "./_components/ChatWindow";
import ChatRoomWindow from "./_components/ChatRoomWindow";
import ChatRoomDetail from "./_components/ChatRoomDetail";
import ChatBotIcon from "./_components/ChatBotIcon";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isChatRoomHovered, setIsChatRoomHovered] = useState(false);
  const [isChatRoomOpen, setIsChatRoomOpen] = useState(false);
  const [isChatRoomMinimized, setIsChatRoomMinimized] = useState(false);
  const [openChatRooms, setOpenChatRooms] = useState<Array<{
    id: string;
    name: string;
    type: "group";
    memberCount?: number;
    members?: Array<{ username: string; nickname: string; realName: string; thumbnailUrl?: string | null }>;
  }>>([]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  const toggleChatRoom = () => {
    setIsChatRoomOpen(!isChatRoomOpen);
    setIsChatRoomMinimized(false);
  };

  const handleChatRoomMinimize = () => {
    setIsChatRoomMinimized(true);
    setIsChatRoomOpen(false);
  };

  const handleSelectRoom = (room: {
    id: string;
    name: string;
    type: "group";
    memberCount?: number;
    members?: Array<{ username: string; nickname: string; realName: string; thumbnailUrl?: string | null }>;
  }) => {
    setOpenChatRooms((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === room.id);
      if (existingIdx === -1) return [...prev, room];

      // 이미 열려 있으면 members/memberCount만 최신 값으로 보정
      const existing = prev[existingIdx];
      const next = [...prev];
      next[existingIdx] = {
        ...existing,
        name: room.name ?? existing.name,
        memberCount: room.memberCount ?? existing.memberCount,
        members: room.members ?? existing.members,
      };
      return next;
    });
    // 채팅방 목록 창은 그대로 유지
  };

  const getInitialPosition = (index: number) => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const windowWidth = 400; // md:w-96 = 384px + padding
    const windowHeight = 650;
    const offset = 24;
    const spacing = 20;
    
    return {
      x: window.innerWidth - windowWidth - offset - (index * spacing),
      y: window.innerHeight - windowHeight - offset - (index * spacing),
    };
  };

  const handleCloseChatRoomDetail = (roomId: string) => {
    setOpenChatRooms(prev => prev.filter(r => r.id !== roomId));
  };

  return (
    <>
      {/* Floating Chat Buttons - Enhanced */}
      {!isOpen && !isChatRoomOpen && openChatRooms.length === 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {/* Chat Room Button */}
          <div className="flex flex-col items-end gap-2">
            {/* Tooltip */}
            {isChatRoomHovered && (
              <div className="animate-fade-in bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                채팅방
              </div>
            )}
            
            {/* Chat Room Button */}
            <button
              onClick={toggleChatRoom}
              onMouseEnter={() => setIsChatRoomHovered(true)}
              onMouseLeave={() => setIsChatRoomHovered(false)}
              className="relative w-16 h-16 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-lg hover:shadow-2xl transition-all duration-300 ease-out hover:scale-110 active:scale-95 flex items-center justify-center group"
              aria-label="Open chat room"
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 rounded-full bg-purple-400 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
            </button>
          </div>

          {/* Chat Bot Button */}
          <div className="flex flex-col items-end gap-2">
            {/* Tooltip */}
            {isHovered && (
              <div className="animate-fade-in bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                SSG봇에게 물어보기
              </div>
            )}

            <button
              onClick={toggleChat}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-20 h-20 bg-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group hover:scale-110 border-4 border-gray-200"
              aria-label="Open chat"
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 rounded-full bg-primary-400 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>

              <div className="relative z-10 flex items-center justify-center">
                <ChatBotIcon size={64} className="group-hover:scale-100 transition-transform duration-300" animated showBubble={false} />
              </div>

              {/* Status indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
            </button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          onClose={handleMinimize}
          isMinimized={isMinimized}
        />
      )}

      {/* Chat Room Window */}
      {isChatRoomOpen && (
        <ChatRoomWindow
          onClose={handleChatRoomMinimize}
          isMinimized={isChatRoomMinimized}
          onSelectRoom={handleSelectRoom}
        />
      )}

      {/* Chat Room Detail Windows - Multiple windows can be open */}
      {openChatRooms.map((room, index) => (
        <ChatRoomDetail
          key={room.id}
          roomId={room.id}
          roomName={room.name}
          roomType={room.type}
          memberCount={room.memberCount}
          members={room.members}
          onClose={() => handleCloseChatRoomDetail(room.id)}
          onBack={() => handleCloseChatRoomDetail(room.id)}
          initialPosition={getInitialPosition(index)}
        />
      ))}
      
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

