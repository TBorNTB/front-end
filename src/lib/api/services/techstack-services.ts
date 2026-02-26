import { PROJECT_ENDPOINTS, getProjectApiUrl } from '@/lib/api/endpoints/project-endpoints';

export interface TechStackItem {
  id: number;
  name: string;
}

/** GET /project-service/api/tech-stack/:techStackId - 테크스택 단건 조회 */
export const techStackService = {
  getById: async (techStackId: number): Promise<TechStackItem> => {
    const endpoint = PROJECT_ENDPOINTS.TECH_STACK.GET_BY_ID.replace(':techStackId', String(techStackId));
    const url = getProjectApiUrl(endpoint);

    const response = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch tech stack: ${response.status} - ${errorText}`);
    }

    return response.json();
  },
};