'use client';

import { BookOpen, CalendarDays, Search, FileText } from 'lucide-react';
import Link from 'next/link';

// ============================================================
// 빈 상태 (Empty State) 컴포넌트
// ============================================================

interface EmptyStateProps {
    icon?: 'book' | 'calendar' | 'search' | 'file';
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}

const ICONS = {
    book: BookOpen,
    calendar: CalendarDays,
    search: Search,
    file: FileText,
};

export default function EmptyState({
    icon = 'file',
    title,
    description,
    actionLabel,
    actionHref,
}: EmptyStateProps) {
    const Icon = ICONS[icon];

    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-page-enter">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[--color-accent-light]">
                <Icon className="h-7 w-7 text-[--color-accent]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[--color-text-primary]">{title}</h3>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-[--color-text-secondary]">
                {description}
            </p>
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="btn-ripple touch-target inline-flex items-center gap-2 rounded-xl bg-[--color-accent] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[--color-accent-hover]"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
