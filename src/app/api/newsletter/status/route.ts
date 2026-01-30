import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'email query parameter is required' }, { status: 400 });
    }

    const backendResponse = await fetch(
      `${BASE_URL}/newsletter-service/api/newsletter/subscribers/status?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const data = await backendResponse.json().catch(() => null);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Newsletter status API route error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
