import { NextRequest, NextResponse } from 'next/server';

/**
 * S3 업로드 프록시 API
 * CORS 문제 해결을 위해 서버에서 S3로 업로드
 */
export async function PUT(request: NextRequest) {
  try {
    const { presignedUrl, contentType } = await request.json();

    if (!presignedUrl) {
      return NextResponse.json(
        { error: 'presignedUrl is required' },
        { status: 400 }
      );
    }

    // request body를 그대로 전달
    const fileBuffer = await request.arrayBuffer();

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return NextResponse.json(
        { error: `Upload failed: ${uploadResponse.status}`, details: errorText },
        { status: uploadResponse.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('S3 Upload Proxy Error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const presignedUrl = formData.get('presignedUrl') as string;
    const file = formData.get('file') as File;

    if (!presignedUrl || !file) {
      return NextResponse.json(
        { error: 'presignedUrl and file are required' },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return NextResponse.json(
        { error: `Upload failed: ${uploadResponse.status}`, details: errorText },
        { status: uploadResponse.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('S3 Upload Proxy Error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
