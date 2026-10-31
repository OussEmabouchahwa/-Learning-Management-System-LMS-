import { http } from '../../../lib/http';
import type { StudentDashboard } from '@dars/contracts';

export async function fetchStudentDashboard(): Promise<StudentDashboard> {
  return http.get<StudentDashboard>('/me/dashboard');
}
