"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Minimize2, Users, MessageSquare, User, Search, Plus, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { getChatRooms, createGroupChat, ChatRoomResponse } from "@/lib/api/services/chat-services";
import { fetchUsers, UserListResponse } from "@/lib/api/services/user-services";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ChatRoomWindowProps {
  onClose: () => void;
  isMinimized: boolean;
  onSelectRoom?: (room: ChatRoom) => void;
}

interface User {
  id: string;
  username: string;
  name: string;
  nickname?: string;
  realName?: string;
  avatar?: string;
  profileImageUrl?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: "group";
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageImageUrl?: string;
  lastSenderNickname?: string;
  unreadCount?: number;
  members?: Array<{ username: string; nickname: string; realName: string; thumbnailUrl?: string | null }>;
  memberCount?: number;
}

const ChatRoomWindow = ({ onClose, isMinimized, onSelectRoom }: ChatRoomWindowProps) => {
  const [activeTab, setActiveTab] = useState<"users" | "rooms">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupRoomName, setGroupRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [roomsNextCursorAt, setRoomsNextCursorAt] = useState<string | null>(null);
  const [roomsNextCursorRoomId, setRoomsNextCursorRoomId] = useState<string | null>(null);
  const [hasMoreRooms, setHasMoreRooms] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const usersContainerRef = useRef<HTMLDivElement>(null);

  const { user: currentUser } = useCurrentUser();
  const selfUsername = currentUser?.username ?? null;
  const selfUser: User | null = currentUser
    ? {
        id: String(currentUser.id),
        username: currentUser.username,
        name: currentUser.realName || currentUser.nickname || currentUser.username,
        nickname: currentUser.nickname,
        realName: currentUser.realName,
        avatar: currentUser.profileImageUrl,
        profileImageUrl: currentUser.profileImageUrl,
      }
    : null;

  const friendUsersCount = selfUsername ? selectedUsers.filter((u) => u.username !== selfUsername).length : selectedUsers.length;
  const hasRoomTitle = groupRoomName.trim().length > 0;
  const createDisabledReason = !hasRoomTitle
    ? "채팅방 제목을 입력해주세요."
    : friendUsersCount === 0
      ? "나를 제외한 사용자를 최소 1명 선택해주세요."
      : null;

  // Sync unreadCount updates when a room is opened/read in detail window
  useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent<{ roomId: string; unreadCount: number }>;
      const detail = e.detail;
      if (!detail?.roomId) return;
      setChatRooms((prev) =>
        prev.map((r) => (r.id === detail.roomId ? { ...r, unreadCount: detail.unreadCount ?? 0 } : r))
      );
    };

    window.addEventListener("chat:roomRead", handler as EventListener);
    return () => window.removeEventListener("chat:roomRead", handler as EventListener);
  }, []);

  // Fetch chat rooms when component mounts or when switching to rooms tab
  useEffect(() => {
    if (activeTab === "rooms") {
      fetchChatRooms("initial");
    }
  }, [activeTab]);

  // Fetch users when component mounts or when switching to users tab
  useEffect(() => {
    if (activeTab === "users" && users.length === 0) {
      fetchUsersList(0);
    }
  }, [activeTab]);

  const fetchUsersList = async (page: number = 0) => {
    setIsLoadingUsers(true);
    try {
      const response: UserListResponse = await fetchUsers(page, 5, 'ASC', 'createdAt');
      
      // Transform API response to User format
      const transformedUsers: User[] = response.data.map((user) => ({
        id: user.id.toString(),
        username: user.username,
        name: user.realName || user.nickname || user.username,
        nickname: user.nickname,
        realName: user.realName,
        avatar: user.profileImageUrl,
        profileImageUrl: user.profileImageUrl,
      }));
      
      if (page === 0) {
        setUsers(transformedUsers);
      } else {
        setUsers(prev => [...prev, ...transformedUsers]);
      }
      
      setCurrentPage(response.page);
      setTotalPages(response.totalPage);
      setHasMoreUsers(response.page < response.totalPage - 1);
    } catch (error) {
      console.error("사용자 목록 조회 오류:", error);
      toast.error("사용자 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadMoreUsers = useCallback(() => {
    if (!isLoadingUsers && hasMoreUsers) {
      fetchUsersList(currentPage + 1);
    }
  }, [currentPage, hasMoreUsers, isLoadingUsers]);

  const fetchChatRooms = async (mode: "initial" | "append") => {
    if (isLoadingRooms) return;
    if (mode === "append" && !hasMoreRooms) return;

    setIsLoadingRooms(true);
    try {
      const pageSize = 5;
      const res = await getChatRooms(
        mode === "append" && roomsNextCursorAt && roomsNextCursorRoomId
          ? { size: pageSize, cursorAt: roomsNextCursorAt, cursorRoomId: roomsNextCursorRoomId }
          : { size: pageSize }
      );

      const rooms: ChatRoomResponse[] = res.items;

      const formatRoomTime = (iso: string): string => {
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return "";
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? "오후" : "오전";
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${period} ${displayHours}:${minutes.toString().padStart(2, "0")}`;
      };
      
      // Transform API response to ChatRoom format
      const transformedRooms: ChatRoom[] = rooms
        .map((room) => {
          const lastMessageText = (room.lastMessage ?? "").trim();
          const lastPreview = lastMessageText.length > 0 ? lastMessageText : room.lastMessageImageUrl ? "[이미지]" : "";
          return {
            id: room.roomId,
            name: room.roomName || "이름 없음",
            type: "group",
            avatar: undefined,
            lastMessage: lastPreview,
            lastMessageTime: formatRoomTime(room.lastMessageAt),
            lastMessageImageUrl: room.lastMessageImageUrl ?? undefined,
            lastSenderNickname: room.lastSenderNickname,
            unreadCount: typeof room.unreadCount === "number" ? room.unreadCount : 0,
            members: Array.isArray(room.members) ? room.members : [],
            memberCount: typeof room.memberCount === "number" ? room.memberCount : Array.isArray(room.members) ? room.members.length : undefined,
          };
        });

      // cursor update
      setRoomsNextCursorAt(res.nextCursorAt ?? null);
      setRoomsNextCursorRoomId(res.nextCursorRoomId ?? null);
      setHasMoreRooms(!!(res.nextCursorAt && res.nextCursorRoomId));

      if (mode === "initial") {
        setChatRooms(transformedRooms);
      } else {
        setChatRooms((prev) => {
          const seen = new Set(prev.map((r) => r.id));
          const merged = [...prev];
          for (const r of transformedRooms) {
            if (!seen.has(r.id)) merged.push(r);
          }
          return merged;
        });
      }
    } catch (error) {
      console.error("채팅방 목록 조회 오류:", error);
      toast.error("채팅방 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const loadMoreRooms = useCallback(() => {
    if (!isLoadingRooms && hasMoreRooms) {
      fetchChatRooms("append");
    }
  }, [hasMoreRooms, isLoadingRooms, roomsNextCursorAt, roomsNextCursorRoomId]);

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.nickname?.toLowerCase().includes(searchLower) ||
      user.realName?.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower)
    );
  });

  const filteredChatRooms = chatRooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserClickForGroupCreation = (user: User) => {
    // 사용자 클릭으로 채팅방 자동 생성 금지
    // 반드시 "그룹 채팅방 만들기" 플로우로만 생성
    setShowCreateGroupModal(true);
    setGroupRoomName(""); // 제목은 항상 빈칸에서 시작
    setSelectedUsers((prev) => {
      const next = [...prev];

      // 나(self)는 항상 강제 선택
      if (selfUser && !next.some((u) => u.username === selfUser.username)) {
        next.unshift(selfUser);
      }

      // 클릭한 유저 추가 (self 제외)
      if (user.username !== selfUsername && !next.some((u) => u.id === user.id)) {
        next.push(user);
      }

      return next;
    });

    toast.success("그룹 채팅방 만들기에서 생성해주세요.");
  };

  const handleToggleUserSelection = (user: User) => {
    // 나(self)는 강제 선택(해제 불가)
    if (selfUsername && user.username === selfUsername) {
      return;
    }
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!groupRoomName.trim()) {
      toast.error("채팅방 이름을 입력해주세요.");
      return;
    }
    // self만 선택되어 있는 경우도 생성 불가 (친구 최소 1명)
    const friendUsers = selfUsername ? selectedUsers.filter((u) => u.username !== selfUsername) : selectedUsers;
    if (friendUsers.length === 0) {
      toast.error("최소 1명 이상의 사용자를 선택해주세요.");
      return;
    }

    setIsCreating(true);
    try {
      const created = await createGroupChat({
        roomName: groupRoomName,
        friendsUsername: friendUsers.map(u => u.username),
      });
      
      toast.success("그룹 채팅방이 생성되었습니다.");

      onSelectRoom?.({
        id: created.roomId,
        name: created.roomName || groupRoomName,
        type: "group",
        memberCount: friendUsers.length + 1,
        members: [
          ...(selfUser ? [selfUser] : []),
          ...friendUsers.map((u) => ({
            username: u.username,
            nickname: (u.nickname ?? u.name ?? u.username) as string,
            realName: (u.realName ?? u.name ?? u.username) as string,
            thumbnailUrl: (u.profileImageUrl ?? u.avatar) as string | undefined,
          })),
        ],
      });

      setShowCreateGroupModal(false);
      setSelectedUsers([]);
      setGroupRoomName("");
      
      // 채팅방 목록 새로고침
      if (activeTab === "rooms") {
        await fetchChatRooms();
      }
      // 채팅방 탭으로 전환
      setActiveTab("rooms");
    } catch (error) {
      console.error("그룹 채팅방 생성 오류:", error);
      toast.error("그룹 채팅방 생성 중 오류가 발생했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] h-[calc(100vh-8rem)] max-h-[calc(100vh-3rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-slide-up md:w-96 md:h-[650px] md:max-h-[650px] backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-600 to-purple-700 text-white px-5 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageSquare className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-bold text-sm">채팅방</h3>
            <p className="text-xs text-white/85">사용자 및 채팅방 목록</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Minimize chat room"
            title="최소화"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Close chat room"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === "users"
              ? "text-purple-600 border-b-2 border-purple-600 bg-white"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            <span>사용자</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("rooms")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === "rooms"
              ? "text-purple-600 border-b-2 border-purple-600 bg-white"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>채팅방</span>
          </div>
        </button>
      </div>

      {/* Search Bar & Create Button */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === "users" ? "사용자 검색..." : "채팅방 검색..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
        {activeTab === "users" && (
          <button
            onClick={() => {
              setShowCreateGroupModal(true);
              setGroupRoomName(""); // 제목은 항상 빈칸에서 시작
              setSelectedUsers(selfUser ? [selfUser] : []); // 나(self) 강제 선택
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            그룹 채팅방 만들기
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white chat-scrollbar" ref={usersContainerRef}>
        {activeTab === "users" ? (
          <div className="p-4 space-y-2">
            {isLoadingUsers && users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
                <p className="text-sm">사용자 목록을 불러오는 중...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">{searchQuery ? "검색 결과가 없습니다" : "사용자가 없습니다"}</p>
              </div>
            ) : (
              <>
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClickForGroupCreation(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="relative">
                      {user.profileImageUrl || user.avatar ? (
                        <img
                          src={user.profileImageUrl || user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-purple-300 transition-colors"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center border-2 border-gray-200 group-hover:border-purple-300 transition-colors">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {user.nickname || user.name || "이름 없음"}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{user.realName || user.name || ""}</p>
                    </div>
                  </button>
                ))}
                
                {/* Load More Button */}
                {!searchQuery && hasMoreUsers && (
                  <button
                    onClick={loadMoreUsers}
                    disabled={isLoadingUsers}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingUsers ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        <span>불러오는 중...</span>
                      </>
                    ) : (
                      <>
                        <span>더보기</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {isLoadingRooms ? (
              <div className="text-center py-12 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
                <p className="text-sm">채팅방 목록을 불러오는 중...</p>
              </div>
            ) : filteredChatRooms.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">채팅방이 없습니다</p>
              </div>
            ) : (
              <>
                {filteredChatRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      if (onSelectRoom) {
                        onSelectRoom(room);
                      }
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="relative">
                      {room.avatar ? (
                        <img
                          src={room.avatar}
                          alt={room.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-purple-300 transition-colors"
                        />
                      ) : room.type === "group" ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center border-2 border-gray-200 group-hover:border-purple-300 transition-colors">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center border-2 border-gray-200 group-hover:border-purple-300 transition-colors">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                      {room.type === "group" && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                          <Users className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                          {room.name}
                        </h4>
                        {room.lastMessageTime && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {room.lastMessageTime}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        {room.lastMessage ? (
                          <p className="text-xs text-gray-600 truncate">
                            {room.lastSenderNickname ? `${room.lastSenderNickname}: ` : ""}
                            {room.lastMessage}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400">메시지 없음</p>
                        )}
                        {room.unreadCount && room.unreadCount > 0 && (
                          <span className="flex-shrink-0 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {room.unreadCount > 99 ? "99+" : room.unreadCount}
                          </span>
                        )}
                      </div>
                      {room.memberCount !== undefined && (
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{room.memberCount}명</span>
                        </div>
                      )}

                      {room.members && room.members.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {room.members.map((m) => {
                            const thumb = (m.thumbnailUrl ?? "").trim();
                            const initial = (m.nickname ?? m.username ?? "?").trim().charAt(0) || "?";
                            const showThumb = thumb.length > 0 && thumb !== "string" && thumb !== "null" && thumb !== "undefined";

                            return (
                              <span
                                key={m.username}
                                title={m.realName}
                                className="inline-flex items-center gap-1 text-[11px] text-gray-600 bg-gray-100 border border-gray-200 rounded-full pl-1 pr-2 py-0.5"
                              >
                                {showThumb ? (
                                  <img
                                    src={thumb}
                                    alt={m.nickname}
                                    className="w-4 h-4 rounded-full object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                                    {initial}
                                  </div>
                                )}
                                <span className="leading-none">{m.nickname}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </button>
                ))}

                {/* Load More Button */}
                {!searchQuery && hasMoreRooms && (
                  <button
                    onClick={loadMoreRooms}
                    disabled={isLoadingRooms}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingRooms ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        <span>불러오는 중...</span>
                      </>
                    ) : (
                      <>
                        <span>더보기</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Group Chat Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">그룹 채팅방 만들기</h3>
              <button
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setSelectedUsers([]);
                  setGroupRoomName("");
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Room Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  채팅방 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={groupRoomName}
                  onChange={(e) => setGroupRoomName(e.target.value)}
                  placeholder="채팅방 이름을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    선택된 사용자 ({selectedUsers.length}명)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        <span>{user.nickname || user.realName || user.name}</span>
                        {!(selfUsername && user.username === selfUsername) && (
                          <button
                            onClick={() => handleToggleUserSelection(user)}
                            className="hover:bg-purple-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User List */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용자 선택
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                  {users.map((user) => {
                    const isSelected = selectedUsers.some(u => u.id === user.id);
                    const isSelf = !!(selfUsername && user.username === selfUsername);
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleToggleUserSelection(user)}
                        disabled={isSelf}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-purple-50" : ""
                        } ${isSelf ? "opacity-75 cursor-not-allowed" : ""}`}
                      >
                        <div className="relative">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center border-2 border-gray-200">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-medium text-gray-900">{user.nickname || user.realName || user.name}</h4>
                          <p className="text-xs text-gray-500">{user.realName || user.name || ""}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setSelectedUsers([]);
                    setGroupRoomName("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  disabled={isCreating}
                >
                  취소
                </button>
                <button
                  onClick={handleCreateGroupChat}
                  disabled={isCreating || !!createDisabledReason}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "생성 중..." : "생성하기"}
                </button>
              </div>

              {createDisabledReason && (
                <p className="mt-2 text-xs text-red-500">{createDisabledReason}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global styles */}
      <style jsx>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.3);
          border-radius: 3px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.5);
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatRoomWindow;

