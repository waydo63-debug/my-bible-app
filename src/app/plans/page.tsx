'use client';

import { BookOpen } from 'lucide-react';
import { getAllPlanCards } from '@/utils/plansRegistry';
import PlanCard from '@/components/plans/PlanCard';

// ============================================================
// 플랜 목록 페이지
// ============================================================
const PLANS = getAllPlanCards();

export default function PlansPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8 pb-28 md:pb-12">
            {/* 헤더 */}
            <div className="mb-10 text-center md:text-left">
                <div className="mb-3 inline-flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950">
                        <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                        성경읽기 플랜
                    </h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                    체계적인 성경 읽기 플랜을 선택하고 매일 말씀을 묵상하세요.
                </p>
            </div>

            {/* 플랜 카드 그리드: 모바일=세로, 데스크탑=3열 */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {PLANS.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                ))}
            </div>
        </div>
    );
}
