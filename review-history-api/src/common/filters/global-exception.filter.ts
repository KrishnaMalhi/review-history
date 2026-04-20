import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { randomUUID } from 'crypto';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        code = (resp.code as string) || this.getCodeFromStatus(status);
        message = (resp.message as string) || exception.message;
        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          details = resp.message;
        }
      } else {
        message = exception.message;
        code = this.getCodeFromStatus(status);
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception [${request.method} ${request.url}]: ${exception.message}`,
        exception.stack,
      );
      // Don't leak internal error details in production
      if (process.env.NODE_ENV === 'development') {
        message = exception.message;
      }
    }

    const requestId = (request.headers['x-request-id'] as string) || randomUUID();

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        requestId,
        ...(details ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.setHeader('X-Request-Id', requestId);
    response.status(status).json(errorResponse);
  }

  private getCodeFromStatus(status: number): string {
    const statusMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return statusMap[status] || 'UNKNOWN_ERROR';
  }
}
