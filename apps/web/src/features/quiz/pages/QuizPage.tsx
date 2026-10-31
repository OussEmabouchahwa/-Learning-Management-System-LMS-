import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { http } from '../../../lib/http';
import type { QuizAttemptDetail } from '@dars/contracts';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { cn } from '../../../lib/cn';

export function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Fetch or start attempt
  const { data: attempt, isLoading, refetch } = useQuery({
    queryKey: ['quiz-attempt', quizId],
    queryFn: async () => {
      return http.post<QuizAttemptDetail>(`/quizzes/${quizId}/attempts`, {});
    },
    enabled: !!quizId,
  });

  // Init answers
  useEffect(() => {
    if (attempt?.savedAnswers) {
      setAnswers(attempt.savedAnswers);
    }
  }, [attempt]);

  // Timer calculation
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!attempt || attempt.status === 'SUBMITTED') return;

    const deadline = new Date(attempt.deadline).getTime();

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      if (remaining === 600) setAnnouncement('10 minutes remaining');
      if (remaining === 300) setAnnouncement('5 minutes remaining');
      if (remaining === 60) setAnnouncement('1 minute remaining');

      if (remaining <= 0) {
        handleSubmitQuiz();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [attempt]);

  // Autosave answers
  const saveAnswersMutation = useMutation({
    mutationFn: async (updatedAnswers: Record<string, string[]>) => {
      if (!attempt) return;
      await http.patch(`/quizzes/${quizId}/attempts/${attempt.id}/answers`, {
        answers: updatedAnswers,
      });
      const now = new Date();
      setLastSaved(now.toLocaleTimeString());
    },
  });

  const handleSelectOption = (questionId: string, optionId: string, isSingle: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      let updated: string[];

      if (isSingle) {
        updated = [optionId];
      } else {
        updated = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      }

      const nextState = { ...prev, [questionId]: updated };
      saveAnswersMutation.mutate(nextState);
      return nextState;
    });
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!attempt) return;
      return http.post<QuizAttemptDetail>(`/quizzes/${quizId}/attempts/${attempt.id}/submit`, {});
    },
    onSuccess: () => {
      toast.success('Quiz submitted');
      refetch();
    },
    onError: () => {
      toast.error('Failed to submit quiz');
    },
  });

  const handleSubmitQuiz = () => {
    setSubmitConfirmOpen(false);
    submitMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="py-16 text-center">
        <p className="text-board-700 text-sm mb-4">Quiz not found.</p>
        <button onClick={() => navigate(-1)} className="text-xs text-pencil-700 underline">
          Go back
        </button>
      </div>
    );
  }

  // Results screen if submitted
  if (attempt.status === 'SUBMITTED') {
    const isPassed = attempt.passed ?? false;
    return (
      <div className="max-w-xl mx-auto py-8 flex flex-col gap-6">
        <div className="bg-chalk-0 border border-line rounded-lg p-6 flex flex-col items-center text-center gap-4">
          {isPassed ? (
            <CheckCircle2 size={48} className="text-leaf-600" aria-hidden />
          ) : (
            <XCircle size={48} className="text-redpen-600" aria-hidden />
          )}

          <h1 className="font-serif font-semibold text-board-900 text-2xl">
            {attempt.quizTitle}
          </h1>

          <div className="flex items-baseline gap-2">
            <span className="font-serif font-semibold text-board-900 text-4xl tabular-nums">
              {attempt.score ?? 0}
            </span>
            <span className="text-board-500 text-sm">points</span>
          </div>

          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-sans font-medium',
              isPassed ? 'bg-leaf-100 text-leaf-600' : 'bg-redpen-100 text-redpen-600',
            )}
          >
            {isPassed ? 'Passed' : 'Not passed'}
          </span>

          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 h-11 px-5 rounded-md bg-chalk-0 text-board-900 border border-board-400 font-sans text-sm hover:bg-chalk-100 transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const questions = attempt.questions;
  const currentQ = questions[activeQuestionIdx];
  const unansweredCount = questions.filter((q) => !(answers[q.id]?.length > 0)).length;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col gap-6">
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Top Bar: Back, Title, Timer, Autosave */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-sans text-board-500 hover:text-board-900"
        >
          <ArrowLeft size={14} aria-hidden />
          Exit
        </button>

        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-xs font-sans text-board-500">
              Saved {lastSaved}
            </span>
          )}
          {secondsRemaining !== null && (
            <div
              className={cn(
                'inline-flex items-center gap-1.5 font-mono text-sm px-2.5 py-1 rounded',
                secondsRemaining <= 60
                  ? 'bg-redpen-100 text-redpen-600 font-medium'
                  : 'bg-chalk-100 text-board-900',
              )}
            >
              <Clock size={14} aria-hidden />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Segment Strip Navigator */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-sans text-board-500">
          <span>Question {activeQuestionIdx + 1} of {questions.length}</span>
          <span>{questions.length - unansweredCount} of {questions.length} answered</span>
        </div>
        <div className="flex gap-1 h-2.5 w-full">
          {questions.map((q, idx) => {
            const hasAnswer = (answers[q.id]?.length ?? 0) > 0;
            const isCurr = idx === activeQuestionIdx;
            return (
              <button
                key={q.id}
                onClick={() => setActiveQuestionIdx(idx)}
                aria-label={`Go to question ${idx + 1}`}
                className={cn(
                  'flex-1 rounded-sm transition-all',
                  isCurr
                    ? 'bg-pencil-500 ring-2 ring-pencil-100 ring-offset-1'
                    : hasAnswer
                      ? 'bg-board-700'
                      : 'bg-board-200',
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Current Question */}
      {currentQ && (
        <div className="bg-chalk-0 border border-line rounded-lg p-6 flex flex-col gap-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-serif font-semibold text-board-900 text-lg leading-tight">
              {currentQ.prompt}
            </h2>
            <span className="text-xs font-sans text-board-500 flex-shrink-0 tabular-nums">
              {currentQ.points} {currentQ.points === 1 ? 'pt' : 'pts'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentQ.id]?.includes(opt.id);
              const isSingle = currentQ.type === 'SINGLE_CHOICE';

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.id, isSingle)}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-md border text-left font-sans text-sm transition-[background-color,border-color]',
                    isSelected
                      ? 'bg-pencil-100/50 border-pencil-500 text-board-900 font-medium'
                      : 'bg-chalk-100 border-board-400 text-board-900 hover:bg-chalk-100/80',
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 flex items-center justify-center border transition-colors',
                      isSingle ? 'rounded-full' : 'rounded',
                      isSelected ? 'border-pencil-500 bg-pencil-500' : 'border-board-400',
                    )}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-board-900" />}
                  </div>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
          disabled={activeQuestionIdx === 0}
          className="h-10 px-4 rounded-md bg-chalk-0 text-board-900 border border-board-400 font-sans text-sm disabled:opacity-40"
        >
          Previous
        </button>

        {activeQuestionIdx < questions.length - 1 ? (
          <button
            onClick={() => setActiveQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1))}
            className="h-10 px-4 rounded-md bg-chalk-0 text-board-900 border border-board-400 font-sans text-sm hover:bg-chalk-100"
          >
            Next question
          </button>
        ) : (
          <button
            onClick={() => setSubmitConfirmOpen(true)}
            className="h-11 px-5 rounded-md bg-pencil-500 text-board-900 font-sans font-medium text-sm hover:bg-pencil-300"
          >
            Submit quiz
          </button>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit quiz?</DialogTitle>
            <DialogDescription>
              {unansweredCount > 0
                ? `You still have ${unansweredCount} unanswered question(s). Are you sure you want to hand in your quiz?`
                : 'All questions have been answered. Ready to submit?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setSubmitConfirmOpen(false)}
              className="h-10 px-4 rounded-md bg-chalk-0 border border-board-400 text-board-900 text-sm font-sans"
            >
              Keep working
            </button>
            <button
              onClick={handleSubmitQuiz}
              disabled={submitMutation.isPending}
              className="h-10 px-4 rounded-md bg-pencil-500 text-board-900 text-sm font-sans font-medium hover:bg-pencil-300"
            >
              Yes, submit now
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
