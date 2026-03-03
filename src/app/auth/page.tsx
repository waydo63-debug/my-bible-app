'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
    Mail, Lock, Eye, EyeOff, LogIn, UserPlus,
    ArrowLeft, Loader2,
} from 'lucide-react';

// ── Google 아이콘 (인라인 SVG) ──
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );
}

type AuthTab = 'login' | 'signup' | 'reset';

export default function AuthPage() {
    const router = useRouter();
    const { user, initialize, signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } =
        useAuthStore();

    const [tab, setTab] = useState<AuthTab>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // 인증 초기화
    useEffect(() => {
        initialize();
    }, [initialize]);

    // 로그인 상태면 홈으로 리다이렉트
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    // ── 이메일/비밀번호 제출 ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (tab === 'reset') {
            const { error } = await resetPassword(email);
            if (error) {
                setMessage({ type: 'error', text: error });
            } else {
                setMessage({ type: 'success', text: '비밀번호 재설정 링크를 이메일로 보냈습니다.' });
            }
            setLoading(false);
            return;
        }

        const action = tab === 'login' ? signInWithEmail : signUpWithEmail;
        const { error } = await action(email, password);

        if (error) {
            setMessage({ type: 'error', text: error });
        } else if (tab === 'signup') {
            setMessage({
                type: 'success',
                text: '인증 이메일을 보냈습니다. 이메일을 확인해 주세요.',
            });
        }
        setLoading(false);
    };

    // ── Google 로그인 ──
    const handleGoogle = async () => {
        setLoading(true);
        setMessage(null);
        const { error } = await signInWithGoogle();
        if (error) {
            setMessage({ type: 'error', text: error });
            setLoading(false);
        }
    };

    const tabLabel = tab === 'login' ? '로그인' : tab === 'signup' ? '회원가입' : '비밀번호 찾기';

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 pb-20 md:pb-0">
            <div className="w-full max-w-sm">
                {/* ─── 제목 ─── */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-extrabold text-gray-900 dark:text-white">
                        {tabLabel}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {tab === 'login' && '계정에 로그인하고 성경 읽기를 계속하세요.'}
                        {tab === 'signup' && '계정을 만들고 읽기 플랜을 시작하세요.'}
                        {tab === 'reset' && '가입한 이메일 주소를 입력해 주세요.'}
                    </p>
                </div>

                {/* ─── 알림 메시지 ─── */}
                {message && (
                    <div
                        className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${message.type === 'error'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* ─── 폼 ─── */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 이메일 */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            이메일
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm
                                    outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                                    dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-900"
                            />
                        </div>
                    </div>

                    {/* 비밀번호 (reset 모드에서는 숨김) */}
                    {tab !== 'reset' && (
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                비밀번호
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm
                                        outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                                        dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 비밀번호 찾기 링크 (로그인 모드에서만) */}
                    {tab === 'login' && (
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => {
                                    setTab('reset');
                                    setMessage(null);
                                }}
                                className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                                비밀번호를 잊으셨나요?
                            </button>
                        </div>
                    )}

                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold
                            text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700
                            disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : tab === 'login' ? (
                            <LogIn className="h-4 w-4" />
                        ) : tab === 'signup' ? (
                            <UserPlus className="h-4 w-4" />
                        ) : (
                            <Mail className="h-4 w-4" />
                        )}
                        {tab === 'reset' ? '재설정 링크 보내기' : tabLabel}
                    </button>
                </form>

                {/* ─── 구분선 ─── */}
                {tab !== 'reset' && (
                    <>
                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">또는</span>
                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                        </div>

                        {/* Google 로그인 */}
                        <button
                            onClick={handleGoogle}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200
                                bg-white py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50
                                disabled:cursor-not-allowed disabled:opacity-60
                                dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            <GoogleIcon className="h-5 w-5" />
                            Google로 계속하기
                        </button>
                    </>
                )}

                {/* ─── 탭 전환 ─── */}
                <div className="mt-6 space-y-2 text-center text-sm text-gray-500 dark:text-gray-400">
                    {tab === 'reset' ? (
                        <button
                            onClick={() => {
                                setTab('login');
                                setMessage(null);
                            }}
                            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            로그인으로 돌아가기
                        </button>
                    ) : (
                        <p>
                            {tab === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
                            <button
                                onClick={() => {
                                    setTab(tab === 'login' ? 'signup' : 'login');
                                    setMessage(null);
                                }}
                                className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                                {tab === 'login' ? '회원가입' : '로그인'}
                            </button>
                        </p>
                    )}
                </div>

                {/* ─── 비로그인 안내 ─── */}
                <p className="mt-8 text-center text-xs leading-relaxed text-gray-400 dark:text-gray-600">
                    로그인 없이도 사용할 수 있습니다.<br />
                    데이터는 기기에 저장되며, 로그인 시 동기화됩니다.
                </p>
            </div>
        </div>
    );
}
