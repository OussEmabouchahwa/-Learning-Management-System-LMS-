import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  CreateAssignmentInputSchema,
  CreateQuizInputSchema,
  CreateQuizQuestionSchema,
  Role,
  SaveAttemptAnswersInputSchema,
  SubmitAssignmentInputSchema,
  UpdateAssignmentInputSchema,
  UpdateQuizInputSchema,
} from '@dars/contracts';
import { AssessmentsService } from './assessments.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@dars/contracts';

@Controller()
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Post('courses/:id/quizzes')
  async createQuiz(
    @Param('id') courseId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = CreateQuizInputSchema.parse(body);
    const data = await this.assessmentsService.createQuiz(courseId, input, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Patch('quizzes/:id')
  async updateQuiz(
    @Param('id') quizId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = UpdateQuizInputSchema.parse(body);
    const data = await this.assessmentsService.updateQuiz(quizId, input, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Post('quizzes/:id/questions')
  async createQuestion(
    @Param('id') quizId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = CreateQuizQuestionSchema.parse(body);
    const data = await this.assessmentsService.createQuestion(quizId, input, user);
    return { data };
  }

  @Roles(Role.STUDENT)
  @Post('quizzes/:id/attempts')
  async startAttempt(
    @Param('id') quizId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.assessmentsService.startAttempt(quizId, user);
    return { data };
  }

  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Put('attempts/:id/answers')
  async saveAnswers(
    @Param('id') attemptId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = SaveAttemptAnswersInputSchema.parse(body);
    const data = await this.assessmentsService.saveAnswers(attemptId, input.answers, user);
    return { data };
  }

  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Post('attempts/:id/submit')
  async submitAttempt(
    @Param('id') attemptId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.assessmentsService.submitAttempt(attemptId, user);
    return { data };
  }

  @Get('attempts/:id')
  async getAttempt(
    @Param('id') attemptId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.assessmentsService.getAttempt(attemptId, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Post('courses/:id/assignments')
  async createAssignment(
    @Param('id') courseId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = CreateAssignmentInputSchema.parse(body);
    const data = await this.assessmentsService.createAssignment(courseId, input, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Patch('assignments/:id')
  async updateAssignment(
    @Param('id') assignmentId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = UpdateAssignmentInputSchema.parse(body);
    const data = await this.assessmentsService.updateAssignment(assignmentId, input, user);
    return { data };
  }

  @Roles(Role.STUDENT)
  @Post('assignments/:id/submissions')
  async submitAssignment(
    @Param('id') assignmentId: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    const input = SubmitAssignmentInputSchema.parse(body);
    const data = await this.assessmentsService.submitAssignment(assignmentId, input, user);
    return { data };
  }

  @Get('submissions/:id')
  async getSubmission(
    @Param('id') submissionId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.assessmentsService.getSubmission(submissionId, user);
    return { data };
  }

  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Get('assignments/:id/submissions')
  async listAssignmentSubmissions(
    @Param('id') assignmentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const data = await this.assessmentsService.listAssignmentSubmissions(assignmentId, user);
    return { data };
  }
}
