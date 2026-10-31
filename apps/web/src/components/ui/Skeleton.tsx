import { cn } from '../../lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-chalk-100', className)}
      aria-hidden="true"
    />
  );
}
