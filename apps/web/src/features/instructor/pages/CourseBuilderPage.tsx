import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { http } from '../../../lib/http';
import type { CourseDetail } from '@dars/contracts';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/Dialog';

export function CourseBuilderPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [createModuleOpen, setCreateModuleOpen] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course-builder', courseId],
    queryFn: async () => {
      return http.get<CourseDetail>(`/courses/${courseId}`);
    },
    enabled: !!courseId,
  });

  const addModuleMutation = useMutation({
    mutationFn: async (title: string) => {
      return http.post(`/courses/${courseId}/modules`, { title });
    },
    onSuccess: () => {
      toast.success('Module created');
      setCreateModuleOpen(false);
      setNewModuleTitle('');
      queryClient.invalidateQueries({ queryKey: ['course-builder', courseId] });
    },
    onError: () => {
      toast.error('Failed to create module');
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      return http.post(`/courses/${courseId}/publish`, {});
    },
    onSuccess: () => {
      toast.success('Course published');
      queryClient.invalidateQueries({ queryKey: ['course-builder', courseId] });
    },
    onError: () => {
      toast.error('Failed to publish course. Ensure all modules have lessons.');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-16 text-center text-sm text-board-700">
        Course not found.
      </div>
    );
  }

  const modules = course.modules ?? [];
  const hasEmptyModule = modules.some((m) => (m.lessons?.length ?? 0) === 0);
  const canPublish = modules.length > 0 && !hasEmptyModule;

  return (
    <div className="max-w-3xl mx-auto py-6 flex flex-col gap-8">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-1.5 text-xs font-sans text-board-500 hover:text-board-900"
        >
          <ArrowLeft size={14} aria-hidden />
          Back to courses
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-sans text-board-500">
            Status: <span className="font-medium text-board-900">{course.status}</span>
          </span>
          {course.status === 'DRAFT' && (
            <button
              onClick={() => publishMutation.mutate()}
              disabled={!canPublish || publishMutation.isPending}
              className="h-9 px-4 rounded-md bg-pencil-500 text-board-900 text-xs font-sans font-medium hover:bg-pencil-300 disabled:opacity-50"
            >
              Publish course
            </button>
          )}
        </div>
      </div>

      {/* Course Title & Checklist */}
      <div className="flex flex-col gap-3">
        <h1 className="font-serif font-semibold text-board-900 text-2xl">
          {course.title}
        </h1>
        <p className="text-sm font-sans text-board-700">{course.description}</p>

        {/* Publish checklist */}
        <div className="bg-chalk-0 border border-line rounded-lg p-4 flex flex-col gap-2 mt-2">
          <span className="text-xs font-sans font-medium text-board-700">Publish Checklist</span>
          <div className="flex items-center gap-2 text-xs font-sans">
            {modules.length > 0 ? (
              <CheckCircle2 size={14} className="text-leaf-600" aria-hidden />
            ) : (
              <AlertCircle size={14} className="text-redpen-600" aria-hidden />
            )}
            <span className={modules.length > 0 ? 'text-board-700' : 'text-redpen-600'}>
              At least one module
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-sans">
            {!hasEmptyModule && modules.length > 0 ? (
              <CheckCircle2 size={14} className="text-leaf-600" aria-hidden />
            ) : (
              <AlertCircle size={14} className="text-redpen-600" aria-hidden />
            )}
            <span className={!hasEmptyModule && modules.length > 0 ? 'text-board-700' : 'text-board-500'}>
              Every module contains at least one lesson
            </span>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-semibold text-board-900 text-lg">Modules</h2>
          <button
            onClick={() => setCreateModuleOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-chalk-0 text-board-900 border border-board-400 text-xs font-sans hover:bg-chalk-100"
          >
            <Plus size={14} aria-hidden />
            Add module
          </button>
        </div>

        {modules.length === 0 ? (
          <div className="bg-chalk-0 border border-line rounded-lg p-8 text-center text-sm text-board-500">
            No modules yet. Click &quot;Add module&quot; to begin building your curriculum.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {modules.map((m, idx) => (
              <div key={m.id} className="bg-chalk-0 border border-line rounded-lg p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-medium text-board-900 text-sm">
                    Module {idx + 1}: {m.title}
                  </h3>
                  <span className="text-xs font-sans text-board-500">
                    {m.lessons?.length ?? 0} lessons
                  </span>
                </div>

                {m.lessons && m.lessons.length > 0 ? (
                  <div className="divide-y divide-line border-t border-line mt-1">
                    {m.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="py-2.5 flex items-center justify-between text-xs font-sans">
                        <span className="text-board-700">
                          {lIdx + 1}. {lesson.title}
                        </span>
                        <span className="text-board-500 tabular-nums">
                          {lesson.durationMin} min
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-board-500 italic">No lessons in this module yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Module Dialog */}
      <Dialog open={createModuleOpen} onOpenChange={setCreateModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New module</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <label htmlFor="module-title" className="text-sm font-sans text-board-900">
              Module title
            </label>
            <input
              id="module-title"
              type="text"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="e.g. Introduction to Relational Models"
              className="h-10 px-3 rounded-md bg-chalk-100 border border-board-400 text-sm font-sans"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setCreateModuleOpen(false)}
              className="h-9 px-4 rounded-md border border-board-400 text-board-900 text-xs font-sans"
            >
              Cancel
            </button>
            <button
              onClick={() => addModuleMutation.mutate(newModuleTitle)}
              disabled={!newModuleTitle.trim() || addModuleMutation.isPending}
              className="h-9 px-4 rounded-md bg-pencil-500 text-board-900 text-xs font-sans font-medium disabled:opacity-50"
            >
              Create module
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
