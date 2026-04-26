'use client';

import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';
import { getSafeApiErrorMessage } from '@/lib/api/helpers';

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
  getPresignedUrl: async (fileName: string, contentType: string, endpoint?: string): Promise<{
    presignedUrl: string;
    fileUrl?: string;
    key?: string;
  }> => {
    try {
      const response = await fetchWithRefresh(endpoint ?? '/api/s3/presigned-url', {
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
        if (process.env.NODE_ENV === 'development') {
          console.error('[s3] getPresignedUrl error', response.status, responseData);
        }
        throw new Error(getSafeApiErrorMessage(response, '파일'));
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
        const nestedData = (responseData as any).data;
        const payload = nestedData && typeof nestedData === 'object' ? nestedData : responseData;

        return {
          presignedUrl: (payload as any).uploadUrl || (payload as any).presignedUrl || (payload as any).url || '',
          fileUrl: (payload as any).downloadUrl || (payload as any).fileUrl || (payload as any).presignedUrl?.split('?')[0],
          key: (payload as any).key || '',
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
  uploadFile: async (file: File, options?: { presignedUrlEndpoint?: string }): Promise<{ url: string; key: string }> => {
    try {
      // 1. Presigned URL 요청
      const { presignedUrl, fileUrl, key } = await s3Service.getPresignedUrl(file.name, file.type, options?.presignedUrlEndpoint);

      if (!presignedUrl) {
        throw new Error('Presigned URL을 받을 수 없습니다.');
      }

      console.log('📤 S3 업로드 시작 (프록시 사용):', {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      });

      // 2. Next.js 프록시를 통해 S3에 업로드 (CORS 우회)
      const formData = new FormData();
      formData.append('presignedUrl', presignedUrl);
      formData.append('file', file);

      let uploadError: Error | null = null;

      const uploadResponse = await fetch('/api/s3/upload-proxy', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        if (process.env.NODE_ENV === 'development') {
          const errorData = await uploadResponse.json().catch(() => ({}));
          console.error('[s3] upload-proxy error', uploadResponse.status, errorData);
        }
        uploadError = new Error(getSafeApiErrorMessage(uploadResponse, '파일'));
      }

      // 프록시 업로드 실패 시, presigned URL로 직접 업로드 한 번 더 시도
      if (uploadError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[s3] upload-proxy failed, trying direct upload fallback');
        }

        const directHeaders: HeadersInit = {};
        if (file.type) {
          directHeaders['Content-Type'] = file.type;
        }

        const directUploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          headers: directHeaders,
          body: file,
        });

        if (!directUploadResponse.ok) {
          if (process.env.NODE_ENV === 'development') {
            const directErrorText = await directUploadResponse.text().catch(() => '');
            console.error('[s3] direct upload error', directUploadResponse.status, directErrorText);
          }
          throw uploadError;
        }
      }

      console.log('✅ S3 업로드 성공:', fileUrl);

      // 3. 업로드된 파일 URL과 key 반환
      const derivedKey =
        key ||
        fileUrl?.split('.amazonaws.com/')[1] ||
        presignedUrl.split('?')[0].split('.amazonaws.com/')[1] ||
        '';

      return {
        url: fileUrl || presignedUrl.split('?')[0],
        key: derivedKey,
      };
    } catch (error: any) {
      console.error('❌ S3 파일 업로드 실패:', error);
      throw new Error('파일 업로드 중 오류가 발생했습니다.');
    }
  },
};