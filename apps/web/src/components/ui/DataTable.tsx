import { cn } from '../../lib/cn';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

type Align = 'left' | 'right' | 'center';

export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: Align;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
  className?: string;
  skeletonRows?: number;
}

const alignCls: Record<Align, string> = {
  left: 'text-left',
  right: 'text-right tabular-nums',
  center: 'text-center',
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyMessage = 'No data available.',
  stickyHeader,
  className,
  skeletonRows = 5,
}: DataTableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm font-sans">
        <thead
          className={cn(
            'bg-board-100',
            stickyHeader && 'sticky top-0 z-10',
          )}
        >
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-2 text-xs font-medium text-board-500 tracking-wide',
                  'first-letter:uppercase lowercase',
                  alignCls[col.align ?? 'left'],
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                <tr key={rowIdx} className="border-b border-line">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            : data.length === 0
              ? (
                  <tr>
                    <td colSpan={columns.length}>
                      <EmptyState message={emptyMessage} />
                    </td>
                  </tr>
                )
              : data.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={cn(
                      'border-b border-line',
                      '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-chalk-50',
                      'transition-colors duration-[var(--dur-base)]',
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-board-900',
                          alignCls[col.align ?? 'left'],
                        )}
                      >
                        {col.render
                          ? col.render(row[col.key] as T[keyof T], row)
                          : String(row[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
        </tbody>
      </table>
    </div>
  );
}
