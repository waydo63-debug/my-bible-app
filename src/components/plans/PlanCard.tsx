'use client';

import { BookOpen, Calendar, Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePlanStore } from '@/store/usePlanStore';

interface PlanSummary {
    id: string;
    title: string;
    description: string;
    duration: string;
    totalDays: number;
    gradient: string;
    category: string;
}

interface PlanCardProps {
    plan: PlanSummary;
}

export default function PlanCard({ plan }: PlanCardProps) {
    const getPlanProgress = usePlanStore((s) => s.getPlanProgress);
    const progress = getPlanProgress(plan.id);
    const isStarted = progress.started;
    const percent = progress.progressPercent;

    return (
        <Link
            href={`/plans/${plan.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900"
        >
            {/* 상단 그라데이션 배너 + 아이콘 */}
            <div
                className={`relative flex items-center justify-center h-44 ${plan.gradient}`}
            >
                {/* 장식 원형 패턴 */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20" />
                    <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/15" />
                    <div className="absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
                </div>

                {/* 중앙 아이콘 */}
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                    <BookOpen className="h-10 w-10 text-white" strokeWidth={1.5} />
                </div>

                {/* 카테고리 뱃지 */}
                <span className="absolute top-3 right-3 rounded-full bg-white/25 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                    {plan.category}
                </span>
            </div>

            {/* 카드 본문 */}
            <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-1.5 text-lg font-bold text-gray-900 dark:text-white">
                    {plan.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {plan.description}
                </p>

                {/* 기간 정보 */}
                <div className="mb-5 flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{plan.duration}</span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span>매일 15~20분</span>
                </div>

                {/* 진행률 바 (시작한 경우) */}
                {isStarted && (
                    <div className="mb-4">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                                Day {progress.currentDay} / {progress.totalDays}
                            </span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {percent}%
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* 스페이서 */}
                <div className="flex-1" />

                {/* 버튼 */}
                {isStarted ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 group-hover:bg-indigo-700 group-hover:shadow-xl group-hover:shadow-indigo-500/30">
                        <Play className="h-4 w-4" fill="currentColor" />
                        이어하기
                    </div>
                ) : (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-600 transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-500/25 dark:border-indigo-800 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white dark:group-hover:border-indigo-600">
                        <ArrowRight className="h-4 w-4" />
                        시작하기
                    </div>
                )}
            </div>
        </Link>
    );
}
