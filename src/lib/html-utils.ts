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
