import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import {
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
  Role,
  UserStatus,
} from '@dars/contracts';
import { AuthRepository } from './auth.repository';
import { AppError } from '../../common/errors/app.error';
import { MailerService } from '../../infra/mailer/mailer.service';

const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgqlfreSAeYFlGhuObe1ffNcIkBg';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly mailer: MailerService,
  ) {}

  async register(input: RegisterInput): Promise<{ auth: AuthResponse; refreshToken: string }> {
    const existing = await this.authRepo.findUserByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email address already exists');
    }

    const passwordHash = await argon2.hash(input.password);
    const user = await this.authRepo.createUser({
      email: input.email,
      name: input.name,
      passwordHash,
      role: Role.STUDENT,
    });

    const accessToken = await this.generateAccessToken(user);
    const { rawToken } = await this.createRefreshToken(user.id);

    return {
      auth: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          status: user.status as UserStatus,
          emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
        },
      },
      refreshToken: rawToken,
    };
  }

  async login(input: LoginInput): Promise<{ auth: AuthResponse; refreshToken: string }> {
    const user = await this.authRepo.findUserByEmail(input.email);

    if (!user) {
      // Dummy verify for constant-time mitigation of email enumeration
      await argon2.verify(DUMMY_HASH, input.password).catch(() => false);
      throw AppError.unauthorized('Invalid email or password');
    }

    const isValid = await argon2.verify(user.passwordHash, input.password);
    if (!isValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw AppError.forbidden('Your account has been suspended');
    }

    const accessToken = await this.generateAccessToken(user);
    const { rawToken } = await this.createRefreshToken(user.id);

    return {
      auth: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          status: user.status as UserStatus,
          emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
        },
      },
      refreshToken: rawToken,
    };
  }

  async refreshTokens(
    rawCookie: string,
    originHeader?: string,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    this.verifyOrigin(originHeader);

    if (!rawCookie) {
      throw AppError.unauthorized('Missing refresh token cookie');
    }

    const tokenHash = this.hashToken(rawCookie);
    const tokenRecord = await this.authRepo.findRefreshToken(tokenHash);

    if (!tokenRecord) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    // Reuse detection
    if (tokenRecord.usedAt !== null) {
      await this.authRepo.revokeFamily(tokenRecord.familyId);
      throw AppError.unauthorized('Refresh token reuse detected. Session revoked.');
    }

    if (tokenRecord.revokedAt !== null) {
      throw AppError.unauthorized('Refresh token has been revoked');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw AppError.unauthorized('Refresh token has expired');
    }

    // Mark current used
    await this.authRepo.markRefreshTokenUsed(tokenRecord.id);

    // Generate new token in family
    const nextRawToken = crypto.randomBytes(32).toString('hex');
    const nextTokenHash = this.hashToken(nextRawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.authRepo.createRefreshToken({
      familyId: tokenRecord.familyId,
      tokenHash: nextTokenHash,
      userId: tokenRecord.userId,
      expiresAt,
    });

    const accessToken = await this.generateAccessToken(tokenRecord.user);

    return {
      accessToken,
      newRefreshToken: nextRawToken,
    };
  }

  async logout(rawCookie?: string): Promise<void> {
    if (rawCookie) {
      const tokenHash = this.hashToken(rawCookie);
      const tokenRecord = await this.authRepo.findRefreshToken(tokenHash);
      if (tokenRecord) {
        await this.authRepo.revokeFamily(tokenRecord.familyId);
      }
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.authRepo.findUserByEmail(email);
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

      await this.authRepo.setResetToken(user.id, tokenHash, expiresAt);

      const resetLink = `${process.env.APP_URL || 'http://localhost:5173'}/auth/reset-password?token=${rawToken}`;
      await this.mailer.sendMail({
        to: user.email,
        subject: 'Reset your Dars password',
        text: `You requested a password reset. Use this link: ${resetLink} (valid for 30 minutes).`,
      });
    }

    // Uniform response always
    return {
      message: 'If an account exists for this email, password reset instructions have been sent.',
    };
  }

  async resetPassword(token: string, newPass: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(token);
    const user = await this.authRepo.findUserByResetToken(tokenHash);

    if (!user) {
      throw AppError.badRequest('Invalid or expired password reset token');
    }

    const passwordHash = await argon2.hash(newPass);
    await this.authRepo.updateUserPassword(user.id, passwordHash);
    await this.authRepo.revokeAllUserFamilies(user.id);

    return { message: 'Password has been updated. You can now log in.' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(token);
    const user = await this.authRepo.findUserByVerifyToken(tokenHash);

    if (!user) {
      throw AppError.badRequest('Invalid or expired email verification token');
    }

    await this.authRepo.markEmailVerified(user.id);
    return { message: 'Email address verified successfully.' };
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.authRepo.findUserById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      status: user.status as UserStatus,
      emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    };
  }

  private async generateAccessToken(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
  }): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      {
        jwtid: crypto.randomUUID(),
      },
    );
  }

  private async createRefreshToken(userId: string): Promise<{ rawToken: string }> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const familyId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.authRepo.createRefreshToken({
      tokenHash,
      familyId,
      userId,
      expiresAt,
    });

    return { rawToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private verifyOrigin(originHeader?: string): void {
    if (!originHeader) return;
    const allowed = (process.env.CORS_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((s) => s.trim());
    if (!allowed.includes(originHeader)) {
      throw AppError.forbidden('Untrusted origin for session refresh');
    }
  }
}
