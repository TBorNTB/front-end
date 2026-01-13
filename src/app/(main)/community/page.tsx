// app/(main)/community/page.tsx
"use client";

import { useState, Suspense } from "react";
import { Megaphone, Calendar, User, Pin, Users, MessageSquare, Send, Trash2, Lock, Plus, X, HelpCircle } from "lucide-react";
import TitleBanner from "@/components/layout/TitleBanner";
import NewsContent from "./_components/NewsContent";
import ChattingRoom from "./_components/ChattingRoom";
import QnAContent from "./_components/QnAContent";

type Tab = "announcements" | "posts" | "chatrooms" | "qna";

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: number;
  maxMembers: number;
  isPrivate: boolean;
  createdAt: Date;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  isPinned?: boolean;
}

const announcements: Announcement[] = [
  {
    id: 1,
    title: "Winter Festival: December 22",
    content:
      "Join us for our annual Winter Festival! There will be food, music, and lots of fun activities. Don't miss out!",
    author: "Admin Team",
    date: "2024-12-15",
    isPinned: true,
  },
  {
    id: 2,
    title: "Meeting Postponed to January 5",
    content:
      "Due to scheduling conflicts, our next meeting has been moved to January 5th at 3 PM. Please mark your calendars.",
    author: "Club Organizer",
    date: "2024-12-20",
    isPinned: true,
  },
  {
    id: 3,
    title: "New Member Orientation - January 10",
    content:
      "We're welcoming new members! Join us for orientation where we'll introduce you to our community and activities.",
    author: "Membership Team",
    date: "2024-12-18",
  },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("announcements");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: "1",
      name: "SSG 소개",
      description: "SSG에 대해 자유롭게 이야기하는 방",
      createdBy: "관리자",
      members: 15,
      maxMembers: 50,
      isPrivate: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      name: "프로젝트 팀",
      description: "현재 진행 중인 프로젝트 논의",
      createdBy: "김철수",
      members: 8,
      maxMembers: 20,
      isPrivate: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    maxMembers: 50,
    isPrivate: false,
  });
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleCreateRoom = () => {
    if (newRoom.name.trim()) {
      const room: ChatRoom = {
        id: Date.now().toString(),
        name: newRoom.name,
        description: newRoom.description,
        createdBy: "You",
        members: 1,
        maxMembers: newRoom.maxMembers,
        isPrivate: newRoom.isPrivate,
        createdAt: new Date(),
      };
      setChatRooms([...chatRooms, room]);
      setNewRoom({
        name: "",
        description: "",
        maxMembers: 50,
        isPrivate: false,
      });
      setShowCreateModal(false);
    }
  };

  const handleDeleteRoom = (id: string) => {
    setChatRooms(chatRooms.filter((room) => room.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <TitleBanner
        title="SSG News & Community"
        description="동아리의 모든 활동 소식을 한 곳에서 확인해보세요."
        backgroundImage="/images/BgHeader.png"
      />
      <div className="container mx-auto px-4 py-10">
        {/* Tabs */}
        <section className="mb-6 flex justify-center">
          <div className="w-full max-w-4xl flex rounded-xl bg-white border border-gray-200 p-1 shadow-sm">
            <TabButton
              icon={Megaphone}
              label="운영진 공지"
              active={activeTab === "announcements"}
              onClick={() => setActiveTab("announcements")}
            />
            <TabButton
              icon={Users}
              label="멤버 소식"
              active={activeTab === "posts"}
              onClick={() => setActiveTab("posts")}
            />
            <TabButton
              icon={MessageSquare}
              label="채팅방"
              active={activeTab === "chatrooms"}
              onClick={() => setActiveTab("chatrooms")}
            />
            <TabButton
              icon={HelpCircle}
              label="Q&A"
              active={activeTab === "qna"}
              onClick={() => setActiveTab("qna")}
            />
          </div>
        </section>

        {/* Content */}
        <section>
          {activeTab === "announcements" ? (
            <AnnouncementsSection announcements={announcements} />
          ) : activeTab === "posts" ? (
            <Suspense
              fallback={
                <div className="space-y-4">
                  <SkeletonCard />
                  <SkeletonCard tall />
                </div>
              }
            >
              <NewsContent />
            </Suspense>
          ) : activeTab === "qna" ? (
            <Suspense
              fallback={
                <div className="space-y-4">
                  <SkeletonCard />
                  <SkeletonCard tall />
                </div>
              }
            >
              <QnAContent />
            </Suspense>
          ) : (
            <ChatRoomsSection
              chatRooms={chatRooms}
              showCreateModal={showCreateModal}
              setShowCreateModal={setShowCreateModal}
              newRoom={newRoom}
              setNewRoom={setNewRoom}
              selectedRoom={selectedRoom}
              setSelectedRoom={setSelectedRoom}
              handleCreateRoom={handleCreateRoom}
              handleDeleteRoom={handleDeleteRoom}
              setActiveChatRoom={setActiveChatRoom}
            />
          )}
        </section>
      </div>

      {/* Chatting Room Modal */}
      {activeChatRoom && !isMinimized && (
        <ChattingRoom
          roomId={activeChatRoom.id}
          roomName={activeChatRoom.name}
          onClose={() => {
            setActiveChatRoom(null);
            setIsMinimized(false);
          }}
          onMinimize={() => setIsMinimized(true)}
        />
      )}

      {/* Minimized Chat Indicator */}
      {activeChatRoom && isMinimized && (
        <div
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 z-50 flex items-center gap-3 group cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm">{activeChatRoom.name}</span>
            <span className="text-xs text-primary-100">클릭하여 열기</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveChatRoom(null);
              setIsMinimized(false);
            }}
            className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── UI Subcomponents ───────────────────────── */

interface TabButtonProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ icon: Icon, label, active, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm sm:text-base font-medium transition-all",
        active
          ? "bg-primary-600 text-white shadow-sm"
          : "text-gray-600 hover:text-primary-600 hover:bg-slate-50",
      ].join(" ")}
    >
      <Icon size={18} className={active ? "text-primary-50" : "text-gray-400"} />
      <span>{label}</span>
    </button>
  );
}

