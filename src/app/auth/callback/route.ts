import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Google OAuth 콜백 처리
// Supabase가 인증 완료 후 이 URL로 리다이렉트합니다.
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        await supabase.auth.exchangeCodeForSession(code);
    }

    // 인증 완료 후 홈으로 리다이렉트
    return NextResponse.redirect(`${origin}/`);
}
