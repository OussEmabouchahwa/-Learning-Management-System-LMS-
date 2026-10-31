import { Link } from 'react-router-dom';
import type { DueSoonItem } from '@dars/contracts';
import { dashboardCopy } from '../copy';
import { cn } from '../../../lib/cn';

interface DueListProps {
  items: DueSoonItem[];
}

export function DueList({ items }: DueListProps) {
  const c = dashboardCopy.dueSoon;

  const getBadgeClass = (variant: DueSoonItem['badgeVariant']) => {
    switch (variant) {
      case 'soon':
      case 'urgent':
        return 'bg-pencil-100 text-pencil-700';
      case 'submitted':
        return 'bg-chalk-100 text-board-700';
      case 'default':
      default:
        return 'bg-board-100 text-board-700';
    }
  };

  return (
    <div className="bg-chalk-0 border border-line rounded-lg p-5 flex flex-col gap-4">
      <h3 className="font-serif font-semibold text-board-900 text-[1.1875rem] leading-tight">
        {c.title}
      </h3>

      {items.length === 0 ? (
        <p className="text-sm font-sans text-board-500 py-4">{c.empty}</p>
      ) : (
        <div className="divide-y divide-line">
          {items.map((item) => {
            const linkHref =
              item.type === 'QUIZ'
                ? `/courses/active/quizzes/${item.id}`
                : `/assignments/${item.id}`;

            return (
              <div
                key={item.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
              >
                <div className="flex flex-col gap-0.5">
                  <Link
                    to={linkHref}
                    className="text-sm font-sans font-medium text-board-900 hover:text-pencil-700 transition-colors"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs font-sans text-board-500">
                    {item.type === 'QUIZ' ? 'Quiz' : 'Assignment'}, {item.courseTitle}, {item.dueAt}
                    {item.durationMinutes ? `. ${c.minutes(item.durationMinutes)}` : ''}
                  </p>
                </div>

                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-sans font-medium flex-shrink-0 self-center',
                    getBadgeClass(item.badgeVariant),
                  )}
                >
                  {item.badgeText}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
