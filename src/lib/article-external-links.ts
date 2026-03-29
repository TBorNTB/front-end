/** 서버·프리사인 제한에 맞춘 아티클 첨부파일 최대 크기 (4.4MB) */
export const MAX_ARTICLE_ATTACHMENT_BYTES = Math.floor(4.4 * 1024 * 1024);

export const ARTICLE_ATTACHMENT_MAX_LABEL = '4.4MB';

export interface ExternalResourceLink {
  url: string;
  label: string;
}

const SSG_EXT_LINKS_MARKER = /<!--\s*SSG_EXT_LINKS:([\s\S]*?)-->/;

function utf8ToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(b64: string): string {
  return decodeURIComponent(escape(atob(b64.trim())));
}

/**
 * 본문 끝에 붙은 참고 링크 마커를 제거하고 링크 목록을 반환합니다.
 */
export function stripExternalLinksFromContent(html: string): { content: string; links: ExternalResourceLink[] } {
  if (typeof html !== 'string' || !html) {
    return { content: '', links: [] };
  }
  const m = html.match(SSG_EXT_LINKS_MARKER);
  if (!m) {
    return { content: html, links: [] };
  }
  let links: ExternalResourceLink[] = [];
  try {
    const parsed = JSON.parse(base64ToUtf8(m[1])) as unknown;
    if (Array.isArray(parsed)) {
      links = parsed
        .filter((item): item is { url?: string; label?: string } => item !== null && typeof item === 'object')
        .map((item) => ({
          url: typeof item.url === 'string' ? item.url : '',
          label: typeof item.label === 'string' ? item.label : '',
        }))
        .filter((item) => item.url.trim().length > 0);
    }
  } catch {
    links = [];
  }
  const content = html.replace(SSG_EXT_LINKS_MARKER, '').replace(/\s+$/, '');
  return { content, links };
}

/**
 * 참고 링크를 본문 HTML 끝에 마커로 병합합니다 (레거시 저장용).
 */
export function mergeExternalLinksIntoContent(html: string, links: ExternalResourceLink[]): string {
  const { content } = stripExternalLinksFromContent(html);
  const valid = links
    .map((l) => ({
      url: l.url.trim(),
      label: (l.label || l.url).trim(),
    }))
    .filter((l) => l.url.length > 0);
  if (valid.length === 0) {
    return content;
  }
  const payload = JSON.stringify(valid);
  const b64 = utf8ToBase64(payload);
  return `${content}\n<!--SSG_EXT_LINKS:${b64}-->`;
}

/**
 * 폼 상태 → API `referenceLinks` (문자열 배열).
 * 표시 이름이 있으면 `표시이름\\tURL`, 없으면 URL만 저장합니다.
 */
export function referenceLinkStringsFromForm(links: ExternalResourceLink[]): string[] {
  return links
    .filter((l) => l.url.trim())
    .map((l) => {
      const u = l.url.trim();
      const lab = l.label.trim();
      if (lab && lab !== u) {
        return `${lab.replace(/\t/g, ' ')}\t${u}`;
      }
      return u;
    });
}

/**
 * API `referenceLinks` → 폼 상태
 */
export function formLinksFromReferenceStrings(strings: string[] | undefined | null): ExternalResourceLink[] {
  if (!strings?.length) return [];
  return strings
    .map((raw) => {
      const s = typeof raw === 'string' ? raw.trim() : '';
      if (!s) return { url: '', label: '' };
      const tab = s.indexOf('\t');
      if (tab > 0) {
        const urlPart = s.slice(tab + 1).trim();
        if (/^https?:\/\//i.test(urlPart)) {
          return { label: s.slice(0, tab).trim(), url: urlPart };
        }
      }
      return { url: s, label: '' };
    })
    .filter((l) => l.url.length > 0);
}

const BLOCKED_LINK_PROTOCOLS = /^(javascript|data|vbscript):/i;

/**
 * 빈 문자열이면 null (필드 스킵), 값이 있으면 오류 메시지 또는 null(통과).
 * 호스트·서비스 제한 없이 일반 URL(표준 스킴만) 허용.
 */
export function validateExternalLinkUrl(url: string): string | null {
  const t = url.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (BLOCKED_LINK_PROTOCOLS.test(u.protocol)) {
      return '이 URL 형식은 등록할 수 없습니다.';
    }
  } catch {
    return '올바른 URL 형식이 아닙니다.';
  }
  return null;
}
