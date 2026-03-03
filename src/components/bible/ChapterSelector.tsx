'use client';

import { useBibleStore } from '@/store/useBibleStore';
import { useRouter } from 'next/navigation';

/**
 * 장 선택 패널 (Bible.com 스타일)
 * 숫자 그리드 → 선택 시 해당 장으로 이동
 */
export default function ChapterSelector() {
    const { currentBook, currentVersion, currentChapter, setChapter, closeNavigator } =
        useBibleStore();
    const router = useRouter();

    if (!currentBook) return null;

    const total = currentBook.chapters;
    const chapters = Array.from({ length: total }, (_, i) => i + 1);

    const handleSelect = (ch: number) => {
        setChapter(ch);
        closeNavigator();
        // 해당 장 페이지로 이동
        router.push(`/bible/${currentVersion}/${currentBook.id}/${ch}`);
    };

    return (
        <div className="flex h-full flex-col">
            {/* 현재 선택된 책 */}
            <div className="px-5 pb-4 pt-1">
                <p className="text-sm text-gray-400">
                    <span className="font-semibold text-white">{currentBook.name}</span>
                    <span className="ml-1.5 text-gray-500">· {total}장</span>
                </p>
            </div>

            {/* 숫자 그리드 */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
                    {chapters.map((ch) => {
                        const isActive = currentChapter === ch;
                        return (
                            <button
                                key={ch}
                                onClick={() => handleSelect(ch)}
                                className={`flex aspect-square items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                        ? 'bg-[#4361ee] text-white shadow-lg shadow-[#4361ee]/30 scale-105'
                                        : 'bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] hover:text-white hover:scale-105'
                                    }`}
                            >
                                {ch}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
