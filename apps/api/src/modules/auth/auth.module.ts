import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { OpsModule } from '../ops/ops.module';
import { MailerService } from '../../infra/mailer/mailer.service';

@Module({
  imports: [OpsModule],
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, MailerService],
  exports: [AuthService],
})
export class AuthModule {}
