import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { http } from '../../../lib/http';
import type { LessonDetail } from '@dars/contracts';
import { Markdown } from '../../../components/ui/Markdown';
import { Skeleton } from '../../../components/ui/Skeleton';

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ['lesson', courseId, lessonId],
    queryFn: async () => {
      return http.get<LessonDetail>(`/courses/${courseId}/lessons/${lessonId}`);
    },
    enabled: !!courseId && !!lessonId,
  });

  const [completedState, setCompletedState] = useState<boolean | null>(null);

  const isCompleted = completedState !== null ? completedState : lesson?.completed;

  const completeMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      return http.post<{ completed: boolean }>(`/lessons/${lessonId}/progress`, { completed });
    },
    onMutate: (newVal) => {
      setCompletedState(newVal);
    },
    onSuccess: () => {
      toast.success('Progress saved');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', courseId, lessonId] });
    },
    onError: () => {
      setCompletedState(lesson?.completed ?? false);
      toast.error('Could not save progress');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-[68ch] mx-auto py-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-64 w-full rounded-md" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="py-16 text-center">
        <p className="text-board-700 text-sm mb-4">Lesson not found or failed to load.</p>
        <button
          onClick={() => navigate('/courses')}
          className="text-xs text-pencil-700 font-medium hover:underline"
        >
          Back to courses
        </button>
      </div>
    );
  }

  return (
    <article className="flex flex-col gap-8 max-w-[68ch] mx-auto py-4">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-1.5 text-xs font-sans text-board-500 hover:text-board-900 transition-colors"
        >
          <ArrowLeft size={14} aria-hidden />
          Back to course
        </button>
      </div>

      {/* Header */}
      <header className="flex flex-col gap-2 border-b border-line pb-6">
        <span className="text-xs font-sans text-board-500">
          Lesson {lesson.position + 1} • {lesson.durationMin} minutes
        </span>
        <h1 className="font-serif font-semibold text-board-900 text-2xl sm:text-[1.75rem] leading-tight text-wrap-balance">
          {lesson.title}
        </h1>
      </header>

      {/* Video embed if applicable */}
      {lesson.videoUrl && (
        <div className="aspect-video w-full rounded-lg overflow-hidden border border-line bg-chalk-100">
          <iframe
            src={lesson.videoUrl}
            title={lesson.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Prose Reading Content (Plex Serif 400, max 68ch) */}
      <div className="prose-dars">
        <Markdown content={lesson.content} />
      </div>

      {/* Navigation Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line pt-6 mt-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-chalk-0 text-board-900 border border-board-400 font-sans text-sm hover:bg-chalk-100 transition-colors active:scale-[.97]"
        >
          <ArrowLeft size={16} aria-hidden />
          Previous
        </button>

        <button
          onClick={() => completeMutation.mutate(!isCompleted)}
          disabled={completeMutation.isPending}
          className={`inline-flex items-center gap-2 h-11 px-6 rounded-md font-sans font-medium text-sm transition-[background-color,transform] duration-[var(--dur-press)] active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-900 ${
            isCompleted
              ? 'bg-leaf-100 text-leaf-600 hover:bg-leaf-100/80'
              : 'bg-pencil-500 text-board-900 hover:bg-pencil-300'
          }`}
        >
          <Check size={16} aria-hidden />
          {isCompleted ? 'Completed' : 'Mark as complete'}
        </button>

        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-chalk-0 text-board-900 border border-board-400 font-sans text-sm hover:bg-chalk-100 transition-colors active:scale-[.97]"
        >
          Next
          <ArrowRight size={16} aria-hidden />
        </button>
      </footer>
    </article>
  );
}
