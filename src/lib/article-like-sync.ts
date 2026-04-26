type LikePostType = "ARTICLE" | "PROJECT";

const getStorageKey = (postType: LikePostType) =>
  postType === "ARTICLE" ? "liked-article-ids" : "liked-project-ids";

const getEventName = (postType: LikePostType) =>
  postType === "ARTICLE" ? "article-like-updated" : "project-like-updated";

export type ArticleLikeUpdatedDetail = {
  articleId: string;
  isLiked: boolean;
  likeCount?: number;
};

export type ProjectLikeUpdatedDetail = {
  projectId: string;
  isLiked: boolean;
  likeCount?: number;
};

const canUseBrowser = () => typeof window !== "undefined";

export const getLikedArticleIds = (): Set<string> => {
  return getLikedIdsByType("ARTICLE");
};

const getLikedIdsByType = (postType: LikePostType): Set<string> => {
  if (!canUseBrowser()) return new Set();

  try {
    const raw = window.localStorage.getItem(getStorageKey(postType));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((id) => String(id)));
  } catch {
    return new Set();
  }
};

const saveLikedArticleIds = (ids: Set<string>) => {
  saveLikedIdsByType("ARTICLE", ids);
};

const saveLikedIdsByType = (postType: LikePostType, ids: Set<string>) => {
  if (!canUseBrowser()) return;
  try {
    window.localStorage.setItem(getStorageKey(postType), JSON.stringify(Array.from(ids)));
  } catch {
    // Ignore storage errors silently
  }
};

export const isArticleLikedFromCache = (articleId: string | number): boolean => {
  const ids = getLikedIdsByType("ARTICLE");
  return ids.has(String(articleId));
};

export const setArticleLikedInCache = (articleId: string | number, isLiked: boolean) => {
  setLikedInCache("ARTICLE", articleId, isLiked);
};

export const isProjectLikedFromCache = (projectId: string | number): boolean => {
  const ids = getLikedIdsByType("PROJECT");
  return ids.has(String(projectId));
};

export const setProjectLikedInCache = (projectId: string | number, isLiked: boolean) => {
  setLikedInCache("PROJECT", projectId, isLiked);
};

const setLikedInCache = (postType: LikePostType, itemId: string | number, isLiked: boolean) => {
  const id = String(itemId);
  const ids = getLikedIdsByType(postType);

  if (isLiked) {
    ids.add(id);
  } else {
    ids.delete(id);
  }

  saveLikedIdsByType(postType, ids);
};

export const notifyArticleLikeUpdated = (detail: ArticleLikeUpdatedDetail) => {
  if (!canUseBrowser()) return;
  window.dispatchEvent(new CustomEvent<ArticleLikeUpdatedDetail>(getEventName("ARTICLE"), { detail }));
};

export const notifyProjectLikeUpdated = (detail: ProjectLikeUpdatedDetail) => {
  if (!canUseBrowser()) return;
  window.dispatchEvent(new CustomEvent<ProjectLikeUpdatedDetail>(getEventName("PROJECT"), { detail }));
};

export const ARTICLE_LIKE_UPDATED_EVENT_NAME = getEventName("ARTICLE");
export const PROJECT_LIKE_UPDATED_EVENT_NAME = getEventName("PROJECT");
