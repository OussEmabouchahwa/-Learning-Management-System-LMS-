import { Role, QuizAttemptStatus } from '@dars/contracts';
import { PolicyUser, PolicyCourse } from '../courses/course.policy';

export interface PolicySubmission {
  userId: string;
}

export interface PolicyQuizAttempt {
  userId: string;
  status: QuizAttemptStatus;
}

export interface PolicyEnrollment {
  userId: string;
  courseId: string;
  status: string;
}

export function canGradeSubmission(user: PolicyUser, course: PolicyCourse): boolean {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.INSTRUCTOR) {
    return course.instructorId === user.id;
  }
  return false;
}

export function canReadSubmission(
  user: PolicyUser,
  submission: PolicySubmission,
  course: PolicyCourse,
): boolean {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.INSTRUCTOR && course.instructorId === user.id) return true;
  return user.id === submission.userId;
}

export function canTakeQuiz(user: PolicyUser, enrollment: PolicyEnrollment): boolean {
  return (
    user.role === Role.STUDENT &&
    enrollment.userId === user.id &&
    enrollment.status === 'ACTIVE'
  );
}

export function canViewQuizResults(attempt: PolicyQuizAttempt): boolean {
  return attempt.status === QuizAttemptStatus.SUBMITTED || attempt.status === QuizAttemptStatus.EXPIRED;
}
