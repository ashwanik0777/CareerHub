import { NextResponse, NextRequest } from 'next/server';
import { deleteSession } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    await deleteSession();
    // Redirect back to login page after cookie clearance (using 303 POST-Redirect-GET pattern)
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    if (loginUrl.hostname === '0.0.0.0') {
      loginUrl.hostname = 'localhost';
    }
    return NextResponse.redirect(loginUrl, 303);
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
