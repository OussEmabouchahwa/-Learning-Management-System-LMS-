import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';
import { AuditModule } from '../audit/audit.module';
import { OpsModule } from '../ops/ops.module';

@Module({
  imports: [OpsModule, AuditModule],
  controllers: [CoursesController],
  providers: [CoursesRepository, CoursesService],
  exports: [CoursesService, CoursesRepository],
})
export class CoursesModule {}
