/**
 * 백엔드에서 HTML 엔티티로 이스케이프된 문자열을 사람이 읽을 수 있는 텍스트로 디코딩합니다.
 * 예: "&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;" → "<script>alert('XSS')</script>"
 * 디코딩된 문자열을 React에서 {decoded} 로 렌더링하면 React가 다시 이스케이프하므로
 * 스크립트는 실행되지 않고 화면에 문자로만 표시됩니다.
 */
export function decodeHtmlEntities(text: string): string {
  if (typeof text !== 'string' || !text) return text;

  const entities: Record<string, string> = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }
  // 숫자 엔티티 &#123; 또는 &#x7B;
  result = result.replace(/&#(\d+);/g, (_, num) =>
    String.fromCharCode(parseInt(num, 10))
  );
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  return result;
}

/**
 * 에디터 HTML에서 태그 사이 불필요한 개행/공백을 제거해
 * 렌더 시 의도치 않은 줄바꿈이 나오지 않도록 합니다.
 * <pre>, <code> 내부는 건드리지 않습니다.
 */
export function normalizeEditorHtml(html: string): string {
  if (typeof html !== 'string' || !html.trim()) return html;
  const preserved: string[] = [];
  let index = 0;
  let normalized = html.replace(/<pre[\s\S]*?<\/pre>/gi, (match) => {
    const i = index++;
    preserved.push(match);
    return `\u0000B${i}\u0000`;
  });
  normalized = normalized.replace(/<code[\s\S]*?<\/code>/gi, (match) => {
    const i = index++;
    preserved.push(match);
    return `\u0000B${i}\u0000`;
  });
  normalized = normalized.replace(/>\s+</g, '><');
  preserved.forEach((s, i) => {
    normalized = normalized.replace(`\u0000B${i}\u0000`, s);
  });
  return normalized;
}

/** 체크박스용 작은 네모 박스 클래스명 (ProjectContentRenderer에서 사용) */
export const PROJECT_CONTENT_CHECKBOX_CLASS = 'project-content-checkbox';

/** input 태그 또는 앞쪽 HTML에서 checked 여부 감지 (이스케이프·속성 순서 무관) */
function isInputChecked(inputTag: string): boolean {
  const normalized = inputTag.replace(/\\/g, '');
  return (
    /\bchecked\s*=\s*["']?(?:checked|true)["']?/i.test(normalized) ||
    /\bchecked\s*(?=>|\s)/i.test(normalized)
  );
}

/** 같은 li 블록 안에 data-checked="true" 가 있는지 (input 앞쪽 문자열 기준) */
function isLiChecked(htmlBeforeInput: string): boolean {
  const lastLi = htmlBeforeInput.lastIndexOf('<li');
  if (lastLi === -1) return false;
  const block = htmlBeforeInput.slice(lastLi);
  return /data-checked\s*=\s*["']?(?:true|checked)["']?/i.test(block);
}

/**
 * HTML 내 <input type="checkbox"> 를 클릭 가능한 작은 네모 박스(span)로 치환합니다.
 * 체크 상태: input의 checked 속성 또는 부모 li의 data-checked 를 사용해 상세페이지에서 올바르게 표시됩니다.
 */
export function replaceCheckboxesWithBoxes(html: string): string {
  if (typeof html !== 'string' || !html.trim()) return html;
  const re = /<input\s[^>]*type\s*=\s*["']?checkbox["']?[^>]*>/gi;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index);
    result += before;
    const fromInput = isInputChecked(match[0]);
    const fromLi = isLiChecked(html.slice(0, match.index));
    const checked = fromInput || fromLi;
    result += `<span class="${PROJECT_CONTENT_CHECKBOX_CLASS}" data-checked="${checked}" role="button" tabindex="0"></span>`;
    lastIndex = re.lastIndex;
  }
  result += html.slice(lastIndex);
  return result;
}
