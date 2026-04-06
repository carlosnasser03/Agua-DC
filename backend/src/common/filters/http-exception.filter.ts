import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Identificar errores de Prisma específicos y asignarles códigos semánticos
    if ((exception as any)?.code) {
      const dbErrorCode = (exception as any).code;
      if (dbErrorCode === 'P2002') {
        // Violación de Unique constraint
        status = HttpStatus.CONFLICT;
      } else if (dbErrorCode === 'P2025' || dbErrorCode === 'P2003') {
        // Registro no encontrado o violación de FK (Foreign Key)
        status = HttpStatus.NOT_FOUND;
      } else if (dbErrorCode.startsWith('P')) {
        // Otros errores de Prisma tipados como Bad Request
        status = HttpStatus.BAD_REQUEST;
      }
    }

    let errorMessage = 'Internal server error';
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      errorMessage = typeof response === 'object' && (response as any).message
        ? (response as any).message
        : response;
    } else if ((exception as any)?.code?.startsWith('P')) {
      // Mensaje estructurado de Prisma
      errorMessage = (exception as any).meta?.cause || (exception as Error).message || 'Database error occurred';
    } else {
      errorMessage = (exception as Error).message || 'Internal server error';
    }

    const messageArray = Array.isArray(errorMessage) ? errorMessage : [errorMessage];

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: messageArray,
      error: exception instanceof HttpException ? (exception.getResponse() as any).error || exception.name : (exception as any)?.code || 'InternalServerError',
    };

    // Log the error for admin debugging
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - Status: ${status} - Error: ${JSON.stringify(errorResponse)}`,
        (exception as Error).stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(messageArray)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
