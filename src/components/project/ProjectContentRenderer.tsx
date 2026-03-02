'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import {
  decodeHtmlEntities,
  normalizeEditorHtml,
  replaceCheckboxesWithBoxes,
  PROJECT_CONTENT_CHECKBOX_CLASS,
} from '@/lib/html-utils';

interface ProjectContentRendererProps {
  html: string;
  className?: string;
  /** true면 상세/조회 페이지처럼 체크박스 클릭 비활성화 */
  readOnly?: boolean;
}

/**
 * 프로젝트 상세 내용(에디터 HTML) 렌더링.
 * - 태그 사이 개행 제거로 의도치 않은 줄바꿈 방지
 * - 체크박스를 작은 네모 박스(span)로 치환하고, readOnly가 false일 때만 클릭 시 토글
 */
export function ProjectContentRenderer({ html, className, readOnly = false }: ProjectContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains(PROJECT_CONTENT_CHECKBOX_CLASS)) return;
    e.preventDefault();
    e.stopPropagation();
    const checked = target.getAttribute('data-checked') !== 'true';
    target.setAttribute('data-checked', String(checked));
    target.classList.toggle('is-checked', checked);
  }, []);

  useEffect(() => {
    if (readOnly) return;
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('click', handleClick, true);
    return () => el.removeEventListener('click', handleClick, true);
  }, [handleClick, html, readOnly]);

  // 렌더 후 부모 li의 data-checked를 체크박스 span에 반영해 체크 표시가 확실히 보이도록 함
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const boxes = el.querySelectorAll<HTMLElement>(`.${PROJECT_CONTENT_CHECKBOX_CLASS}`);
    boxes.forEach((span) => {
      const li = span.closest('li[data-checked]');
      if (li) {
        const checked = li.getAttribute('data-checked') === 'true';
        span.setAttribute('data-checked', String(checked));
        span.classList.toggle('is-checked', checked);
      }
    });
  }, [html]);

  if (!html?.trim()) return null;

  let processed = decodeHtmlEntities(html);
  processed = normalizeEditorHtml(processed);
  processed = replaceCheckboxesWithBoxes(processed);

  return (
    <>
      <style>{`
        /* 노션 스타일: 심플한 테두리 + 체크 시 부드러운 색상 */
        .project-content-checkbox {
          display: inline-block;
          position: relative;
          width: 1.125rem;
          height: 1.125rem;
          min-width: 1.125rem;
          min-height: 1.125rem;
          border: 1.5px solid #d1d5db;
          border-radius: 4px;
          margin-right: 0.5rem;
          vertical-align: middle;
          cursor: pointer;
          background: #fff;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.1s;
          flex-shrink: 0;
        }
        .project-content-checkbox:hover {
          border-color: #9ca3af;
          background: #f9fafb;
        }
        .project-content-checkbox.is-checked,
        .project-content-checkbox[data-checked="true"] {
          background: #2383e2 !important;
          border-color: #2383e2 !important;
          box-shadow: none !important;
        }
        .project-content-checkbox.is-checked::after,
        .project-content-checkbox[data-checked="true"]::after {
          content: '' !important;
          position: absolute;
          left: 50%;
          top: 40%;
          width: 4px;
          height: 9px;
          margin-left: -3px;
          border: solid #fff;
          border-width: 0 2.5px 2.5px 0;
          transform: rotate(45deg);
          pointer-events: none;
        }
        .project-content-renderer.read-only .project-content-checkbox {
          pointer-events: none;
          cursor: default;
        }
        /* 할 일 목록: 체크박스와 글자를 한 줄에 배치 (prose 등 상위 스타일보다 우선) */
        .project-content-renderer ul[data-type="taskList"],
        .project-content-renderer.prose ul[data-type="taskList"] {
          list-style: none !important;
          padding-left: 0 !important;
          margin: 0.5rem 0;
        }
        .project-content-renderer ul[data-type="taskList"] li[data-type="taskItem"],
        .project-content-renderer.prose ul[data-type="taskList"] li[data-type="taskItem"] {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          gap: 0.5rem !important;
          margin: 0.25rem 0 !important;
          list-style: none !important;
        }
        .project-content-renderer ul[data-type="taskList"] li[data-type="taskItem"] > label,
        .project-content-renderer.prose ul[data-type="taskList"] li[data-type="taskItem"] > label {
          flex-shrink: 0 !important;
          margin: 0 !important;
          display: inline-flex !important;
          align-items: center;
          cursor: pointer;
        }
        .project-content-renderer ul[data-type="taskList"] li[data-type="taskItem"] > div,
        .project-content-renderer.prose ul[data-type="taskList"] li[data-type="taskItem"] > div {
          flex: 1 1 auto !important;
          min-width: 0 !important;
          display: block !important;
        }
        .project-content-renderer ul[data-type="taskList"] li[data-type="taskItem"] > div p,
        .project-content-renderer.prose ul[data-type="taskList"] li[data-type="taskItem"] > div p {
          margin: 0 !important;
        }
        .project-content-renderer ul[data-type="taskList"] li[data-type="taskItem"][data-checked="true"] > div,
        .project-content-renderer.prose ul[data-type="taskList"] li[data-type="taskItem"][data-checked="true"] > div {
          text-decoration: line-through;
          color: var(--color-gray-600, #6b7280);
        }
        /* data-type 없을 때: 체크박스 span이 있는 ul/li도 동일 레이아웃 */
        .project-content-renderer ul:has(.project-content-checkbox),
        .project-content-renderer.prose ul:has(.project-content-checkbox) {
          list-style: none !important;
          padding-left: 0 !important;
          margin: 0.5rem 0;
        }
        .project-content-renderer ul:has(.project-content-checkbox) li:has(.project-content-checkbox),
        .project-content-renderer.prose ul:has(.project-content-checkbox) li:has(.project-content-checkbox) {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          gap: 0.5rem !important;
          margin: 0.25rem 0 !important;
          list-style: none !important;
        }
        .project-content-renderer ul:has(.project-content-checkbox) li:has(.project-content-checkbox) > label,
        .project-content-renderer.prose ul:has(.project-content-checkbox) li:has(.project-content-checkbox) > label {
          flex-shrink: 0 !important;
          margin: 0 !important;
          display: inline-flex !important;
        }
        .project-content-renderer ul:has(.project-content-checkbox) li:has(.project-content-checkbox) > div,
        .project-content-renderer.prose ul:has(.project-content-checkbox) li:has(.project-content-checkbox) > div {
          flex: 1 1 auto !important;
          min-width: 0 !important;
        }
        .project-content-renderer ul:has(.project-content-checkbox) li:has(.project-content-checkbox) > div p,
        .project-content-renderer.prose ul:has(.project-content-checkbox) li:has(.project-content-checkbox) > div p {
          margin: 0 !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className={`project-content-renderer ${readOnly ? 'read-only' : ''} ${className ?? ''}`.trim()}
        dangerouslySetInnerHTML={{ __html: processed }}
      />
    </>
  );
}
