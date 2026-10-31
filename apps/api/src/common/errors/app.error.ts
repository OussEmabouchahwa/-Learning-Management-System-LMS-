import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@dars/contracts';

export class AppError extends Error {
  public readonly code: ErrorCode | string;
  public readonly status: number;
  public readonly fields?: Record<string, string>;

  constructor(
    code: ErrorCode | string,
    message: string,
    status: number = HttpStatus.BAD_REQUEST,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.fields = fields;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, fields?: Record<string, string>): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, HttpStatus.BAD_REQUEST, fields);
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message = 'You do not have permission to access this resource'): AppError {
    return new AppError(ErrorCode.FORBIDDEN, message, HttpStatus.FORBIDDEN);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(ErrorCode.NOT_FOUND, message, HttpStatus.NOT_FOUND);
  }

  static conflict(message: string): AppError {
    return new AppError(ErrorCode.CONFLICT, message, HttpStatus.CONFLICT);
  }

  static rateLimited(message = 'Too many requests, please try again later'): AppError {
    return new AppError(ErrorCode.RATE_LIMITED, message, HttpStatus.TOO_MANY_REQUESTS);
  }

  static internal(message = 'An unexpected error occurred'): AppError {
    return new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
