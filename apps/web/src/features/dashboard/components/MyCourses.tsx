import { Link } from 'react-router-dom';
import type { DashboardCourseItem } from '@dars/contracts';
import { LessonTrail } from '../../../components/ui/LessonTrail';
import { dashboardCopy } from '../copy';

interface MyCoursesProps {
  courses: DashboardCourseItem[];
}

export function MyCourses({ courses }: MyCoursesProps) {
  const c = dashboardCopy.myCourses;

  return (
    <div className="bg-chalk-0 border border-line rounded-lg p-5 flex flex-col gap-4">
      <h3 className="font-serif font-semibold text-board-900 text-[1.1875rem] leading-tight">
        {c.title}
      </h3>

      {courses.length === 0 ? (
        <p className="text-sm font-sans text-board-500 py-4">{c.empty}</p>
      ) : (
        <div className="divide-y divide-line">
          {courses.map((course) => (
            <div
              key={course.id}
              className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <Link
                  to={`/courses`}
                  className="text-sm font-sans font-medium text-board-900 hover:text-pencil-700 transition-colors truncate"
                >
                  {course.title}
                </Link>
                <p className="text-xs font-sans text-board-500 truncate">
                  {course.nextLessonTitle
                    ? `${c.nextPrefix}${course.nextLessonTitle}`
                    : course.statusBadge
                      ? 'Completed final quiz'
                      : 'Course in progress'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-32 flex-shrink-0 justify-end">
                {course.statusBadge ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-sans font-medium bg-leaf-100 text-leaf-600">
                    {course.statusBadge}
                  </span>
                ) : (
                  <div className="w-24">
                    <LessonTrail
                      compact
                      total={course.totalLessons}
                      completed={course.completedLessons}
                      current={course.completedLessons + 1}
                      percent={course.progressPct}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
