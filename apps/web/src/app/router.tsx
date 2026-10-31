import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { RequireAuth, RequireRole } from './guards';
import { Role } from '@dars/contracts';

// Auth pages (small, not lazy)
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';

// Lazy feature pages
const DashboardPage = lazy(() =>
  import('../features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const CourseCatalogPage = lazy(() =>
  import('../features/catalog/pages/CourseCatalogPage').then((m) => ({ default: m.CourseCatalogPage })),
);
const LessonPage = lazy(() =>
  import('../features/learn/pages/LessonPage').then((m) => ({ default: m.LessonPage })),
);
const QuizPage = lazy(() =>
  import('../features/quiz/pages/QuizPage').then((m) => ({ default: m.QuizPage })),
);
const AssignmentPage = lazy(() =>
  import('../features/assignments/pages/AssignmentPage').then((m) => ({ default: m.AssignmentPage })),
);
const GradesPage = lazy(() =>
  import('../features/grades/pages/GradesPage').then((m) => ({ default: m.GradesPage })),
);
// Instructor
const CourseBuilderPage = lazy(() =>
  import('../features/instructor/pages/CourseBuilderPage').then((m) => ({ default: m.CourseBuilderPage })),
);
const SubmissionsQueuePage = lazy(() =>
  import('../features/instructor/pages/SubmissionsQueuePage').then((m) => ({ default: m.SubmissionsQueuePage })),
);
// Admin
const UsersPage = lazy(() =>
  import('../features/admin/pages/UsersPage').then((m) => ({ default: m.UsersPage })),
);
const AuditLogPage = lazy(() =>
  import('../features/admin/pages/AuditLogPage').then((m) => ({ default: m.AuditLogPage })),
);

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-6 h-6 border-2 border-board-300 border-t-board-700 rounded-full animate-spin" />
    </div>
  );
}

const router = createBrowserRouter([
  // Public auth routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // Authenticated routes
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<PageFallback />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: 'courses',
            element: (
              <Suspense fallback={<PageFallback />}>
                <CourseCatalogPage />
              </Suspense>
            ),
          },
          {
            path: 'courses/:courseId/lessons/:lessonId',
            element: (
              <Suspense fallback={<PageFallback />}>
                <LessonPage />
              </Suspense>
            ),
          },
          {
            path: 'courses/:courseId/quizzes/:quizId',
            element: (
              <Suspense fallback={<PageFallback />}>
                <QuizPage />
              </Suspense>
            ),
          },
          {
            path: 'assignments/:assignmentId',
            element: (
              <Suspense fallback={<PageFallback />}>
                <AssignmentPage />
              </Suspense>
            ),
          },
          {
            path: 'grades',
            element: (
              <Suspense fallback={<PageFallback />}>
                <GradesPage />
              </Suspense>
            ),
          },
          // Instructor routes
          {
            element: <RequireRole roles={[Role.INSTRUCTOR, Role.ADMIN]} />,
            children: [
              {
                path: 'courses/:courseId/build',
                element: (
                  <Suspense fallback={<PageFallback />}>
                    <CourseBuilderPage />
                  </Suspense>
                ),
              },
              {
                path: 'submissions',
                element: (
                  <Suspense fallback={<PageFallback />}>
                    <SubmissionsQueuePage />
                  </Suspense>
                ),
              },
            ],
          },
          // Admin routes
          {
            element: <RequireRole roles={[Role.ADMIN]} />,
            children: [
              {
                path: 'admin/users',
                element: (
                  <Suspense fallback={<PageFallback />}>
                    <UsersPage />
                  </Suspense>
                ),
              },
              {
                path: 'admin/audit',
                element: (
                  <Suspense fallback={<PageFallback />}>
                    <AuditLogPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
