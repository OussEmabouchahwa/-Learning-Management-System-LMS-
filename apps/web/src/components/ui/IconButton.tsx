import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  size?: 'sm' | 'md';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        'bg-transparent text-board-700',
        '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-chalk-100',
        'pointer-coarse:h-11 pointer-coarse:w-11',
        size === 'sm' ? 'h-9 w-9' : 'h-10 w-10',
        'transition-[background-color,opacity] duration-[var(--dur-press)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-900 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
IconButton.displayName = 'IconButton';
