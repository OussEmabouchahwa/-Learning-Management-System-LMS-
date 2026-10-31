import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { RegisterInputSchema, type RegisterInput } from '@dars/contracts';
import { register as registerUser } from '../api/auth.api';
import { authCopy } from '../copy';
import { AuthLayout } from './LoginPage';

const c = authCopy.register;

export function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({ resolver: zodResolver(RegisterInputSchema) });

  async function onSubmit(data: RegisterInput) {
    try {
      await registerUser(data);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string; fields?: Record<string, string[]> };
      if (e.fields) {
        Object.entries(e.fields).forEach(([field, msgs]) => {
          setError(field as keyof RegisterInput, { message: msgs[0] });
        });
      } else {
        setError('root', { message: e.message ?? 'Something went wrong' });
      }
    }
  }

  const field = (
    id: string,
    label: string,
    type: string,
    key: keyof RegisterInput,
    hint?: string,
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-sans text-board-900" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className="h-11 px-3 rounded-md bg-chalk-100 border border-board-400 text-board-900 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-board-900 focus:ring-offset-2"
        {...register(key)}
      />
      {hint && !errors[key] && (
        <p id={`${id}-hint`} className="text-xs text-board-500">{hint}</p>
      )}
      {errors[key] && (
        <p id={`${id}-error`} className="text-xs text-redpen-600" role="alert">
          {errors[key]?.message}
        </p>
      )}
    </div>
  );

  return (
    <AuthLayout>
      <h1 className="font-serif font-semibold text-board-900 text-[1.75rem] leading-tight tracking-[-0.01em] mb-6">
        {c.title}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {field('reg-name', c.nameLabel, 'text', 'name')}
        {field('reg-email', c.emailLabel, 'email', 'email')}
        {field('reg-password', c.passwordLabel, 'password', 'password', c.passwordHint)}

        {errors.root && (
          <p className="text-sm text-redpen-600" role="alert">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-4 rounded-md bg-pencil-500 text-board-900 font-sans font-medium text-sm transition-[background-color,transform] duration-[var(--dur-press)] hover:bg-pencil-300 active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-900 focus-visible:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
        >
          {c.submit}
        </button>
      </form>

      <p className="mt-6 text-sm text-board-700 text-center">
        {c.hasAccount}{' '}
        <Link to="/login" className="text-pencil-700 hover:underline font-medium">{c.signIn}</Link>
      </p>
    </AuthLayout>
  );
}
