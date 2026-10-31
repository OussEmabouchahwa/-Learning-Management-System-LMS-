import { Module } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsRepository } from './enrollments.repository';
import { CoursesModule } from '../courses/courses.module';
import { OpsModule } from '../ops/ops.module';

@Module({
  imports: [OpsModule, CoursesModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsRepository, EnrollmentsService],
  exports: [EnrollmentsService, EnrollmentsRepository],
})
export class EnrollmentsModule {}
