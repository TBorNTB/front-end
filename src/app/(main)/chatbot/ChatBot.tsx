"use client";

import { useState } from "react";
import ChatWindow from "./_components/ChatWindow";
import ChatRoomWindow from "./_components/ChatRoomWindow";
import ChatRoomDetail from "./_components/ChatRoomDetail";
import ChatBotIcon from "./_components/ChatBotIcon";
import { useChatRoom } from "@/context/ChatContext";

const ChatBot = () => {
  const { isChatRoomOpen, closeChatRoom } = useChatRoom();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

  const handleChatRoomMinimize = () => {
    setIsChatRoomMinimized(true);
    closeChatRoom();
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
      {/* Floating Chat Bot Button Only */}
      {!isOpen && !isChatRoomOpen && openChatRooms.length === 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
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

