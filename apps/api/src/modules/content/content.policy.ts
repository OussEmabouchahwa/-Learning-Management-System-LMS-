import { Role, CourseStatus } from '@dars/contracts';
import { PolicyUser, PolicyCourse } from '../courses/course.policy';
import { PolicyEnrollment } from '../assessments/assessment.policy';

export function canReadLesson(
  user: PolicyUser,
  course: PolicyCourse,
  enrollment?: PolicyEnrollment | null,
): boolean {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.INSTRUCTOR) {
    return course.instructorId === user.id;
  }
  if (user.role === Role.STUDENT) {
    if (course.status !== CourseStatus.PUBLISHED) return false;
    return !!enrollment && enrollment.status === 'ACTIVE';
  }
  return false;
}
