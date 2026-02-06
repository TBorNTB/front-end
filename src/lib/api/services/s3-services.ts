'use client';

import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';

/**
 * S3 파일 업로드 서비스
 */
export const s3Service = {
  /**
   * S3 presigned URL 요청
   * POST /user-service/api/s3/presigned-url
   * @param fileName 파일 이름
   * @param contentType 파일 타입 (MIME type)
   * @returns presigned URL 및 파일 URL
   */
  getPresignedUrl: async (fileName: string, contentType: string): Promise<{
    presignedUrl: string;
    fileUrl?: string;
    key?: string;
  }> => {
    try {
      const response = await fetchWithRefresh('/api/s3/presigned-url', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          contentType,
          fileType: contentType,
        }),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = responseData?.message ||
                            responseData?.error ||
                            `Presigned URL 생성 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      // responseData가 null이거나 undefined인 경우
      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      // 응답이 문자열인 경우
      if (typeof responseData === 'string') {
        return {
          presignedUrl: responseData,
          fileUrl: responseData.split('?')[0],
        };
      }

      // 응답이 객체인 경우
      if (typeof responseData === 'object') {
        return {
          presignedUrl: responseData.uploadUrl || responseData.presignedUrl || responseData.url || '',
          fileUrl: responseData.downloadUrl || responseData.fileUrl || responseData.presignedUrl?.split('?')[0],
          key: responseData.key || '',
        };
      }

      // 예상치 못한 응답 형식
      throw new Error('서버 응답 형식이 올바르지 않습니다.');
    } catch (error: any) {
      console.error('Error getting presigned URL:', error);
      throw error;
    }
  },

  /**
   * 파일을 S3에 업로드
   * @param file 업로드할 파일
   * @returns 업로드된 파일의 URL과 key
   */
  uploadFile: async (file: File): Promise<{ url: string; key: string }> => {
    try {
      // 1. Presigned URL 요청
      const { presignedUrl, fileUrl, key } = await s3Service.getPresignedUrl(file.name, file.type);

      if (!presignedUrl) {
        throw new Error('Presigned URL을 받을 수 없습니다.');
      }

      // 2. 파일을 S3에 업로드
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`파일 업로드 실패 (${uploadResponse.status})`);
      }

      // 3. 업로드된 파일 URL과 key 반환
      return {
        url: fileUrl || presignedUrl.split('?')[0],
        key: key || '',
      };
    } catch (error: any) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  },
};