interface PlanProgressProps {
    currentDay: number;
    totalDays: number;
    completedDays: number[];
}

export default function PlanProgress({ currentDay, totalDays, completedDays }: PlanProgressProps) {
    const percentage = Math.round((completedDays.length / totalDays) * 100);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            {/* 진행률 바 */}
            <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-200">진행률</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{percentage}%</span>
            </div>
            <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* 현황 */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Day {currentDay} / {totalDays}</span>
                <span>{completedDays.length}일 완료</span>
            </div>

            {/* 일별 체크 그리드 */}
            <div className="mt-4 grid grid-cols-7 gap-1">
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                    const isCompleted = completedDays.includes(day);
                    const isCurrent = day === currentDay;
                    return (
                        <div
                            key={day}
                            className={`flex h-8 w-full items-center justify-center rounded text-xs font-medium ${isCompleted
                                    ? 'bg-indigo-600 text-white'
                                    : isCurrent
                                        ? 'border-2 border-indigo-400 text-indigo-600 dark:text-indigo-400'
                                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                }`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
