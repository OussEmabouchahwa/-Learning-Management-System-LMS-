import { Module } from '@nestjs/common';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';
import { GradingRepository } from './grading.repository';
import { AuditModule } from '../audit/audit.module';
import { OpsModule } from '../ops/ops.module';

@Module({
  imports: [OpsModule, AuditModule],
  controllers: [GradingController],
  providers: [GradingRepository, GradingService],
  exports: [GradingService, GradingRepository],
})
export class GradingModule {}
