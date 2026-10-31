import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { http } from '../../../lib/http';
import type { SubmissionDetail } from '@dars/contracts';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusTag } from '../../../components/ui/StatusTag';

export function AssignmentPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [textSubmission, setTextSubmission] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch assignment & existing submission
  const { data: assignmentData, isLoading, refetch } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      // Endpoint provides assignment details and user's current submission
      return http.get<{
        assignment: {
          id: string;
          title: string;
          description: string;
          dueAt: string;
          maxPoints: number;
          allowLate: boolean;
          submissionType: 'TEXT' | 'FILE' | 'BOTH';
        };
        submission?: SubmissionDetail;
      }>(`/assignments/${assignmentId}`);
    },
    enabled: !!assignmentId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      let fileKey = undefined;
      let fileName = undefined;
      let fileSizeBytes = undefined;

      // Handle file upload if present
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'}/files/upload`,
          {
            method: 'POST',
            body: formData,
            credentials: 'include',
          },
        );

        if (!uploadRes.ok) {
          throw new Error('File upload failed');
        }

        const uploadJson = await uploadRes.json();
        fileKey = uploadJson.data.key;
        fileName = selectedFile.name;
        fileSizeBytes = selectedFile.size;
      }

      return http.post<SubmissionDetail>(`/assignments/${assignmentId}/submissions`, {
        content: textSubmission || undefined,
        fileKey,
        fileName,
        fileSizeBytes,
      });
    },
    onSuccess: () => {
      toast.success('Assignment submitted');
      refetch();
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Failed to submit assignment';
      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!assignmentData) {
    return (
      <div className="py-16 text-center">
        <p className="text-board-700 text-sm mb-4">Assignment not found.</p>
        <button onClick={() => navigate(-1)} className="text-xs text-pencil-700 underline">
          Go back
        </button>
      </div>
    );
  }

  const { assignment, submission } = assignmentData;
  const isGraded = submission?.status === 'GRADED';

  return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col gap-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-sans text-board-500 hover:text-board-900"
        >
          <ArrowLeft size={14} aria-hidden />
          Back
        </button>
      </div>

      {/* Assignment Header */}
      <div className="flex flex-col gap-2 border-b border-line pb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-sans text-board-500">
            Due {new Date(assignment.dueAt).toLocaleDateString()} • {assignment.maxPoints} points
          </span>
          {submission && (
            <StatusTag variant={isGraded ? 'graded' : 'submitted'}>
              {submission.status.toLowerCase()}
            </StatusTag>
          )}
        </div>
        <h1 className="font-serif font-semibold text-board-900 text-2xl">
          {assignment.title}
        </h1>
        <p className="text-sm font-sans text-board-700 whitespace-pre-wrap">
          {assignment.description}
        </p>
      </div>

      {/* Grade Feedback Card (if graded) */}
      {isGraded && (
        <section
          aria-label="Grade feedback"
          className="bg-chalk-0 border border-line rounded-lg p-6 flex flex-col gap-4"
        >
          <h2 className="text-xs font-sans text-board-500 font-medium">Feedback and score</h2>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-semibold text-board-900 text-3xl tabular-nums">
              {submission.points ?? submission.rawPoints}
            </span>
            <span className="text-board-500 text-sm">out of {assignment.maxPoints}</span>
          </div>

          {submission.feedback && (
            <div className="bg-chalk-50 border border-line rounded p-4 text-sm font-serif text-board-900">
              {submission.feedback}
            </div>
          )}

          {submission.gradedAt && (
            <span className="text-xs font-sans text-board-500">
              Graded on {new Date(submission.gradedAt).toLocaleDateString()}
            </span>
          )}
        </section>
      )}

      {/* Receipt Card (if already submitted) */}
      {submission && (
        <section
          aria-label="Submission receipt"
          className="bg-chalk-0 border border-line rounded-lg p-5 flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 text-leaf-600 text-sm font-medium">
            <CheckCircle2 size={18} aria-hidden />
            <span>Submission received</span>
          </div>
          <div className="text-xs font-sans text-board-500 flex flex-col gap-1">
            <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
            {submission.fileName && (
              <span>
                File: {submission.fileName} ({Math.round((submission.fileSizeBytes ?? 0) / 1024)} KB)
              </span>
            )}
          </div>
          {submission.content && (
            <p className="text-sm font-sans text-board-700 bg-chalk-100 p-3 rounded border border-line whitespace-pre-wrap">
              {submission.content}
            </p>
          )}
        </section>
      )}

      {/* Submission Form (if not graded) */}
      {!isGraded && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMutation.mutate();
          }}
          className="bg-chalk-0 border border-line rounded-lg p-6 flex flex-col gap-5"
        >
          <h2 className="font-serif font-semibold text-board-900 text-lg">
            {submission ? 'Resubmit assignment' : 'Hand in assignment'}
          </h2>

          {/* Text option */}
          {(assignment.submissionType === 'TEXT' || assignment.submissionType === 'BOTH') && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="submission-text" className="text-sm font-sans text-board-900">
                Written response
              </label>
              <textarea
                id="submission-text"
                rows={5}
                value={textSubmission}
                onChange={(e) => setTextSubmission(e.target.value)}
                placeholder="Type your response here..."
                className="p-3 rounded-md bg-chalk-100 border border-board-400 text-board-900 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-board-900"
              />
            </div>
          )}

          {/* File option */}
          {(assignment.submissionType === 'FILE' || assignment.submissionType === 'BOTH') && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-sans text-board-900">Attach file</span>
              <p className="text-xs font-sans text-board-500">
                PDF, ZIP, PNG, or JPG up to 10MB
              </p>
              <label
                htmlFor="file-dropzone"
                className="mt-1 border-2 border-dashed border-board-400 rounded-md p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-chalk-50 transition-colors"
              >
                <Upload size={24} className="text-board-500" aria-hidden />
                <span className="text-sm font-sans text-board-700">
                  {selectedFile ? selectedFile.name : 'Click to select a file'}
                </span>
                <input
                  id="file-dropzone"
                  type="file"
                  className="sr-only"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  accept=".pdf,.zip,.png,.jpg,.jpeg"
                />
              </label>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitMutation.isPending || (!textSubmission && !selectedFile)}
              className="h-11 px-6 rounded-md bg-pencil-500 text-board-900 font-sans font-medium text-sm transition-[background-color,transform] duration-[var(--dur-press)] hover:bg-pencil-300 active:scale-[.97] disabled:opacity-50 flex items-center gap-2"
            >
              <FileText size={16} aria-hidden />
              {submitMutation.isPending ? 'Submitting...' : 'Hand in'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
