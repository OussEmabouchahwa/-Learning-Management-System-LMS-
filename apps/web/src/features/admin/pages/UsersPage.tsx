import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '../../../lib/http';
import type { UserListItem } from '@dars/contracts';
import { Role, UserStatus } from '@dars/contracts';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusTag } from '../../../components/ui/StatusTag';

export function UsersPage() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      return http.get<UserListItem[]>('/users').catch(() => [] as UserListItem[]);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      return http.patch(`/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast.success('User role updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Failed to update role');
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between border-b border-line pb-4">
        <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em]">
          Users
        </h1>
        <span className="text-xs font-sans text-board-500">
          {users?.length ?? 0} registered
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !users || users.length === 0 ? (
        <div className="bg-chalk-0 border border-line rounded-lg p-12 text-center text-sm text-board-500">
          No users found.
        </div>
      ) : (
        <div className="bg-chalk-0 border border-line rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line bg-board-100">
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Name</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Email</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Status</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-sans text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-chalk-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-board-900">{u.name}</td>
                  <td className="py-3.5 px-4 text-board-700">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <StatusTag variant={u.status === UserStatus.ACTIVE ? 'published' : 'draft'}>
                      {u.status.toLowerCase()}
                    </StatusTag>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        updateRoleMutation.mutate({
                          userId: u.id,
                          role: e.target.value as Role,
                        })
                      }
                      className="h-8 px-2 rounded border border-board-400 bg-chalk-100 text-xs font-sans text-board-900"
                    >
                      <option value={Role.STUDENT}>STUDENT</option>
                      <option value={Role.INSTRUCTOR}>INSTRUCTOR</option>
                      <option value={Role.ADMIN}>ADMIN</option>
                    </select>
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
