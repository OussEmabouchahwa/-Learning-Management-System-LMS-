import { Controller, Get, Param } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser, Role } from '@dars/contracts';

@Controller()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Roles(Role.STUDENT)
  @Get('me/dashboard')
  async getDashboard(@CurrentUser() user: AuthUser) {
    const data = await this.progressService.getDashboardData(user.id);
    return { data };
  }

  @Roles(Role.STUDENT)
  @Get('me/progress')
  async getMyProgress(@CurrentUser() user: AuthUser) {
    const dashboard = await this.progressService.getDashboardData(user.id);
    return { data: dashboard.courses };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Get('courses/:id/progress/summary')
  async getCourseProgressSummary(@Param('id') _courseId: string) {
    return {
      data: {
        enrolledCount: 0,
        averageProgressPct: 0,
        completedCount: 0,
      },
    };
  }
}
