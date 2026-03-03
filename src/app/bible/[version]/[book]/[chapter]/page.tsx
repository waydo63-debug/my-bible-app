'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useBibleStore } from '@/store/useBibleStore';
import { getBookById, loadChapter, BIBLE_VERSIONS } from '@/lib/bible-data';
import BibleReader from '@/components/bible/BibleReader';
import CompareReader from '@/components/bible/CompareReader';
import BibleNavigator from '@/components/bible/BibleNavigator';
import BibleSearchModal from '@/components/bible/BibleSearchModal';
import { ChevronLeft, ChevronDown, Globe, Search, Columns2 } from 'lucide-react';

export default function BiblePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const router = useRouter();
    const {
        currentBook,
        currentChapter,
        currentVersion,
        isCompareMode,
        setVersion,
        setBook,
        setChapter,
        setVerses,
        setLoading,
        openNavigator,
        toggleCompareMode,
    } = useBibleStore();

    // ── 플랜 모드 쿼리 파라미터 ──
    const planId = searchParams.get('planId') || undefined;
    const planDay = searchParams.get('day') ? parseInt(searchParams.get('day')!, 10) : undefined;

    // URL 파라미터에서 초기값 설정
    useEffect(() => {
        const version = params.version as string;
        const bookId = parseInt(params.book as string, 10);
        const chapter = parseInt(params.chapter as string, 10);

        if (version) setVersion(version);
        const book = getBookById(bookId);
        if (book) setBook(book);
        if (chapter) setChapter(chapter);
    }, [params, setVersion, setBook, setChapter]);

    // 버전/책/장이 바뀔 때 데이터 로드
    useEffect(() => {
        if (!currentBook) return;

        const fetchVerses = async () => {
            setLoading(true);
            const data = await loadChapter(currentVersion, currentBook.id, currentChapter);
            setVerses(data);
            setLoading(false);
        };

        fetchVerses();
    }, [currentVersion, currentBook, currentChapter, setVerses, setLoading]);

    const versionLabel =
        BIBLE_VERSIONS.find((v) => v.id === currentVersion)?.abbreviation ??
        currentVersion.toUpperCase();

    // ── 뒤로가기: 플랜 모드면 플랜 페이지, 아니면 홈 ──
    const handleBack = () => {
        if (planId) {
            router.push(`/plans/${planId}`);
        } else {
            router.push('/');
        }
    };

    return (
        <div className={`min-h-screen bg-white dark:bg-gray-950 ${isCompareMode ? '' : ''}`}>
            {/* ── 자체 헤더 ── */}
            <header
                className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md
                     dark:border-gray-800/60 dark:bg-gray-950/90"
            >
                <div className={`mx-auto flex h-12 items-center justify-between px-3 ${isCompareMode ? 'max-w-5xl' : 'max-w-2xl'}`}>
                    {/* 왼쪽: 뒤로가기 */}
                    <button
                        onClick={handleBack}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500
                       transition-colors hover:bg-gray-100 hover:text-gray-700
                       dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        aria-label={planId ? '플랜으로 돌아가기' : '홈으로'}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* 가운데: 책/장 선택 */}
                    <button
                        onClick={() => openNavigator('book')}
                        className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold
                       text-gray-800 transition-colors hover:bg-gray-100
                       dark:text-gray-100 dark:hover:bg-gray-800"
                    >
                        {currentBook ? `${currentBook.name} ${currentChapter}장` : '책 선택'}
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </button>

                    {/* 오른쪽: 비교 + 검색 + 역본 */}
                    <div className="flex items-center gap-0.5">
                        {/* 비교 토글 */}
                        <button
                            onClick={toggleCompareMode}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors
                ${isCompareMode
                                    ? 'bg-[#4361ee]/10 text-[#4361ee]'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-[#4361ee] dark:text-gray-400 dark:hover:bg-gray-800'
                                }`}
                            aria-label="번역본 비교"
                            title="번역본 비교"
                        >
                            <Columns2 className="h-4 w-4" />
                        </button>
                        {/* 검색 */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500
                         transition-colors hover:bg-gray-100 hover:text-[#4361ee]
                         dark:text-gray-400 dark:hover:bg-gray-800"
                            aria-label="검색"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                        {/* 역본 */}
                        {!isCompareMode && (
                            <button
                                onClick={() => openNavigator('version')}
                                className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold
                           text-[#4361ee] transition-colors hover:bg-[#4361ee]/10
                           dark:text-[#6d83f2] dark:hover:bg-[#4361ee]/15"
                            >
                                <Globe className="h-3.5 w-3.5" />
                                {versionLabel}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ── 본문: 일반 vs 비교 ── */}
            {isCompareMode ? (
                <CompareReader />
            ) : (
                <BibleReader planId={planId} planDay={planDay} />
            )}

            {/* ── 네비게이터 모달 ── */}
            <BibleNavigator />

            {/* ── 검색 모달 ── */}
            <BibleSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
    );
}
