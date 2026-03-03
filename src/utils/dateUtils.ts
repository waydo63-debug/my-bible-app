// ============================================================
// 날짜 계산 유틸리티
// 플랜의 startDate + planDay → 실제 달력 날짜 변환
// ============================================================

import {
    addDays,
    addBusinessDays,
    differenceInCalendarDays,
    differenceInBusinessDays,
    format,
    isWeekend,
    isSameDay,
    parseISO,
    startOfDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import type { PlanScheduleType } from '@/types/plan';

// ── 핵심 함수 ──

/**
 * planDay → 실제 달력 날짜
 *
 * @param startDate  - 플랜 시작일 (ISO date string: "2026-03-01")
 * @param planDay    - 플랜 일차 (1-based)
 * @param scheduleType - 'daily' = 매일 / 'weekday' = 월~금만
 * @returns Date 객체
 *
 * @example
 * // daily: startDate=월요일, planDay=3 → 수요일
 * getDateForPlanDay("2026-03-02", 3, "daily")  // → 2026-03-04 (수)
 *
 * // weekday: startDate=월요일, planDay=6 → 다음주 월요일
 * getDateForPlanDay("2026-03-02", 6, "weekday") // → 2026-03-09 (월)
 */
export function getDateForPlanDay(
    startDate: string,
    planDay: number,
    scheduleType: PlanScheduleType,
): Date {
    const start = parseISO(startDate);

    if (scheduleType === 'daily') {
        // 일반 플랜: startDate + (planDay - 1)일
        return addDays(start, planDay - 1);
    }

    // 셰필드 (weekday): 영업일(월~금)만 세기
    // addBusinessDays(date, n)은 date로부터 n "영업일" 후를 반환
    // planDay=1이면 시작일 자체이므로 addBusinessDays(start, planDay - 1)
    return addBusinessDays(start, planDay - 1);
}

/**
 * 오늘 날짜 → 현재 planDay 계산
 *
 * @param startDate - 플랜 시작일 (ISO date string)
 * @param scheduleType - 'daily' | 'weekday'
 * @param totalDays - 플랜 총 일수 (clamp용)
 * @returns 현재 planDay (1-based, 최소 1, 최대 totalDays)
 */
export function getCurrentPlanDay(
    startDate: string,
    scheduleType: PlanScheduleType,
    totalDays: number,
): number {
    const start = startOfDay(parseISO(startDate));
    const today = startOfDay(new Date());

    if (today < start) return 1; // 시작 전이면 Day 1

    let dayNumber: number;

    if (scheduleType === 'daily') {
        dayNumber = differenceInCalendarDays(today, start) + 1;
    } else {
        // weekday: 영업일 차이 계산
        // 오늘이 주말이면 직전 금요일의 day로
        if (isWeekend(today)) {
            // 주말에는 마지막 영업일 기준
            dayNumber = differenceInBusinessDays(today, start) + 1;
        } else {
            dayNumber = differenceInBusinessDays(today, start) + 1;
        }
    }

    return Math.max(1, Math.min(dayNumber, totalDays));
}

/**
 * 특정 날짜가 오늘인지 확인
 */
export function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}

/**
 * 날짜 포맷팅 유틸리티
 */
export function formatDate(date: Date, formatStr: string = 'M월 d일 (EEE)'): string {
    return format(date, formatStr, { locale: ko });
}

/**
 * ISO date string → 포맷팅된 문자열
 */
export function formatDateString(dateStr: string, formatStr: string = 'M월 d일 (EEE)'): string {
    return format(parseISO(dateStr), formatStr, { locale: ko });
}

/**
 * 오늘 날짜를 ISO date string으로
 */
export function todayString(): string {
    return format(new Date(), 'yyyy-MM-dd');
}

/**
 * streak(연속 읽기 일수) 계산
 *
 * 완료한 날짜 set을 받아서 오늘(또는 어제)부터 역순으로
 * 연속 며칠을 읽었는지 계산합니다.
 *
 * @param completedDates - 완료한 날짜들의 Set (ISO date string)
 */
export function calculateStreak(completedDates: Set<string>): number {
    if (completedDates.size === 0) return 0;

    const today = startOfDay(new Date());
    let streak = 0;

    for (let i = 0; i < 1000; i++) {
        const checkDate = addDays(today, -i);
        const dateStr = format(checkDate, 'yyyy-MM-dd');

        if (completedDates.has(dateStr)) {
            streak++;
        } else if (i === 0) {
            // 오늘 아직 안 읽었으면 어제부터 검사
            continue;
        } else {
            break;
        }
    }

    return streak;
}
