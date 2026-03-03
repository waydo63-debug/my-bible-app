import { create } from 'zustand';
import type { BibleBook, BibleVerse } from '@/types/bible';

// ============================================================
// Zustand 상태 관리 스토어
// ============================================================

/** 네비게이터 패널의 현재 단계 */
export type NavigatorStep = 'closed' | 'version' | 'book' | 'chapter';

interface BibleState {
    // ── 현재 선택 상태 ──
    currentVersion: string;
    currentBook: BibleBook | null;
    currentChapter: number;
    verses: BibleVerse[];

    // ── UI 상태 ──
    navigatorStep: NavigatorStep;
    isLoading: boolean;
    fontSize: number;
    selectedVerses: number[];

    // ── 비교 모드 ──
    isCompareMode: boolean;
    compareVersion: string;      // 두 번째 번역본 코드

    // ── 하위 호환 (기존 코드용) ──
    isBookSelectorOpen: boolean;
    isVersionSelectorOpen: boolean;

    // ── 액션 ──
    setVersion: (version: string) => void;
    setBook: (book: BibleBook) => void;
    setChapter: (chapter: number) => void;
    setVerses: (verses: BibleVerse[]) => void;
    setLoading: (loading: boolean) => void;
    setFontSize: (size: number) => void;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    nextChapter: () => void;
    prevChapter: () => void;

    // ── 절 선택 ──
    toggleVerseSelection: (verse: number) => void;
    clearVerseSelection: () => void;

    // ── 비교 모드 ──
    toggleCompareMode: () => void;
    setCompareVersion: (version: string) => void;

    // ── 네비게이터 액션 ──
    openNavigator: (step?: NavigatorStep) => void;
    closeNavigator: () => void;
    setNavigatorStep: (step: NavigatorStep) => void;

    // ── 하위 호환 ──
    toggleBookSelector: () => void;
    toggleVersionSelector: () => void;
}

// localStorage에서 fontSize 불러오기
function getStoredFontSize(): number {
    if (typeof window === 'undefined') return 18;
    try {
        const stored = localStorage.getItem('bible-font-size');
        if (stored) return parseInt(stored, 10);
    } catch { }
    return 18;
}

export const useBibleStore = create<BibleState>((set, get) => ({
    // ── 기본값 ──
    currentVersion: 'krv',
    currentBook: null,
    currentChapter: 1,
    verses: [],
    navigatorStep: 'closed',
    isLoading: false,
    fontSize: 18,
    selectedVerses: [],
    isCompareMode: false,
    compareVersion: 'niv',
    isBookSelectorOpen: false,
    isVersionSelectorOpen: false,

    // ── 액션 구현 ──
    setVersion: (version) => set({ currentVersion: version }),

    setBook: (book) => set({ currentBook: book, currentChapter: 1, selectedVerses: [] }),

    setChapter: (chapter) => set({ currentChapter: chapter, selectedVerses: [] }),

    setVerses: (verses) => set({ verses }),

    setLoading: (loading) => set({ isLoading: loading }),

    setFontSize: (size) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('bible-font-size', String(size));
        }
        set({ fontSize: size });
    },

    increaseFontSize: () => {
        const { fontSize, setFontSize } = get();
        if (fontSize < 28) setFontSize(fontSize + 2);
    },

    decreaseFontSize: () => {
        const { fontSize, setFontSize } = get();
        if (fontSize > 12) setFontSize(fontSize - 2);
    },

    nextChapter: () => {
        const { currentBook, currentChapter } = get();
        if (currentBook && currentChapter < currentBook.chapters) {
            set({ currentChapter: currentChapter + 1, selectedVerses: [] });
        }
    },

    prevChapter: () => {
        const { currentChapter } = get();
        if (currentChapter > 1) {
            set({ currentChapter: currentChapter - 1, selectedVerses: [] });
        }
    },

    // ── 절 선택 ──
    toggleVerseSelection: (verse) => {
        const { selectedVerses } = get();
        if (selectedVerses.includes(verse)) {
            set({ selectedVerses: selectedVerses.filter((v) => v !== verse) });
        } else {
            set({ selectedVerses: [...selectedVerses, verse] });
        }
    },

    clearVerseSelection: () => set({ selectedVerses: [] }),

    // ── 비교 모드 ──
    toggleCompareMode: () => {
        const { isCompareMode, currentVersion, compareVersion } = get();
        // 비교 버전이 현재 버전과 같으면 다른 버전으로 변경
        if (!isCompareMode && currentVersion === compareVersion) {
            const fallback = currentVersion === 'krv' ? 'niv' : 'krv';
            set({ isCompareMode: true, compareVersion: fallback });
        } else {
            set({ isCompareMode: !isCompareMode });
        }
    },
    setCompareVersion: (version) => set({ compareVersion: version }),

    // ── 네비게이터 ──
    openNavigator: (step = 'book') => set({ navigatorStep: step }),
    closeNavigator: () => set({ navigatorStep: 'closed' }),
    setNavigatorStep: (step) => set({ navigatorStep: step }),

    // ── 하위 호환 ──
    toggleBookSelector: () => {
        const { navigatorStep } = get();
        set({ navigatorStep: navigatorStep === 'book' ? 'closed' : 'book' });
    },
    toggleVersionSelector: () => {
        const { navigatorStep } = get();
        set({ navigatorStep: navigatorStep === 'version' ? 'closed' : 'version' });
    },
}));
