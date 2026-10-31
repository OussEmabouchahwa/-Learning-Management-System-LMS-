import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  CreateLessonInputSchema,
  CreateModuleInputSchema,
  LessonProgressUpdateSchema,
  ReorderItemsInputSchema,
  Role,
  UpdateLessonInputSchema,
  UpdateModuleInputSchema,
} from '@dars/contracts';
import { ContentService } from './content.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@dars/contracts';

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Post('courses/:id/modules')
  async createModule(
    @Param('id') courseId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = CreateModuleInputSchema.parse(body);
    const data = await this.contentService.createModule(courseId, input, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Patch('modules/:id')
  async updateModule(
    @Param('id') moduleId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = UpdateModuleInputSchema.parse(body);
    const data = await this.contentService.updateModule(moduleId, input, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('modules/:id')
  async deleteModule(
    @Param('id') moduleId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.contentService.deleteModule(moduleId, user);
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('courses/:id/modules/reorder')
  async reorderModules(
    @Param('id') courseId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = ReorderItemsInputSchema.parse(body);
    await this.contentService.reorderModules(courseId, input, user);
    return { message: 'Modules reordered successfully' };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Post('modules/:id/lessons')
  async createLesson(
    @Param('id') moduleId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = CreateLessonInputSchema.parse(body);
    const data = await this.contentService.createLesson(moduleId, input, user);
    return { data };
  }

  @Get('lessons/:id')
  async getLesson(
    @Param('id') lessonId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.contentService.getLesson(lessonId, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Patch('lessons/:id')
  async updateLesson(
    @Param('id') lessonId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = UpdateLessonInputSchema.parse(body);
    const data = await this.contentService.updateLesson(lessonId, input, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('lessons/:id')
  async deleteLesson(
    @Param('id') lessonId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.contentService.deleteLesson(lessonId, user);
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('modules/:id/lessons/reorder')
  async reorderLessons(
    @Param('id') moduleId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = ReorderItemsInputSchema.parse(body);
    await this.contentService.reorderLessons(moduleId, input, user);
    return { message: 'Lessons reordered successfully' };
  }

  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Put('lessons/:id/progress')
  async updateLessonProgress(
    @Param('id') lessonId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = LessonProgressUpdateSchema.parse(body);
    const data = await this.contentService.updateLessonProgress(
      lessonId,
      input.completed,
      user,
    );
    return { data };
  }
}
