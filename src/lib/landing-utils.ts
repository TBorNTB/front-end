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

export const normalizeImageUrl = (url: string | null | undefined): string => {
  const defaultImageUrl = 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800';
  
  if (!url || typeof url !== 'string') return defaultImageUrl;
  if (url.trim() === '' || url === 'string' || url === 'null' || url === 'undefined') return defaultImageUrl;

  // Relative paths (/images/...)
  if (url.startsWith('/')) return url;

  try {
    new URL(url);
    return url;
  } catch {
    return defaultImageUrl;
  }
};
