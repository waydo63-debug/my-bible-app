'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    ArrowLeft, Check, ChevronRight, ChevronLeft,
    ChevronsRight, Settings2, Play
} from 'lucide-react';
import Link from 'next/link';
import { getPlanById } from '@/utils/plansRegistry';
import { usePlanStore } from '@/store/usePlanStore';
import { PLAN_SCHEDULE_TYPE } from '@/types/plan';
import type { ReadingPlan, PlanDay } from '@/types/plan';
import {
    getCurrentPlanDay, getDateForPlanDay, formatDate, todayString
} from '@/utils/dateUtils';
import { expandReadings, type ExpandedChapter } from '@/utils/planUtils';

// ============================================================
// Toast 컴포넌트
// ============================================================
function CompletionToast({
    message,
    visible,
}: {
    message: string;
    visible: boolean;
}) {
    return (
        <div
            className={`fixed left-1/2 top-8 z-50 -translate-x-1/2 transform transition-all duration-500 ${visible
                ? 'translate-y-0 opacity-100'
                : '-translate-y-8 pointer-events-none opacity-0'
                }`}
        >
            <div className="rounded-2xl bg-gray-900 px-6 py-3 text-base font-semibold text-white shadow-2xl dark:bg-white dark:text-gray-900">
                {message}
            </div>
        </div>
    );
}

