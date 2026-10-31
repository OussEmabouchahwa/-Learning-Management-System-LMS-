import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Field, useFieldId } from './Field';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

export function Select({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  helperText,
  errorText,
  required,
  disabled,
  id: idProp,
}: SelectProps) {
  const generatedId = useFieldId('select');
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
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          id={id}
          aria-invalid={hasError || undefined}
          className={cn(
            'flex w-full items-center justify-between rounded-md bg-chalk-100 px-3 py-2',
            'text-sm text-board-900 font-sans',
            'border border-board-400',
            'transition-[border-color,box-shadow] duration-[var(--dur-base)]',
            'focus:outline-none focus:border-board-900 focus:ring-2 focus:ring-board-900 focus:ring-offset-0',
            hasError && 'border-redpen-600 focus:ring-redpen-600',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'data-[placeholder]:text-board-400',
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown className="h-4 w-4 text-board-500" aria-hidden="true" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            className={cn(
              'z-50 min-w-[8rem] overflow-hidden rounded-md bg-chalk-0 shadow-float',
              'border border-line',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            )}
            position="popper"
            sideOffset={4}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    'relative flex cursor-default select-none items-center rounded-sm px-3 py-2 pr-8',
                    'text-sm text-board-900 font-sans',
                    'outline-none',
                    '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-chalk-100',
                    'focus:bg-chalk-100',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  )}
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-2 inline-flex items-center">
                    <Check className="h-4 w-4 text-board-900" aria-hidden="true" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </Field>
  );
}
