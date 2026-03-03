'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBibleStore } from '@/store/useBibleStore';
import { getChapter, BIBLE_VERSIONS, BOOK_INFO } from '@/lib/bible-data';
import { ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VerseData {
    verse: number;
    text: string;
}

/**
 * 번역본 비교 읽기 컴포넌트
 * - 데스크탑: 좌우 2단 분할
 * - 모바일: 절마다 두 번역본 번갈아 표시
 */
export default function CompareReader() {
    const {
        currentBook,
        currentChapter,
        currentVersion,
        compareVersion,
        fontSize,
        isLoading,
        setCompareVersion,
        toggleCompareMode,
        nextChapter,
        prevChapter,
    } = useBibleStore();

    const router = useRouter();
    const [primaryVerses, setPrimaryVerses] = useState<VerseData[]>([]);
    const [secondaryVerses, setSecondaryVerses] = useState<VerseData[]>([]);
    const [isLoadingCompare, setIsLoadingCompare] = useState(false);
    const [showVersionPicker, setShowVersionPicker] = useState(false);

    // 책 약어 가져오기
    const bookAbbr = currentBook
        ? BOOK_INFO.find((b) => b.id === currentBook.id)?.abbr ?? ''
        : '';

    // 두 번역본 데이터 로드
    useEffect(() => {
        if (!bookAbbr || !currentChapter) return;

        const load = async () => {
            setIsLoadingCompare(true);
            const [primary, secondary] = await Promise.all([
                getChapter(currentVersion, bookAbbr, currentChapter),
                getChapter(compareVersion, bookAbbr, currentChapter),
            ]);
            setPrimaryVerses(primary);
            setSecondaryVerses(secondary);
            setIsLoadingCompare(false);
        };

        load();
    }, [currentVersion, compareVersion, bookAbbr, currentChapter]);

    const primaryLabel =
        BIBLE_VERSIONS.find((v) => v.id === currentVersion)?.abbreviation ?? currentVersion.toUpperCase();
    const secondaryLabel =
        BIBLE_VERSIONS.find((v) => v.id === compareVersion)?.abbreviation ?? compareVersion.toUpperCase();

    // 이전/다음 장
    const goToPrevChapter = useCallback(() => {
        if (!currentBook || currentChapter <= 1) return;
        prevChapter();
        router.push(`/bible/${currentVersion}/${currentBook.id}/${currentChapter - 1}`);
    }, [currentBook, currentChapter, currentVersion, prevChapter, router]);

    const goToNextChapter = useCallback(() => {
        if (!currentBook || currentChapter >= currentBook.chapters) return;
        nextChapter();
        router.push(`/bible/${currentVersion}/${currentBook.id}/${currentChapter + 1}`);
    }, [currentBook, currentChapter, currentVersion, nextChapter, router]);

    // 절 개수 맞추기 (둘 중 긴 쪽에 맞춤)
    const maxVerses = Math.max(primaryVerses.length, secondaryVerses.length);

    if (isLoading || isLoadingCompare) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-[#4361ee]" />
                    <p className="text-sm text-gray-400">번역본을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (!currentBook) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                <p className="text-lg font-medium">책과 장을 선택해 주세요</p>
            </div>
        );
    }

    const hasPrev = currentChapter > 1;
    const hasNext = currentChapter < currentBook.chapters;

    return (
        <>
            {/* ── 비교 모드 바 ── */}
            <div className="sticky top-12 z-30 border-b border-gray-100 bg-gray-50/90 backdrop-blur-md dark:border-gray-800/60 dark:bg-gray-900/90">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                        {/* 메인 역본 */}
                        <span className="rounded-lg bg-[#4361ee] px-2.5 py-1 text-xs font-bold text-white">
                            {primaryLabel}
                        </span>
                        <span className="text-xs text-gray-400">vs</span>
                        {/* 비교 역본 선택 */}
                        <div className="relative">
                            <button
                                onClick={() => setShowVersionPicker(!showVersionPicker)}
                                className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#4361ee]
                           border border-[#4361ee]/20 hover:bg-[#4361ee]/5 transition-colors
                           dark:bg-gray-800 dark:border-[#4361ee]/30"
                            >
                                {secondaryLabel}
                                <ChevronDown className="h-3 w-3" />
                            </button>
                            {showVersionPicker && (
                                <div className="absolute left-0 top-full mt-1 z-50 rounded-xl border border-gray-200 bg-white py-1 shadow-xl
                                dark:border-gray-700 dark:bg-gray-900">
                                    {BIBLE_VERSIONS.filter((v) => v.id !== currentVersion).map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => {
                                                setCompareVersion(v.id);
                                                setShowVersionPicker(false);
                                            }}
                                            className={`flex w-full items-center gap-2 px-4 py-2 text-xs font-medium transition-colors
                        ${compareVersion === v.id
                                                    ? 'bg-[#4361ee]/10 text-[#4361ee]'
                                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {v.name} ({v.abbreviation})
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* 비교 모드 종료 */}
                    <button
                        onClick={toggleCompareMode}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-500
                       hover:bg-gray-200 transition-colors dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                        <X className="h-3.5 w-3.5" />
                        닫기
                    </button>
                </div>
            </div>

            {/* ── 장 제목 ── */}
            <div className="mx-auto max-w-5xl px-5 pt-6 pb-4 text-center">
                <h2 className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                    {currentBook.name}
                </h2>
                <p className="mt-1 text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {currentChapter}
                </p>
            </div>

            {/* ── 데스크탑: 좌우 분할 ── */}
            <div className="mx-auto hidden max-w-5xl gap-6 px-5 pb-32 md:grid md:grid-cols-2">
                {/* 좌측: 메인 역본 */}
                <div>
                    <div className="mb-4 text-center">
                        <span className="rounded-full bg-[#4361ee]/10 px-3 py-1 text-xs font-bold text-[#4361ee]">
                            {primaryLabel}
                        </span>
                    </div>
                    <div className="space-y-1">
                        {primaryVerses.map((v) => (
                            <p
                                key={v.verse}
                                className="rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300"
                                style={{ fontSize: `${fontSize}px`, lineHeight: '1.8', fontFamily: 'var(--font-noto-serif-kr), serif' }}
                            >
                                <sup className="mr-1.5 text-xs font-bold text-gray-400 dark:text-gray-500" style={{ fontSize: '0.7em' }}>
                                    {v.verse}
                                </sup>
                                {v.text}
                            </p>
                        ))}
                    </div>
                </div>

                {/* 우측: 비교 역본 */}
                <div>
                    <div className="mb-4 text-center">
                        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                            {secondaryLabel}
                        </span>
                    </div>
                    <div className="space-y-1">
                        {secondaryVerses.map((v) => (
                            <p
                                key={v.verse}
                                className="rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300"
                                style={{ fontSize: `${fontSize}px`, lineHeight: '1.8', fontFamily: 'var(--font-noto-serif-kr), serif' }}
                            >
                                <sup className="mr-1.5 text-xs font-bold text-gray-400 dark:text-gray-500" style={{ fontSize: '0.7em' }}>
                                    {v.verse}
                                </sup>
                                {v.text}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── 모바일: 절마다 번갈아 표시 ── */}
            <div className="mx-auto max-w-2xl space-y-3 px-5 pb-32 md:hidden">
                {Array.from({ length: maxVerses }, (_, i) => i).map((i) => {
                    const pv = primaryVerses[i];
                    const sv = secondaryVerses[i];
                    const verseNum = (pv?.verse ?? sv?.verse ?? i + 1);

                    return (
                        <div key={verseNum} className="rounded-2xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                            {/* 절 번호 */}
                            <div className="mb-2 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                    {verseNum}
                                </span>
                            </div>

                            {/* 메인 역본 */}
                            {pv && (
                                <div className="mb-2">
                                    <span className="mb-1 inline-block rounded bg-[#4361ee]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#4361ee]">
                                        {primaryLabel}
                                    </span>
                                    <p
                                        className="text-gray-700 dark:text-gray-300"
                                        style={{ fontSize: `${fontSize - 1}px`, lineHeight: '1.7', fontFamily: 'var(--font-noto-serif-kr), serif' }}
                                    >
                                        {pv.text}
                                    </p>
                                </div>
                            )}

                            {/* 비교 역본 */}
                            {sv && (
                                <div className="border-t border-gray-100 pt-2 dark:border-gray-800">
                                    <span className="mb-1 inline-block rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                                        {secondaryLabel}
                                    </span>
                                    <p
                                        className="text-gray-600 dark:text-gray-400"
                                        style={{ fontSize: `${fontSize - 1}px`, lineHeight: '1.7', fontFamily: 'var(--font-noto-serif-kr), serif' }}
                                    >
                                        {sv.text}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── 이전/다음 장 ── */}
            <div className="mx-auto max-w-5xl px-5 pb-32">
                <div className="flex items-stretch gap-3">
                    {hasPrev ? (
                        <button onClick={goToPrevChapter}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 text-sm font-semibold text-gray-600 transition-all hover:border-[#4361ee]/30 hover:text-[#4361ee] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                            <ChevronLeft className="h-4 w-4" />{currentChapter - 1}장
                        </button>
                    ) : <div className="flex-1" />}
                    <div className="flex items-center text-xs font-medium text-gray-400">{currentChapter} / {currentBook.chapters}</div>
                    {hasNext ? (
                        <button onClick={goToNextChapter}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 text-sm font-semibold text-gray-600 transition-all hover:border-[#4361ee]/30 hover:text-[#4361ee] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                            {currentChapter + 1}장<ChevronRight className="h-4 w-4" />
                        </button>
                    ) : <div className="flex-1" />}
                </div>
            </div>
        </>
    );
}
