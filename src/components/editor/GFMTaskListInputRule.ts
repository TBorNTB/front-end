/**
 * 새 줄에서 "- [ ] " / "- [x] " 입력 시에만 할 일 목록(체크박스)으로 변환.
 * 불릿("- ") 적용 후 "[ ] " 입력 시에는 extension-list의 TaskItem 규칙이 먼저 실행되며
 * setNodeMarkup에서 "Invalid content for node type taskList" 에러가 나서, 해당 흐름은 지원하지 않음.
 * → 체크박스: 새 줄에서 "- [ ] " 한 번에 입력, 또는 " [ ] " 만 입력, 툴바, 붙여넣기 사용.
 */
import { Extension, wrappingInputRule } from '@tiptap/core';

const GFM_TASK_LINE_REGEX = /^-\s*\[( |x)\]\s$/i;

export const GFMTaskListInputRule = Extension.create({
  name: 'gfmTaskListInputRule',

  addInputRules() {
    const taskItemType = this.editor.schema.nodes.taskItem;
    if (!taskItemType) return [];

    return [
      wrappingInputRule({
        find: GFM_TASK_LINE_REGEX,
        type: taskItemType,
        getAttributes: (match) => ({
          checked: (match[1] ?? ' ').toLowerCase() === 'x',
        }),
        undoable: true,
      }),
    ];
  },
});
