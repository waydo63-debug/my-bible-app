// ============================================================
// 플랜 레지스트리
// 3개 JSON 파일을 통합 관리하는 유틸리티
// ============================================================

import type { ReadingPlan } from '@/types/plan';

// ── JSON 직접 import (빌드 타임에 번들링됨) ──
import bibleReadingPlan from '../../public/plans/bible_reading_plan.json';
import chronologicalPlan from '../../public/plans/chronological_bible_plan.json';
import sheffieldPlan from '../../public/plans/sheffield_bible_plan.json';

// ── 플랜 ID로 매핑 ──
export const ALL_PLANS: Record<string, ReadingPlan> = {
    '1year-complete': bibleReadingPlan as ReadingPlan,
    '1year-chronological': chronologicalPlan as ReadingPlan,
    'sheffield-chronological': sheffieldPlan as ReadingPlan,
};

/** 모든 플랜 목록 (배열) */
export const ALL_PLANS_LIST: ReadingPlan[] = Object.values(ALL_PLANS);

/** ID로 플랜 가져오기 */
export function getPlanById(id: string): ReadingPlan | undefined {
    return ALL_PLANS[id];
}

/** 플랜 카드 표시용 요약 정보 */
export interface PlanCardInfo {
    id: string;
    title: string;
    description: string;
    duration: string;
    totalDays: number;
    gradient: string;
    category: string;
}

/** 플랜 ID → 그라데이션/카테고리 매핑 */
const PLAN_STYLES: Record<string, { gradient: string; category: string }> = {
    '1year-complete': {
        gradient: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700',
        category: '통독',
    },
    '1year-chronological': {
        gradient: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700',
        category: '연대기',
    },
    'sheffield-chronological': {
        gradient: 'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700',
        category: '심화',
    },
};

/** 카드 표시용 요약 목록 */
export function getAllPlanCards(): PlanCardInfo[] {
    return ALL_PLANS_LIST.map((plan) => {
        const style = PLAN_STYLES[plan.id] || {
            gradient: 'bg-gradient-to-br from-gray-500 to-gray-700',
            category: '기타',
        };
        return {
            id: plan.id,
            title: plan.title,
            description: plan.description,
            duration: plan.duration,
            totalDays: plan.totalDays,
            gradient: style.gradient,
            category: style.category,
        };
    });
}
