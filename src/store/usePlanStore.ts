import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MyPlan, ReadingPlan, PlanDay } from '@/types/plan';
import { PLAN_SCHEDULE_TYPE } from '@/types/plan';
import {
    getCurrentPlanDay,
    getDateForPlanDay,
    formatDate,
    todayString,
    calculateStreak,
} from '@/utils/dateUtils';

// ============================================================
// 플랜 JSON 캐시 (런타임에 fetch하여 저장)
// ============================================================

/** 플랜 ID → JSON 파일명 매핑 */
const PLAN_FILES: Record<string, string> = {
    '1year-complete': '/plans/bible_reading_plan.json',
    '1year-chronological': '/plans/chronological_bible_plan.json',
    'sheffield-chronological': '/plans/sheffield_bible_plan.json',
};

/** 메모리 캐시 (새로고침 시 초기화, persist 불필요) */
const planCache: Record<string, ReadingPlan> = {};

/** 플랜 JSON 로드 (캐시 우선) */
export async function loadPlan(planId: string): Promise<ReadingPlan | null> {
    if (planCache[planId]) return planCache[planId];

    const file = PLAN_FILES[planId];
    if (!file) return null;

    try {
        const res = await fetch(file);
        const data: ReadingPlan = await res.json();
        planCache[planId] = data;
        return data;
    } catch (e) {
        console.error(`플랜 로드 실패: ${planId}`, e);
        return null;
    }
}

/** 캐시에서 동기적으로 플랜 가져오기 (이미 로드 된 경우) */
export function getCachedPlan(planId: string): ReadingPlan | null {
    return planCache[planId] || null;
}

/** 모든 플랜 요약 정보 */
export function getAllPlanSummaries() {
    return [
        {
            id: '1year-complete',
            title: '1년 성경 통독',
            description: '1년 동안 성경 전체를 읽는 플랜',
            duration: '365일',
            totalDays: 365,
            gradient: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700',
            category: '통독',
        },
        {
            id: '1year-chronological',
            title: '1년 연대기 통독',
            description: '사건 발생 순서대로 성경을 읽는 플랜 (역사서, 예언서, 서신서 병행)',
            duration: '362일',
            totalDays: 362,
            gradient: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700',
            category: '연대기',
        },
        {
            id: 'sheffield-chronological',
            title: '셰필드 연대기 통독',
            description: '46주(주 5일) 동안 연대기 순으로 성경을 완독하는 플랜',
            duration: '230일 (주 5일)',
            totalDays: 230,
            gradient: 'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700',
            category: '심화',
        },
    ];
}

// ============================================================
// Store 타입 정의
// ============================================================

interface PlanScheduleResult {
    /** 현재 planDay (1-based) */
    currentDay: number;
    /** 오늘의 실제 달력 날짜 */
    currentDate: string;
    /** 오늘의 읽기 분량 (PlanDay) */
    todaySchedule: PlanDay | null;
    /** 해당 일차가 완료되었는지 */
    isComplete: boolean;
}

interface PlanProgressResult {
    /** 플랜 시작 여부 */
    started: boolean;
    /** 총 일수 */
    totalDays: number;
    /** 완료 일수 */
    completedDays: number;
    /** 진행률 (0~100) */
    progressPercent: number;
    /** 현재 일차 */
    currentDay: number;
}

interface PlanState {
    // ── 상태 (persist 대상) ──
    myPlans: Record<string, MyPlan>;

    // ── 액션 ──
    startPlan: (planId: string, startDate?: string) => void;
    toggleDayComplete: (planId: string, day: number) => void;
    toggleChapter: (planId: string, day: number, chapterKey: string, totalChaptersInDay: number) => void;
    resetPlan: (planId: string) => void;
    removePlan: (planId: string) => void;
    changeStartDate: (planId: string, newStartDate: string) => void;

    // ── 계산 함수 ──
    isPlanStarted: (planId: string) => boolean;
    getCompletedChapters: (planId: string, day: number) => string[];
    getPlanProgress: (planId: string) => PlanProgressResult;
    getPlanSchedule: (planId: string, plan: ReadingPlan) => PlanScheduleResult;
    getStreak: () => number;
    getCompletedDateStrings: () => Set<string>;
}

// ============================================================
// Zustand Store
// ============================================================

