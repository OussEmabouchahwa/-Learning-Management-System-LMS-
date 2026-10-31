import { Module } from '@nestjs/common';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { AssessmentsRepository } from './assessments.repository';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { OpsModule } from '../ops/ops.module';

@Module({
  imports: [OpsModule, CoursesModule, EnrollmentsModule],
  controllers: [AssessmentsController],
  providers: [AssessmentsRepository, AssessmentsService],
  exports: [AssessmentsService, AssessmentsRepository],
})
export class AssessmentsModule {}
