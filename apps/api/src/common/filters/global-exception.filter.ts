import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ErrorCode, ErrorResponse } from '@dars/contracts';
import { AppError } from '../errors/app.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const reqWithId = request as Request & { id?: string };
    const requestId = (request.headers['x-request-id'] as string) || reqWithId.id || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = 'An internal server error occurred';
    let fields: Record<string, string> | undefined = undefined;

    if (exception instanceof AppError) {
      status = exception.status;
      code = exception.code;
      message = exception.message;
      fields = exception.fields;
    } else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      code = ErrorCode.VALIDATION_ERROR;
      message = 'Check the highlighted fields.';
      fields = {};
      for (const issue of exception.issues) {
        const path = issue.path.join('.') || 'root';
        fields[path] = issue.message;
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const anyRes = res as Record<string, unknown>;
        message = (anyRes.message as string) || exception.message;
        code = (anyRes.error as string) || (status === 429 ? ErrorCode.RATE_LIMITED : ErrorCode.VALIDATION_ERROR);
        if (Array.isArray(anyRes.message)) {
          message = anyRes.message[0] || 'Validation failed';
          fields = {};
          for (const item of anyRes.message) {
            fields['body'] = String(item);
          }
        }
      } else {
        message = String(res);
      }
      if (status === HttpStatus.UNAUTHORIZED) {
        code = ErrorCode.UNAUTHORIZED;
      } else if (status === HttpStatus.FORBIDDEN) {
        code = ErrorCode.FORBIDDEN;
      } else if (status === HttpStatus.NOT_FOUND) {
        code = ErrorCode.NOT_FOUND;
      } else if (status === HttpStatus.TOO_MANY_REQUESTS) {
        code = ErrorCode.RATE_LIMITED;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
      message = exception.message;
    } else {
      this.logger.error('Unhandled unknown error', exception);
    }

    const payload: ErrorResponse = {
      error: {
        code,
        message,
        ...(fields && Object.keys(fields).length > 0 ? { fields } : {}),
        requestId,
      },
    };

    response.status(status).json(payload);
  }
}