export const usePlanStore = create<PlanState>()(
    persist(
        (set, get) => ({
            // ── 초기 상태 ──
            myPlans: {},

            // ── 플랜 시작 ──
            startPlan: (planId, startDate) => {
                set((state) => ({
                    myPlans: {
                        ...state.myPlans,
                        [planId]: {
                            planId,
                            startDate: startDate || todayString(),
                            completedDays: [],
                            completedChapters: {},
                            startedAt: new Date().toISOString(),
                        },
                    },
                }));
            },

            // ── 읽기 완료 토글 (Day 단위) ──
            toggleDayComplete: (planId, day) => {
                set((state) => {
                    const myPlan = state.myPlans[planId];
                    if (!myPlan) return state;

                    const isCompleted = myPlan.completedDays.includes(day);
                    const updatedDays = isCompleted
                        ? myPlan.completedDays.filter((d) => d !== day)
                        : [...myPlan.completedDays, day].sort((a, b) => a - b);

                    return {
                        myPlans: {
                            ...state.myPlans,
                            [planId]: {
                                ...myPlan,
                                completedDays: updatedDays,
                            },
                        },
                    };
                });
            },

            // ── 챕터 단위 완료 토글 ──
            toggleChapter: (planId, day, chapterKey, totalChaptersInDay) => {
                set((state) => {
                    const myPlan = state.myPlans[planId];
                    if (!myPlan) return state;

                    // completedChapters가 없으면 빈 객체로 초기화 (하위 호환)
                    const prevChapters = myPlan.completedChapters ?? {};
                    const dayChapters = prevChapters[day] ?? [];

                    const isChecked = dayChapters.includes(chapterKey);
                    const updatedDayChapters = isChecked
                        ? dayChapters.filter((k) => k !== chapterKey)
                        : [...dayChapters, chapterKey];

                    const updatedChapters = {
                        ...prevChapters,
                        [day]: updatedDayChapters,
                    };

                    // 모든 챕터가 완료되었는지 확인 → Day 자동 완료/해제
                    const allDone = updatedDayChapters.length >= totalChaptersInDay;
                    const wasDayDone = myPlan.completedDays.includes(day);

                    let updatedDays = myPlan.completedDays;
                    if (allDone && !wasDayDone) {
                        updatedDays = [...myPlan.completedDays, day].sort((a, b) => a - b);
                    } else if (!allDone && wasDayDone) {
                        updatedDays = myPlan.completedDays.filter((d) => d !== day);
                    }

                    return {
                        myPlans: {
                            ...state.myPlans,
                            [planId]: {
                                ...myPlan,
                                completedChapters: updatedChapters,
                                completedDays: updatedDays,
                            },
                        },
                    };
                });
            },

            // ── 플랜 초기화 (다시 시작) ──
            resetPlan: (planId) => {
                set((state) => {
                    const myPlan = state.myPlans[planId];
                    if (!myPlan) return state;

                    return {
                        myPlans: {
                            ...state.myPlans,
                            [planId]: {
                                ...myPlan,
                                startDate: todayString(),
                                completedDays: [],
                                completedChapters: {},
                                startedAt: new Date().toISOString(),
                            },
                        },
                    };
                });
            },

            // ── 플랜 삭제 ──
            removePlan: (planId) => {
                set((state) => {
                    const { [planId]: _, ...rest } = state.myPlans;
                    return { myPlans: rest };
                });
            },

            // ── 시작일 변경 ──
            changeStartDate: (planId, newStartDate) => {
                set((state) => {
                    const myPlan = state.myPlans[planId];
                    if (!myPlan) return state;

                    return {
                        myPlans: {
                            ...state.myPlans,
                            [planId]: { ...myPlan, startDate: newStartDate },
                        },
                    };
                });
            },

            // ── 플랜 시작 여부 ──
            isPlanStarted: (planId) => {
                return !!get().myPlans[planId];
            },

            // ── 특정 Day의 완료된 챕터 목록 ──
            getCompletedChapters: (planId, day) => {
                const myPlan = get().myPlans[planId];
                if (!myPlan) return [];
                return myPlan.completedChapters?.[day] ?? [];
            },

            // ── 진행률 계산 ──
            getPlanProgress: (planId) => {
                const myPlan = get().myPlans[planId];
                const summary = getAllPlanSummaries().find((s) => s.id === planId);
                const totalDays = summary?.totalDays || 0;

                if (!myPlan) {
                    return {
                        started: false,
                        totalDays,
                        completedDays: 0,
                        progressPercent: 0,
                        currentDay: 0,
                    };
                }

                const scheduleType = PLAN_SCHEDULE_TYPE[planId] || 'daily';
                const completedDays = myPlan.completedDays.length;
                const progressPercent = totalDays > 0
                    ? Math.round((completedDays / totalDays) * 100)
                    : 0;
                const currentDay = getCurrentPlanDay(myPlan.startDate, scheduleType, totalDays);

                return {
                    started: true,
                    totalDays,
                    completedDays,
                    progressPercent,
                    currentDay,
                };
            },

            // ── 오늘의 스케줄 ──
            getPlanSchedule: (planId, plan) => {
                const myPlan = get().myPlans[planId];
                const scheduleType = PLAN_SCHEDULE_TYPE[planId] || 'daily';

                if (!myPlan) {
                    return {
                        currentDay: 1,
                        currentDate: formatDate(new Date()),
                        todaySchedule: plan.days[0] || null,
                        isComplete: false,
                    };
                }

                const currentDay = getCurrentPlanDay(
                    myPlan.startDate,
                    scheduleType,
                    plan.totalDays,
                );
                const currentDate = formatDate(
                    getDateForPlanDay(myPlan.startDate, currentDay, scheduleType),
                );
                const todaySchedule = plan.days.find((d) => d.day === currentDay) || null;
                const isComplete = myPlan.completedDays.includes(currentDay);

                return { currentDay, currentDate, todaySchedule, isComplete };
            },

            // ── 연속 읽기 일수 (streak) ──
            getStreak: () => {
                return calculateStreak(get().getCompletedDateStrings());
            },

            // ── 완료한 날짜들을 ISO date string Set으로 변환 ──
            getCompletedDateStrings: () => {
                const { myPlans } = get();
                const dates = new Set<string>();

                for (const myPlan of Object.values(myPlans)) {
                    const scheduleType = PLAN_SCHEDULE_TYPE[myPlan.planId] || 'daily';
                    for (const day of myPlan.completedDays) {
                        const date = getDateForPlanDay(myPlan.startDate, day, scheduleType);
                        dates.add(date.toISOString().split('T')[0]);
                    }
                }

                return dates;
            },
        }),
        {
            name: 'bible-plan-storage',
            // ── Supabase 마이그레이션 시: ──
            // storage: createJSONStorage(() => supabaseStorage),
            partialize: (state) => ({
                myPlans: state.myPlans,
            }),
        },
    ),
);
