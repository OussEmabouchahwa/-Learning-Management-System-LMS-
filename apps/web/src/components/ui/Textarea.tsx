import { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { Field, useFieldId } from './Field';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  errorText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, errorText, required, className, id: idProp, ...props }, ref) => {
    const generatedId = useFieldId('textarea');
    const id = idProp ?? generatedId;
    const hasError = Boolean(errorText);

    return (
      <Field
        label={label}
        htmlFor={id}
        helperText={helperText}
        errorText={errorText}
        required={required}
      >
        <textarea
          ref={ref}
          id={id}
          required={required}
          aria-invalid={hasError || undefined}
          className={cn(
            'block w-full rounded-md bg-chalk-100 px-3 py-2',
            'text-sm text-board-900 font-sans',
            'border border-board-400',
            'placeholder:text-board-400',
            'resize-y min-h-24',
            'transition-[border-color,box-shadow] duration-[var(--dur-base)]',
            'focus:outline-none focus:border-board-900 focus:ring-2 focus:ring-board-900 focus:ring-offset-0',
            hasError && 'border-redpen-600 focus:ring-redpen-600',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />
      </Field>
    );
  },
);
Textarea.displayName = 'Textarea';
