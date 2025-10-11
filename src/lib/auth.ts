/*// lib/auth.ts - Utility functions
import { User } from '@/features/auth/types';  // Import from feature
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Utility to get user from cookies (server-side)
export async function getServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) return null;
  
  // Verify and decode token
  return await verifyToken(token);
}

// Utility to protect API routes
export function requireAuth(handler: Function) {
  return async (request: NextRequest) => {
    const user = await getServerUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(request, user);
  };
}

// Token utilities
export async function verifyToken(token: string) {
  // JWT verification logic
}

export function generateToken(user: User) {
  // JWT generation logic
}

// Cookie helpers
export function setAuthCookie(token: string) {
  // Set secure HTTP-only cookie
}

export function clearAuthCookie() {
  // Clear auth cookie
}
*/