// ============================================================
// DateStrip 컴포넌트 (가로 날짜 스크롤)
// ============================================================
function DateStrip({
    totalDays,
    selectedDay,
    completedDays,
    startDate,
    scheduleType,
    onSelectDay,
}: {
    totalDays: number;
    selectedDay: number;
    completedDays: number[];
    startDate: string;
    scheduleType: 'daily' | 'weekday';
    onSelectDay: (day: number) => void;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLButtonElement>(null);

    // 표시할 날짜 범위 (selectedDay 기준 ±15일)
    const visibleRange = useMemo(() => {
        const start = Math.max(1, selectedDay - 15);
        const end = Math.min(totalDays, selectedDay + 15);
        const days: number[] = [];
        for (let i = start; i <= end; i++) days.push(i);
        return days;
    }, [selectedDay, totalDays]);

    // 선택된 날로 자동 스크롤
    useEffect(() => {
        if (selectedRef.current && scrollRef.current) {
            const container = scrollRef.current;
            const el = selectedRef.current;
            const offset = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
            container.scrollTo({ left: offset, behavior: 'smooth' });
        }
    }, [selectedDay]);

    const handlePrev = useCallback(() => {
        const newDay = Math.max(1, selectedDay - 7);
        onSelectDay(newDay);
    }, [selectedDay, onSelectDay]);

    const handleNext = useCallback(() => {
        const newDay = Math.min(totalDays, selectedDay + 7);
        onSelectDay(newDay);
    }, [selectedDay, totalDays, onSelectDay]);

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {/* 날짜 원형들 */}
            <div className="flex items-center gap-2">
                {/* 왼쪽 화살표 */}
                <button
                    onClick={handlePrev}
                    disabled={selectedDay <= 1}
                    className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 dark:hover:bg-gray-800"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {/* 스크롤 영역 */}
                <div
                    ref={scrollRef}
                    className="flex flex-1 gap-3 overflow-x-auto py-1 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {visibleRange.map((day) => {
                        const isCompleted = completedDays.includes(day);
                        const isSelected = day === selectedDay;
                        const date = startDate
                            ? getDateForPlanDay(startDate, day, scheduleType)
                            : null;

                        return (
                            <button
                                key={day}
                                ref={isSelected ? selectedRef : undefined}
                                onClick={() => onSelectDay(day)}
                                className="flex shrink-0 flex-col items-center gap-1"
                            >
                                {/* 원형 */}
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${isSelected
                                        ? isCompleted
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300'
                                            : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                        : isCompleted
                                            ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                                            : 'border-2 border-gray-200 bg-transparent text-gray-400 dark:border-gray-700 dark:text-gray-500'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <span className="text-xs">{day}</span>
                                    )}
                                </div>
                                {/* 날짜 텍스트 */}
                                {date && (
                                    <span className={`text-[10px] whitespace-nowrap ${isSelected
                                        ? isCompleted
                                            ? 'font-semibold text-emerald-600'
                                            : 'font-semibold text-rose-500'
                                        : isCompleted
                                            ? 'font-medium text-emerald-500 dark:text-emerald-400'
                                            : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                        {formatDate(date, 'M/d (EEE)')}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* 오른쪽 화살표 */}
                <button
                    onClick={handleNext}
                    disabled={selectedDay >= totalDays}
                    className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 dark:hover:bg-gray-800"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onSelectDay(Math.min(totalDays, selectedDay + 14))}
                    disabled={selectedDay >= totalDays}
                    className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 dark:hover:bg-gray-800"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// ============================================================
// ReadingList 컴포넌트 (개별 챕터 리스트)
// ============================================================
function ReadingList({
    chapters,
    completedChapterKeys,
    onToggleChapter,
    planId,
    day,
}: {
    chapters: ExpandedChapter[];
    completedChapterKeys: string[];
    onToggleChapter: (chapterKey: string) => void;
    planId: string;
    day: number;
}) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {chapters.map((ch, idx) => {
                const isDone = completedChapterKeys.includes(ch.chapterKey);
                const isFirst = idx === 0;
                const isLast = idx === chapters.length - 1;

                return (
                    <div
                        key={ch.chapterKey}
                        className={`flex items-center gap-4 px-5 py-4 transition-colors ${!isLast ? 'border-b border-gray-50 dark:border-gray-800' : ''
                            } ${isDone ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}`}
                    >
                        {/* 체크 원형 */}
                        <button
                            onClick={() => onToggleChapter(ch.chapterKey)}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${isDone
                                ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                                : 'border-2 border-gray-300 text-transparent hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                                }`}
                        >
                            {isDone && <Check className="h-4 w-4" strokeWidth={3} />}
                        </button>

                        {/* 챕터 텍스트 */}
                        <span
                            className={`flex-1 text-base font-semibold ${isDone
                                ? 'text-gray-400 line-through dark:text-gray-500'
                                : 'text-gray-900 dark:text-white'
                                }`}
                        >
                            {ch.label}
                        </span>

                        {/* 읽기 버튼 / 화살표 */}
                        {isFirst && !isDone ? (
                            <Link
                                href={`/bible/krv/${ch.bookId}/${ch.chapter}?planId=${planId}&day=${day}`}
                                className="flex items-center gap-1 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-95 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                            >
                                읽기 시작
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link
                                href={`/bible/krv/${ch.bookId}/${ch.chapter}?planId=${planId}&day=${day}`}
                                className="shrink-0 rounded-full p-2 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:text-gray-600 dark:hover:bg-gray-800"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ============================================================
// 메인 페이지 컴포넌트
// ============================================================
export default function PlanDetailPage() {
    const params = useParams();
    const router = useRouter();
    const planId = params.planId as string;

    // ── 플랜 데이터 ──
    const plan = getPlanById(planId);

    // ── Store ──
    const myPlans = usePlanStore((s) => s.myPlans);
    const startPlan = usePlanStore((s) => s.startPlan);
    const toggleChapter = usePlanStore((s) => s.toggleChapter);
    const getCompletedChapters = usePlanStore((s) => s.getCompletedChapters);

    const myPlan = myPlans[planId];
    const isStarted = !!myPlan;

    // ── 상태 ──
    const [selectedDay, setSelectedDay] = useState(1);
    const [toast, setToast] = useState({ visible: false, message: '' });
    const [showSettings, setShowSettings] = useState(false);
    const changeStartDate = usePlanStore((s) => s.changeStartDate);
    const resetPlan = usePlanStore((s) => s.resetPlan);

    // ── 계산값 ──
    const scheduleType = PLAN_SCHEDULE_TYPE[planId] || 'daily';

    // 현재 Day 계산 및 selectedDay 초기화
    useEffect(() => {
        if (isStarted && plan) {
            const currentDay = getCurrentPlanDay(myPlan.startDate, scheduleType, plan.totalDays);
            setSelectedDay(currentDay);
        }
    }, [isStarted, planId]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!plan) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    플랜을 찾을 수 없습니다
                </h1>
                <p className="mb-8 text-gray-500">요청한 플랜 ID: {planId}</p>
                <Link href="/plans" className="text-indigo-600 hover:underline">
                    ← 플랜 목록으로 돌아가기
                </Link>
            </div>
        );
    }

    const completedDays = myPlan?.completedDays || [];

    // ── 선택된 Day의 데이터 ──
    const selectedDayData = plan.days.find((d) => d.day === selectedDay);
    const expandedChapters = selectedDayData ? expandReadings(selectedDayData) : [];
    const completedChapterKeys = isStarted
        ? getCompletedChapters(planId, selectedDay)
        : [];
    const totalChaptersInDay = expandedChapters.length;

    // ── 챕터 토글 핸들러 ──
    const handleToggleChapter = useCallback(
        (chapterKey: string) => {
            if (!isStarted) return;

            toggleChapter(planId, selectedDay, chapterKey, totalChaptersInDay);

            // 토글 후 완료 여부 확인 (낙관적 업데이트 — 다음 틱에서 체크)
            setTimeout(() => {
                const updatedChapters = usePlanStore.getState().getCompletedChapters(planId, selectedDay);
                if (updatedChapters.length >= totalChaptersInDay && totalChaptersInDay > 0) {
                    // Day 자동 완료 처리는 toggleChapter 내부에서 이미 수행됨
                    setToast({ visible: true, message: `Day ${selectedDay} 읽기 완료! 🎉` });
                    setTimeout(() => {
                        setToast({ visible: false, message: '' });
                        // 1초 후 다음 Day로 포커스 이동
                        if (selectedDay < plan.totalDays) {
                            setSelectedDay(selectedDay + 1);
                        }
                    }, 1000);
                }
            }, 30);
        },
        [isStarted, planId, selectedDay, totalChaptersInDay, toggleChapter, plan.totalDays],
    );

    return (
        <div className="mx-auto max-w-2xl px-4 py-6 pb-28 md:pb-12">
            {/* Toast */}
            <CompletionToast message={toast.message} visible={toast.visible} />

            {/* ============================================ */}
            {/* A. 상단 헤더 */}
            {/* ============================================ */}
            <div className="mb-6">
                {/* 뒤로가기 */}
                <Link
                    href="/plans"
                    className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    My Plans
                </Link>

                {/* 제목 영역 */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            {plan.title}
                        </h1>
                        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                            Day {selectedDay} of {plan.totalDays}
                        </p>
                    </div>

                    {/* 설정 버튼 */}
                    {isStarted && (
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="rounded-full bg-gray-100 p-2.5 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            <Settings2 className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* 설정 패널 */}
            {showSettings && isStarted && (
                <div className="mb-6 space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                            시작일 변경
                        </label>
                        <input
                            type="date"
                            value={myPlan.startDate}
                            onChange={(e) => {
                                changeStartDate(planId, e.target.value);
                                setShowSettings(false);
                            }}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('플랜을 다시 시작하시겠습니까? 진행 상황이 초기화됩니다.')) {
                                resetPlan(planId);
                                setShowSettings(false);
                                setSelectedDay(1);
                            }
                        }}
                        className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                    >
                        플랜 초기화
                    </button>
                </div>
            )}

            {/* 플랜 미시작 → 시작 버튼 */}
            {!isStarted && (
                <button
                    onClick={() => startPlan(planId)}
                    className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-gray-800 active:scale-[0.98] dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                    <Play className="h-5 w-5" />
                    플랜 시작하기
                </button>
            )}

            {/* ============================================ */}
            {/* B. 날짜 스트립 */}
            {/* ============================================ */}
            {isStarted && (
                <div className="mb-6">
                    <DateStrip
                        totalDays={plan.totalDays}
                        selectedDay={selectedDay}
                        completedDays={completedDays}
                        startDate={myPlan.startDate}
                        scheduleType={scheduleType}
                        onSelectDay={setSelectedDay}
                    />
                </div>
            )}

            {/* ============================================ */}
            {/* C. 읽기 목록 */}
            {/* ============================================ */}
            {selectedDayData && (
                <div>
                    {/* Day 노트 */}
                    {selectedDayData.note && (
                        <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                            📖 {selectedDayData.note}
                        </div>
                    )}

                    {/* 챕터 리스트 */}
                    {expandedChapters.length > 0 && (
                        <ReadingList
                            chapters={expandedChapters}
                            completedChapterKeys={completedChapterKeys}
                            onToggleChapter={handleToggleChapter}
                            planId={planId}
                            day={selectedDay}
                        />
                    )}

                    {/* 진행 요약 (Day 레벨) */}
                    {isStarted && totalChaptersInDay > 0 && (
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {completedChapterKeys.length}/{totalChaptersInDay} 장 완료
                                {completedDays.includes(selectedDay) && (
                                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                        <Check className="h-3 w-3" /> 완료
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {!selectedDayData && (
                <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-gray-400">Day {selectedDay}의 읽기 데이터가 없습니다.</p>
                </div>
            )}
        </div>
    );
}
