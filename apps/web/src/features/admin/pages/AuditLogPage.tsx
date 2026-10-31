import { useQuery } from '@tanstack/react-query';
import { http } from '../../../lib/http';
import type { AuditLogItem } from '@dars/contracts';
import { Skeleton } from '../../../components/ui/Skeleton';

export function AuditLogPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      return http.get<AuditLogItem[]>('/admin/audit').catch(() => [] as AuditLogItem[]);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between border-b border-line pb-4">
        <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em]">
          Audit Log
        </h1>
        <span className="text-xs font-sans text-board-500">
          Security events and system actions
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !logs || logs.length === 0 ? (
        <div className="bg-chalk-0 border border-line rounded-lg p-12 text-center text-sm text-board-500">
          No audit records found.
        </div>
      ) : (
        <div className="bg-chalk-0 border border-line rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line bg-board-100">
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Timestamp</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Action</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Actor</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Target</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Request ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-sans text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-chalk-50/60 transition-colors">
                  <td className="py-3 px-4 text-board-500 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-board-900">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-board-700">
                    {log.actorName ?? log.actorEmail ?? log.actorId}
                  </td>
                  <td className="py-3 px-4 text-board-500 font-mono">
                    {log.targetType}:{log.targetId}
                  </td>
                  <td className="py-3 px-4 text-board-500 font-mono truncate max-w-xs">
                    {log.requestId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
