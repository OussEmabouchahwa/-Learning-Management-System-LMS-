import { Module } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { AuditService } from './audit.service';
import { OpsModule } from '../ops/ops.module';

@Module({
  imports: [OpsModule],
  providers: [AuditRepository, AuditService],
  exports: [AuditService],
})
export class AuditModule {}
