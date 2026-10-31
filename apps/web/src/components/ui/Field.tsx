import { useId } from 'react';
import { cn } from '../../lib/cn';

interface FieldProps {
  label: string;
  htmlFor?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function useFieldId(prefix?: string): string {
  const id = useId();
  return prefix ? `${prefix}-${id}` : id;
}

export function Field({
  label,
  htmlFor,
  helperText,
  errorText,
  required,
  children,
  className,
}: FieldProps) {
  const descId = useId();
  const hasError = Boolean(errorText);
  const hasHelper = Boolean(helperText);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-board-900 font-sans"
      >
        {label}
        {required && (
          <span className="text-redpen-600 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Inject aria-describedby and aria-invalid onto child via clone */}
      <div
        aria-describedby={hasError || hasHelper ? descId : undefined}
      >
        {children}
      </div>

      {(hasError || hasHelper) && (
        <p
          id={descId}
          className={cn(
            'text-xs font-sans',
            hasError ? 'text-redpen-600' : 'text-board-500',
          )}
          role={hasError ? 'alert' : undefined}
        >
          {hasError ? errorText : helperText}
        </p>
      )}
    </div>
  );
}
