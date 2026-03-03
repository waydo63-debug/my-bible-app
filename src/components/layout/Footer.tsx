'use client';

import { usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();

    // 성경 읽기 페이지에서는 숨김
    if (pathname.startsWith('/bible/')) return null;

    return (
        <footer className="hidden border-t border-gray-100 bg-[--color-bg-secondary] py-8 md:block dark:border-[--color-border]">
            <div className="mx-auto max-w-5xl px-4 text-center">
                <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-[--color-text-secondary]">
                    Made with <Heart className="h-3.5 w-3.5 text-red-400" /> Way Bible
                </p>
                <p className="mt-1.5 text-xs text-[--color-text-muted]">
                    © {new Date().getFullYear()} Way Bible. 언제 어디서나 말씀과 함께.
                </p>
            </div>
        </footer>
    );
}
