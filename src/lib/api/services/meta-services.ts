import { fetchWithRefresh } from "@/lib/api/fetch-with-refresh";
import { META_ENDPOINTS, getMetaApiUrl } from "@/lib/api/endpoints";

export type MetaCountResponse = {
  userCount: number;
  projectCount: number;
  articleCount: number;
  categoryCount: number;
};

export async function fetchMetaCount(): Promise<MetaCountResponse> {
  const url = getMetaApiUrl(META_ENDPOINTS.META.COUNT);

  const response = await fetchWithRefresh(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch meta count: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
    );
  }

  return response.json();
}
