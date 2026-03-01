/**
 * 댓글/답글이 실제로 수정된 경우에만 true.
 * 백엔드가 생성 시 createdAt과 updatedAt을 동시에 넣거나, 밀리초 차이로 다르게 줄 수 있어
 * "처음 댓글 달았는데 수정됨 표시"가 나오지 않도록, updatedAt이 createdAt보다
 * 최소 2초 이상 뒤일 때만 수정된 것으로 간주합니다.
 */
const EDITED_THRESHOLD_MS = 2000;

export function isCommentEdited(
  createdAt: string | undefined,
  updatedAt: string | undefined
): boolean {
  if (!createdAt || !updatedAt) return false;
  try {
    const created = new Date(createdAt).getTime();
    const updated = new Date(updatedAt).getTime();
    if (Number.isNaN(created) || Number.isNaN(updated)) return false;
    return updated - created > EDITED_THRESHOLD_MS;
  } catch {
    return false;
  }
}
