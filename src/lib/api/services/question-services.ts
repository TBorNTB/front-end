import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';
import { PROJECT_ENDPOINTS, getProjectApiUrl } from '@/lib/api/endpoints/project-endpoints';
import type {
  AnswerUpsertRequest,
  AnswerItem,
  OffsetSearchResponse,
  QuestionDetail,
  QuestionOffsetSearchParams,
  QuestionSearchItem,
  QuestionSearchStatus,
  QuestionUpsertRequest,
  SortDirection,
} from '@/types/services/question';

const normalizeStatus = (status?: QuestionSearchStatus): QuestionSearchStatus => status ?? 'ALL';
const normalizeSortDirection = (direction?: SortDirection): SortDirection => direction ?? 'DESC';

const buildQuestionOffsetSearchQuery = (params: QuestionOffsetSearchParams): string => {
  const searchParams = new URLSearchParams();

  searchParams.set('page', String(params.page));
  searchParams.set('size', String(params.size));
  searchParams.set('sortBy', params.sortBy ?? 'createdAt');
  searchParams.set('sortDirection', normalizeSortDirection(params.sortDirection));
  searchParams.set('status', normalizeStatus(params.status));

  // Backend accepts empty keyword, so always include it.
  searchParams.set('keyword', params.keyword ?? '');

  (params.categoryNames ?? [])
    .filter((name) => Boolean(name))
    .forEach((name) => searchParams.append('categoryNames', name));

  return searchParams.toString();
};

export const questionService = {
  /**
   * Q&A 질문 생성
   * POST /project-service/api/question
   */
  createQuestion: async (payload: QuestionUpsertRequest): Promise<QuestionDetail> => {
    const url = getProjectApiUrl(PROJECT_ENDPOINTS.QUESTION.CREATE);

    const response = await fetchWithRefresh(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to create question: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }

    return response.json();
  },

  /**
   * Q&A 질문 목록 조회 (offset search)
   * GET /project-service/api/question/offset/search
   */
  searchOffset: async (
    params: QuestionOffsetSearchParams
  ): Promise<OffsetSearchResponse<QuestionSearchItem>> => {
    const baseUrl = getProjectApiUrl(PROJECT_ENDPOINTS.QUESTION.OFFSET_SEARCH);
    const query = buildQuestionOffsetSearchQuery(params);
    const url = `${baseUrl}?${query}`;

    const response = await fetchWithRefresh(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to fetch questions: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }

    return response.json();
  },

  /**
   * Q&A 질문 상세 조회
   * GET /project-service/api/question/:id
   */
  getQuestionDetail: async (id: string | number): Promise<QuestionDetail> => {
    const endpoint = PROJECT_ENDPOINTS.QUESTION.GET_BY_ID.replace(':id', String(id));
    const url = getProjectApiUrl(endpoint);

    const response = await fetchWithRefresh(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to fetch question detail: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }

    return response.json();
  },

  /**
   * Q&A 질문 수정
   * PUT /project-service/api/question/:id
   */
  updateQuestion: async (
    id: string | number,
    payload: QuestionUpsertRequest
  ): Promise<QuestionDetail> => {
    const endpoint = PROJECT_ENDPOINTS.QUESTION.UPDATE.replace(':id', String(id));
    const url = getProjectApiUrl(endpoint);

    const response = await fetchWithRefresh(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to update question: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }

    return response.json();
  },

  /**
   * Q&A 질문 삭제
   * DELETE /project-service/api/question/:id
   */
  deleteQuestion: async (id: string | number): Promise<void> => {
    const endpoint = PROJECT_ENDPOINTS.QUESTION.DELETE.replace(':id', String(id));
    const url = getProjectApiUrl(endpoint);

    const response = await fetchWithRefresh(url, {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to delete question: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }
  },

  /**
   * Q&A 답변 목록 조회 (offset)
   * GET /project-service/api/question/:questionId/answer/offset
   */
  getAnswerOffset: async (
    questionId: string | number,
    params: {
      page: number;
      size: number;
      sortBy?: string;
      sortDirection?: SortDirection;
    }
  ): Promise<OffsetSearchResponse<AnswerItem>> => {
    const endpoint = PROJECT_ENDPOINTS.QUESTION.ANSWER_OFFSET.replace(
      ':questionId',
      String(questionId)
    );
    const baseUrl = getProjectApiUrl(endpoint);

    const searchParams = new URLSearchParams();
    searchParams.set('page', String(params.page));
    searchParams.set('size', String(params.size));
    searchParams.set('sortBy', params.sortBy ?? 'createdAt');
    searchParams.set('sortDirection', params.sortDirection ?? 'DESC');

    const url = `${baseUrl}?${searchParams.toString()}`;

    const response = await fetchWithRefresh(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to fetch answers: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }

    return response.json();
  },

  /**
   * Q&A 답변 생성
   * POST /project-service/api/question/:questionId/answer
   */
  createAnswer: async (
    questionId: string | number,
    payload: AnswerUpsertRequest
  ): Promise<AnswerItem> => {
    const endpoint = PROJECT_ENDPOINTS.QUESTION.ANSWER_CREATE.replace(
      ':questionId',
      String(questionId)
    );
    const url = getProjectApiUrl(endpoint);

    const response = await fetchWithRefresh(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to create answer: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }

    return response.json();
  },

  /**
   * Q&A 답변 수정
   * PUT /project-service/api/question/answer/:answerId
   */
  updateAnswer: async (
    answerId: string | number,
    payload: AnswerUpsertRequest
  ): Promise<AnswerItem> => {
    const endpoint = PROJECT_ENDPOINTS.QUESTION.ANSWER_UPDATE.replace(
      ':answerId',
      String(answerId)
    );
    const url = getProjectApiUrl(endpoint);

    const response = await fetchWithRefresh(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to update answer: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }

    return response.json();
  },

  /**
   * Q&A 답변 삭제
   * DELETE /project-service/api/question/answer/:answerId
   */
  deleteAnswer: async (answerId: string | number): Promise<void> => {
    const endpoint = PROJECT_ENDPOINTS.QUESTION.ANSWER_DELETE.replace(
      ':answerId',
      String(answerId)
    );
    const url = getProjectApiUrl(endpoint);

    const response = await fetchWithRefresh(url, {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to delete answer: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }
  },

  /**
   * Q&A 답변 채택
   * POST /project-service/api/question/:questionId/answer/:answerId/accept
   * Response: empty
   */
  acceptAnswer: async (questionId: string | number, answerId: string | number): Promise<void> => {
    const endpoint = PROJECT_ENDPOINTS.QUESTION.ANSWER_ACCEPT
      .replace(':questionId', String(questionId))
      .replace(':answerId', String(answerId));
    const url = getProjectApiUrl(endpoint);

    const response = await fetchWithRefresh(url, {
      method: 'POST',
      headers: {
        Accept: '*/*',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to accept answer: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }
  },
};
