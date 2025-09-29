"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

// Complete cybersecurity categories based on your original header data
const learningCategories = [
  { name: "학습자료", slug: "study" },
  { name: "웹 해킹", slug: "web-security" },
  { name: "시스템 해킹", slug: "system-hacking" },
  { name: "네트워크 분석", slug: "network-analysis" },
  { name: "포렌식", slug: "forensics" },
  { name: "악성코드 분석", slug: "analysis" },
  { name: "리버싱", slug: "reversing" },
  { name: "모바일 해킹", slug: "mobile-security" },
  { name: "취약점 분석", slug: "vulnerability" },
  { name: "디지털 포렌식", slug: "digital-forensics" },
  { name: "암호학", slug: "cryptography" },
  { name: "보안 관제", slug: "security-monitoring" },
];

const CategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 py-2 px-1 transition-all duration-200 relative group text-gray-900 hover:text-primary-600"
      >
        <span>Topics</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="p-2">
            {learningCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/topics?category=${category.slug}`}
                className="block w-full text-left px-3 py-2 text-gray-700 rounded-md hover:bg-gray-50 hover:text-primary-600 transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
