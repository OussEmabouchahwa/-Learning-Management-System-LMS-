import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentRepository } from './content.repository';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { OpsModule } from '../ops/ops.module';

@Module({
  imports: [OpsModule, CoursesModule, EnrollmentsModule],
  controllers: [ContentController],
  providers: [ContentRepository, ContentService],
  exports: [ContentService, ContentRepository],
})
export class ContentModule {}
