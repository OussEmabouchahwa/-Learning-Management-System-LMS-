import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '../../lib/cn';

export const Tabs = RadixTabs.Root;

export function TabsList({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn(
        'flex border-b border-line gap-0',
        className,
      )}
      {...props}
    >
      {children}
    </RadixTabs.List>
  );
}

export function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'relative px-4 py-2 text-sm font-medium font-sans text-board-500',
        'transition-[color] duration-[var(--dur-base)]',
        'outline-none',
        '[@media(hover:hover)_and_(pointer:fine)]:hover:text-board-900',
        'focus-visible:ring-2 focus-visible:ring-board-900 focus-visible:ring-inset',
        // Active underline
        'data-[state=active]:text-board-900',
        'data-[state=active]:after:absolute data-[state=active]:after:inset-x-0',
        'data-[state=active]:after:bottom-[-1px] data-[state=active]:after:h-0.5',
        'data-[state=active]:after:bg-board-900 data-[state=active]:after:rounded-t-full',
        className,
      )}
      {...props}
    >
      {children}
    </RadixTabs.Trigger>
  );
}

export const TabsContent = RadixTabs.Content;
