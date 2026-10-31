import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export const Drawer = RadixDialog.Root;
export const DrawerTrigger = RadixDialog.Trigger;

export function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Content>) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-board-900/40',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'transition-opacity duration-[var(--dur-panel)]',
        )}
      />
      <RadixDialog.Content
        className={cn(
          'fixed inset-y-0 right-0 z-50 h-full',
          'w-full max-w-sm bg-chalk-0 shadow-float',
          'flex flex-col',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'transition-transform duration-[var(--dur-panel)] ease-[var(--ease-drawer)]',
          'focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
        <RadixDialog.Close
          className={cn(
            'absolute right-4 top-4 rounded-sm',
            'text-board-500 opacity-70',
            '[@media(hover:hover)_and_(pointer:fine)]:hover:opacity-100',
            'transition-opacity duration-[var(--dur-base)]',
            'focus:outline-none focus:ring-2 focus:ring-board-900',
          )}
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 px-6 pt-6 pb-4 border-b border-line', className)}
      {...props}
    />
  );
}

export function DrawerTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title
      className={cn('text-lg font-serif font-semibold text-board-900', className)}
      {...props}
    />
  );
}

export function DrawerDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      className={cn('text-sm text-board-500 font-sans', className)}
      {...props}
    />
  );
}

export function DrawerBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto px-6 py-4', className)}
      {...props}
    />
  );
}

export function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 px-6 py-4 border-t border-line',
        className,
      )}
      {...props}
    />
  );
}