interface AnnouncementsSectionProps {
  announcements: Announcement[];
}

function AnnouncementsSection({ announcements }: AnnouncementsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Megaphone size={22} className="text-primary-600" />
          <span>운영진 공지사항</span>
        </h2>
        <p className="text-sm text-slate-500">
          중요한 일정과 안내는 이곳에서 확인할 수 있어요.
        </p>
      </div>

      <div className="space-y-3">
        {announcements.map((announcement) => (
          <article
            key={announcement.id}
            className={[
              "rounded-xl border bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md",
              announcement.isPinned
                ? "border-primary-200 bg-primary-50/60"
                : "border-slate-200",
            ].join(" ")}
          >
            <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-2">
              <div className="flex items-center gap-2">
                {announcement.isPinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                    <Pin size={12} />
                    상단 고정
                  </span>
                )}
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  {announcement.title}
                </h3>
              </div>
            </header>

            <p className="text-sm text-slate-700 leading-relaxed mb-3">
              {announcement.content}
            </p>

            <footer className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <User size={14} />
                {announcement.author}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} />
                {new Date(announcement.date).toLocaleDateString()}
              </span>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}

function SkeletonCard({ tall }: { tall?: boolean }) {
  return (
    <div
      className={`rounded-xl bg-white border border-slate-200 shadow-sm p-4 animate-pulse ${
        tall ? "h-52" : "h-32"
      }`}
    >
      <div className="h-4 w-32 bg-slate-200 rounded mb-3" />
      <div className="h-3 w-full bg-slate-200 rounded mb-2" />
      <div className="h-3 w-5/6 bg-slate-200 rounded" />
    </div>
  );
}

interface ChatRoomsSectionProps {
  chatRooms: ChatRoom[];
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  newRoom: {
    name: string;
    description: string;
    maxMembers: number;
    isPrivate: boolean;
  };
  setNewRoom: (room: any) => void;
  selectedRoom: ChatRoom | null;
  setSelectedRoom: (room: ChatRoom | null) => void;
  handleCreateRoom: () => void;
  handleDeleteRoom: (id: string) => void;
  setActiveChatRoom: (room: ChatRoom | null) => void;
}

function ChatRoomsSection({
  chatRooms,
  showCreateModal,
  setShowCreateModal,
  newRoom,
  setNewRoom,
  selectedRoom,
  setSelectedRoom,
  handleCreateRoom,
  handleDeleteRoom,
  setActiveChatRoom,
}: ChatRoomsSectionProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare size={22} className="text-primary-600" />
            <span>커뮤니티 채팅방</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            관심있는 주제의 채팅방에 참여하세요.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white shadow-sm hover:bg-primary-500 rounded-lg font-medium transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 채팅방 생성
        </button>
      </div>

      {/* Create Chat Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">새 채팅방 생성</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  채팅방 이름 *
                </label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, name: e.target.value })
                  }
                  placeholder="채팅방 이름을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newRoom.description}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, description: e.target.value })
                  }
                  placeholder="채팅방 설명을 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 인원
                </label>
                <input
                  type="number"
                  value={newRoom.maxMembers}
                  onChange={(e) =>
                    setNewRoom({
                      ...newRoom,
                      maxMembers: parseInt(e.target.value),
                    })
                  }
                  min={2}
                  max={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newRoom.isPrivate}
                  onChange={(e) =>
                    setNewRoom({
                      ...newRoom,
                      isPrivate: e.target.checked,
                    })
                  }
                  className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-600">
                  비공개 채팅방
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateRoom}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chatRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                <h4 className="font-semibold text-gray-900">{room.name}</h4>
                {room.isPrivate && (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRoom(room.id);
                }}
                className="p-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{room.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>생성자: {room.createdBy}</span>
              <span>
                {room.members}/{room.maxMembers}명
              </span>
            </div>
            <button className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2" onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); }}>
              <Send className="w-4 h-4" />
              채팅 입장
            </button>
          </div>
        ))}

        {/* Create New Room Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
        >
          <Plus className="w-10 h-10 text-gray-400 mb-3" />
          <h4 className="font-medium text-gray-600 mb-1">새 채팅방 만들기</h4>
          <p className="text-sm text-gray-500">
            커뮤니티 채팅방을 만들어보세요
          </p>
        </div>
      </div>

      {/* Chat Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-6 h-6 text-primary-600" />
              <h4 className="text-2xl font-semibold text-gray-900">
                {selectedRoom.name}
              </h4>
              {selectedRoom.isPrivate && (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">설명</p>
                <p className="text-gray-700">
                  {selectedRoom.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">생성자</p>
                  <p className="text-gray-700">{selectedRoom.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">인원</p>
                  <p className="text-gray-700">
                    {selectedRoom.members}/{selectedRoom.maxMembers}명
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">생성일</p>
                <p className="text-gray-700">
                  {selectedRoom.createdAt.toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">
                최근 메시지
              </p>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">김철수:</span> 안녕하세요!
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">이영희:</span> 반갑습니다!
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedRoom(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
              <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2" onClick={() => { setActiveChatRoom(selectedRoom); setSelectedRoom(null); }}>
                <Send className="w-4 h-4" />
                채팅 시작하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
