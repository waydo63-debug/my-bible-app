import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// ============================================================
// Supabase 인증 상태 관리 스토어
// ============================================================

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;

    // 액션
    initialize: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
    signInWithGoogle: () => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: string | null }>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,

    // 앱 시작 시 세션 복원 + 변경 감지
    initialize: async () => {
        // SSR / 빌드 환경에서는 실행하지 않음
        if (typeof window === 'undefined') {
            set({ isLoading: false });
            return;
        }

        try {
            const { data } = await supabase.auth.getSession();
            set({
                session: data.session,
                user: data.session?.user ?? null,
                isLoading: false,
            });

            // 인증 상태 변경 리스너
            supabase.auth.onAuthStateChange((_event, session) => {
                set({
                    session,
                    user: session?.user ?? null,
                    isLoading: false,
                });
            });
        } catch {
            set({ isLoading: false });
        }
    },

    // 이메일 로그인
    signInWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error?.message ?? null };
    },

    // 이메일 회원가입
    signUpWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) return { error: error.message };
        return { error: null };
    },

    // Google 소셜 로그인
    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        return { error: error?.message ?? null };
    },

    // 로그아웃
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },

    // 비밀번호 재설정 이메일 발송
    resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset`,
        });
        return { error: error?.message ?? null };
    },
}));
