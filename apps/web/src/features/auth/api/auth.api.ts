import { http } from '../../../lib/http';
import { useAuthStore } from '../../../lib/auth-store';
import type { AuthResponse, LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from '@dars/contracts';

export async function login(data: LoginInput): Promise<AuthResponse> {
  const result = await http.post<AuthResponse>('/auth/login', data);
  useAuthStore.getState().setAuth(result.user, result.accessToken);
  return result;
}

export async function register(data: RegisterInput): Promise<AuthResponse> {
  const result = await http.post<AuthResponse>('/auth/register', data);
  useAuthStore.getState().setAuth(result.user, result.accessToken);
  return result;
}

export async function forgotPassword(data: ForgotPasswordInput): Promise<{ message: string }> {
  return http.post('/auth/forgot-password', data);
}

export async function resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
  return http.post('/auth/reset-password', data);
}
