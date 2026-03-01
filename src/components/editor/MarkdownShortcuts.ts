/**
 * 마크다운 입력 규칙: 타이핑 시 ** * ` [text](url) 등이 자동 변환되도록 합니다.
 * # 제목, > 인용, - 목록, ``` 코드블록은 StarterKit에서 이미 지원됩니다.
 * (Mark 확장으로 등록해 addInputRules가 호출되도록 함)
 */
import { Mark, markInputRule } from '@tiptap/core';

export const MarkdownShortcuts = Mark.create({
  name: 'markdownShortcuts',

  parseHTML: () => [],
  renderHTML: () => ['span', 0],

  addInputRules() {
    const editor = this.editor;
    if (!editor?.schema) return [];

    const rules: ReturnType<typeof markInputRule>[] = [];
    const schema = editor.schema;

    // **굵게** → bold
    if (schema.marks.bold) {
      rules.push(
        markInputRule({
          find: /\*\*([^*]+)\*\*$/,
          type: schema.marks.bold,
        })
      );
      rules.push(
        markInputRule({
          find: /__([^_]+)__$/,
          type: schema.marks.bold,
        })
      );
    }

    // *기울임* → italic
    if (schema.marks.italic) {
      rules.push(
        markInputRule({
          find: /\*([^*]+)\*$/,
          type: schema.marks.italic,
        })
      );
      rules.push(
        markInputRule({
          find: /_([^_]+)_$/,
          type: schema.marks.italic,
        })
      );
    }

    // `코드` → code
    if (schema.marks.code) {
      rules.push(
        markInputRule({
          find: /`([^`]+)`$/,
          type: schema.marks.code,
        })
      );
    }

    // ~~취소선~~ → strike (GitHub Flavored Markdown)
    if (schema.marks.strike) {
      rules.push(
        markInputRule({
          find: /~~([^~]+)~~$/,
          type: schema.marks.strike,
        })
      );
    }

    return rules;
  },
});
