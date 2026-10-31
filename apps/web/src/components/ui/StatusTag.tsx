import { cn } from '../../lib/cn';

type StatusTagVariant =
  | 'draft'
  | 'published'
  | 'graded'
  | 'passed'
  | 'due-soon'
  | 'overdue'
  | 'failed'
  | 'archived'
  | 'neutral'
  | 'submitted';

interface StatusTagProps {
  variant: StatusTagVariant;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

const variantCls: Record<StatusTagVariant, string> = {
  draft: 'bg-board-100 text-board-700',
  published: 'bg-leaf-100 text-leaf-600',
  graded: 'bg-leaf-100 text-leaf-600',
  passed: 'bg-leaf-100 text-leaf-600',
  'due-soon': 'bg-pencil-100 text-pencil-700',
  overdue: 'bg-redpen-100 text-redpen-600',
  failed: 'bg-redpen-100 text-redpen-600',
  archived: 'bg-board-100 text-board-500',
  neutral: 'bg-chalk-100 text-board-700',
  submitted: 'bg-chalk-100 text-board-700',
};

export function StatusTag({ variant, label, children, className }: StatusTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 rounded-full font-sans font-medium',
        'text-xs leading-none h-[22px]',
        variantCls[variant],
        className,
      )}
    >
      {children ?? label}
    </span>
  );
}
