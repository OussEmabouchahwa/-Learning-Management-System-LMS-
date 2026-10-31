import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ProgressRepository } from './progress.repository';
import { OpsModule } from '../ops/ops.module';

@Module({
  imports: [OpsModule],
  controllers: [ProgressController],
  providers: [ProgressRepository, ProgressService],
  exports: [ProgressService, ProgressRepository],
})
export class ProgressModule {}
