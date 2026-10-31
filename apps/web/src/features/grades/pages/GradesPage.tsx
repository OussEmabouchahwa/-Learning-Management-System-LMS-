import { useQuery } from '@tanstack/react-query';
import { http } from '../../../lib/http';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusTag } from '../../../components/ui/StatusTag';

interface GradeItem {
  id: string;
  courseTitle: string;
  itemTitle: string;
  type: 'ASSIGNMENT' | 'QUIZ';
  score: number;
  maxScore: number;
  submittedAt: string;
  passed: boolean;
}

export function GradesPage() {
  const { data: grades, isLoading } = useQuery({
    queryKey: ['my-grades'],
    queryFn: async () => {
      return http.get<GradeItem[]>('/me/grades').catch(() => [] as GradeItem[]);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between border-b border-line pb-4">
        <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em]">
          Grades
        </h1>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !grades || grades.length === 0 ? (
        <div className="bg-chalk-0 border border-line rounded-lg p-12 text-center text-sm text-board-500">
          No graded submissions or quizzes yet.
        </div>
      ) : (
        <div className="bg-chalk-0 border border-line rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line bg-board-100">
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Course</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Item</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Type</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700 text-right">Score</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-sans text-sm">
              {grades.map((g) => (
                <tr key={g.id} className="hover:bg-chalk-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-board-900">{g.courseTitle}</td>
                  <td className="py-3.5 px-4 text-board-700">{g.itemTitle}</td>
                  <td className="py-3.5 px-4 text-xs text-board-500">{g.type}</td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-board-900">
                    {g.score} / {g.maxScore}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <StatusTag variant={g.passed ? 'passed' : 'neutral'}>
                      {g.passed ? 'Passed' : 'Completed'}
                    </StatusTag>
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
