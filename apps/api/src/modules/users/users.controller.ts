import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ChangePasswordInputSchema,
  Role,
  UpdateProfileInputSchema,
  UpdateUserRoleInputSchema,
  UpdateUserStatusInputSchema,
  UsersListQuerySchema,
} from '@dars/contracts';
import { UsersService } from './users.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@dars/contracts';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  async updateProfile(
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = UpdateProfileInputSchema.parse(body);
    const data = await this.usersService.updateProfile(user.id, input);
    return { data };
  }

  @HttpCode(HttpStatus.OK)
  @Post('me/password')
  async changePassword(
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = ChangePasswordInputSchema.parse(body);
    return this.usersService.changePassword(user.id, input);
  }

  @Roles(Role.ADMIN)
  @Get('users')
  async listUsers(@Query() query: unknown) {
    const parsed = UsersListQuerySchema.parse(query);
    const result = await this.usersService.listUsers(parsed);
    return {
      data: result.items,
      meta: result.meta,
    };
  }

  @Roles(Role.ADMIN)
  @Patch('users/:id/role')
  async updateRole(
    @Param('id') targetUserId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
    @Headers('x-request-id') requestId = 'unknown',
  ) {
    const input = UpdateUserRoleInputSchema.parse(body);
    const data = await this.usersService.updateRole(
      targetUserId,
      input.role,
      user.id,
      requestId,
    );
    return { data };
  }

  @Roles(Role.ADMIN)
  @Patch('users/:id/status')
  async updateStatus(
    @Param('id') targetUserId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
    @Headers('x-request-id') requestId = 'unknown',
  ) {
    const input = UpdateUserStatusInputSchema.parse(body);
    const data = await this.usersService.updateStatus(
      targetUserId,
      input.status,
      user.id,
      requestId,
    );
    return { data };
  }
}
