import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ForgotPasswordInputSchema, type ForgotPasswordInput } from '@dars/contracts';
import { forgotPassword } from '../api/auth.api';
import { authCopy } from '../copy';
import { AuthLayout } from './LoginPage';

const c = authCopy.forgot;

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(ForgotPasswordInputSchema) });

  async function onSubmit(data: ForgotPasswordInput) {
    try {
      await forgotPassword(data);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Failed to send request';
      setError('root', { message: msg });
    }
  }

  if (submitted) {
    return (
      <AuthLayout>
        <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em] mb-3 text-wrap-balance">
          {c.sent}
        </h1>
        <p className="text-sm font-sans text-board-700 mb-6">
          {c.sentDescription}
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center h-11 px-4 w-full rounded-md bg-chalk-0 text-board-900 border border-board-400 font-sans text-sm hover:bg-chalk-100 transition-[background-color,transform] duration-[var(--dur-press)] active:scale-[.97]"
        >
          {c.backToLogin}
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em] mb-2 text-wrap-balance">
        {c.title}
      </h1>
      <p className="text-sm font-sans text-board-700 mb-6">
        {c.description}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-sans text-board-900" htmlFor="forgot-email">
            {c.emailLabel}
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'forgot-email-error' : undefined}
            className="h-11 px-3 rounded-md bg-chalk-100 border border-board-400 text-board-900 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-board-900 focus:ring-offset-2"
            {...register('email')}
          />
          {errors.email && (
            <p id="forgot-email-error" className="text-xs text-redpen-600" role="alert">
              {errors.email.message}
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
          className="h-11 px-4 rounded-md bg-pencil-500 text-board-900 font-sans font-medium text-sm transition-[background-color,transform] duration-[var(--dur-press)] hover:bg-pencil-300 active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-900 focus-visible:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
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
        <Link to="/login" className="text-pencil-700 hover:underline font-medium">
          {c.backToLogin}
        </Link>
      </p>
    </AuthLayout>
  );
}
