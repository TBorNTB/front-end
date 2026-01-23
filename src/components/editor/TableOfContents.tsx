"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface HeadingItem {
  level: number; // 1 | 2 | 3
  text: string;
}

interface TableOfContentsProps {
  contentHtml?: string; // optional HTML to parse for headings
  headings?: HeadingItem[]; // optionally pass pre-computed headings
  className?: string;
  title?: string;
  emptyText?: string;
}

function extractHeadingsFromHtml(html: string): HeadingItem[] {
  if (!html) return [];
  const container = document.createElement("div");
  container.innerHTML = html;
  const nodes = Array.from(container.querySelectorAll("h1, h2, h3"));
  return nodes.map((node) => ({
    level: Number(node.tagName.replace("H", "")),
    text: (node.textContent || "").trim(),
  }));
}

export default function TableOfContents({
  contentHtml,
  headings,
  className,
  title = "목차",
  emptyText = "헤딩(H1/H2/H3)을 추가하면 여기서 목차를 볼 수 있어요.",
}: TableOfContentsProps) {
  const [computedHeadings, setComputedHeadings] = useState<HeadingItem[]>(headings ?? []);

  useEffect(() => {
    if (headings && headings.length) {
      setComputedHeadings(headings);
      return;
    }
    setComputedHeadings(extractHeadingsFromHtml(contentHtml || ""));
  }, [contentHtml, headings]);

  return (
    <div className={cn("border border-gray-200 rounded-lg p-4 bg-gray-50 h-full", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-semibold text-gray-900">{title}</span>
        <span className="text-xs text-gray-500">자동 생성</span>
      </div>

      {computedHeadings.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyText}</p>
      ) : (
        <ul className="space-y-2 text-base text-gray-900">
          {computedHeadings.map((h, idx) => (
            <li
              key={`${h.text}-${idx}`}
              className={cn(
                "leading-snug",
                h.level === 1 ? "font-medium text-primary-700" : h.level === 2 ? "ml-3" : "ml-5 text-gray-800"
              )}
            >
              {h.text || "제목 없음"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
