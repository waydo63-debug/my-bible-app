'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import {
  BookOpen, Share2, ArrowRight, ChevronRight,
  CalendarDays, BookMarked, Play, Sparkles,
} from 'lucide-react';
import { getTodayVerse } from '@/data/dailyVerses';
import { getAllPlanCards, getPlanById, type PlanCardInfo } from '@/utils/plansRegistry';
import { usePlanStore } from '@/store/usePlanStore';

// ── 오늘의 말씀 그라데이션 (날짜 기반 순환) ──
const GRADIENTS = [
  'from-indigo-500 via-purple-500 to-pink-500',
  'from-blue-600 via-cyan-500 to-teal-400',
  'from-violet-600 via-fuchsia-500 to-rose-400',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-amber-500 via-orange-500 to-red-400',
  'from-sky-500 via-blue-600 to-indigo-600',
  'from-rose-500 via-pink-500 to-purple-500',
];

function getTodayGradient(): string {
  const d = new Date();
  const day = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  return GRADIENTS[day % GRADIENTS.length];
}

// ============================================================
// 1. 오늘의 말씀
// ============================================================
function VerseOfTheDay() {
  const verse = getTodayVerse();
  const gradient = getTodayGradient();

  const handleShare = async () => {
    const text = `"${verse.text}"\n— ${verse.reference}\n\nvia Way Bible`;
    if (navigator.share) {
      await navigator.share({ title: '오늘의 말씀', text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('클립보드에 복사되었습니다!');
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl">
      <div className={`bg-gradient-to-br ${gradient} px-6 py-10 text-white sm:px-10 sm:py-14`}>
        {/* 장식 원 */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/10" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            오늘의 말씀
          </div>
          <blockquote className="mb-5 text-xl font-bold leading-relaxed sm:text-2xl">
            &ldquo;{verse.text}&rdquo;
          </blockquote>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white/80">
              {verse.reference}
            </p>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <Share2 className="h-3.5 w-3.5" />
              공유
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 2. 계속 읽기 (진행 중인 플랜)
// ============================================================
function ContinueReading() {
  const myPlans = usePlanStore((s) => s.myPlans);

  // 가장 최근 시작한 활성 플랜 찾기
  const activePlan = useMemo(() => {
    const entries = Object.values(myPlans);
    if (entries.length === 0) return null;

    // 가장 최근 시작한 플랜
    const latest = entries.sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )[0];

    const planData = getPlanById(latest.planId);
    if (!planData) return null;

    const completedDays = latest.completedDays?.length || 0;
    const totalDays = planData.totalDays;
    const progress = Math.round((completedDays / totalDays) * 100);
    const currentDay = completedDays + 1;

    return {
      planId: latest.planId,
      title: planData.title,
      currentDay: Math.min(currentDay, totalDays),
      totalDays,
      progress,
      completedDays,
    };
  }, [myPlans]);

  if (!activePlan) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">계속 읽기</h2>
        <Link
          href={`/plans/${activePlan.planId}`}
          className="flex items-center gap-1 text-sm font-semibold text-[--color-accent]"
        >
          상세보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <Link
        href={`/plans/${activePlan.planId}`}
        className="group block rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-lg dark:border-[--color-border] dark:bg-[--color-surface]"
      >
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[--color-accent-light]">
            <CalendarDays className="h-5 w-5 text-[--color-accent]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">{activePlan.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Day {activePlan.currentDay} of {activePlan.totalDays}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--color-accent] text-white transition-transform group-hover:scale-110">
            <Play className="ml-0.5 h-4 w-4" />
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[--color-accent] to-indigo-400 transition-all"
            style={{ width: `${activePlan.progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{activePlan.completedDays}일 완료</span>
          <span className="font-semibold text-[--color-accent]">{activePlan.progress}%</span>
        </div>
      </Link>
    </section>
  );
}

// ============================================================
// 3. 성경읽기 플랜 추천
// ============================================================
function PlanRecommendations() {
  const planCards = useMemo(() => getAllPlanCards(), []);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">읽기 플랜</h2>
        <Link
          href="/plans"
          className="flex items-center gap-1 text-sm font-semibold text-[--color-accent]"
        >
          모두 보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {planCards.map((plan) => (
          <PlanMiniCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}

function PlanMiniCard({ plan }: { plan: PlanCardInfo }) {
  return (
    <Link
      href={`/plans/${plan.id}`}
      className="group flex w-56 shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:shadow-lg dark:border-[--color-border] dark:bg-[--color-surface]"
    >
      {/* 그라데이션 상단 */}
      <div className={`flex h-28 items-center justify-center ${plan.gradient}`}>
        <BookOpen className="h-10 w-10 text-white/80" />
      </div>
      {/* 정보 */}
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[--color-accent]">
          {plan.category}
        </span>
        <h3 className="mb-1 font-bold text-gray-900 dark:text-gray-100 leading-tight">{plan.title}</h3>
        <p className="mt-auto text-xs text-gray-500 dark:text-gray-400">
          {plan.totalDays}일 · {plan.duration}
        </p>
      </div>
    </Link>
  );
}

// ============================================================
// 4. 빠른 성경 접근
// ============================================================
function QuickAccess() {
  const [lastRead, setLastRead] = useState<{ bookName: string; chapter: number; url: string } | null>(null);

  useEffect(() => {
    // localStorage에서 마지막 읽은 위치 복원
    try {
      const stored = localStorage.getItem('way-bible-last-read');
      if (stored) setLastRead(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">성경 읽기</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {/* 이어 읽기 */}
        <Link
          href={lastRead?.url || '/bible/krv/1/1'}
          className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:shadow-lg dark:border-[--color-border] dark:bg-[--color-surface]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <BookMarked className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">이어 읽기</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {lastRead ? `${lastRead.bookName} ${lastRead.chapter}장` : '창세기 1장부터 시작'}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* 성경 책 선택 */}
        <Link
          href="/bible/krv/1/1"
          className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:shadow-lg dark:border-[--color-border] dark:bg-[--color-surface]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">책 선택</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              66권에서 원하는 책을 선택
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

// ============================================================
// 메인 홈페이지
// ============================================================
export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-6 md:py-10">
      {/* 1. 오늘의 말씀 */}
      <VerseOfTheDay />

      {/* 2. 계속 읽기 */}
      <ContinueReading />

      {/* 3. 읽기 플랜 추천 */}
      <PlanRecommendations />

      {/* 4. 빠른 성경 접근 */}
      <QuickAccess />
    </div>
  );
}
