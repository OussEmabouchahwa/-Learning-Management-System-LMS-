import {
  Body,
  Controller,
  Delete,
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
  CoursesListQuerySchema,
  CreateCourseInputSchema,
  Role,
  UpdateCourseInputSchema,
} from '@dars/contracts';
import { CoursesService } from './courses.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@dars/contracts';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  async listCourses(
    @Query() query: unknown,
    @CurrentUser() user?: AuthUser,
  ) {
    const parsed = CoursesListQuerySchema.parse(query);
    const result = await this.coursesService.listCourses(parsed, user);
    return {
      data: result.items,
      meta: result.meta,
    };
  }

  @Public()
  @Get(':slug')
  async getCourseBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user?: AuthUser,
  ) {
    const data = await this.coursesService.getCourseBySlug(slug, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Post()
  async createCourse(
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = CreateCourseInputSchema.parse(body);
    const data = await this.coursesService.createCourse(input, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Patch(':id')
  async updateCourse(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = UpdateCourseInputSchema.parse(body);
    const data = await this.coursesService.updateCourse(id, input, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post(':id/publish')
  async publishCourse(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Headers('x-request-id') requestId = 'unknown',
  ) {
    const data = await this.coursesService.publishCourse(id, user, requestId);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post(':id/archive')
  async archiveCourse(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Headers('x-request-id') requestId = 'unknown',
  ) {
    const data = await this.coursesService.archiveCourse(id, user, requestId);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteCourse(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Headers('x-request-id') requestId = 'unknown',
  ) {
    await this.coursesService.deleteCourse(id, user, requestId);
  }
}
