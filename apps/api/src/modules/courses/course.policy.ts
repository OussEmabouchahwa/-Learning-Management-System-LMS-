import { Role, CourseStatus } from '@dars/contracts';

export interface PolicyUser {
  id: string;
  role: Role;
}

export interface PolicyCourse {
  id: string;
  instructorId: string;
  status: CourseStatus;
}

export function canCreateCourse(user: PolicyUser): boolean {
  return user.role === Role.INSTRUCTOR || user.role === Role.ADMIN;
}

export function canEditCourse(user: PolicyUser, course: PolicyCourse): boolean {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.INSTRUCTOR) {
    return course.instructorId === user.id;
  }
  return false;
}

export function canPublishCourse(user: PolicyUser, course: PolicyCourse): boolean {
  return canEditCourse(user, course);
}

export function canArchiveCourse(user: PolicyUser, course: PolicyCourse): boolean {
  return canEditCourse(user, course);
}

export function canDeleteCourse(user: PolicyUser, course: PolicyCourse): boolean {
  if (course.status !== CourseStatus.DRAFT) {
    return false; // only draft courses can be deleted
  }
  return canEditCourse(user, course);
}
