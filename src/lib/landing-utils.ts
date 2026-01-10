// src/lib/landing-utils.ts
export const convertStatus = (apiStatus: string): string => {
  switch (apiStatus) {
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Active';
    case 'PLANNING':
      return 'Planning';
    default:
      return apiStatus;
  }
};

export const normalizeImageUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== 'string') return null;
  if (url.trim() === '' || url === 'string' || url === 'null' || url === 'undefined') return null;

  // Relative paths (/images/...)
  if (url.startsWith('/')) return url;

  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
};
