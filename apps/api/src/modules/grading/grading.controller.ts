import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
} from '@nestjs/common';
import { GradeSubmissionInputSchema, Role } from '@dars/contracts';
import { GradingService } from './grading.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@dars/contracts';

@Controller()
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Patch('submissions/:id/grade')
  async gradeSubmission(
    @Param('id') submissionId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
    @Headers('x-request-id') requestId = 'unknown',
  ) {
    const input = GradeSubmissionInputSchema.parse(body);
    const data = await this.gradingService.gradeSubmission(
      submissionId,
      input,
      user,
      requestId,
    );
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Get('courses/:id/gradebook')
  async getGradebook(
    @Param('id') courseId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.gradingService.getGradebook(courseId, user);
    return { data };
  }

  @Roles(Role.STUDENT)
  @Get('me/grades')
  async getMyGrades(@CurrentUser() user: AuthUser) {
    const data = await this.gradingService.getStudentGrades(user.id);
    return { data };
  }
}
