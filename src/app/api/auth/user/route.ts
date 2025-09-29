import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Make request to backend to validate token and get user info
    const response = await fetch('http://3.37.124.162:8000/user-service/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ message: 'Token validation failed' }, { status: 401 });
    }

    const data = await response.json();
    
    // Transform the data to match your frontend user structure
    const user = {
      name: data.nickname || data.name || "User",
      email: data.email,
      avatar: data.profileImageUrl || "/default-avatar.png",
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error("User API route error:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
