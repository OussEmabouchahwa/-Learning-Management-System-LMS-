import { useQuery } from '@tanstack/react-query';
import { fetchStudentDashboard } from '../api/dashboard.api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'me'],
    queryFn: fetchStudentDashboard,
  });
}
