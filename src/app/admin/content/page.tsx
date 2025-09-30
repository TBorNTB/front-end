"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import ContentManagement from "@/components/admin/ContentManagement";

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64">
          <ContentManagement />
        </main>
      </div>
    </div>
  );
}
