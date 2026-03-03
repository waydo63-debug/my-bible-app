'use client';

import { useBibleStore } from '@/store/useBibleStore';
import { BIBLE_VERSIONS } from '@/lib/bible-data';
import { Check, Globe } from 'lucide-react';

/**
 * 역본 선택 패널 (Bible.com 스타일)
 * 다크 테마 (#1a1a2e 배경)
 */
export default function VersionSelector() {
    const { currentVersion, setVersion, setNavigatorStep } = useBibleStore();

    const handleSelect = (versionId: string) => {
        setVersion(versionId);
        // 역본 선택 후 → 책 선택 단계로 이동
        setNavigatorStep('book');
    };

    return (
        <div className="flex h-full flex-col">
            {/* 안내 */}
            <div className="flex items-center gap-2 px-5 pb-4 pt-1">
                <Globe className="h-4 w-4 text-[#4361ee]" />
                <p className="text-sm font-medium text-gray-400">번역본을 선택하세요</p>
            </div>

            {/* 목록 */}
            <div className="flex-1 space-y-1.5 overflow-y-auto px-4 pb-6">
                {BIBLE_VERSIONS.map((v) => {
                    const isActive = currentVersion === v.id;
                    return (
                        <button
                            key={v.id}
                            onClick={() => handleSelect(v.id)}
                            className={`group flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-all duration-200 ${isActive
                                    ? 'bg-[#4361ee] shadow-lg shadow-[#4361ee]/25'
                                    : 'bg-white/[0.04] hover:bg-white/[0.08]'
                                }`}
                        >
                            <div>
                                <p className={`font-semibold ${isActive ? 'text-white' : 'text-gray-200'}`}>
                                    {v.name}
                                </p>
                                <p className={`mt-0.5 text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                                    {v.abbreviation} · {v.language === 'ko' ? '한국어' : '영어'}
                                </p>
                            </div>
                            {isActive && <Check className="h-5 w-5 text-white" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
