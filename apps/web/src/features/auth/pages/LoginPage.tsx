import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LoginInputSchema, type LoginInput } from '@dars/contracts';
import { login } from '../api/auth.api';
import { authCopy } from '../copy';

const c = authCopy.login;

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-chalk-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-chalk-0 border border-line rounded-lg p-8 shadow-float">
        {children}
      </div>
    </div>
  );
}

export { AuthLayout };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({ resolver: zodResolver(LoginInputSchema) });

  async function onSubmit(data: LoginInput) {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? c.error.generic;
      setError('root', { message: msg });
    }
  }

  return (
    <AuthLayout>
      <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em] mb-6 text-wrap-balance">
        {c.title}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-sans text-board-900" htmlFor="login-email">
            {c.emailLabel}
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className="h-11 px-3 rounded-md bg-chalk-100 border border-board-400 text-board-900 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-board-900 focus:ring-offset-2 disabled:opacity-50"
            {...register('email')}
          />
          {errors.email && (
            <p id="login-email-error" className="text-xs text-redpen-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-baseline">
            <label className="text-sm font-sans text-board-900" htmlFor="login-password">
              {c.passwordLabel}
            </label>
            <Link to="/forgot-password" className="text-xs text-pencil-700 hover:underline">
              {c.forgotPassword}
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            className="h-11 px-3 rounded-md bg-chalk-100 border border-board-400 text-board-900 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-board-900 focus:ring-offset-2 disabled:opacity-50"
            {...register('password')}
          />
          {errors.password && (
            <p id="login-password-error" className="text-xs text-redpen-600" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-redpen-600" role="alert">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-4 rounded-md bg-pencil-500 text-board-900 font-sans font-medium text-sm transition-[background-color,transform] duration-[var(--dur-press)] hover:bg-pencil-300 active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : null}
          {c.submit}
        </button>
      </form>

      <p className="mt-6 text-sm text-board-700 text-center">
        {c.noAccount}{' '}
        <Link to="/register" className="text-pencil-700 hover:underline font-medium">
          {c.register}
        </Link>
      </p>
    </AuthLayout>
  );
}
