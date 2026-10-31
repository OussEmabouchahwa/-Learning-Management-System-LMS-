import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '../../../lib/http';
import type { SubmissionDetail } from '@dars/contracts';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/Dialog';

export function SubmissionsQueuePage() {
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
  const [points, setPoints] = useState<number>(100);
  const [feedback, setFeedback] = useState<string>('');

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissions-queue'],
    queryFn: async () => {
      return http.get<SubmissionDetail[]>('/grading/queue').catch(() => [] as SubmissionDetail[]);
    },
  });

  const gradeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSubmission) return;
      return http.post(`/grading/submissions/${selectedSubmission.id}`, {
        points,
        feedback,
      });
    },
    onSuccess: () => {
      toast.success('Submission graded');
      setSelectedSubmission(null);
      queryClient.invalidateQueries({ queryKey: ['submissions-queue'] });
    },
    onError: () => {
      toast.error('Failed to submit grade');
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between border-b border-line pb-4">
        <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em]">
          Submissions Queue
        </h1>
        <span className="text-xs font-sans text-board-500">
          {submissions?.length ?? 0} awaiting feedback
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : !submissions || submissions.length === 0 ? (
        <div className="bg-chalk-0 border border-line rounded-lg p-12 text-center text-sm text-board-500">
          No submissions awaiting grading. All caught up!
        </div>
      ) : (
        <div className="bg-chalk-0 border border-line rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line bg-board-100">
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Student</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Assignment</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700">Submitted</th>
                <th className="py-3 px-4 text-xs font-sans font-medium text-board-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-sans text-sm">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-chalk-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-board-900">{sub.studentName}</td>
                  <td className="py-3.5 px-4 text-board-700">{sub.assignmentTitle}</td>
                  <td className="py-3.5 px-4 text-xs text-board-500">
                    {new Date(sub.submittedAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setPoints(100);
                        setFeedback('');
                      }}
                      className="h-8 px-3 rounded-md bg-chalk-0 border border-board-400 text-xs font-sans text-board-900 hover:bg-chalk-100"
                    >
                      Grade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grade Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade submission</DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-board-500">Student</span>
                <span className="text-sm font-medium text-board-900">{selectedSubmission.studentName}</span>
              </div>

              {selectedSubmission.content && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-board-500">Response</span>
                  <p className="text-xs font-sans text-board-700 bg-chalk-100 p-3 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {selectedSubmission.content}
                  </p>
                </div>
              )}

              {selectedSubmission.fileName && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-board-500">Attached file</span>
                  <span className="text-xs font-medium text-board-900 underline">
                    {selectedSubmission.fileName}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label htmlFor="grade-points" className="text-xs font-sans text-board-900">
                  Score
                </label>
                <input
                  id="grade-points"
                  type="number"
                  min={0}
                  max={100}
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="h-9 px-3 rounded bg-chalk-100 border border-board-400 text-sm font-sans w-24"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="grade-feedback" className="text-xs font-sans text-board-900">
                  Feedback (optional)
                </label>
                <textarea
                  id="grade-feedback"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive notes for the student..."
                  className="p-2.5 rounded bg-chalk-100 border border-board-400 text-sm font-sans"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setSelectedSubmission(null)}
              className="h-9 px-4 rounded border border-board-400 text-xs font-sans text-board-900"
            >
              Cancel
            </button>
            <button
              onClick={() => gradeMutation.mutate()}
              disabled={gradeMutation.isPending}
              className="h-9 px-4 rounded bg-pencil-500 text-xs font-sans font-medium text-board-900 hover:bg-pencil-300"
            >
              Submit grade
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
