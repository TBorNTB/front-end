/**
 * 불릿 항목 안에서 "[ ] " / "[x] " 입력 시 → 해당 bulletList를 taskList로 교체.
 * TaskItem의 " [ ] " 규칙보다 먼저 실행되어 setNodeMarkup 에러를 막기 위해
 * 본 확장만 TaskItem/ TaskList보다 앞에 등록함.
 */
import { Extension, InputRule } from '@tiptap/core';

const TASK_IN_BULLET_REGEX = /^\s*\[( |x)\]\s$/i;

export const GFMBulletToTaskRule = Extension.create({
  name: 'gfmBulletToTaskRule',

  addInputRules() {
    const schema = this.editor.schema;
    const taskItemType = schema.nodes.taskItem;
    const taskListType = schema.nodes.taskList;
    const listItemType = schema.nodes.listItem;
    const bulletListType = schema.nodes.bulletList;
    const paragraphType = schema.nodes.paragraph;
    if (!taskItemType || !taskListType || !listItemType || !bulletListType || !paragraphType) return [];

    return [
      new InputRule({
        find: TASK_IN_BULLET_REGEX,
        handler: ({ state, range, match }) => {
          const $pos = state.doc.resolve(range.from);
          let listItemPos: number | null = null;
          let bulletListPos: number | null = null;
          for (let d = $pos.depth - 1; d >= 0; d--) {
            const node = $pos.node(d);
            if (node.type === listItemType && listItemPos === null) listItemPos = $pos.before(d);
            if (node.type === bulletListType) {
              bulletListPos = $pos.before(d);
              break;
            }
          }
          if (listItemPos === null || bulletListPos === null) return null;

          const checked = (match[1] ?? ' ').toLowerCase() === 'x';
          const tr = state.tr;
          tr.delete(range.from, range.to);

          const listItemNode = tr.doc.nodeAt(listItemPos + 1);
          const bulletListNode = tr.doc.nodeAt(bulletListPos + 1);
          if (!listItemNode || !bulletListNode || listItemNode.type !== listItemType || bulletListNode.type !== bulletListType) return null;

          const remainingText = listItemNode.textContent.trim();
          const paragraphContent = remainingText ? [schema.text(remainingText)] : [];
          const paragraphNode = paragraphType.create(null, paragraphContent);
          const taskItemNode = taskItemType.create({ checked }, paragraphNode);
          const taskListNode = taskListType.create(null, [taskItemNode]);
          const from = bulletListPos + 1;
          const to = bulletListPos + 1 + bulletListNode.nodeSize;
          tr.replaceWith(from, to, taskListNode);
        },
        undoable: true,
      }),
    ];
  },
});
