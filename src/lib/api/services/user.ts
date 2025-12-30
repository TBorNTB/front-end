// src/lib/api/user.ts
import { apiClient } from './client';
import { API_ENDPOINTS } from '@/lib/endpoints'; // your existing endpoints.[file:1]

type LoginPayload = { email: string; password: string };

type LoginResponse = {
  message?: string;
  authenticated?: boolean;
  user?: any;
};

export function loginFromGateway(payload: LoginPayload, req?: Request) {
  return apiClient.post<LoginResponse>(API_ENDPOINTS.USERS.LOGIN, payload, req);
}
