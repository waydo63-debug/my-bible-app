'use client';

import { useState } from 'react';
import { useBibleStore } from '@/store/useBibleStore';
import { BOOK_INFO } from '@/lib/bible-data';
import type { BibleBook } from '@/types/bible';

/**
 * 책 선택 패널 (Bible.com 스타일)
 * 구약/신약 탭 + 그리드
 */
export default function BookSelector() {
    const { currentBook, setBook, setNavigatorStep } = useBibleStore();
    const [activeTab, setActiveTab] = useState<'old' | 'new'>('old');

    const books = BOOK_INFO.filter((b) => b.testament === activeTab);

    const handleSelect = (info: typeof BOOK_INFO[number]) => {
        const book: BibleBook = {
            id: info.id,
            name: info.name,
            abbreviation: info.abbr,
            testament: info.testament,
            chapters: info.chapters,
        };
        setBook(book);
        // 책 선택 후 → 장 선택 단계로 이동
        setNavigatorStep('chapter');
    };

    return (
        <div className="flex h-full flex-col">
            {/* 구약 / 신약 탭 */}
            <div className="mx-4 mb-4 flex rounded-xl bg-white/[0.06] p-1">
                <button
                    onClick={() => setActiveTab('old')}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === 'old'
                            ? 'bg-[#4361ee] text-white shadow-md shadow-[#4361ee]/30'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                >
                    구약 <span className="ml-1 text-xs opacity-70">39권</span>
                </button>
                <button
                    onClick={() => setActiveTab('new')}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === 'new'
                            ? 'bg-[#4361ee] text-white shadow-md shadow-[#4361ee]/30'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                >
                    신약 <span className="ml-1 text-xs opacity-70">27권</span>
                </button>
            </div>

            {/* 책 그리드 */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {books.map((info) => {
                        const isActive = currentBook?.id === info.id;
                        return (
                            <button
                                key={info.id}
                                onClick={() => handleSelect(info)}
                                className={`relative rounded-xl px-2 py-3 text-center transition-all duration-200 ${isActive
                                        ? 'bg-[#4361ee] text-white shadow-lg shadow-[#4361ee]/25'
                                        : 'bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] hover:text-white'
                                    }`}
                            >
                                <span className="block text-sm font-medium leading-tight">
                                    {info.name}
                                </span>
                                <span
                                    className={`mt-1 block text-[10px] ${isActive ? 'text-white/60' : 'text-gray-500'
                                        }`}
                                >
                                    {info.chapters}장
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
