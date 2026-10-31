import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser, Role } from '@dars/contracts';

@Controller()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @Post('courses/:id/enroll')
  async enroll(
    @Param('id') courseId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.enrollmentsService.enroll(user.id, courseId);
    return { data };
  }

  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('courses/:id/enroll')
  async unenroll(
    @Param('id') courseId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.enrollmentsService.unenroll(user.id, courseId);
  }

  @Roles(Role.STUDENT)
  @Get('me/enrollments')
  async getMyEnrollments(@CurrentUser() user: AuthUser) {
    const data = await this.enrollmentsService.getMyEnrollments(user.id);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Get('courses/:id/students')
  async getCourseStudents(
    @Param('id') courseId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = user.role === Role.ADMIN;
    const data = await this.enrollmentsService.getCourseStudents(
      courseId,
      user.id,
      isAdmin,
    );
    return { data };
  }
}
