"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import CommunityManagement from "@/components/admin/CommunityManagement";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64">
          <CommunityManagement />
        </main>
      </div>
    </div>
  );
}
