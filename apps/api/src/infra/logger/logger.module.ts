import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { IncomingMessage } from 'http';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.newPassword',
          'req.body.currentPassword',
          'req.body.token',
          'req.body.answers',
        ],
        customProps: (req: IncomingMessage) => {
          const reqId = (req as IncomingMessage & { id?: unknown }).id;
          return {
            requestId:
              typeof reqId === 'string'
                ? reqId
                : (req.headers['x-request-id'] as string) || 'unknown',
          };
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class AppLoggerModule {}

