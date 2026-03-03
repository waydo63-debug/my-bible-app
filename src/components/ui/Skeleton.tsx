'use client';

// ============================================================
// 재사용 가능한 스켈레톤 컴포넌트
// ============================================================

export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`skeleton ${className}`} {...props} />;
}

/** 텍스트 줄 스켈레톤 */
export function SkeletonLine({ width = '100%' }: { width?: string }) {
    return <Skeleton className="h-4" style={{ width }} />;
}

/** 카드 형태 스켈레톤 */
export function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-[--color-border] dark:bg-[--color-surface]">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <SkeletonLine width="60%" />
                    <SkeletonLine width="40%" />
                </div>
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
        </div>
    );
}

/** 읽기 목록 스켈레톤 */
export function SkeletonReadingList() {
    return (
        <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 dark:border-[--color-border] dark:bg-[--color-surface]"
                >
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="flex-1 space-y-1.5">
                        <SkeletonLine width="50%" />
                        <SkeletonLine width="30%" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/** 큰 히어로 스켈레톤 */
export function SkeletonHero() {
    return (
        <Skeleton className="h-48 w-full rounded-3xl sm:h-56" />
    );
}
