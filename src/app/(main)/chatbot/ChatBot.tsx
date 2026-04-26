"use client";

import { useState, useEffect } from "react";
import ChatWindow from "./_components/ChatWindow";
import ChatRoomWindow from "./_components/ChatRoomWindow";
import ChatRoomDetail from "./_components/ChatRoomDetail";
import ChatBotIcon from "./_components/ChatBotIcon";
import { useChatRoom } from "@/context/ChatContext";

interface RoomToSelect {
  id: string;
  name: string;
  type: "group";
  memberCount?: number;
  members?: Array<{ username: string; nickname: string; realName: string; thumbnailUrl?: string | null }>;
}

const ChatBot = () => {
  const { isChatRoomOpen, closeChatRoom, openChatRoom } = useChatRoom();

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

  // 프로젝트/뉴스에서 "멤버와 채팅하기"로 생성한 방 자동 열기 (같은 방이 두 번 열리지 않도록)
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<RoomToSelect>;
      ev.stopImmediatePropagation(); // 다른 리스너가 같은 이벤트를 처리하지 않도록
      const room = ev.detail;
      if (!room?.id) return;
      const roomId = String(room.id);
      setOpenChatRooms((prev) => {
        if (prev.some((r) => String(r.id) === roomId)) return prev;
        return [...prev, { ...room, id: roomId, members: room.members }];
      });
      openChatRoom();
    };
    window.addEventListener("chat:selectRoom", handler as EventListener);
    return () => window.removeEventListener("chat:selectRoom", handler as EventListener);
  }, [openChatRoom]);

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
        <div className="fixed bottom-24 right-6 z-[9999]">
          {/* Tooltip */}
          {isHovered && (
            <div className="absolute bottom-full right-0 mb-2 animate-fade-in bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
              SSG봇에게 물어보기
            </div>
          )}

          <button
            onClick={toggleChat}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-[68px] h-[68px] bg-transparent rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
            aria-label="Open chat"
          >
            <div className="relative z-10 flex items-center justify-center">
              <ChatBotIcon size={68} className="group-hover:scale-100 transition-transform duration-300" animated showBubble={false} />
            </div>
            {/* Status indicator */}
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border-2 border-white transition-opacity duration-200 group-hover:opacity-0"></div>
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
          onRoomNameChange={(newName) =>
            setOpenChatRooms((prev) =>
              prev.map((r) => (r.id === room.id ? { ...r, name: newName } : r))
            )
          }
          onMembersChange={(addedCount) =>
            setOpenChatRooms((prev) =>
              prev.map((r) =>
                r.id === room.id
                  ? { ...r, memberCount: (r.memberCount ?? 0) + (addedCount ?? 0) }
                  : r
              )
            )
          }
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

