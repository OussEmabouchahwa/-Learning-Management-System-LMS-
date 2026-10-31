import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ResumeTarget } from '@dars/contracts';
import { LessonTrail } from '../../../components/ui/LessonTrail';
import { dashboardCopy } from '../copy';

interface ResumePanelProps {
  resume: ResumeTarget | null;
}

export function ResumePanel({ resume }: ResumePanelProps) {
  const navigate = useNavigate();
  const c = dashboardCopy.resume;

  if (!resume) {
    return null;
  }

  const handleResume = () => {
    navigate(`/courses/${resume.courseId}/lessons/${resume.lessonId}`);
  };

  return (
    <section
      aria-label="Current lesson"
      className="bg-chalk-0 border border-line rounded-lg p-6 flex flex-col gap-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-sans text-board-500">
            {resume.courseTitle}, {resume.instructorName}
          </p>
          <h2 className="text-xl sm:text-[1.4375rem] font-serif font-semibold text-board-900 leading-tight">
            {resume.lessonTitle}
          </h2>
          <p className="text-sm font-sans text-board-500">
            {c.moduleLesson(resume.modulePosition, resume.lessonPosition, resume.lessonDurationMin)}
          </p>
        </div>

        <button
          onClick={handleResume}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-pencil-500 text-board-900 font-sans font-medium text-sm transition-[background-color,transform] duration-[var(--dur-press)] hover:bg-pencil-300 active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-900 focus-visible:ring-offset-2 flex-shrink-0"
        >
          <Play size={16} fill="currentColor" aria-hidden />
          {c.resumeLesson}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <LessonTrail
          total={resume.totalLessonsCount}
          completed={resume.completedLessonsCount}
          current={resume.completedLessonsCount + 1}
        />
        {resume.nextMilestoneText && (
          <div className="flex justify-end -mt-1">
            <span className="text-xs font-sans text-board-500">
              {resume.nextMilestoneText}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
