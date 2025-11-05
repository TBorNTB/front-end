import { NextResponse } from 'next/server';
import { getApiUrl, API_ENDPOINTS } from '@/lib/api/services/user-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    let profileImageUrl = body.profileImageUrl;
    
    // If there's file data, upload to S3 first
    if (body.fileData && body.fileName && body.fileType) {
      try {
        console.log('🔍 Starting S3 upload process...');
        
        // Get S3 presigned URL
        const s3Payload = {
          fileName: body.fileName,
          contentType: body.fileType,
          fileType: body.fileType,
        };
        
        const s3ApiUrl = getApiUrl(API_ENDPOINTS.S3.PRESIGNED_URL);
        console.log('🌐 S3 API URL:', s3ApiUrl);
        
        const s3Response = await fetch(s3ApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(s3Payload),
        });

        console.log('📡 S3 Response Status:', s3Response.status);
        console.log('📡 S3 Response Headers:', Object.fromEntries(s3Response.headers.entries()));

        if (!s3Response.ok) {
          const errorText = await s3Response.text();
          console.error('❌ S3 API Error:', errorText);
          
          return NextResponse.json({
            message: 'Failed to generate upload URL for profile image',
            details: errorText,
            debug: {
              url: s3ApiUrl,
              status: s3Response.status,
              headers: Object.fromEntries(s3Response.headers.entries())
            }
          }, { status: 400 });
        }

        // Check if response is JSON
        const contentType = s3Response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await s3Response.text();
          console.error('❌ S3 API returned non-JSON:', responseText.substring(0, 200));
          
          return NextResponse.json({
            message: 'S3 API returned non-JSON response',
            details: responseText.substring(0, 200),
            debug: {
              contentType,
              url: s3ApiUrl
            }
          }, { status: 400 });
        }

        const s3Data = await s3Response.json();
        console.log('✅ S3 Response Data:', s3Data);
        
        let presignedUrl;
        
        if (typeof s3Data === 'string') {
          presignedUrl = s3Data;
          profileImageUrl = presignedUrl.split('?')[0];
        } else if (s3Data.presignedUrl) {
          presignedUrl = s3Data.presignedUrl;
          profileImageUrl = s3Data.fileUrl || presignedUrl.split('?')[0];
        } else {
          return NextResponse.json({
            message: 'Invalid upload URL response',
            debug: { s3Data }
          }, { status: 400 });
        }

        console.log('📤 Uploading to S3 URL:', presignedUrl.substring(0, 100) + '...');

        // Convert base64 to blob and upload to S3
        const fileBuffer = Buffer.from(body.fileData.split(',')[1], 'base64');
        
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': body.fileType,
          },
          body: fileBuffer,
        });

        console.log('📤 S3 Upload Status:', uploadResponse.status);

        if (!uploadResponse.ok) {
          return NextResponse.json({
            message: 'Failed to upload profile image',
            debug: { uploadStatus: uploadResponse.status }
          }, { status: 400 });
        }
        
        console.log('✅ S3 Upload Success! Image URL:', profileImageUrl);
        
      } catch (s3Error) {
        console.error('💥 S3 Error:', s3Error);
        return NextResponse.json({
          message: 'Profile image upload failed',
          error: s3Error instanceof Error ? s3Error.message : 'Unknown error',
          debug: { 
            step: 'S3 upload process',
            errorType: typeof s3Error
          }
        }, { status: 400 });
      }
    }

    // Prepare user data for backend (exclude file-related fields)
    const { fileData, fileName, fileType, confirmPassword, ...userData } = body;
    userData.profileImageUrl = profileImageUrl;

    console.log('👤 Creating user account...');

    // Create user account
    const signupApiUrl = getApiUrl(API_ENDPOINTS.USERS.SIGNUP);
    console.log('Signup API URL:', signupApiUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const backendResponse = await fetch(signupApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('👤 Signup Response Status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json({
        message: `Registration failed: ${backendResponse.status}`,
        details: errorText
      }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    console.log('Signup Success!');
    return NextResponse.json(data, { status: backendResponse.status });

  } catch (error) {
    console.error('Signup Route Error:', error);
    
    if (typeof error === 'object' && error !== null && 'name' in error && (error as { name?: unknown }).name === 'AbortError') {
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
