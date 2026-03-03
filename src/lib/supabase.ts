import { createClient } from '@supabase/supabase-js';

// ============================================================
// Supabase 클라이언트 설정
// .env.local 파일에 아래 환경변수를 설정하세요:
//   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
// ============================================================

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 유효한 URL(http/https)인지 확인, 아니면 placeholder 사용
const supabaseUrl = rawUrl.startsWith('http') ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = rawKey.length > 20 ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// 환경변수 미설정 시에도 빌드가 깨지지 않도록 안전한 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Supabase 환경변수가 실제로 설정되어 있는지 확인 */
export const isSupabaseConfigured =
    rawUrl.startsWith('http') &&
    !rawUrl.includes('placeholder') &&
    rawKey.length > 20;

