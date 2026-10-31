import { useDashboard } from '../hooks/useDashboard';
import { ResumePanel } from '../components/ResumePanel';
import { StatBand } from '../components/StatBand';
import { DueList } from '../components/DueList';
import { MyCourses } from '../components/MyCourses';
import { Skeleton } from '../../../components/ui/Skeleton';
import { dashboardCopy } from '../copy';

export function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const c = dashboardCopy;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center flex flex-col items-center gap-3">
        <p className="text-board-700 text-sm">Failed to load dashboard data.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs font-sans font-medium text-pencil-700 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-baseline justify-between border-b border-line pb-4">
        <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em]">
          {c.title}
        </h1>
        <span className="text-xs font-sans text-board-500">
          {data.dateFormatted}
        </span>
      </div>

      {/* Focal Element: Resume Panel */}
      {data.resume && <ResumePanel resume={data.resume} />}

      {/* KPI Band */}
      <StatBand stats={data.stats} />

      {/* 2-column Grid: Due Soon & My Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DueList items={data.dueSoon} />
        <MyCourses courses={data.courses} />
      </div>
    </div>
  );
}
