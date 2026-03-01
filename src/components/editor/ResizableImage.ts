/**
 * Image extension with CSS-based resize (no dependency on ResizableNodeView).
 * Wraps img in a div with resize: both so users can drag to resize.
 * width/height are stored in the node and serialized to HTML so they persist in detail view.
 */
import Image from '@tiptap/extension-image';

const MIN_SIZE = 80;
/** 삽입 직후 이미지 기본 크기 (width, height) */
const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 320;

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const w = el.getAttribute('width');
          const n = w != null ? parseInt(w, 10) : null;
          return Number.isFinite(n) ? n : null;
        },
        renderHTML: (attrs) => (attrs.width != null ? { width: attrs.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (el) => {
          const h = el.getAttribute('height');
          const n = h != null ? parseInt(h, 10) : null;
          return Number.isFinite(n) ? n : null;
        },
        renderHTML: (attrs) => (attrs.height != null ? { height: attrs.height } : {}),
      },
    };
  },

  addNodeView() {
    const extension = this;
    return ({ node, getPos }: { node: { attrs: Record<string, unknown>; type: { name: string } }; getPos: () => number | undefined }) => {
      const editor = extension.editor;
      const attrs = node.attrs as { src?: string; alt?: string; title?: string; width?: number; height?: number };
      const hasSize = attrs.width != null && attrs.height != null;
      const w = hasSize ? attrs.width! : DEFAULT_WIDTH;
      const h = hasSize ? attrs.height! : DEFAULT_HEIGHT;

      const img = document.createElement('img');
      img.setAttribute('src', attrs.src || '');
      if (attrs.alt != null) img.setAttribute('alt', String(attrs.alt));
      if (attrs.title != null) img.setAttribute('title', String(attrs.title));
      img.className = 'max-w-full h-auto rounded-lg';
      img.style.display = 'block';
      img.style.objectFit = 'contain';
      img.style.width = `${w}px`;
      img.style.height = `${h}px`;

      // 상세보기(읽기 전용)에서는 리사이즈 불가 — 이미지만 표시
      if (!editor.isEditable) {
        return {
          dom: img,
          update: (updatedNode: { type: { name: string }; attrs: Record<string, unknown> }) => {
            if (updatedNode.type.name !== node.type.name) return false;
            const u = updatedNode.attrs as { src?: string; alt?: string; title?: string; width?: number; height?: number };
            img.setAttribute('src', u.src || '');
            if (u.alt != null) img.setAttribute('alt', String(u.alt));
            if (u.title != null) img.setAttribute('title', String(u.title));
            if (u.width != null) img.style.width = `${u.width}px`;
            if (u.height != null) img.style.height = `${u.height}px`;
            return true;
          },
          ignoreMutation: () => true,
        };
      }

      // 생성/수정 시에만 리사이즈 가능한 래퍼 사용
      const wrapper = document.createElement('div');
      wrapper.className = 'resizable-image-wrapper';
      wrapper.style.cssText = [
        'resize: both',
        'overflow: auto',
        `min-width: ${MIN_SIZE}px`,
        `min-height: ${MIN_SIZE}px`,
        'display: inline-block',
        'max-width: 100%',
        `width: ${w}px`,
        `height: ${h}px`,
      ].filter(Boolean).join('; ');
      img.style.width = '100%';
      img.style.height = '100%';
      wrapper.appendChild(img);

      if (!hasSize) {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (typeof pos === 'number' && editor) {
          requestAnimationFrame(() => {
            editor.chain().setNodeSelection(pos).updateAttributes('image', { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }).run();
          });
        }
      }

      const syncSizeToNode = () => {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (typeof pos !== 'number' || !editor) return;
        const ww = wrapper.offsetWidth;
        const hh = wrapper.offsetHeight;
        editor.chain().setNodeSelection(pos).updateAttributes('image', { width: ww, height: hh }).run();
      };

      const ro = new ResizeObserver(() => syncSizeToNode());
      ro.observe(wrapper);

      return {
        dom: wrapper,
        update: (updatedNode: { type: { name: string }; attrs: Record<string, unknown> }) => {
          if (updatedNode.type.name !== node.type.name) return false;
          const u = updatedNode.attrs as { src?: string; alt?: string; title?: string; width?: number; height?: number };
          img.setAttribute('src', u.src || '');
          if (u.alt != null) img.setAttribute('alt', String(u.alt));
          if (u.title != null) img.setAttribute('title', String(u.title));
          if (u.width) img.style.width = `${u.width}px`;
          if (u.height) img.style.height = `${u.height}px`;
          if (u.width) wrapper.style.width = `${u.width}px`;
          if (u.height) wrapper.style.height = `${u.height}px`;
          return true;
        },
        ignoreMutation: () => true,
      };
    };
  },
});
