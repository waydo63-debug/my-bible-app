'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, CalendarDays, MoreHorizontal } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/', icon: Home, label: '홈' },
    { href: '/bible/krv/1/1', icon: BookOpen, label: '성경', matchPrefix: '/bible' },
    { href: '/plans', icon: CalendarDays, label: '플랜' },
    { href: '/auth', icon: MoreHorizontal, label: '더보기' },
];

export default function BottomNav() {
    const pathname = usePathname();

    // 성경 읽기 페이지에서는 숨김 (자체 네비게이션 사용)
    if (pathname.startsWith('/bible/')) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/80 bg-white/90 backdrop-blur-xl md:hidden dark:border-[--color-border] dark:bg-[--color-bg]/90">
            <div className="mx-auto flex max-w-lg items-center justify-around">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.matchPrefix
                        ? pathname.startsWith(item.matchPrefix)
                        : item.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 px-4 py-2.5 text-[10px] font-semibold transition-colors ${isActive
                                    ? 'text-[--color-accent]'
                                    : 'text-[--color-text-muted]'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* 하단 안전 영역 (iPhone 등) */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
    );
}
