import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/auth-store';
import { Role } from '@dars/contracts';
import { cn } from '../lib/cn';
import { http } from '../lib/http';

const studentNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses', label: 'My courses', icon: BookOpen },
  { to: '/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/quizzes', label: 'Quizzes', icon: GraduationCap },
  { to: '/grades', label: 'Grades', icon: ClipboardList },
];

const instructorNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/submissions', label: 'Submissions', icon: ClipboardList },
];

const adminNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/audit', label: 'Audit log', icon: ClipboardList },
];

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 h-10 rounded-md text-sm font-sans transition-colors duration-[var(--dur-press)]',
          '@media(hover:hover){hover:bg-chalk-100}',
          isActive
            ? 'bg-chalk-0 text-board-900 font-medium'
            : 'text-board-700',
        )
      }
    >
      <Icon size={18} strokeWidth={1.75} aria-hidden />
      {label}
    </NavLink>
  );
}

function UserBlock() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleLogout() {
    try {
      await http.post('/auth/logout');
    } finally {
      clearAuth();
      navigate('/login');
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 border-t border-line mt-auto">
      <div className="w-8 h-8 rounded-full bg-board-700 text-white flex items-center justify-center text-xs font-medium font-sans select-none">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-board-900 truncate">{user?.name}</p>
        <p className="text-xs text-board-500 truncate">{user?.email}</p>
      </div>
      <button
        onClick={handleLogout}
        className="text-xs text-board-500 hover:text-board-900 transition-colors"
        aria-label="Sign out"
      >
        Out
      </button>
    </div>
  );
}

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const navItems =
    role === Role.ADMIN
      ? adminNav
      : role === Role.INSTRUCTOR
        ? instructorNav
        : studentNav;

  return (
    <div className="flex min-h-screen bg-chalk-50">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-board-900 focus:text-white focus:rounded-md focus:text-sm"
      >
        Skip to content
      </a>

      {/* Sidebar — 232px desktop, top strip < 820px */}
      <nav
        aria-label="Main navigation"
        className="
          hidden lg:flex flex-col
          w-[232px] flex-shrink-0
          bg-board-100 border-r border-line
          h-screen sticky top-0
        "
      >
        {/* Product mark */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-line">
          <span className="font-serif font-semibold text-board-900 text-lg tracking-[-0.01em]">
            Dars
          </span>
        </div>

        {/* Nav links */}
        <div className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        <UserBlock />
      </nav>

      {/* Mobile top strip — shows < 820px (lg breakpoint) */}
      <nav
        aria-label="Main navigation"
        className="lg:hidden fixed top-0 inset-x-0 z-30 bg-board-100 border-b border-line flex items-center gap-1 px-2 h-12"
      >
        <span className="font-serif font-semibold text-board-900 text-base mr-3 px-1">
          Dars
        </span>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 px-2 h-8 rounded text-xs font-sans transition-colors',
                isActive ? 'bg-chalk-0 text-board-900 font-medium' : 'text-board-700',
              )
            }
          >
            <Icon size={14} strokeWidth={1.75} aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 min-w-0 lg:min-h-screen pt-12 lg:pt-0"
      >
        <div className="mx-auto max-w-[1160px] px-[clamp(20px,4vw,48px)] py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
