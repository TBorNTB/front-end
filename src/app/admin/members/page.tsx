"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import MemberManagement from "@/components/admin/MemberManagement";

export default function MembersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64">
          <MemberManagement />
        </main>
      </div>
    </div>
  );
}
