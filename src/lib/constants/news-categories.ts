/**
 * NEWS 카테고리
 * - 생성/수정(project-service): 한글 description 전송 (연합 세미나, 스터디 등)
 * - 조회(elastic-service): enum 전송 (UNITED_SEMINAR, STUDY 등)
 */
export const NEWS_CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { label: 'MT', value: 'MT' },
  { label: 'OT', value: 'OT' },
  { label: '스터디', value: '스터디' },
  { label: '세미나', value: '세미나' },
  { label: '연합 세미나', value: '연합 세미나' },
  { label: '컨퍼런스', value: '컨퍼런스' },
  { label: 'CTF', value: 'CTF' },
];

/** API가 enum으로 내려줄 때 → 폼/표시용 한글로 변환 (수정 폼 로드 등) */
export const NEWS_CATEGORY_ENUM_TO_DESCRIPTION: Record<string, string> = {
  MT: 'MT',
  OT: 'OT',
  STUDY: '스터디',
  SEMINAR: '세미나',
  UNITED_SEMINAR: '연합 세미나',
  CONFERENCE: '컨퍼런스',
  CTF: 'CTF',
};

/** 한글(description) → elastic-service 요청용 enum */
export const NEWS_CATEGORY_DESCRIPTION_TO_ENUM: Record<string, string> = {
  MT: 'MT',
  OT: 'OT',
  '스터디': 'STUDY',
  '세미나': 'SEMINAR',
  '연합 세미나': 'UNITED_SEMINAR',
  '컨퍼런스': 'CONFERENCE',
  CTF: 'CTF',
};

export function toNewsCategoryDescription(category: string | undefined): string {
  if (!category) return '';
  return NEWS_CATEGORY_ENUM_TO_DESCRIPTION[category] ?? category;
}

/** Elastic-service 조회 시 카테고리 필터: description → enum */
export function toNewsCategoryEnum(category: string | undefined): string {
  if (!category || category === 'all') return category ?? '';
  return NEWS_CATEGORY_DESCRIPTION_TO_ENUM[category] ?? category;
}
