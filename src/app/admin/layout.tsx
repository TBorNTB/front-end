import type { Metadata } from "next";
import "../../styles/admin.css";

export const metadata: Metadata = {
  title: "Admin - SSG Hub",
  description: "Admin panel for SSG Hub",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-container min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
