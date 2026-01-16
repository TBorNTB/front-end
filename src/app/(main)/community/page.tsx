// app/(main)/community/page.tsx
"use client";

import { useState, Suspense } from "react";
import { Megaphone, Calendar, User, Pin, Users, HelpCircle } from "lucide-react";
import TitleBanner from "@/components/layout/TitleBanner";
import NewsContent from "./_components/NewsContent";
import QnAContent from "./_components/QnAContent";

type Tab = "announcements" | "posts" | "qna";


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
          ) : (
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
          )}
        </section>
      </div>

      {/* Minimized Chat Indicator */}
      {/* Removed - Chatting room feature has been removed */}
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
