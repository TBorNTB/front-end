"use client";

import Link from "next/link";

const quickLinks = [
  {
    name: "콘텐츠 관리",
    href: "/admin/content",
  },
  {
    name: "커뮤니티 관리",
    href: "/admin/community",
  },
];

export default function QuickLinks() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 링크</h3>
      
      <div className="space-y-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
