import { Module } from '@nestjs/common';
import { OpsController } from './ops.controller';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Module({
  controllers: [OpsController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class OpsModule {}
