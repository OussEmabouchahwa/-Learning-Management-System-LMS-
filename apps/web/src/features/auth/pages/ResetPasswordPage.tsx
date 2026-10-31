import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { ResetPasswordInputSchema, type ResetPasswordInput } from '@dars/contracts';
import { resetPassword } from '../api/auth.api';
import { authCopy } from '../copy';
import { AuthLayout } from './LoginPage';

const c = authCopy.reset;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordInputSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: ResetPasswordInput) {
    try {
      await resetPassword(data);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Failed to reset password';
      setError('root', { message: msg });
    }
  }

  if (success) {
    return (
      <AuthLayout>
        <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em] mb-3 text-wrap-balance">
          {c.title}
        </h1>
        <p className="text-sm font-sans text-board-700 mb-6">
          {c.success}
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center h-11 px-4 w-full rounded-md bg-pencil-500 text-board-900 font-sans font-medium text-sm hover:bg-pencil-300 transition-[background-color,transform] duration-[var(--dur-press)] active:scale-[.97]"
        >
          {c.backToLogin}
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em] mb-6 text-wrap-balance">
        {c.title}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <input type="hidden" {...register('token')} value={token} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-sans text-board-900" htmlFor="reset-password">
            {c.passwordLabel}
          </label>
          <input
            id="reset-password"
            type="password"
            aria-invalid={!!errors.newPassword}
            aria-describedby={errors.newPassword ? 'reset-password-error' : 'reset-password-hint'}
            className="h-11 px-3 rounded-md bg-chalk-100 border border-board-400 text-board-900 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-board-900 focus:ring-offset-2"
            {...register('newPassword')}
          />
          {!errors.newPassword && (
            <p id="reset-password-hint" className="text-xs text-board-500">{c.passwordHint}</p>
          )}
          {errors.newPassword && (
            <p id="reset-password-error" className="text-xs text-redpen-600" role="alert">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {errors.token && (
          <p className="text-sm text-redpen-600" role="alert">
            Missing or invalid reset token.
          </p>
        )}

        {errors.root && (
          <p className="text-sm text-redpen-600" role="alert">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-4 rounded-md bg-pencil-500 text-board-900 font-sans font-medium text-sm transition-[background-color,transform] duration-[var(--dur-press)] hover:bg-pencil-300 active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-900 focus-visible:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {c.submit}
        </button>
      </form>
    </AuthLayout>
  );
}
