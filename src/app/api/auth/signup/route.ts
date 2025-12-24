import { NextResponse } from 'next/server';
import { getApiUrl, API_ENDPOINTS } from '@/lib/api/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // ✅ Extract only the user data fields your backend expects
    // Remove file-related fields and confirmPassword
    const { fileData, fileName, fileType, confirmPassword, ...userData } = body;
    
    console.log('👤 Creating user account with data:', {
      ...userData,
      password: '[REDACTED]' // Security: don't log passwords
    });

    // ✅ Create user account
    const signupApiUrl = getApiUrl(API_ENDPOINTS.USERS.SIGNUP);
    console.log('🌐 Signup API URL:', signupApiUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const backendResponse = await fetch(signupApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', //For cookie-based auth
      body: JSON.stringify(userData), //THIS IS THE KEY FIX!
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('📡 Signup Response Status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Signup failed:', errorText);
      return NextResponse.json({
        message: `Registration failed: ${backendResponse.status}`,
        details: errorText
      }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    console.log('✅ Signup Success!');
    
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error) {
    console.error('❌ Signup Route Error:', error);
    
    // Handle timeout errors
    if (typeof error === 'object' && error !== null && 'name' in error && 
        (error as { name?: unknown }).name === 'AbortError') {
      return NextResponse.json({
        message: 'Request timeout - please try again',
        error: 'Connection timeout'
      }, { status: 408 });
    }

    return NextResponse.json({
      message: 'Registration failed - please try again',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
