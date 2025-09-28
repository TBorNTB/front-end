import type { Metadata } from "next";

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
    <div>
      {/* Admin-specific layout components */}
      <nav>Admin Navigation</nav>
      {children}
    </div>
  );
}
