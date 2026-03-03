'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Search, Moon, Sun, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import BibleSearchModal from '@/components/bible/BibleSearchModal';

const NAV_LINKS = [
    { href: '/bible/krv/1/1', label: '성경읽기' },
    { href: '/plans', label: '플랜' },
];

export default function Header() {
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isDark, toggleTheme, initialize: initTheme } = useThemeStore();
    const { user, initialize: initAuth } = useAuthStore();

    useEffect(() => {
        initTheme();
        initAuth();
    }, [initTheme, initAuth]);

    // 성경 읽기 페이지에서는 자체 헤더를 사용하므로 숨김
    if (pathname.startsWith('/bible/')) return null;

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl dark:border-[--color-border] dark:bg-[--color-bg]/85">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                    {/* ── 왼쪽: 로고 ── */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-extrabold tracking-tight"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--color-accent] text-white">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        <span className="bg-gradient-to-r from-[--color-accent] to-indigo-500 bg-clip-text text-transparent dark:from-[--color-accent] dark:to-blue-400">
                            Way Bible
                        </span>
                    </Link>

                    {/* ── 가운데: 네비게이션 (데스크탑) ── */}
                    <nav className="hidden items-center gap-1 md:flex">
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname.startsWith(link.href.split('/').slice(0, 2).join('/'));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isActive
                                            ? 'bg-[--color-accent-light] text-[--color-accent]'
                                            : 'text-[--color-text-secondary] hover:bg-gray-100 hover:text-[--color-text-primary] dark:hover:bg-[--color-surface]'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ── 오른쪽: 액션 버튼들 ── */}
                    <div className="flex items-center gap-1">
                        {/* 검색 */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[--color-text-secondary]
                                transition-colors hover:bg-gray-100 hover:text-[--color-accent]
                                dark:hover:bg-[--color-surface]"
                            aria-label="검색"
                        >
                            <Search className="h-[18px] w-[18px]" />
                        </button>

                        {/* 다크 모드 토글 */}
                        <button
                            onClick={toggleTheme}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[--color-text-secondary]
                                transition-colors hover:bg-gray-100 hover:text-amber-500
                                dark:hover:bg-[--color-surface] dark:hover:text-amber-400"
                            aria-label="다크 모드 토글"
                        >
                            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                        </button>

                        {/* 로그인/프로필 (데스크탑) */}
                        <div className="hidden md:block">
                            {user ? (
                                <Link
                                    href="/auth"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[--color-accent] text-white transition-colors hover:bg-[--color-accent-hover]"
                                >
                                    <span className="text-sm font-bold">
                                        {user.email?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </Link>
                            ) : (
                                <Link
                                    href="/auth"
                                    className="ml-1 flex items-center gap-1.5 rounded-lg bg-[--color-accent] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[--color-accent-hover]"
                                >
                                    <User className="h-3.5 w-3.5" />
                                    로그인
                                </Link>
                            )}
                        </div>

                        {/* 모바일 메뉴 토글 */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[--color-text-secondary]
                                transition-colors hover:bg-gray-100 dark:hover:bg-[--color-surface] md:hidden"
                            aria-label="메뉴"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* ── 모바일 드롭다운 ── */}
                {isMobileMenuOpen && (
                    <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden dark:border-[--color-border] dark:bg-[--color-bg]">
                        <div className="flex flex-col gap-1">
                            {NAV_LINKS.map((link) => {
                                const isActive = pathname.startsWith(link.href.split('/').slice(0, 2).join('/'));
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActive
                                                ? 'bg-[--color-accent-light] text-[--color-accent]'
                                                : 'text-[--color-text-secondary] hover:bg-gray-50 dark:hover:bg-[--color-surface]'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </header>

            {/* 검색 모달 */}
            <BibleSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
