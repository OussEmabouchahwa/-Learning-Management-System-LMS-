import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ForgotPasswordInputSchema,
  LoginInputSchema,
  RegisterInputSchema,
  ResetPasswordInputSchema,
} from '@dars/contracts';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@dars/contracts';

const REFRESH_COOKIE_NAME = 'dars_refresh';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const input = RegisterInputSchema.parse(body);
    const result = await this.authService.register(input);
    this.setRefreshCookie(res, result.refreshToken);
    return result.auth;
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const input = LoginInputSchema.parse(body);
    const result = await this.authService.login(input);
    this.setRefreshCookie(res, result.refreshToken);
    return result.auth;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('origin') origin?: string,
  ) {
    const rawCookie = req.cookies?.[REFRESH_COOKIE_NAME];
    const result = await this.authService.refreshTokens(rawCookie, origin);
    this.setRefreshCookie(res, result.newRefreshToken);
    return { accessToken: result.accessToken };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawCookie = req.cookies?.[REFRESH_COOKIE_NAME];
    await this.authService.logout(rawCookie);
    res.clearCookie(REFRESH_COOKIE_NAME, {
      path: '/api/v1/auth',
    });
    return { message: 'Logged out successfully' };
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() body: unknown) {
    const input = ForgotPasswordInputSchema.parse(body);
    return this.authService.forgotPassword(input.email);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() body: unknown) {
    const input = ResetPasswordInputSchema.parse(body);
    return this.authService.resetPassword(input.token, input.newPassword);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('me')
  async getMe(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user.id);
  }

  private setRefreshCookie(res: Response, token: string): void {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: isProd ? process.env.COOKIE_DOMAIN : undefined,
    });
  }
}
