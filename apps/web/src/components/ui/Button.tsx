import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantCls: Record<Variant, string> = {
  primary:
    'bg-pencil-500 text-board-900 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-pencil-300 active:scale-[.97] font-medium',
  secondary:
    'bg-chalk-0 text-board-900 border border-board-400 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-chalk-100 active:scale-[.97]',
  destructive:
    'bg-redpen-600 text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-redpen-600/90 active:scale-[.97]',
  ghost:
    'bg-transparent text-board-700 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-chalk-100 active:scale-[.97]',
};

const sizeCls: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, className, children, disabled, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-sans',
        'transition-[background-color,transform,opacity] duration-[var(--dur-press)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-900 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
        variantCls[variant],
        sizeCls[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
