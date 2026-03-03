'use client';

import { useEffect } from 'react';
import { useBibleStore, type NavigatorStep } from '@/store/useBibleStore';
import VersionSelector from './VersionSelector';
import BookSelector from './BookSelector';
import ChapterSelector from './ChapterSelector';
import { X, ChevronLeft, BookOpen, Globe, Hash } from 'lucide-react';
import { BIBLE_VERSIONS } from '@/lib/bible-data';

/**
 * Bible.com 스타일 통합 네비게이터 모달
 * version → book → chapter 단계를 하나의 패널에서 관리
 *
 * 색상 테마:
 *   배경  #1a1a2e
 *   포인트 #4361ee
 *   텍스트 white
 */

const STEP_TITLES: Record<Exclude<NavigatorStep, 'closed'>, string> = {
    version: '번역본 선택',
    book: '책 선택',
    chapter: '장 선택',
};

const STEP_ICONS: Record<Exclude<NavigatorStep, 'closed'>, React.ReactNode> = {
    version: <Globe className="h-4 w-4" />,
    book: <BookOpen className="h-4 w-4" />,
    chapter: <Hash className="h-4 w-4" />,
};

/** 뒤로가기 목적지 */
const BACK_STEP: Record<Exclude<NavigatorStep, 'closed'>, NavigatorStep> = {
    version: 'closed',
    book: 'version',
    chapter: 'book',
};

export default function BibleNavigator() {
    const { navigatorStep, closeNavigator, setNavigatorStep, currentVersion } = useBibleStore();

    // ESC 키로 닫기
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeNavigator();
        };
        if (navigatorStep !== 'closed') {
            document.addEventListener('keydown', handleKeyDown);
            // 배경 스크롤 방지
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [navigatorStep, closeNavigator]);

    if (navigatorStep === 'closed') return null;

    const currentVersionName =
        BIBLE_VERSIONS.find((v) => v.id === currentVersion)?.name ?? currentVersion;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
            {/* 어두운 오버레이 */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeNavigator}
            />

            {/* 패널 */}
            <div
                className="relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl
                   sm:max-w-md sm:rounded-3xl"
                style={{ backgroundColor: '#1a1a2e' }}
            >
                {/* ── 헤더 ── */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
                    <div className="flex items-center gap-2">
                        {/* 뒤로가기 (version 단계에선 닫기) */}
                        {navigatorStep !== 'version' ? (
                            <button
                                onClick={() => setNavigatorStep(BACK_STEP[navigatorStep])}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400
                           transition-colors hover:bg-white/[0.06] hover:text-white"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        ) : (
                            <div className="h-8 w-8" /> /* 공간 확보 */
                        )}

                        {/* 제목 */}
                        <div className="flex items-center gap-2">
                            <span className="text-[#4361ee]">{STEP_ICONS[navigatorStep]}</span>
                            <h2 className="text-base font-bold text-white">
                                {STEP_TITLES[navigatorStep]}
                            </h2>
                        </div>
                    </div>

                    {/* 닫기 */}
                    <button
                        onClick={closeNavigator}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400
                       transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* ── 단계 인디케이터 ── */}
                <div className="flex gap-1.5 px-5 py-3">
                    {(['version', 'book', 'chapter'] as const).map((step, idx) => {
                        const steps = ['version', 'book', 'chapter'] as const;
                        const currentIdx = steps.indexOf(navigatorStep);
                        const isCompleted = idx < currentIdx;
                        const isActive = idx === currentIdx;

                        return (
                            <div
                                key={step}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${isActive
                                        ? 'bg-[#4361ee]'
                                        : isCompleted
                                            ? 'bg-[#4361ee]/50'
                                            : 'bg-white/[0.06]'
                                    }`}
                            />
                        );
                    })}
                </div>

                {/* ── 현재 선택 상태 요약 ── */}
                {navigatorStep !== 'version' && (
                    <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2">
                        <span className="text-xs text-gray-500">현재:</span>
                        <button
                            onClick={() => setNavigatorStep('version')}
                            className="rounded-md bg-[#4361ee]/20 px-2 py-0.5 text-xs font-medium text-[#4361ee] hover:bg-[#4361ee]/30 transition-colors"
                        >
                            {currentVersionName}
                        </button>
                        {navigatorStep === 'chapter' && (
                            <>
                                <span className="text-gray-600">›</span>
                                <button
                                    onClick={() => setNavigatorStep('book')}
                                    className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-gray-300 hover:bg-white/[0.1] transition-colors"
                                >
                                    {useBibleStore.getState().currentBook?.name}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* ── 콘텐츠 ── */}
                <div className="min-h-0 flex-1 overflow-hidden">
                    {navigatorStep === 'version' && <VersionSelector />}
                    {navigatorStep === 'book' && <BookSelector />}
                    {navigatorStep === 'chapter' && <ChapterSelector />}
                </div>
            </div>
        </div>
    );
}
