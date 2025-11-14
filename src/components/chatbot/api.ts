// RAG API 호출 함수
import { BASE_URL, API_ENDPOINTS } from "@/lib/api/services/user-service";

interface RAGRequest {
  query: string;
  maxResults?: number;
  model?: string;
}

interface RAGResponse {
  success: boolean;
  data?: {
    query: string;
    answer: string;
    relevantDocuments?: Array<{
      id: string;
      content: string;
      metadata: Record<string, any>;
      score: number;
    }>;
  };
  error?: string;
}

const RAG_API_URL = `${BASE_URL}${API_ENDPOINTS.RAG.QUERY}`;

/**
 * 답변 텍스트에서 참고문서 관련 내용을 제거하는 함수
 */
const removeReferences = (text: string): string => {
  if (!text) return text;

  let cleaned = text;

  // 참고문서 섹션 제거 (다양한 패턴)
  const referencePatterns = [
    /참고문서[:\s]*[\s\S]*$/i,
    /참고\s*문서[:\s]*[\s\S]*$/i,
    /출처[:\s]*[\s\S]*$/i,
    /References?[:\s]*[\s\S]*$/i,
    /Sources?[:\s]*[\s\S]*$/i,
    /참고\s*자료[:\s]*[\s\S]*$/i,
    /관련\s*문서[:\s]*[\s\S]*$/i,
    /\[참고문서\][\s\S]*$/i,
    /\[출처\][\s\S]*$/i,
    /\[References?\][\s\S]*$/i,
  ];

  referencePatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "");
  });

  // 인용 번호 제거 [1], [2], [3] 등
  cleaned = cleaned.replace(/\[\d+\]/g, "");

  // URL 제거 (http://, https://로 시작하는 링크)
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "");

  // 연속된 공백 정리
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // 마지막 문장 끝의 불필요한 공백이나 구두점 정리
  cleaned = cleaned.replace(/\s*[,\-]\s*$/, "");

  return cleaned.trim();
};

export const queryRAG = async (query: string): Promise<string> => {
  try {
    const response = await fetch(RAG_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        maxResults: 5,
        model: "아느",
      }),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: RAGResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || "RAG API 요청 실패");
    }

    // 답변만 추출하고 참고문서 제거
    const answer = data.data?.answer || "답변을 생성할 수 없습니다.";
    return removeReferences(answer);
  } catch (error) {
    console.error("RAG API 호출 오류:", error);
    throw error;
  }
};

