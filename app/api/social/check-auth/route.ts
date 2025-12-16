/**
 * 🔐 Check Auth Status API
 *
 * POST /api/social/check-auth
 *
 * Checks if user has existing OAuth authorization stored in session/cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform } = body;

    if (!platform || !['twitter', 'discord'].includes(platform)) {
      return NextResponse.json({ hasAuth: false });
    }

    // Check for stored tokens in cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(`${platform}_oauth_token`);

    if (tokenCookie?.value) {
      return NextResponse.json({ hasAuth: true });
    }

    return NextResponse.json({ hasAuth: false });
  } catch (error) {
    console.error('[Check Auth] Error:', error);
    return NextResponse.json({ hasAuth: false });
  }
}
