import { NextResponse } from 'next/server';
import { getApiUrl, API_ENDPOINTS } from '@/lib/api';

export async function POST(request: Request) {
  try {
    console.log('Signup API route called');
    
    const body = await request.json();
    console.log('Request body:', body);

    // Forward to your backend - using the correct endpoint URL
    const backendResponse = await fetch(getApiUrl(API_ENDPOINTS.USERS.SIGNUP), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', backendResponse.status);
    
    let data;
    try {
      data = await backendResponse.json();
      console.log('Backend response data:', data);
    } catch (jsonError) {
      console.error('Failed to parse backend response as JSON:', jsonError);
      return NextResponse.json(
        { message: 'Invalid response from backend' },
        { status: 500 }
      );
    }

    // Return the response with the same status as backend
    return NextResponse.json(data, {
      status: backendResponse.status,
    });

  } catch (error) {
    console.error("Signup API route error:", error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
