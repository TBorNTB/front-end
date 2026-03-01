'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useChatRoom } from '@/context/ChatContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { profileService } from '@/lib/api/services/user-services';
import { createGroupChat, getChatRooms } from '@/lib/api/services/chat-services';
import { UserRole } from '@/types/core';

export interface CreateChatFromPostMember {
  username: string;
  displayName: string;
}

interface CreateChatFromPostButtonProps {
  type: 'project' | 'news';
  title: string;
  members: CreateChatFromPostMember[];
  /** 프로젝트/뉴스 생성 시 백엔드에서 자동 생성된 채팅방 ID. 있으면 이름 검색 없이 이 ID로만 연다. */
  chatRoomId?: string | null;
  className?: string;
}

export default function CreateChatFromPostButton({
  type,
  title,
  members,
  chatRoomId,
  className = '',
}: CreateChatFromPostButtonProps) {
  const { openChatRoom } = useChatRoom();
  const { user: currentUser } = useCurrentUser();
  const [guestNicknames, setGuestNicknames] = useState<string[]>([]);
  const [eligibleUsernames, setEligibleUsernames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(!chatRoomId);
  const [isCreating, setIsCreating] = useState(false);

  const fetchRoles = useCallback(async () => {
    if (members.length === 0) {
      setEligibleUsernames([]);
      setGuestNicknames([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const results = await Promise.all(
        members.map((m) =>
          profileService.getProfileByUsername(m.username).then(
            (profile) => ({ username: m.username, displayName: m.displayName, role: profile?.role }),
            () => ({ username: m.username, displayName: m.displayName, role: null })
          )
        )
      );
      const guests: string[] = [];
      const eligible: string[] = [];
      results.forEach((r) => {
        if (r.role === UserRole.GUEST || r.role === 'GUEST') {
          guests.push(r.displayName || r.username);
        } else {
          eligible.push(r.username);
        }
      });
      setGuestNicknames(guests);
      setEligibleUsernames(eligible);
    } catch (e) {
      console.error('Failed to fetch member roles:', e);
      setGuestNicknames([]);
      setEligibleUsernames(members.map((m) => m.username));
    } finally {
      setIsLoading(false);
    }
  }, [members]);

  useEffect(() => {
    if (chatRoomId) {
      setIsLoading(false);
      return;
    }
    fetchRoles();
  }, [chatRoomId, fetchRoles]);

  const selfUsername = currentUser?.username ?? null;
  const inviteUsernames = selfUsername
    ? eligibleUsernames.filter((u) => u !== selfUsername)
    : eligibleUsernames;
  const canCreate = inviteUsernames.length >= 1 && eligibleUsernames.length >= 2;

  const roomName =
    type === 'project' ? `프로젝트 : ${title}` : `뉴스 : ${title}`;

  const handleCreateChat = async () => {
    // chatRoomId가 있으면 항상 그 방만 연다 (이름 변경과 무관)
    if (chatRoomId) {
      openChatRoom();
      window.dispatchEvent(
        new CustomEvent('chat:selectRoom', {
          detail: {
            id: chatRoomId,
            name: roomName,
            type: 'group' as const,
          },
        })
      );
      toast.success('채팅방을 열었습니다.');
      return;
    }

    if (!canCreate) {
      toast.error('채팅방을 만들려면 초대 가능한 멤버가 2명 이상 필요합니다.');
      return;
    }
    setIsCreating(true);
    try {
      // chatRoomId 없음(구 데이터): 같은 이름 방이 있으면 열고, 없으면 생성
      const { items: rooms } = await getChatRooms({ size: 50 });
      const existing = rooms.find((r) => r.roomName === roomName);
      if (existing) {
        openChatRoom();
        window.dispatchEvent(
          new CustomEvent('chat:selectRoom', {
            detail: {
              id: existing.roomId,
              name: existing.roomName,
              type: 'group' as const,
              memberCount: existing.memberCount,
              members: existing.members,
            },
          })
        );
        toast.success('채팅방을 열었습니다.');
        return;
      }

      const created = await createGroupChat({
        roomName,
        friendsUsername: inviteUsernames,
      });
      openChatRoom();
      window.dispatchEvent(
        new CustomEvent('chat:selectRoom', {
          detail: {
            id: created.roomId,
            name: created.roomName || roomName,
            type: 'group' as const,
            memberCount: inviteUsernames.length + 1,
          },
        })
      );
      toast.success('채팅방이 생성되었습니다.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '채팅방 생성에 실패했습니다.';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  if (members.length === 0 && !chatRoomId) return null;

  const canOpen = chatRoomId || canCreate;

  return (
    <div className={`space-y-2 ${className}`}>
      {!chatRoomId && guestNicknames.length > 0 && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          guest인 유저는 초대가 되지 않았습니다.
          {guestNicknames.length > 0 && (
            <span className="font-medium ml-1">
              ({guestNicknames.join(', ')})
            </span>
          )}
        </p>
      )}
      {!chatRoomId && !canCreate && !isLoading && eligibleUsernames.length < 2 && (
        <p className="text-xs text-gray-500">
          채팅방을 만들려면 초대 가능한 멤버가 2명 이상 필요합니다.
        </p>
      )}
      <button
        type="button"
        onClick={handleCreateChat}
        disabled={isLoading || isCreating || !canOpen}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading || isCreating ? (
          <span className="inline-block w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <MessageCircle className="w-4 h-4" />
        )}
        {isCreating ? '채팅방 생성 중...' : '멤버와 채팅하기'}
      </button>
    </div>
  );
}
