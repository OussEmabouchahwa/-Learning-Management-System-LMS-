import { Injectable } from '@nestjs/common';
import { Role, UserStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: Role;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role ?? Role.STUDENT,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
  }

  async createRefreshToken(data: {
    tokenHash: string;
    familyId: string;
    userId: string;
    expiresAt: Date;
  }) {
    return this.prisma.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  async markRefreshTokenUsed(id: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async revokeFamily(familyId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserFamilies(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async setResetToken(userId: string, resetToken: string, resetExpiresAt: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { resetToken, resetExpiresAt },
    });
  }

  async findUserByResetToken(resetToken: string) {
    return this.prisma.user.findFirst({
      where: {
        resetToken,
        resetExpiresAt: { gt: new Date() },
      },
    });
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        resetToken: null,
        resetExpiresAt: null,
      },
    });
  }

  async setVerifyToken(userId: string, verifyToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { verifyToken },
    });
  }

  async findUserByVerifyToken(verifyToken: string) {
    return this.prisma.user.findFirst({
      where: { verifyToken },
    });
  }

  async markEmailVerified(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: new Date(),
        verifyToken: null,
      },
    });
  }
}
