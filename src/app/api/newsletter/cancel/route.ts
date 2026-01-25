import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(
      `${BASE_URL}/newsletter-service/api/newsletter/subscribers/verify/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json().catch(() => null);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Newsletter cancel (send code) API route error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(
      `${BASE_URL}/newsletter-service/api/newsletter/subscribers/verify/cancel`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json().catch(() => null);

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('Newsletter cancel (verify code) API route error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
