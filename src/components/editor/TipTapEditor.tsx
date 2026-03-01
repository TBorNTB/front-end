'use client';

import Link from '@tiptap/extension-link';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { ResizableImage } from '@/components/editor/ResizableImage';
import { GFMBulletToTaskRule } from '@/components/editor/GFMBulletToTaskRule';
import { GFMTaskListInputRule } from '@/components/editor/GFMTaskListInputRule';
import { MarkdownShortcuts } from '@/components/editor/MarkdownShortcuts';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useRef, useState } from 'react';

/** 복붙한 텍스트에서 마크다운(헤딩, 할 일, 코드 블록)을 HTML로 변환 (노션 등 복붙 지원) */
function transformPastedMarkdown(text: string): string | null {
  const taskLineRegex = /^\s*-\s*\[( |x|X)\]\s*(.*)$/im;
  const headingRegex = /^(#{1,6})\s+(.*)$/;
  const codeFenceRegex = /^```(\w*)\s*$/;
  const blockquoteLineRegex = /^>\s?(.*)$/;
  const lines = text.split(/\r?\n/);
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  const blocks: string[] = [];
  let taskItems: { checked: boolean; content: string }[] = [];
  let hasTaskLine = false;
  let hasHeading = false;
  let hasCodeBlock = false;
  let hasBlockquote = false;
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];
  let blockquoteLines: string[] = [];

  const flushTaskList = () => {
    if (taskItems.length === 0) return;
    hasTaskLine = true;
    const itemsHtml = taskItems
      .map(
        (item) =>
          `<li data-type="taskItem" data-checked="${item.checked}"><p>${escapeHtml(item.content)}</p></li>`
      )
      .join('');
    blocks.push(`<ul data-type="taskList">${itemsHtml}</ul>`);
    taskItems = [];
  };

  const flushCodeBlock = () => {
    if (codeBlockLines.length === 0) return;
    hasCodeBlock = true;
    const code = codeBlockLines.join('\n');
    const lang = codeBlockLang ? ` class="language-${escapeHtml(codeBlockLang)}"` : '';
    blocks.push(`<pre><code${lang}>${escapeHtml(code)}</code></pre>`);
    codeBlockLines = [];
    codeBlockLang = '';
  };

  const flushBlockquote = () => {
    if (blockquoteLines.length === 0) return;
    hasBlockquote = true;
    const inner = blockquoteLines.map((l) => `<p>${escapeHtml(l)}</p>`).join('');
    blocks.push(`<blockquote>${inner}</blockquote>`);
    blockquoteLines = [];
  };

  for (const line of lines) {
    const fenceMatch = line.match(codeFenceRegex);
    if (fenceMatch !== null) {
      flushBlockquote();
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushTaskList();
        codeBlockLang = (fenceMatch[1] ?? '').trim();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    const blockquoteMatch = line.match(blockquoteLineRegex);
    if (blockquoteMatch) {
      flushTaskList();
      blockquoteLines.push(blockquoteMatch[1].trim());
      continue;
    }
    flushBlockquote();

    const taskMatch = line.match(taskLineRegex);
    const headingMatch = line.match(headingRegex);

    if (taskMatch) {
      taskItems.push({
        checked: taskMatch[1].toLowerCase() === 'x',
        content: taskMatch[2]?.trim() ?? '',
      });
    } else if (headingMatch) {
      flushTaskList();
      hasHeading = true;
      const level = Math.min(headingMatch[1].length, 3);
      const content = headingMatch[2].trim();
      blocks.push(`<h${level}>${escapeHtml(content)}</h${level}>`);
    } else {
      flushTaskList();
      if (line.trim().length > 0) blocks.push(`<p>${escapeHtml(line.trim())}</p>`);
    }
  }

  if (inCodeBlock) flushCodeBlock();
  flushBlockquote();
  flushTaskList();
  if (!hasTaskLine && !hasHeading && !hasCodeBlock && !hasBlockquote) return null;
  return blocks.length > 0 ? blocks.join('') : null;
}

interface TipTapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  onImageUpload?: (file: File) => Promise<{ url: string; key: string }>;
  editable?: boolean;
  placeholder?: string;
}

export default function TipTapEditor({
  content = '',
  onChange,
  onImageUpload,
  editable = true,
  placeholder = '문서 작성을 시작하세요...'
}: TipTapEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  // Prevent SSR hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false, // ✅ FIX: Explicitly disable immediate render for SSR
    extensions: [
      // 불릿 안 "[ ] " 시 우리 규칙이 TaskItem 규칙보다 먼저 실행되도록 맨 앞에 등록
      GFMBulletToTaskRule,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none pl-0 space-y-1',
        },
      }),
      GFMTaskListInputRule,
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-inside',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-inside',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 rounded p-4 font-mono text-sm',
          },
        },
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline hover:text-primary-700',
        },
      }),
      MarkdownShortcuts,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor || !onImageUpload) return;
    setIsUploadingImage(true);
    try {
      const { url } = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingImage(false);
    }
  }, [editor, onImageUpload]);

  // Ctrl+V 붙여넣기: 이미지 업로드, 노션 등 "- [ ]" / "- [x]" 할 일 목록 변환. wrapper에 캡처로 등록해 에디터 기본 붙여넣기보다 먼저 처리 → 중복 삽입 방지
  useEffect(() => {
    if (!editor || !editable) return;
    const wrapper = editorWrapperRef.current;
    if (!wrapper) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            e.stopPropagation();
            const file = items[i].getAsFile();
            if (file) handleImageUpload(file);
            return;
          }
        }
      }

      const text = e.clipboardData?.getData('text/plain');
      if (text) {
        const parsedHtml = transformPastedMarkdown(text);
        if (parsedHtml) {
          e.preventDefault();
          e.stopPropagation();
          editor.commands.insertContent(parsedHtml, { parseOptions: { preserveWhitespace: false } });
        }
      }
    };

    wrapper.addEventListener('paste', handlePaste, true);
    return () => wrapper.removeEventListener('paste', handlePaste, true);
  }, [editor, editable, handleImageUpload]);

  const handleImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = '';
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!onImageUpload || !editable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, [onImageUpload, editable]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!onImageUpload || !editable || !editor) return;
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files?.length) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
        break;
      }
    }
  }, [onImageUpload, editable, editor, handleImageUpload]);

  // Don't render until mounted (prevents hydration mismatch)
  if (!isMounted || !editor) {
    return (
      <div className="flex items-center justify-center h-96 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-700 text-sm">에디터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={editorWrapperRef}
      className="border border-gray-200 rounded-lg overflow-hidden bg-white"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 이미지 업로드 중 로딩 표시 */}
      {editable && isUploadingImage && (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 border-b border-primary-200 text-primary-800 text-sm">
          <svg className="animate-spin h-4 w-4 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>이미지 업로드 중...</span>
        </div>
      )}
      {/* Toolbar */}
      {editable && (
        <div className="border-b border-gray-200 p-3 flex gap-1 flex-wrap bg-gray-50">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>
              </svg>
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <span className="font-bold text-sm">H1</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <span className="font-bold text-sm">H2</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <span className="font-bold text-sm">H3</span>
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton
              onClick={() => {
                editor.chain().focus().toggleBulletList().run();
                editor.commands.focus();
              }}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                editor.chain().focus().toggleOrderedList().run();
                editor.commands.focus();
              }}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                editor.chain().focus().toggleTaskList().run();
                editor.commands.focus();
              }}
              isActive={editor.isActive('taskList')}
              title="할 일 목록 (체크박스) - [ ] 또는 - [x] 입력"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </ToolbarButton>
          </div>

          {/* Block Types */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Code Block"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
            </ToolbarButton>
          </div>

          {/* Image Upload */}
          {onImageUpload && (
            <div className="flex items-center gap-2 border-r border-gray-300 pr-2 mr-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <ToolbarButton
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                title="이미지 삽입 (삽입 후 드래그로 위치 변경, 선택 시 모서리로 크기 조절)"
              >
                {isUploadingImage ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                )}
              </ToolbarButton>
              <span className="text-xs text-gray-500 hidden sm:inline whitespace-nowrap">드래그로 이동 · 선택 후 크기 조절 · 파일 끌어다 놓기</span>
            </div>
          )}

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
              </svg>
            </ToolbarButton>
          </div>
        </div>
      )}
      
      {/* Editor Content */}
      <div className="p-4">
        <EditorContent editor={editor} />
        {editable && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-600">
            <p className="mb-2 font-medium text-gray-700">✏️ 사용 방법</p>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li><strong>글자 꾸미기:</strong> <code className="rounded bg-gray-200 px-1">**굵게**</code> <code className="rounded bg-gray-200 px-1">*기울임*</code> <code className="rounded bg-gray-200 px-1">`코드`</code> <code className="rounded bg-gray-200 px-1">~~취소선~~</code> 입력 후 스페이스/엔터</li>
              <li><strong>줄 맨 앞에서:</strong> <code className="rounded bg-gray-200 px-1">#</code> 제목, <code className="rounded bg-gray-200 px-1">&gt;</code> 인용, <code className="rounded bg-gray-200 px-1">-</code> 목록, <code className="rounded bg-gray-200 px-1">```</code> 코드 블록</li>
              <li><strong>체크박스(할 일):</strong> <code className="rounded bg-gray-200 px-1">-</code> 입력 후 스페이스(불릿) → <code className="rounded bg-gray-200 px-1">[ ]</code> 또는 <code className="rounded bg-gray-200 px-1">[x]</code> 입력 후 스페이스. 또는 새 줄에서 <code className="rounded bg-gray-200 px-1">- [ ]</code> 한 번에 입력, 툴바, 노션 붙여넣기.</li>
              <li><strong>붙여넣기:</strong> 노션 등에서 복사한 마크다운을 붙여넣으면 자동 변환됩니다. <code className="rounded bg-gray-200 px-1">#</code>~<code className="rounded bg-gray-200 px-1">###</code> 제목, <code className="rounded bg-gray-200 px-1">- [ ]</code> / <code className="rounded bg-gray-200 px-1">- [x]</code> 할 일, <code className="rounded bg-gray-200 px-1">```언어</code> 코드 블록, <code className="rounded bg-gray-200 px-1">&gt;</code> 인용.</li>
              <li><strong>이미지:</strong> 툴바 버튼으로 넣거나, 파일을 여기로 끌어다 놓기. 넣은 뒤 드래그로 위치 이동, 선택 후 모서리로 크기 조절</li>
              <li><strong>실행 취소:</strong> Ctrl+Z / 다시 실행: Ctrl+Y</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Toolbar Button Component
function ToolbarButton({ 
  onClick, 
  isActive, 
  disabled, 
  title, 
  children 
}: { 
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      type="button"
      className={`
        px-2.5 py-1.5 rounded text-sm font-medium transition-colors flex items-center justify-center
        ${isActive 
          ? 'bg-primary-600 text-white shadow-sm' 
          : 'bg-white text-gray-700 hover:bg-gray-100'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        border border-gray-300 min-w-[32px]
      `}
    >
      {children}
    </button>
  );
}
