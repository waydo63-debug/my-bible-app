'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useBibleStore } from '@/store/useBibleStore';
import { usePlanStore } from '@/store/usePlanStore';
import { useRouter } from 'next/navigation';
import { getPlanById } from '@/utils/plansRegistry';
import { expandReadings } from '@/utils/planUtils';
import {
    ChevronLeft,
    ChevronRight,
    Copy,
    Share2,
    Bookmark,
    X,
    AArrowUp,
    AArrowDown,
    CheckCircle2,
} from 'lucide-react';

/**
 * Bible.com 스타일 성경 본문 읽기 컴포넌트
 *
 * - Noto Serif KR 세리프 폰트
 * - 절 탭 → 하이라이트 + 액션 메뉴
 * - 스와이프로 장 이동 (모바일)
 * - A+/A- 글꼴 크기 조절 (localStorage 저장)
 * - 이전/다음 장 네비게이션
 */
export default function BibleReader({
    planId,
    planDay,
}: {
    planId?: string;
    planDay?: number;
}) {
    const {
        verses,
        currentBook,
        currentChapter,
        currentVersion,
        fontSize,
        isLoading,
        selectedVerses,
        nextChapter,
        prevChapter,
        toggleVerseSelection,
        clearVerseSelection,
        increaseFontSize,
        decreaseFontSize,
        setFontSize,
    } = useBibleStore();

    const router = useRouter();
    const contentRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const [showFontControls, setShowFontControls] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // localStorage에서 fontSize 복원 (hydration 후)
    useEffect(() => {
        try {
            const stored = localStorage.getItem('bible-font-size');
            if (stored) setFontSize(parseInt(stored, 10));
        } catch { }
    }, [setFontSize]);

    // 장 변경 시 스크롤 맨 위로
    useEffect(() => {
        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentChapter, currentBook]);

    // ── 스와이프 핸들러 ──
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.changedTouches[0].screenX;
    }, []);

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            touchEndX.current = e.changedTouches[0].screenX;
            const diff = touchStartX.current - touchEndX.current;
            const threshold = 80;

            if (diff > threshold) {
                // 왼쪽 스와이프 → 다음 장
                nextChapter();
            } else if (diff < -threshold) {
                // 오른쪽 스와이프 → 이전 장
                prevChapter();
            }
        },
        [nextChapter, prevChapter]
    );

    // ── 절 복사 ──
    const handleCopy = useCallback(() => {
        if (!currentBook || selectedVerses.length === 0) return;
        const selected = verses
            .filter((v) => selectedVerses.includes(v.verse))
            .sort((a, b) => a.verse - b.verse);

        const text = selected.map((v) => `${v.verse} ${v.text}`).join('\n');
        const ref = `${currentBook.name} ${currentChapter}:${selected.map((v) => v.verse).join(',')}`;
        const full = `${text}\n— ${ref}`;

        navigator.clipboard.writeText(full).then(() => {
            setToastMessage('복사되었습니다');
            setTimeout(() => setToastMessage(''), 2000);
        });
        clearVerseSelection();
    }, [currentBook, currentChapter, selectedVerses, verses, clearVerseSelection]);

    // ── 공유 ──
    const handleShare = useCallback(() => {
        if (!currentBook || selectedVerses.length === 0) return;
        const selected = verses
            .filter((v) => selectedVerses.includes(v.verse))
            .sort((a, b) => a.verse - b.verse);

        const text = selected.map((v) => `${v.verse} ${v.text}`).join('\n');
        const ref = `${currentBook.name} ${currentChapter}:${selected.map((v) => v.verse).join(',')}`;

        if (navigator.share) {
            navigator.share({ title: ref, text: `${text}\n— ${ref}` });
        } else {
            handleCopy();
        }
        clearVerseSelection();
    }, [currentBook, currentChapter, selectedVerses, verses, clearVerseSelection, handleCopy]);

    // ── 플랜 모드: 마지막 장 확인 ──
    const planContext = useMemo(() => {
        if (!planId || planDay === undefined) return null;

        const plan = getPlanById(planId);
        if (!plan) return null;

        const dayData = plan.days.find((d) => d.day === planDay);
        if (!dayData) return null;

        const chapters = expandReadings(dayData);
        const lastChapter = chapters[chapters.length - 1];

        return {
            plan,
            dayData,
            chapters,
            lastChapterBookId: lastChapter?.bookId,
            lastChapterNum: lastChapter?.chapter,
            totalChapters: chapters.length,
        };
    }, [planId, planDay]);

    // 현재 장이 플랜 내 마지막 장인지 확인
    const isLastChapterInPlan = useMemo(() => {
        if (!planContext || !currentBook) return false;
        return (
            currentBook.id === planContext.lastChapterBookId &&
            currentChapter === planContext.lastChapterNum
        );
    }, [planContext, currentBook, currentChapter]);

    const toggleChapter = usePlanStore((s) => s.toggleChapter);

    // ── 이전/다음 장 라우팅 ──
    const goToPrevChapter = useCallback(() => {
        if (!currentBook || currentChapter <= 1) return;
        prevChapter();
        const queryStr = planId && planDay !== undefined
            ? `?planId=${planId}&day=${planDay}`
            : '';
        router.push(`/bible/${currentVersion}/${currentBook.id}/${currentChapter - 1}${queryStr}`);
    }, [currentBook, currentChapter, currentVersion, prevChapter, router, planId, planDay]);

    const goToNextChapter = useCallback(() => {
        if (!currentBook) return;

        // 플랜 모드 + 마지막 장 → Day 완료 처리 후 플랜 페이지로 복귀
        if (planId && planDay !== undefined && isLastChapterInPlan && planContext) {
            // 모든 챕터를 완료 처리
            const chapters = planContext.chapters;
            for (const ch of chapters) {
                const completed = usePlanStore.getState().getCompletedChapters(planId, planDay);
                if (!completed.includes(ch.chapterKey)) {
                    toggleChapter(planId, planDay, ch.chapterKey, planContext.totalChapters);
                }
            }

            // Toast + 플랜 상세 페이지로 이동
            setToastMessage(`Day ${planDay} 완료! 수고하셨습니다 🎉`);
            setTimeout(() => {
                setToastMessage('');
                router.push(`/plans/${planId}`);
            }, 1200);
            return;
        }

        // 일반 모드 또는 플랜 내 다음 장
        if (currentChapter >= currentBook.chapters) return;
        nextChapter();
        const queryStr = planId && planDay !== undefined
            ? `?planId=${planId}&day=${planDay}`
            : '';
        router.push(`/bible/${currentVersion}/${currentBook.id}/${currentChapter + 1}${queryStr}`);
    }, [currentBook, currentChapter, currentVersion, nextChapter, router, planId, planDay, isLastChapterInPlan, planContext, toggleChapter]);

    // ── 로딩 ──
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-[#4361ee]" />
                    <p className="text-sm text-gray-400">말씀을 불러오는 중...</p>
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
    // 플랜 모드: 마지막 장이라도 '읽기 완료' 버튼 표시
    const hasNext = isLastChapterInPlan || currentChapter < currentBook.chapters;

    return (
        <>
            {/* ── 본문 영역 ── */}
            <div
                ref={contentRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative mx-auto max-w-2xl px-5 pb-32 pt-6 sm:px-8"
            >
                {/* 장 제목 */}
                <div className="mb-8 text-center">
                    <h2 className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                        {currentBook.name}
                    </h2>
                    <p className="mt-1 text-4xl font-bold text-gray-800 dark:text-gray-100">
                        {currentChapter}
                    </p>
                </div>

                {/* 절 목록 */}
                <div className="space-y-1">
                    {verses.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-gray-400">
                                구절 데이터를 불러올 수 없습니다.
                            </p>
                            <p className="mt-2 text-xs text-gray-300 dark:text-gray-600">
                                경로: /bible-data/{currentVersion}/{currentBook.abbreviation?.toUpperCase()}.json
                            </p>
                        </div>
                    ) : (
                        verses.map((verse) => {
                            const isSelected = selectedVerses.includes(verse.verse);
                            return (
                                <p
                                    key={verse.id}
                                    onClick={() => toggleVerseSelection(verse.verse)}
                                    className={`cursor-pointer rounded-lg px-2 py-1.5 transition-colors duration-150 ${isSelected
                                        ? 'bg-[#4361ee]/10 dark:bg-[#4361ee]/20'
                                        : 'hover:bg-gray-100/60 dark:hover:bg-gray-800/40'
                                        }`}
                                    style={{
                                        fontSize: `${fontSize}px`,
                                        lineHeight: '1.8',
                                        fontFamily: 'var(--font-noto-serif-kr), serif',
                                    }}
                                >
                                    <sup
                                        className={`mr-1.5 text-xs font-bold ${isSelected
                                            ? 'text-[#4361ee]'
                                            : 'text-gray-400 dark:text-gray-500'
                                            }`}
                                        style={{ fontSize: '0.7em' }}
                                    >
                                        {verse.verse}
                                    </sup>
                                    <span
                                        className={
                                            isSelected
                                                ? 'text-gray-900 dark:text-gray-50'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }
                                    >
                                        {verse.text}
                                    </span>
                                </p>
                            );
                        })
                    )}
                </div>

                {/* ── 이전/다음 장 네비게이션 ── */}
                <div className="mt-12 flex items-stretch gap-3">
                    {hasPrev ? (
                        <button
                            onClick={goToPrevChapter}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200
                         bg-white py-4 text-sm font-semibold text-gray-600 transition-all
                         hover:border-[#4361ee]/30 hover:text-[#4361ee]
                         dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-[#4361ee]/40 dark:hover:text-[#4361ee]"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {currentChapter - 1}장
                        </button>
                    ) : (
                        <div className="flex-1" />
                    )}

                    <div className="flex items-center text-xs font-medium text-gray-400 dark:text-gray-500">
                        {currentChapter} / {currentBook.chapters}
                    </div>

                    {hasNext ? (
                        <button
                            onClick={goToNextChapter}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-semibold transition-all ${isLastChapterInPlan
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-[#4361ee]/30 hover:text-[#4361ee] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-[#4361ee]/40 dark:hover:text-[#4361ee]'
                                }`}
                        >
                            {isLastChapterInPlan ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    읽기 완료
                                </>
                            ) : (
                                <>
                                    {currentChapter + 1}장
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="flex-1" />
                    )}
                </div>
            </div>

            {/* ── 글꼴 크기 조절 (우측 하단 고정) ── */}
            <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 md:bottom-8">
                {showFontControls && (
                    <div
                        className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white px-2 py-1.5
                        shadow-lg dark:border-gray-700 dark:bg-gray-900"
                    >
                        <button
                            onClick={decreaseFontSize}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors
                         hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            aria-label="글꼴 작게"
                        >
                            <AArrowDown className="h-4 w-4" />
                        </button>
                        <span className="min-w-[2.5rem] text-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                            {fontSize}
                        </span>
                        <button
                            onClick={increaseFontSize}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors
                         hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            aria-label="글꼴 크게"
                        >
                            <AArrowUp className="h-4 w-4" />
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setShowFontControls(!showFontControls)}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200
                     bg-white text-gray-500 shadow-lg transition-all hover:bg-gray-50 hover:text-[#4361ee]
                     dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-[#4361ee]"
                    aria-label="글꼴 크기 조절"
                >
                    <span className="text-sm font-bold">Aa</span>
                </button>
            </div>

            {/* ── 절 선택 시 하단 액션 바 ── */}
            {selectedVerses.length > 0 && (
                <div
                    className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95
                      px-4 py-3 backdrop-blur-md md:bottom-0
                      dark:border-gray-800 dark:bg-gray-950/95"
                >
                    <div className="mx-auto flex max-w-2xl items-center justify-between">
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {currentBook.name} {currentChapter}:
                                {selectedVerses.sort((a, b) => a - b).join(',')}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium
                           text-gray-600 transition-colors hover:bg-gray-100
                           dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Copy className="h-4 w-4" />
                                복사
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium
                           text-gray-600 transition-colors hover:bg-gray-100
                           dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Share2 className="h-4 w-4" />
                                공유
                            </button>
                            <button
                                onClick={() => {
                                    setToastMessage('북마크에 추가되었습니다');
                                    setTimeout(() => setToastMessage(''), 2000);
                                    clearVerseSelection();
                                }}
                                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium
                           text-gray-600 transition-colors hover:bg-gray-100
                           dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Bookmark className="h-4 w-4" />
                            </button>
                            <button
                                onClick={clearVerseSelection}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400
                           transition-colors hover:bg-gray-100 hover:text-gray-600
                           dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 토스트 메시지 ── */}
            {toastMessage && (
                <div className="fixed bottom-20 left-1/2 z-[200] -translate-x-1/2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-gray-100 dark:text-gray-900">
                    {toastMessage}
                </div>
            )}
        </>
    );
}
