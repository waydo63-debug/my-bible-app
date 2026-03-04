'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowLeft, Loader2 } from 'lucide-react';
import { BOOK_INFO, BIBLE_VERSIONS, type SearchResult } from '@/lib/bible-data';

// ── 디바운스 훅 ──────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

// ── 키워드 하이라이트 ────────────────────────────────────────
function HighlightedText({ text, query }: { text: string; query: string }) {
    if (!query.trim()) return <>{text}</>;

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark
                        key={i}
                        className="rounded-sm bg-[#4361ee]/20 px-0.5 text-[#4361ee] dark:bg-[#4361ee]/30 dark:text-[#6d83f2]"
                    >
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
}

// ── 클라이언트 사이드 검색 함수 ──────────────────────────────
// bible-data.ts의 searchBible은 async (fetch 기반)이므로
// 여기서는 캐시된 데이터가 없을 수 있어 직접 fetch + 검색
async function clientSearch(
    version: string,
    query: string,
    maxResults = 50
): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const book of BOOK_INFO) {
        if (results.length >= maxResults) break;

        try {
            const res = await fetch(`/bible-data/${version}/${book.abbr.toUpperCase()}.json`);
            if (!res.ok) continue;
            const data = await res.json();

            for (const ch of data.chapters) {
                if (results.length >= maxResults) break;

                for (const v of ch.verses) {
                    if (results.length >= maxResults) break;

                    if (v.text.toLowerCase().includes(lowerQuery)) {
                        results.push({
                            version,
                            book: book.abbr,
                            bookName: book.name,
                            chapter: ch.chapter,
                            verse: v.verse,
                            text: v.text,
                        });
                    }
                }
            }
        } catch {
            continue;
        }
    }

    return results;
}

// ── 검색 모달 컴포넌트 ──────────────────────────────────────
interface BibleSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BibleSearchModal({ isOpen, onClose }: BibleSearchModalProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const [query, setQuery] = useState('');
    const [version, setVersion] = useState('krv');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const debouncedQuery = useDebounce(query, 300);

    // 모달 열릴 때 포커스
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // ESC 닫기
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // 디바운스된 검색 실행
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        let cancelled = false;

        const doSearch = async () => {
            setIsSearching(true);
            const res = await clientSearch(version, debouncedQuery, 50);
            if (!cancelled) {
                setResults(res);
                setIsSearching(false);
                setHasSearched(true);
            }
        };

        doSearch();
        return () => {
            cancelled = true;
        };
    }, [debouncedQuery, version]);

    // 결과 클릭 → 이동
    const handleResultClick = useCallback(
        (result: SearchResult) => {
            const bookInfo = BOOK_INFO.find((b) => b.abbr === result.book);
            if (!bookInfo) return;
            router.push(`/bible/${result.version}/${bookInfo.id}/${result.chapter}`);
            onClose();
            setQuery('');
            setResults([]);
            setHasSearched(false);
        },
        [router, onClose]
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-white dark:bg-gray-950">
            {/* ── 상단 검색 바 ── */}
            <div className="border-b border-gray-100 dark:border-gray-800/60">
                <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 py-2">
                    {/* 뒤로가기 */}
                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500
                       transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    {/* 검색 입력 */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="성경 검색..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm
                         outline-none transition-colors focus:border-[#4361ee] focus:bg-white focus:ring-2 focus:ring-[#4361ee]/10
                         dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:bg-gray-900"
                        />
                        {query && (
                            <button
                                onClick={() => {
                                    setQuery('');
                                    setResults([]);
                                    setHasSearched(false);
                                    inputRef.current?.focus();
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 번역본 선택 필터 */}
                <div className="mx-auto flex max-w-2xl gap-2 px-4 pb-2">
                    {BIBLE_VERSIONS.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => setVersion(v.id)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${version === v.id
                                ? 'bg-[#4361ee] text-white shadow-sm'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                        >
                            {v.abbreviation}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── 검색 결과 ── */}
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl px-4 py-4">
                    {/* 로딩 */}
                    {isSearching && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-[#4361ee]" />
                            <span className="ml-2 text-sm text-gray-400">검색 중...</span>
                        </div>
                    )}

                    {/* 초기 상태 */}
                    {!isSearching && !hasSearched && (
                        <div className="flex flex-col items-center py-20 text-center">
                            <Search className="mb-3 h-10 w-10 text-gray-200 dark:text-gray-700" />
                            <p className="text-sm text-gray-400">
                                성경 구절을 검색하세요
                            </p>
                            <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
                                예: &quot;사랑&quot;, &quot;여호와&quot;, &quot;빛&quot;
                            </p>
                        </div>
                    )}

                    {/* 결과 없음 */}
                    {!isSearching && hasSearched && results.length === 0 && (
                        <div className="flex flex-col items-center py-16 text-center">
                            <p className="text-sm text-gray-400">
                                &quot;<span className="font-medium text-gray-600 dark:text-gray-300">{debouncedQuery}</span>&quot;에 대한 검색 결과가 없습니다
                            </p>
                        </div>
                    )}

                    {/* 결과 목록 */}
                    {!isSearching && results.length > 0 && (
                        <>
                            <p className="mb-4 text-xs font-medium text-gray-400">
                                {results.length}개의 결과
                            </p>
                            <div className="space-y-1">
                                {results.map((result, idx) => (
                                    <button
                                        key={`${result.book}-${result.chapter}-${result.verse}-${idx}`}
                                        onClick={() => handleResultClick(result)}
                                        className="group flex w-full flex-col rounded-xl px-3 py-3 text-left transition-colors
                               hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        {/* 참조 */}
                                        <span className="mb-1 text-xs font-semibold text-[#4361ee] dark:text-[#6d83f2]">
                                            {result.bookName} {result.chapter}:{result.verse}
                                        </span>
                                        {/* 절 텍스트 */}
                                        <span
                                            className="text-sm leading-relaxed text-gray-600 dark:text-gray-400"
                                            style={{ fontFamily: 'var(--font-noto-serif-kr), serif' }}
                                        >
                                            <HighlightedText text={result.text} query={debouncedQuery} />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
