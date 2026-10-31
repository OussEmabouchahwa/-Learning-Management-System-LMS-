import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { validateEnv } from './config/env';
import { AppLoggerModule } from './infra/logger/logger.module';
import { OpsModule } from './modules/ops/ops.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ContentModule } from './modules/content/content.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { GradingModule } from './modules/grading/grading.module';
import { ProgressModule } from './modules/progress/progress.module';
import { FilesModule } from './modules/files/files.module';
import { AdminModule } from './modules/admin/admin.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { StorageService } from './infra/storage/storage.service';
import { MailerService } from './infra/mailer/mailer.service';

const env = validateEnv(process.env);

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    JwtModule.register({
      global: true,
      secret: env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: env.JWT_ACCESS_TTL },
    }),
    AppLoggerModule,
    OpsModule,
    AuditModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    ContentModule,
    EnrollmentsModule,
    AssessmentsModule,
    GradingModule,
    ProgressModule,
    FilesModule,
    AdminModule,
  ],
  providers: [
    StorageService,
    MailerService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
  exports: [StorageService, MailerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
