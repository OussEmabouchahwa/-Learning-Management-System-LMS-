import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { http } from '../../../lib/http';
import type { CourseSummary } from '@dars/contracts';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusTag } from '../../../components/ui/StatusTag';

export function CourseCatalogPage() {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: () => http.get<CourseSummary[]>('/courses'),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between border-b border-line pb-4">
        <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em]">
          Courses
        </h1>
        <span className="text-xs font-sans text-board-500">
          {courses?.length ?? 0} available
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col divide-y divide-line bg-chalk-0 border border-line rounded-lg p-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <div className="py-12 text-center text-sm text-board-700">
          Failed to load courses.
        </div>
      ) : !courses || courses.length === 0 ? (
        <div className="py-16 text-center text-sm text-board-500 bg-chalk-0 border border-line rounded-lg">
          No courses published yet.
        </div>
      ) : (
        <div className="bg-chalk-0 border border-line rounded-lg divide-y divide-line">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-chalk-50/50 transition-colors"
            >
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-sans font-medium text-board-900 truncate">
                    {course.title}
                  </h2>
                  <StatusTag variant={course.status === 'PUBLISHED' ? 'published' : 'draft'}>
                    {course.level.toLowerCase()}
                  </StatusTag>
                </div>
                <p className="text-xs font-sans text-board-500 line-clamp-2 max-w-2xl">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-xs font-sans text-board-500 mt-1">
                  <span>{course.instructorName ?? 'Instructor'}</span>
                  <span>•</span>
                  <span>{course.totalLessons} lessons</span>
                  <span>•</span>
                  <span>{course.totalDurationMin} min</span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  to={`/courses/${course.id}/lessons/intro`}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-chalk-0 text-board-900 border border-board-400 font-sans text-sm hover:bg-chalk-100 transition-[background-color,transform] duration-[var(--dur-press)] active:scale-[.97]"
                >
                  View course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
