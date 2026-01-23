"use client";

import React, { createContext, useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/core";

interface ChatContextType {
  isChatRoomOpen: boolean;
  toggleChatRoom: () => void;
  openChatRoom: () => void;
  closeChatRoom: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  
  const [isChatRoomOpen, setIsChatRoomOpen] = useState(false);

  const ensureChatRoomAccess = () => {
    const isGuestRole = (role: unknown) => role === UserRole.GUEST || role === 'GUEST';

    if (authLoading) {
      toast("로그인 정보를 확인 중입니다. 잠시만 기다려주세요.");
      return false;
    }

    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다. 먼저 로그인 해주세요.");
      const next = encodeURIComponent(pathname || "/");
      router.push(`/login?next=${next}`);
      return false;
    }

    const role: unknown = user?.role;
    if (isGuestRole(role)) {
      toast.error("해당 서비스는 GUEST가 이용 불가합니다.");
      return false;
    }

    return true;
  };

  const toggleChatRoom = () => {
    if (!ensureChatRoomAccess()) return;
    setIsChatRoomOpen((prev) => !prev);
  };

  const openChatRoom = () => {
    if (!ensureChatRoomAccess()) return;
    setIsChatRoomOpen(true);
  };

  const closeChatRoom = () => {
    setIsChatRoomOpen(false);
  };

  return (
    <ChatContext.Provider
      value={{
        isChatRoomOpen,
        toggleChatRoom,
        openChatRoom,
        closeChatRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatRoom() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatRoom must be used within a ChatProvider");
  }
  return context;
}
