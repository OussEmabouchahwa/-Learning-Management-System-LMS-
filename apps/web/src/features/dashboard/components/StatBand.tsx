import type { DashboardStats } from '@dars/contracts';
import { dashboardCopy } from '../copy';

interface StatBandProps {
  stats: DashboardStats;
}

export function StatBand({ stats }: StatBandProps) {
  const c = dashboardCopy.stats;

  return (
    <div className="bg-chalk-0 border border-line rounded-lg grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line">
      {/* Cell 1: Average grade */}
      <div className="p-5 flex flex-col gap-1">
        <span className="text-xs font-sans text-board-500 font-medium">
          {c.averageGrade}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-serif font-semibold text-board-900 text-[1.75rem] leading-none tabular-nums">
            {stats.averageGradePct.toFixed(1)}
          </span>
          <span className="text-xs font-sans text-board-500">
            {c.outOf100}
          </span>
        </div>
      </div>

      {/* Cell 2: Submitted */}
      <div className="p-5 flex flex-col gap-1">
        <span className="text-xs font-sans text-board-500 font-medium">
          {c.submitted}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-serif font-semibold text-board-900 text-[1.75rem] leading-none tabular-nums">
            {stats.submittedAssignmentsCount}
          </span>
          <span className="text-xs font-sans text-board-500">
            {c.ofAssignments(stats.totalAssignmentsCount)}
          </span>
        </div>
      </div>

      {/* Cell 3: Awaiting feedback */}
      <div className="p-5 flex flex-col gap-1">
        <span className="text-xs font-sans text-board-500 font-medium">
          {c.awaitingFeedback}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-serif font-semibold text-board-900 text-[1.75rem] leading-none tabular-nums">
            {stats.awaitingFeedbackCount}
          </span>
          <span className="text-xs font-sans text-board-500">
            {stats.oldestFeedbackDays
              ? c.oldestSentDays(stats.oldestFeedbackDays)
              : c.noneAwaiting}
          </span>
        </div>
      </div>
    </div>
  );
}
