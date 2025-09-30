"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import Dashboard from "@/components/admin/Dashboard";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
