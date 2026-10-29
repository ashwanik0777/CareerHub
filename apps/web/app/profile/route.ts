import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const profileUrl = request.nextUrl.clone();
  profileUrl.pathname = '/dashboard/profile';
  if (profileUrl.hostname === '0.0.0.0') {
    profileUrl.hostname = 'localhost';
  }
  return NextResponse.redirect(profileUrl);
}
