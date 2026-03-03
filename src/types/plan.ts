// ============================================================
// 성경 읽기 플랜 타입 정의
// JSON 데이터(public/plans/*.json)와 1:1 매핑
// ============================================================

/** 하나의 읽기 항목 (한 구절 범위) */
export interface Reading {
    /** 성경 책 코드 (예: "GEN", "EXO", "PSA") */
    book: string;
    /** 시작 장 */
    startChapter: number;
    /** 끝 장 */
    endChapter: number;
    /** 표시 라벨 (예: "창세기 1-3장") */
    label: string;
}

/** 하루 치 읽기 분량 */
export interface PlanDay {
    /** 일차 번호 (1-based) */
    day: number;
    /** 읽기 항목 목록 */
    readings: Reading[];
    /** 참고 노트 (연대기 플랜에서 시대/배경 설명용) */
    note?: string;
}

/** 읽기 플랜 전체 */
export interface ReadingPlan {
    /** 플랜 고유 ID (예: "1year-complete", "sheffield-chronological") */
    id: string;
    /** 플랜 이름 */
    title: string;
    /** 플랜 설명 */
    description: string;
    /** 기간 문자열 (예: "365일", "230일") */
    duration: string;
    /** 총 일수 */
    totalDays: number;
    /** 일별 읽기 스케줄 */
    days: PlanDay[];
}

// ============================================================
// 사용자 진행 상태 관련 타입
// Supabase 마이그레이션 시 테이블 스키마와 매핑 가능
// ============================================================

/** 사용자가 시작한 플랜의 진행 정보 */
export interface MyPlan {
    /** 플랜 ID (ReadingPlan.id와 매핑) */
    planId: string;
    /** 플랜 시작 날짜 (ISO date string, "2026-03-01") */
    startDate: string;
    /** 완료한 일차 번호 배열 */
    completedDays: number[];
    /** 챕터 단위 완료 기록 — key: day 번호, value: 완료한 chapterKey 배열 (예: "GEN-1") */
    completedChapters: Record<number, string[]>;
    /** 플랜 시작 시각 (ISO datetime) */
    startedAt: string;
}

/**
 * 플랜 스케줄 타입
 * - "daily": 매일 읽기 (토/일 포함)
 * - "weekday": 평일만 읽기 (월~금)
 */
export type PlanScheduleType = 'daily' | 'weekday';

/** 플랜 ID → 스케줄 타입 매핑 */
export const PLAN_SCHEDULE_TYPE: Record<string, PlanScheduleType> = {
    '1year-complete': 'daily',
    '1year-chronological': 'daily',
    'sheffield-chronological': 'weekday',
};
