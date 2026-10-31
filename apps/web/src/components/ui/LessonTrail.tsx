import { cn } from '../../lib/cn';

interface Milestone {
  position: number;
  label: string;
}

interface LessonTrailProps {
  total: number;
  completed: number;
  current: number;
  milestones?: Milestone[];
  compact?: boolean;
  percent?: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function LessonTrail({
  total,
  completed,
  current,
  milestones,
  compact,
  percent,
}: LessonTrailProps) {
  const safeTotal = Math.max(1, total);
  const safeCompleted = clamp(completed, 0, safeTotal);
  const safeCurrent = clamp(current, 1, safeTotal);

  const ariaLabel = `${safeCompleted} of ${safeTotal} lessons completed, currently on lesson ${safeCurrent}`;

  const nextMilestone = milestones
    ?.filter((m) => m.position > safeCompleted)
    .sort((a, b) => a.position - b.position)[0];

  const segmentHeight = compact ? 'h-1.5' : 'h-2';
  const segmentGap = 'gap-[3px]';

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        role="img"
        aria-label={ariaLabel}
        className={cn('flex w-full', segmentGap)}
      >
        {Array.from({ length: safeTotal }).map((_, idx) => {
          const lessonNumber = idx + 1;
          const isDone = lessonNumber <= safeCompleted;
          const isCurrent = lessonNumber === safeCurrent && !isDone;

          return (
            <div
              key={idx}
              className={cn(
                'flex-1 rounded-full transition-[background-color] duration-[var(--dur-base)]',
                segmentHeight,
                isDone && 'bg-board-700',
                isCurrent && 'bg-pencil-500 ring-2 ring-pencil-100 ring-offset-1',
                !isDone && !isCurrent && 'bg-board-200',
              )}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {compact ? (
        percent !== undefined && (
          <span className="text-xs font-sans text-board-500 tabular-nums">
            {Math.round(percent)}%
          </span>
        )
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-xs font-sans text-board-500">
            {safeCompleted} of {safeTotal} lessons completed
          </span>
          {nextMilestone && (
            <span className="text-xs font-sans text-board-500">
              {nextMilestone.label} after lesson {nextMilestone.position}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
